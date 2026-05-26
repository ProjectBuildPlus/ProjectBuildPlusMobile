import { ReadOnlyProvider } from "@/context/ReadOnlyContext";
import { useGetSubscriptionStatus } from "@/hooks/useSubscription";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, HardHat } from "lucide-react";
import { useEffect, useState } from "react";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

function LoadingSpinner() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      data-ocid="subscription_gate.loading_state"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <HardHat className="h-6 w-6 text-primary" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Verifying subscription…
        </p>
      </div>
    </div>
  );
}

function ExpiredScreen({ onReadOnly }: { onReadOnly: () => void }) {
  const navigate = useNavigate();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
      data-ocid="subscription_gate.expired_screen"
    >
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Your Subscription Has Expired
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Renew with your verified payment method on file and complete fresh
          identity verification to restore full access.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/renewal" })}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-amber-500 to-accent py-3 text-sm font-semibold text-foreground shadow-lg transition-all hover:opacity-90"
          data-ocid="subscription_gate.renew_button"
        >
          Renew Subscription
        </button>
        <button
          type="button"
          onClick={onReadOnly}
          className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          data-ocid="subscription_gate.read_only_button"
        >
          View Projects (Read Only)
        </button>
      </div>
    </div>
  );
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { data: status, isLoading } = useGetSubscriptionStatus();
  const navigate = useNavigate();
  const [readOnlyMode, setReadOnlyMode] = useState(false);

  const statusTag = status ?? null;

  useEffect(() => {
    if (isLoading) return;
    if (!status || statusTag === "cancelled") {
      navigate({ to: "/pricing" });
    }
  }, [isLoading, status, statusTag, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect cases — render nothing while navigating
  if (!status || statusTag === "cancelled") {
    return null;
  }

  // Expired: show full-screen expired card, or read-only mode if user chose it
  if (statusTag === "expired") {
    if (!readOnlyMode) {
      return <ExpiredScreen onReadOnly={() => setReadOnlyMode(true)} />;
    }
    return (
      <ReadOnlyProvider>
        <div className="pt-0">
          <div
            className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 shadow-md"
            data-ocid="subscription_gate.expired_banner"
          >
            <p className="text-sm font-semibold text-amber-950">
              ⚠️ Read-only mode — subscription expired.
            </p>
            <button
              type="button"
              onClick={() => setReadOnlyMode(false)}
              className="shrink-0 rounded-md bg-amber-900 px-3 py-1 text-xs font-bold text-amber-50 transition-colors hover:bg-amber-800"
              data-ocid="subscription_gate.renew_button"
            >
              Renew Now
            </button>
          </div>
          <div className="pt-[44px]">{children}</div>
        </div>
      </ReadOnlyProvider>
    );
  }

  // trial or active: full access
  return <>{children}</>;
}
