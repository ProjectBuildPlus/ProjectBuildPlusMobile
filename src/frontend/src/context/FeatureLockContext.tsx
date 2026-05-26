import type React from "react";
import { createContext, useContext } from "react";
import { useFeatureLocks } from "../hooks/useAuth";
import type { FeatureLocks } from "../hooks/useAuth";

const defaultLocks: FeatureLocks = {
  scheduling: true,
  cost: true,
  resources: true,
  compliance: true,
  participants: true,
  documents: true,
  oacMeetings: true,
  subscriptions: true,
};

const FeatureLockContext = createContext<FeatureLocks>(defaultLocks);

export function FeatureLockProvider({
  children,
}: { children: React.ReactNode }) {
  const { data } = useFeatureLocks();
  return (
    <FeatureLockContext.Provider value={data ?? defaultLocks}>
      {children}
    </FeatureLockContext.Provider>
  );
}

export function useFeatureLockContext(): FeatureLocks {
  return useContext(FeatureLockContext);
}

/**
 * Returns true when the feature is locked (value === false means locked).
 * In the backend schema: false = locked, true = unlocked.
 */
export function useIsFeatureLocked(feature: keyof FeatureLocks): boolean {
  const locks = useFeatureLockContext();
  return locks[feature] === false;
}
