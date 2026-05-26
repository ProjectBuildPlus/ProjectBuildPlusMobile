import { useIsController } from "@/hooks/useSubscription";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2, ShieldAlert } from "lucide-react";
import type React from "react";

interface ControllerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ControllerOnly({ children, fallback }: ControllerOnlyProps) {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  const { data: isController, isLoading } = useIsController(principal);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isController) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="text-gray-400 max-w-md">
            Only the app controller can enter or set up projects. Please contact
            the project administrator to request access.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
