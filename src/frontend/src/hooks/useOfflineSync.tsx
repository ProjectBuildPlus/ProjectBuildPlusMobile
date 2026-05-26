import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface CachedData {
  phases?: unknown;
  costCodes?: Record<string, unknown>;
  cumulativeCashRequirement?: unknown;
  cumulativeCrashedRequirement?: unknown;
  cumulativeWithBreakdown?: unknown;
  earnedValueMetrics?: Record<string, unknown>;
  projectEVMSummary?: Record<string, unknown>;
  timestamp: string;
}

interface OfflineSyncContextType {
  isOffline: boolean;
  lastSynced: string | null;
  cachedData: CachedData | null;
}

export const OfflineSyncContext = createContext<OfflineSyncContextType>({
  isOffline: false,
  lastSynced: null,
  cachedData: null,
});

export function useOfflineSync() {
  return useContext(OfflineSyncContext);
}

const CACHE_KEY = "pbp_cache";
const RECONNECT_DEBOUNCE_MS = 300;

function readCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedData;
  } catch {
    return null;
  }
}

function writeCache(data: CachedData): CachedData {
  const payload: CachedData = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage might be full
  }
  return payload;
}

export function OfflineSyncProvider({
  children,
}: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const writeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCacheRef = useRef<CachedData | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const cache = readCache();
    if (cache) {
      setCachedData(cache);
      setLastSynced(cache.timestamp);
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        queryClient.invalidateQueries();
        const now = new Date().toISOString();
        setLastSynced(now);
        const cache = readCache();
        if (cache) {
          cache.timestamp = now;
          localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
          setCachedData(cache);
        }
      }, RECONNECT_DEBOUNCE_MS);
    };

    const handleOffline = () => {
      setIsOffline(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [queryClient]);

  // Debounced cache writer
  const scheduleCacheWrite = useCallback(() => {
    if (writeTimeoutRef.current) clearTimeout(writeTimeoutRef.current);
    writeTimeoutRef.current = setTimeout(() => {
      if (pendingCacheRef.current) {
        const payload = writeCache(pendingCacheRef.current);
        setCachedData(payload);
        setLastSynced(payload.timestamp);
        pendingCacheRef.current = null;
      }
    }, 500);
  }, []);

  // Subscribe to query cache changes
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      if (event.query.state.status !== "success") return;

      const key = event.query.queryKey;
      const rootKey = key[0];

      const knownRoots = [
        "phases",
        "costCodes",
        "cumulativeCashRequirement",
        "cumulativeCrashedRequirement",
        "cumulativeWithBreakdown",
        "earnedValueMetrics",
        "projectEVMSummary",
      ];

      if (!knownRoots.includes(rootKey as string)) return;

      if (!pendingCacheRef.current) {
        pendingCacheRef.current = readCache() ?? {
          timestamp: new Date().toISOString(),
        };
      }

      const cache = pendingCacheRef.current;

      if (rootKey === "phases") {
        cache.phases = event.query.state.data;
      } else if (rootKey === "costCodes" && key[1] != null) {
        if (!cache.costCodes) cache.costCodes = {};
        cache.costCodes[String(key[1])] = event.query.state.data;
      } else if (rootKey === "cumulativeCashRequirement") {
        cache.cumulativeCashRequirement = event.query.state.data;
      } else if (rootKey === "cumulativeCrashedRequirement") {
        cache.cumulativeCrashedRequirement = event.query.state.data;
      } else if (rootKey === "cumulativeWithBreakdown") {
        cache.cumulativeWithBreakdown = event.query.state.data;
      } else if (rootKey === "earnedValueMetrics" && key[1] != null) {
        if (!cache.earnedValueMetrics) cache.earnedValueMetrics = {};
        cache.earnedValueMetrics[String(key[1])] = event.query.state.data;
      } else if (rootKey === "projectEVMSummary" && key[1] != null) {
        if (!cache.projectEVMSummary) cache.projectEVMSummary = {};
        cache.projectEVMSummary[String(key[1])] = event.query.state.data;
      }

      scheduleCacheWrite();
    });

    return () => unsubscribe();
  }, [queryClient, scheduleCacheWrite]);

  return (
    <OfflineSyncContext.Provider value={{ isOffline, lastSynced, cachedData }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}
