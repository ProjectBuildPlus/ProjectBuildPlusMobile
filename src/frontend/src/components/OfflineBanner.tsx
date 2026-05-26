import { Wifi, WifiOff } from "lucide-react";

interface OfflineBannerProps {
  isOffline: boolean;
  showSynced: boolean;
}

export function OfflineBanner({ isOffline, showSynced }: OfflineBannerProps) {
  if (!isOffline && !showSynced) return null;

  return (
    <div
      className={`w-full px-4 py-2.5 text-sm font-medium text-white ${
        isOffline
          ? "bg-gradient-to-r from-amber-500 to-red-500"
          : "bg-gradient-to-r from-emerald-500 to-green-600"
      }`}
      aria-live="polite"
      data-ocid="offline.banner"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="leading-tight">
              You are offline — viewing cached data. Editing is disabled until
              your connection is restored.
            </span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="leading-tight">Connected — syncing data...</span>
          </>
        )}
      </div>
    </div>
  );
}
