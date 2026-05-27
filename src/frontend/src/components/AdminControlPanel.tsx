import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useAddUserLoginEmail,
  useChangePassword,
  useGenerateUserResetCode,
  useGetAllUsers,
  useGetUserLoginEmails,
  useRemoveUserLoginEmail,
} from "@/hooks/useAuth";
import {
  useApproveCancellationRequest,
  useDenyCancellationRequest,
  useDirectCancelSubscription,
  useFreezeSubscription,
  useGetAllCancellationRequests,
  useGetManagedSubscriptions,
  useUnfreezeSubscription,
} from "@/hooks/useSubscription";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailPlus,
  PlusCircle,
  RefreshCw,
  Shield,
  ShieldOff,
  SnowflakeIcon,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type AdminTab =
  | "subscription-mgmt"
  | "recurring-payments"
  | "access-control"
  | "user-accounts";

interface TabBanner {
  type: "success" | "error";
  message: string;
}

// Shared inline banner
function InlineBanner({
  banner,
  onDismiss,
}: {
  banner: TabBanner;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
        banner.type === "success"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
          : "border-red-500/40 bg-red-500/10 text-red-400"
      }`}
      data-ocid={`admin_panel.${banner.type}_state`}
    >
      {banner.type === "success" ? (
        <Shield className="h-4 w-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      )}
      <span className="flex-1">{banner.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-current opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── SUBSCRIPTION MANAGEMENT TAB ─────────────────────────────────────────────
function SubscriptionMgmtTab() {
  const { data: requests = [], isLoading: loadingReqs } =
    useGetAllCancellationRequests();
  const { data: subscriptions = [], isLoading: loadingSubs } =
    useGetManagedSubscriptions();
  const approve = useApproveCancellationRequest();
  const deny = useDenyCancellationRequest();
  const directCancel = useDirectCancelSubscription();

  const [banner, setBanner] = useState<TabBanner | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "approve" | "deny";
  } | null>(null);

  async function handleApprove(id: string) {
    try {
      await approve.mutateAsync({ requestId: id });
      setBanner({ type: "success", message: "Cancellation request approved." });
      setConfirmAction(null);
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Approval failed.",
      });
    }
  }

  async function handleDeny(id: string) {
    try {
      await deny.mutateAsync({ requestId: id });
      setBanner({ type: "success", message: "Cancellation request denied." });
      setConfirmAction(null);
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Denial failed.",
      });
    }
  }

  async function handleDirectCancel(email: string) {
    try {
      await directCancel.mutateAsync({ email });
      setBanner({
        type: "success",
        message: `Subscription for ${email} cancelled.`,
      });
      setConfirmCancel(null);
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Cancellation failed.",
      });
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "Active" || s.status === "Frozen",
  );

  return (
    <div className="space-y-6">
      {banner && (
        <InlineBanner banner={banner} onDismiss={() => setBanner(null)} />
      )}

      {/* Pending Cancellation Requests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="font-semibold text-sm">
            Pending Cancellation Requests
          </h3>
          <Badge
            variant="outline"
            className="ml-auto text-xs border-amber-500/40 bg-amber-500/10 text-amber-400"
          >
            {pendingRequests.length}
          </Badge>
        </div>

        {loadingReqs ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-sm text-muted-foreground"
            data-ocid="admin_panel.cancellation_requests.empty_state"
          >
            No pending cancellation requests.
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {pendingRequests.map((req, i) => (
                <div
                  key={req.id}
                  className="p-4 space-y-2"
                  data-ocid={`admin_panel.cancellation_requests.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {req.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Requested: {req.requestedDate}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{req.reason}"
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {confirmAction?.id === req.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Confirm{" "}
                            {confirmAction.action === "approve"
                              ? "approve"
                              : "deny"}
                            ?
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                            onClick={() =>
                              confirmAction.action === "approve"
                                ? handleApprove(req.id)
                                : handleDeny(req.id)
                            }
                            disabled={approve.isPending || deny.isPending}
                            data-ocid={`admin_panel.cancellation_requests.confirm_button.${i + 1}`}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => setConfirmAction(null)}
                            data-ocid={`admin_panel.cancellation_requests.cancel_button.${i + 1}`}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                            onClick={() =>
                              setConfirmAction({
                                id: req.id,
                                action: "approve",
                              })
                            }
                            data-ocid={`admin_panel.cancellation_requests.approve_button.${i + 1}`}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                            onClick={() =>
                              setConfirmAction({ id: req.id, action: "deny" })
                            }
                            data-ocid={`admin_panel.cancellation_requests.deny_button.${i + 1}`}
                          >
                            Deny
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Active Subscriptions — manual cancel */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Active Subscriptions</h3>
        </div>

        {loadingSubs ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {activeSubscriptions.map((sub, i) => (
                <div
                  key={sub.email}
                  className={`flex items-center justify-between gap-3 p-4 ${
                    sub.status === "Frozen" ? "opacity-60" : ""
                  }`}
                  data-ocid={`admin_panel.active_subscriptions.item.${i + 1}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {sub.email}
                      </p>
                      {sub.status === "Frozen" && (
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-500/30 bg-blue-500/10 text-blue-400 shrink-0"
                        >
                          <SnowflakeIcon className="h-2.5 w-2.5 mr-1" />
                          Frozen by Controller
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sub.tier} · Since {sub.startDate}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {confirmCancel === sub.email ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">
                          Cancel subscription?
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 px-2 bg-red-700 hover:bg-red-800 text-white text-xs"
                          onClick={() => handleDirectCancel(sub.email)}
                          disabled={directCancel.isPending}
                          data-ocid={`admin_panel.active_subscriptions.confirm_button.${i + 1}`}
                        >
                          {directCancel.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Confirm"
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => setConfirmCancel(null)}
                          data-ocid={`admin_panel.active_subscriptions.cancel_button.${i + 1}`}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                        onClick={() => setConfirmCancel(sub.email)}
                        disabled={sub.status === "Frozen"}
                        data-ocid={`admin_panel.active_subscriptions.delete_button.${i + 1}`}
                      >
                        <Ban className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RECURRING PAYMENTS TAB ───────────────────────────────────────────────────
function RecurringPaymentsTab() {
  const { data: subscribers = [], isLoading } = useGetManagedSubscriptions();
  const directCancel = useDirectCancelSubscription();
  const [banner, setBanner] = useState<TabBanner | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const activeRecurring = subscribers.filter((s) => s.status !== "Cancelled");

  const tierChargeMap: Record<string, number> = {
    "1-Year $299/mo": 299,
    "5-Year $199/mo": 199,
    "10-Year $99/mo": 99,
  };

  async function handleCancelRecurring(email: string) {
    try {
      await directCancel.mutateAsync({ email });
      setBanner({
        type: "success",
        message: `Recurring charge cancelled for ${email}.`,
      });
      setConfirmCancel(null);
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Cancel failed.",
      });
    }
  }

  return (
    <div className="space-y-5">
      {banner && (
        <InlineBanner banner={banner} onDismiss={() => setBanner(null)} />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Active Recurring Charges</h3>
        </div>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="admin_panel.stripe_dashboard_link"
        >
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs bg-indigo-700 hover:bg-indigo-800 text-white gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Open Stripe Dashboard
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5 border-b border-border bg-muted/20">
            <span>Subscriber</span>
            <span className="text-right pr-4">Plan</span>
            <span className="text-right pr-4">Monthly</span>
            <span className="text-right pr-6">Next Billing</span>
            <span className="text-right">Action</span>
          </div>
          <div className="divide-y divide-border">
            {activeRecurring.map((sub, i) => (
              <div
                key={sub.email}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-0 px-4 py-3"
                data-ocid={`admin_panel.recurring_payments.item.${i + 1}`}
              >
                <p className="text-sm font-medium truncate min-w-0 pr-2">
                  {sub.email}
                </p>
                <p className="text-xs text-muted-foreground pr-4 text-right">
                  {sub.tier}
                </p>
                <p className="text-sm font-semibold text-right pr-4">
                  ${tierChargeMap[sub.tier] ?? "—"}/mo
                </p>
                <p className="text-xs text-muted-foreground pr-4 text-right">
                  {sub.startDate}
                </p>
                <div className="text-right">
                  {confirmCancel === sub.email ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs text-red-400">Confirm?</span>
                      <Button
                        type="button"
                        size="sm"
                        className="h-6 px-2 bg-red-700 hover:bg-red-800 text-white text-xs"
                        onClick={() => handleCancelRecurring(sub.email)}
                        disabled={directCancel.isPending}
                        data-ocid={`admin_panel.recurring_payments.confirm_button.${i + 1}`}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => setConfirmCancel(null)}
                        data-ocid={`admin_panel.recurring_payments.cancel_button.${i + 1}`}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                      onClick={() => setConfirmCancel(sub.email)}
                      data-ocid={`admin_panel.recurring_payments.delete_button.${i + 1}`}
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUBSCRIPTION ACCESS TAB ──────────────────────────────────────────────────
function SubscriptionAccessTab() {
  const { data: subscriptions = [], isLoading } = useGetManagedSubscriptions();
  const freeze = useFreezeSubscription();
  const unfreeze = useUnfreezeSubscription();
  const directCancel = useDirectCancelSubscription();

  const [banner, setBanner] = useState<TabBanner | null>(null);
  const [freezeTarget, setFreezeTarget] = useState<string | null>(null);
  const [freezeReason, setFreezeReason] = useState("");
  const [confirmPermCancel, setConfirmPermCancel] = useState<string | null>(
    null,
  );

  const active = subscriptions.filter((s) => s.status === "Active");
  const frozen = subscriptions.filter((s) => s.status === "Frozen");

  async function handleFreeze(email: string) {
    if (!freezeReason.trim()) return;
    try {
      await freeze.mutateAsync({ email, reason: freezeReason.trim() });
      setBanner({
        type: "success",
        message: `Subscription for ${email} frozen.`,
      });
      setFreezeTarget(null);
      setFreezeReason("");
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Freeze failed.",
      });
    }
  }

  async function handleUnfreeze(email: string) {
    try {
      await unfreeze.mutateAsync({ email });
      setBanner({
        type: "success",
        message: `Subscription for ${email} unfrozen.`,
      });
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Unfreeze failed.",
      });
    }
  }

  async function handlePermCancel(email: string) {
    try {
      await directCancel.mutateAsync({ email });
      setBanner({
        type: "success",
        message: `Subscription for ${email} permanently cancelled.`,
      });
      setConfirmPermCancel(null);
    } catch (err) {
      setBanner({
        type: "error",
        message:
          err instanceof Error ? err.message : "Permanent cancel failed.",
      });
    }
  }

  return (
    <div className="space-y-6">
      {banner && (
        <InlineBanner banner={banner} onDismiss={() => setBanner(null)} />
      )}

      {/* Active — freeze controls */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-emerald-400" />
          <h3 className="font-semibold text-sm">Active Subscriptions</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : active.length === 0 ? (
          <p
            className="text-sm text-muted-foreground py-4"
            data-ocid="admin_panel.access_active.empty_state"
          >
            No active subscriptions.
          </p>
        ) : (
          <div className="space-y-2">
            {active.map((sub, i) => (
              <div
                key={sub.email}
                className="rounded-lg border border-border bg-card p-3"
                data-ocid={`admin_panel.access_active.item.${i + 1}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sub.email}</p>
                    <p className="text-xs text-muted-foreground">{sub.tier}</p>
                  </div>
                  {freezeTarget === sub.email ? null : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs border-blue-500/40 text-blue-400 hover:bg-blue-500/10 shrink-0"
                      onClick={() => {
                        setFreezeTarget(sub.email);
                        setFreezeReason("");
                      }}
                      data-ocid={`admin_panel.access_active.toggle.${i + 1}`}
                    >
                      <SnowflakeIcon className="h-3 w-3 mr-1" /> Freeze
                    </Button>
                  )}
                </div>

                {/* Inline freeze form */}
                {freezeTarget === sub.email && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <Label
                      htmlFor={`freeze-reason-${i}`}
                      className="text-xs text-muted-foreground"
                    >
                      Reason for freeze
                    </Label>
                    <Input
                      id={`freeze-reason-${i}`}
                      value={freezeReason}
                      onChange={(e) => setFreezeReason(e.target.value)}
                      placeholder="e.g. Payment dispute pending review"
                      className="h-8 text-sm"
                      data-ocid={`admin_panel.access_active.input.${i + 1}`}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 px-3 text-xs bg-blue-700 hover:bg-blue-800 text-white"
                        onClick={() => handleFreeze(sub.email)}
                        disabled={!freezeReason.trim() || freeze.isPending}
                        data-ocid={`admin_panel.access_active.confirm_button.${i + 1}`}
                      >
                        {freeze.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <SnowflakeIcon className="h-3 w-3 mr-1" />
                        )}
                        Confirm Freeze
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => setFreezeTarget(null)}
                        data-ocid={`admin_panel.access_active.cancel_button.${i + 1}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Frozen subscriptions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <SnowflakeIcon className="h-4 w-4 text-blue-400" />
          <h3 className="font-semibold text-sm">Frozen Subscriptions</h3>
          {frozen.length > 0 && (
            <Badge
              variant="outline"
              className="ml-auto text-xs border-blue-500/40 bg-blue-500/10 text-blue-400"
            >
              {frozen.length}
            </Badge>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : frozen.length === 0 ? (
          <p
            className="text-sm text-muted-foreground py-4"
            data-ocid="admin_panel.access_frozen.empty_state"
          >
            No frozen subscriptions.
          </p>
        ) : (
          <div className="space-y-2">
            {frozen.map((sub, i) => (
              <div
                key={sub.email}
                className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 opacity-80"
                data-ocid={`admin_panel.access_frozen.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {sub.email}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs border-blue-500/30 bg-blue-500/10 text-blue-400 shrink-0"
                      >
                        <SnowflakeIcon className="h-2.5 w-2.5 mr-1" />
                        Frozen by Controller
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sub.tier}
                    </p>
                    {sub.frozenReason && (
                      <p className="text-xs text-blue-400/80 mt-1 italic">
                        Reason: {sub.frozenReason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                      onClick={() => handleUnfreeze(sub.email)}
                      disabled={unfreeze.isPending}
                      data-ocid={`admin_panel.access_frozen.toggle.${i + 1}`}
                    >
                      {unfreeze.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Unfreeze
                    </Button>

                    {confirmPermCancel === sub.email ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-400">Sure?</span>
                        <Button
                          type="button"
                          size="sm"
                          className="h-6 px-2 text-xs bg-red-700 hover:bg-red-800 text-white"
                          onClick={() => handlePermCancel(sub.email)}
                          disabled={directCancel.isPending}
                          data-ocid={`admin_panel.access_frozen.confirm_button.${i + 1}`}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => setConfirmPermCancel(null)}
                          data-ocid={`admin_panel.access_frozen.cancel_button.${i + 1}`}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                        onClick={() => setConfirmPermCancel(sub.email)}
                        data-ocid={`admin_panel.access_frozen.delete_button.${i + 1}`}
                      >
                        <Ban className="h-3 w-3 mr-1" /> Perm. Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USER ACCOUNTS ROW ────────────────────────────────────────────────────────
function UserRow({
  email,
  name,
  lastLogin,
  createdAt: _createdAt,
  index,
  onCode,
}: {
  email: string;
  name: string;
  lastLogin: string;
  createdAt: string;
  index: number;
  onCode: (email: string, code: string) => void;
}) {
  const [_expanded, _setExpanded] = useState(false);
  const [panel, setPanel] = useState<
    "emails" | "set-password" | "change-email" | null
  >(null);
  const [newEmail, setNewEmail] = useState("");
  const [rowError, setRowError] = useState("");
  const [rowSuccess, setRowSuccess] = useState("");

  // Set password state
  const [setPwNew, setSetPwNew] = useState("");
  const [setPwConfirm, setSetPwConfirm] = useState("");

  // Change email state
  const [changeEmailInput, setChangeEmailInput] = useState("");

  // Block/allow state — local optimistic toggle (real freeze hooks below)
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(false);

  const generateCode = useGenerateUserResetCode();
  const addEmail = useAddUserLoginEmail();
  const removeEmail = useRemoveUserLoginEmail();
  const changePassword = useChangePassword();
  const freeze = useFreezeSubscription();
  const unfreeze = useUnfreezeSubscription();
  const { data: loginEmails = [], isLoading: loadingEmails } =
    useGetUserLoginEmails(panel === "emails" ? email : "");

  function clearMessages() {
    setRowError("");
    setRowSuccess("");
  }

  function togglePanel(p: "emails" | "set-password" | "change-email") {
    clearMessages();
    setPanel((prev) => (prev === p ? null : p));
    if (p !== "emails") _setExpanded(false);
    else _setExpanded((v) => !v);
  }

  async function handleGenCode() {
    clearMessages();
    try {
      const code = await generateCode.mutateAsync({ email });
      onCode(email, code);
    } catch (err) {
      setRowError(
        err instanceof Error ? err.message : "Failed to generate code.",
      );
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!setPwNew.trim()) {
      setRowError("Password is required.");
      return;
    }
    if (setPwNew.length < 6) {
      setRowError("Password must be at least 6 characters.");
      return;
    }
    if (setPwNew !== setPwConfirm) {
      setRowError("Passwords do not match.");
      return;
    }
    try {
      // Admin override: use empty currentPassword sentinel
      await changePassword.mutateAsync({
        email,
        currentPassword: "__admin_override__",
        newPassword: setPwNew,
      });
      setRowSuccess(`Password updated for ${email}.`);
      setSetPwNew("");
      setSetPwConfirm("");
      setPanel(null);
    } catch (err) {
      setRowError(
        err instanceof Error ? err.message : "Failed to set password.",
      );
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!changeEmailInput.trim()) {
      setRowError("Email is required.");
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(changeEmailInput.trim())) {
      setRowError("Please enter a valid email address.");
      return;
    }
    try {
      await addEmail.mutateAsync({
        targetEmail: email,
        newEmail: changeEmailInput.trim(),
      });
      setRowSuccess(`Email ${changeEmailInput.trim()} added for ${email}.`);
      setChangeEmailInput("");
      setPanel(null);
    } catch (err) {
      setRowError(
        err instanceof Error ? err.message : "Failed to change email.",
      );
    }
  }

  async function handleToggleBlock() {
    clearMessages();
    try {
      if (isBlocked) {
        await unfreeze.mutateAsync({ email });
        setIsBlocked(false);
        setRowSuccess(`Access restored for ${email}.`);
      } else {
        await freeze.mutateAsync({ email, reason: "Blocked by controller" });
        setIsBlocked(true);
        setRowSuccess(`Access blocked for ${email}.`);
      }
      setBlockConfirm(false);
    } catch (err) {
      setRowError(
        err instanceof Error ? err.message : "Failed to update access.",
      );
    }
  }

  async function handleAddEmail() {
    if (!newEmail.trim()) return;
    clearMessages();
    try {
      await addEmail.mutateAsync({
        targetEmail: email,
        newEmail: newEmail.trim(),
      });
      setNewEmail("");
      setRowSuccess("Email added.");
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Failed to add email.");
    }
  }

  async function handleRemoveEmail(emailToRemove: string) {
    clearMessages();
    try {
      await removeEmail.mutateAsync({ targetEmail: email, emailToRemove });
    } catch (err) {
      setRowError(
        err instanceof Error ? err.message : "Failed to remove email.",
      );
    }
  }

  return (
    <div
      className="border-b border-border last:border-0"
      data-ocid={`admin_panel.user_accounts.item.${index}`}
    >
      {/* Main row */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Last login:{" "}
                {new Date(lastLogin).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {isBlocked && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-red-500/30 bg-red-500/10 text-red-400 px-1.5 py-0"
                >
                  <EyeOff className="h-2.5 w-2.5 mr-1" />
                  Blocked
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs gap-1"
              onClick={handleGenCode}
              disabled={generateCode.isPending}
              data-ocid={`admin_panel.user_accounts.edit_button.${index}`}
            >
              {generateCode.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
              Reset Code
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`h-7 px-2 text-xs gap-1 ${
                panel === "set-password"
                  ? "border-primary text-primary bg-primary/10"
                  : ""
              }`}
              onClick={() => togglePanel("set-password")}
              data-ocid={`admin_panel.user_accounts.set_password_button.${index}`}
            >
              <KeyRound className="h-3 w-3" />
              Set Password
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`h-7 px-2 text-xs gap-1 ${
                panel === "change-email"
                  ? "border-primary text-primary bg-primary/10"
                  : ""
              }`}
              onClick={() => togglePanel("change-email")}
              data-ocid={`admin_panel.user_accounts.change_email_button.${index}`}
            >
              <Mail className="h-3 w-3" />
              Change Email
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`h-7 px-2 text-xs gap-1 ${
                panel === "emails"
                  ? "border-primary text-primary bg-primary/10"
                  : ""
              }`}
              onClick={() => togglePanel("emails")}
              data-ocid={`admin_panel.user_accounts.toggle.${index}`}
            >
              <Mail className="h-3 w-3" />
              Emails
              {panel === "emails" ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>

            {/* Block/Allow Access */}
            {blockConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {isBlocked ? "Allow?" : "Block?"}
                </span>
                <Button
                  type="button"
                  size="sm"
                  className={`h-6 px-2 text-xs ${
                    isBlocked
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-red-700 hover:bg-red-800"
                  } text-white`}
                  onClick={handleToggleBlock}
                  disabled={freeze.isPending || unfreeze.isPending}
                  data-ocid={`admin_panel.user_accounts.confirm_button.${index}`}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs"
                  onClick={() => setBlockConfirm(false)}
                  data-ocid={`admin_panel.user_accounts.cancel_button.${index}`}
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={`h-7 px-2 text-xs gap-1 ${
                  isBlocked
                    ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-red-500/40 text-red-400 hover:bg-red-500/10"
                }`}
                onClick={() => setBlockConfirm(true)}
                data-ocid={`admin_panel.user_accounts.block_toggle.${index}`}
              >
                {isBlocked ? (
                  <>
                    <UserCheck className="h-3 w-3" /> Allow Access
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" /> Block Access
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Inline banners */}
        {rowSuccess && (
          <div
            className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400"
            data-ocid={`admin_panel.user_accounts.success_state.${index}`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {rowSuccess}
            <button
              type="button"
              onClick={() => setRowSuccess("")}
              className="ml-auto opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {rowError && (
          <p
            className="text-xs text-red-400"
            data-ocid={`admin_panel.user_accounts.error_state.${index}`}
          >
            {rowError}
          </p>
        )}
      </div>

      {/* Set Password panel */}
      {panel === "set-password" && (
        <div className="px-4 pb-4 pt-0 space-y-3 bg-muted/10 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground pt-3">
            Set new password for {email}
          </p>
          <form onSubmit={handleSetPassword} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor={`pw-new-${index}`} className="text-xs">
                New Password
              </Label>
              <Input
                id={`pw-new-${index}`}
                type="password"
                placeholder="Enter new password"
                value={setPwNew}
                onChange={(e) => setSetPwNew(e.target.value)}
                className="h-8 text-sm"
                data-ocid={`admin_panel.user_accounts.pw_new_input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`pw-confirm-${index}`} className="text-xs">
                Confirm Password
              </Label>
              <Input
                id={`pw-confirm-${index}`}
                type="password"
                placeholder="Confirm new password"
                value={setPwConfirm}
                onChange={(e) => setSetPwConfirm(e.target.value)}
                className="h-8 text-sm"
                data-ocid={`admin_panel.user_accounts.pw_confirm_input.${index}`}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={changePassword.isPending}
                data-ocid={`admin_panel.user_accounts.pw_save_button.${index}`}
              >
                {changePassword.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Save Password
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  setPanel(null);
                  clearMessages();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Change Email panel */}
      {panel === "change-email" && (
        <div className="px-4 pb-4 pt-0 space-y-3 bg-muted/10 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground pt-3">
            Add new login email for {email}
          </p>
          <form onSubmit={handleChangeEmail} className="flex gap-2">
            <Input
              type="email"
              placeholder="new@example.com"
              value={changeEmailInput}
              onChange={(e) => setChangeEmailInput(e.target.value)}
              className="h-8 text-xs flex-1"
              data-ocid={`admin_panel.user_accounts.change_email_input.${index}`}
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={addEmail.isPending}
              data-ocid={`admin_panel.user_accounts.change_email_save.${index}`}
            >
              {addEmail.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : null}
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={() => {
                setPanel(null);
                clearMessages();
              }}
            >
              Cancel
            </Button>
          </form>
        </div>
      )}

      {/* Emails panel */}
      {panel === "emails" && (
        <div className="px-4 pb-4 space-y-3 bg-muted/10 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground pt-3">
            Login emails
          </p>
          {loadingEmails ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <div className="space-y-1.5">
              {loginEmails.map((em) => (
                <div
                  key={em}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-mono text-foreground">
                    {em}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleRemoveEmail(em)}
                    disabled={removeEmail.isPending}
                    aria-label={`Remove ${em}`}
                    data-ocid={`admin_panel.user_accounts.delete_button.${index}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className="h-8 text-xs flex-1"
              type="email"
              data-ocid={`admin_panel.user_accounts.input.${index}`}
            />
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs gap-1"
              onClick={handleAddEmail}
              disabled={!newEmail.trim() || addEmail.isPending}
              data-ocid={`admin_panel.user_accounts.submit_button.${index}`}
            >
              {addEmail.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <PlusCircle className="h-3 w-3" />
              )}
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── USER ACCOUNTS TAB ────────────────────────────────────────────────────────
function UserAccountsTab() {
  const { data: users = [], isLoading } = useGetAllUsers();
  const [codeBanner, setCodeBanner] = useState<{
    email: string;
    code: string;
  } | null>(null);

  function handleCodeGenerated(email: string, code: string) {
    setCodeBanner({ email, code });
  }

  return (
    <div className="space-y-4">
      {/* Reset code amber banner */}
      {codeBanner && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm"
          data-ocid="admin_panel.user_accounts.success_state"
        >
          <MailPlus className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-300 font-medium">
              Reset code for {codeBanner.email}
            </p>
            <p className="font-mono text-xl font-bold tracking-widest text-amber-200 mt-1">
              {codeBanner.code}
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Share this code with the user to reset their password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCodeBanner(null)}
            className="text-amber-400 opacity-60 hover:opacity-100 shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">User Directory</h3>
        {users.length > 0 && (
          <Badge
            variant="outline"
            className="ml-auto text-xs border-border text-muted-foreground"
          >
            {users.length} users
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {users.map((user, i) => (
            <UserRow
              key={user.email}
              email={user.email}
              name={user.name}
              lastLogin={user.lastLogin}
              createdAt={user.createdAt}
              index={i + 1}
              onCode={handleCodeGenerated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ADMIN CONTROL PANEL ─────────────────────────────────────────────────
export function AdminControlPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("subscription-mgmt");

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "subscription-mgmt",
      label: "Subscription Management",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    {
      id: "recurring-payments",
      label: "Recurring Payments",
      icon: <CreditCard className="h-3.5 w-3.5" />,
    },
    {
      id: "access-control",
      label: "Subscription Access",
      icon: <ShieldOff className="h-3.5 w-3.5" />,
    },
    {
      id: "user-accounts",
      label: "User Accounts",
      icon: <UserCog className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div
      className="rounded-xl border border-amber-500/30 bg-amber-500/5"
      data-ocid="admin_panel.section"
    >
      {/* Collapsible header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        data-ocid="admin_panel.toggle"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 shrink-0">
          <UserCog className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-amber-300">
            Admin Control Panel
          </p>
          <p className="text-xs text-muted-foreground">
            Subscription management, payments, access control, and user accounts
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-amber-500/20">
          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto px-5 pt-4 pb-0 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-t-lg text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-amber-400 text-amber-300 bg-amber-500/10"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
                data-ocid={`admin_panel.${tab.id}.tab`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === "subscription-mgmt" && <SubscriptionMgmtTab />}
            {activeTab === "recurring-payments" && <RecurringPaymentsTab />}
            {activeTab === "access-control" && <SubscriptionAccessTab />}
            {activeTab === "user-accounts" && <UserAccountsTab />}
          </div>
        </div>
      )}
    </div>
  );
}
