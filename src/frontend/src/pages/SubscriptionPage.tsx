import { Variant_Failed_Paid_Cancelled_Pending } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type RenewalHistoryEntry,
  useCancelTrial,
  useGetRenewalHistory,
  useGetTrialLinks,
  useGetUserSubscription,
  useSwitchTrialTier,
} from "@/hooks/useSubscription";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TIER_CONFIG = {
  tier1year: {
    label: "1-Year Plan",
    monthlyPrice: 299,
    totalPrice: 3588,
    term: "1 year",
    color: "text-primary",
    border: "border-primary/40",
    bg: "bg-primary/5",
    icon: <Zap className="h-5 w-5" />,
  },
  tier5year: {
    label: "5-Year Plan",
    monthlyPrice: 199,
    totalPrice: 11940,
    term: "5 years",
    color: "text-accent",
    border: "border-accent/40",
    bg: "bg-accent/5",
    icon: <Shield className="h-5 w-5" />,
  },
  tier10year: {
    label: "10-Year Plan",
    monthlyPrice: 99,
    totalPrice: 11880,
    term: "10 years",
    color: "text-[oklch(0.65_0.18_250)]",
    border: "border-[oklch(0.65_0.18_250)]/40",
    bg: "bg-[oklch(0.65_0.18_250)]/5",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

function StatusBadge({ status }: { status: string }) {
  if (status === "trial")
    return (
      <Badge className="bg-accent/20 text-accent border border-accent/40 font-semibold">
        Trial Active
      </Badge>
    );
  if (status === "active")
    return (
      <Badge className="bg-primary/20 text-primary border border-primary/40 font-semibold">
        Active Subscription
      </Badge>
    );
  if (status === "expired")
    return (
      <Badge className="bg-destructive/20 text-destructive border border-destructive/40 font-semibold">
        Subscription Expired
      </Badge>
    );
  if (status === "cancelled")
    return (
      <Badge className="bg-muted text-muted-foreground border border-border font-semibold">
        Cancelled
      </Badge>
    );
  return null;
}

function BillingHistorySection() {
  const { data: history, isLoading } = useGetRenewalHistory();

  const tierLabelMap: Record<string, string> = {
    tier1year: "1-Year Plan $299/mo",
    tier5year: "5-Year Plan $199/mo",
    tier10year: "10-Year Plan $99/mo",
  };

  function formatDate(ns: bigint): string {
    const ms = Number(ns) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function statusBadge(status: RenewalHistoryEntry["status"]) {
    if (status === Variant_Failed_Paid_Cancelled_Pending.Paid)
      return (
        <Badge className="bg-primary/20 text-primary border border-primary/40 font-semibold">
          Paid
        </Badge>
      );
    if (status === Variant_Failed_Paid_Cancelled_Pending.Cancelled)
      return (
        <Badge className="bg-muted text-muted-foreground border border-border font-semibold">
          Cancelled
        </Badge>
      );
    if (status === Variant_Failed_Paid_Cancelled_Pending.Pending)
      return (
        <Badge className="bg-accent/20 text-accent border border-accent/40 font-semibold">
          Pending
        </Badge>
      );
    return (
      <Badge className="bg-destructive/20 text-destructive border border-destructive/40 font-semibold">
        Failed
      </Badge>
    );
  }

  return (
    <div data-ocid="subscription.billing_history_section">
      <h2 className="text-lg font-semibold font-display mb-4 text-foreground">
        Billing History
      </h2>
      <Card className="border border-border bg-card">
        <CardContent className="pt-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !history || history.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="subscription.billing_history.empty_state"
            >
              No billing history yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Monthly Charge</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry, idx) => (
                    <TableRow
                      key={entry.id}
                      data-ocid={`subscription.billing_history.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {tierLabelMap[entry.tier] ?? entry.tier}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.startDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.endDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        ${(Number(entry.monthlyCharge) / 100).toFixed(2)}/mo
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        ${(Number(entry.totalPaid) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrialCountdown({
  trialStartAt,
  chargeScheduledAt,
}: {
  trialStartAt: string | null;
  chargeScheduledAt: string | null;
}) {
  if (!trialStartAt) return null;
  const start = new Date(trialStartAt).getTime();
  const now = Date.now();
  const dayElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const day = Math.min(Math.max(dayElapsed + 1, 1), 30);
  const remaining = Math.max(30 - day, 0);

  const chargeDate = chargeScheduledAt ? new Date(chargeScheduledAt) : null;
  const chargeFormatted = chargeDate
    ? chargeDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className="rounded-xl border border-accent/30 bg-accent/5 p-4"
      data-ocid="subscription.trial_countdown"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-accent">Trial Period</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-foreground">{remaining}</span>
        <span className="text-muted-foreground mb-1">days remaining</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-3">
        <div
          className="bg-accent rounded-full h-2 transition-all"
          style={{ width: `${(day / 30) * 100}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Day {day} of 30
        {chargeFormatted && (
          <span className="block mt-1 text-accent/80">
            First charge scheduled: {chargeFormatted}
          </span>
        )}
      </p>
    </div>
  );
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { data: subscription, isLoading } = useGetUserSubscription();
  const { data: trialLinks } = useGetTrialLinks();
  const switchTierMutation = useSwitchTrialTier();
  const cancelTrialMutation = useCancelTrial();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [pendingSwitchTier, setPendingSwitchTier] = useState<TierKey | null>(
    null,
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-24"
        data-ocid="subscription.loading_state"
      >
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div
        className="text-center py-24 text-muted-foreground"
        data-ocid="subscription.error_state"
      >
        Unable to load subscription data.
      </div>
    );
  }

  const status = subscription.status as string;
  const tierKey = subscription.tier as unknown as TierKey;
  const tier = (tierKey in TIER_CONFIG ? tierKey : "tier10year") as TierKey;
  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG.tier10year;

  const now = Date.now();
  const chargeTime = subscription.chargeScheduledAt
    ? Number(subscription.chargeScheduledAt) / 1_000_000
    : null;
  const chargeHasPassed = chargeTime !== null && now >= chargeTime;
  const canSwitchTier = status === "trial" && !chargeHasPassed;

  const expiresDate = subscription.subscriptionExpiresAt
    ? new Date(
        Number(subscription.subscriptionExpiresAt) / 1_000_000,
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  function handleCopyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    });
  }

  function handleSwitchRequest(newTier: TierKey) {
    setPendingSwitchTier(newTier);
    setSwitchDialogOpen(true);
  }

  function confirmSwitch() {
    if (!pendingSwitchTier) return;
    switchTierMutation.mutate(
      { newTier: pendingSwitchTier as import("@/backend").SubscriptionTier },
      {
        onSuccess: () => {
          toast.success("Plan switched successfully!");
          setSwitchDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to switch plan. Please try again.");
        },
      },
    );
  }

  function confirmCancel() {
    cancelTrialMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Trial cancelled. Your free access has ended.");
        setCancelDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to cancel trial. Please try again.");
      },
    });
  }

  const appBaseUrl = window.location.origin;

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-ocid="subscription.page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Subscription Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your Project Build Plus plan and trial access.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Current Plan Card */}
      <Card
        className={`border-2 ${tierConfig.border} ${tierConfig.bg}`}
        data-ocid="subscription.current_plan_card"
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-accent" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Plan
              </p>
              <p className={`text-xl font-bold ${tierConfig.color}`}>
                {tierConfig.label}
              </p>
            </div>
            <Separator
              orientation="vertical"
              className="h-10 hidden sm:block"
            />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Monthly Rate
              </p>
              <p className="text-xl font-bold text-foreground">
                ${tierConfig.monthlyPrice}/mo
              </p>
            </div>
            <Separator
              orientation="vertical"
              className="h-10 hidden sm:block"
            />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Commitment
              </p>
              <p className="text-xl font-bold text-foreground">
                {tierConfig.term}
              </p>
            </div>
          </div>

          {/* Trial countdown */}
          {status === "trial" && (
            <TrialCountdown
              trialStartAt={
                subscription.trialStartAt !== undefined &&
                subscription.trialStartAt !== null
                  ? new Date(
                      Number(subscription.trialStartAt) / 1_000_000,
                    ).toISOString()
                  : null
              }
              chargeScheduledAt={
                subscription.chargeScheduledAt !== undefined &&
                subscription.chargeScheduledAt !== null
                  ? new Date(
                      Number(subscription.chargeScheduledAt) / 1_000_000,
                    ).toISOString()
                  : null
              }
            />
          )}

          {/* Active subscription details */}
          {status === "active" && (
            <div
              className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2"
              data-ocid="subscription.active_details"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Active Subscription
                </span>
              </div>
              {expiresDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Expires:{" "}
                    <span className="text-foreground font-medium">
                      {expiresDate}
                    </span>
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                <AlertTriangle className="h-3 w-3 inline mr-1 text-accent" />
                This is a full, non-cancellable commitment for the{" "}
                {tierConfig.term} term. Monthly charges of $
                {tierConfig.monthlyPrice} will continue until the term expires.
              </p>
            </div>
          )}

          {/* Expired state */}
          {status === "expired" && (
            <div
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3"
              data-ocid="subscription.expired_details"
            >
              <p className="text-sm text-destructive font-semibold">
                Your subscription has expired.
              </p>
              <p className="text-xs text-muted-foreground">
                Your projects are in read-only mode. Renew to restore full
                access.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => navigate({ to: "/pricing" })}
                data-ocid="subscription.renew_button"
              >
                Renew Subscription
              </Button>
            </div>
          )}

          {/* Cancel Trial Button */}
          {status === "trial" && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setCancelDialogOpen(true)}
                data-ocid="subscription.cancel_trial_button"
              >
                Cancel Trial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Options — Switch Plan */}
      <div data-ocid="subscription.plan_options_section">
        <h2 className="text-lg font-semibold font-display mb-4 text-foreground">
          Available Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            Object.entries(TIER_CONFIG) as [
              TierKey,
              (typeof TIER_CONFIG)[TierKey],
            ][]
          ).map(([tierKey, config]) => {
            const isCurrentTier = tier === tierKey;
            return (
              <Card
                key={tierKey}
                className={`relative border-2 transition-all ${
                  isCurrentTier
                    ? `${config.border} ${config.bg}`
                    : "border-border hover:border-muted-foreground/40"
                }`}
                data-ocid={`subscription.plan_card.${tierKey}`}
              >
                <CardContent className="pt-5 pb-5 space-y-3">
                  <div className={`flex items-center gap-2 ${config.color}`}>
                    {config.icon}
                    <span className="font-bold text-sm">{config.label}</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      ${config.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /month
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config.term} commitment · 30-day trial
                  </p>
                  {isCurrentTier ? (
                    <Badge
                      className={`text-xs ${config.bg} ${config.color} border ${config.border}`}
                    >
                      Current Plan
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`w-full border-${tierKey === "tier1year" ? "primary" : tierKey === "tier5year" ? "accent" : "[oklch(0.65_0.18_250)]"}/40 hover:bg-muted`}
                      disabled={!canSwitchTier}
                      onClick={() => handleSwitchRequest(tierKey)}
                      data-ocid={`subscription.switch_plan_button.${tierKey}`}
                    >
                      Switch Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {status === "trial" && chargeHasPassed && (
          <p className="text-xs text-muted-foreground mt-3">
            <AlertTriangle className="h-3 w-3 inline mr-1 text-accent" />
            Trial period has ended — plan switching is no longer available.
          </p>
        )}
        {status !== "trial" && (
          <p className="text-xs text-muted-foreground mt-3">
            Plan switching is only available during the 30-day trial period.
          </p>
        )}
      </div>

      {/* Trial Links */}
      {trialLinks && trialLinks.length > 0 && (
        <div data-ocid="subscription.trial_links_section">
          <h2 className="text-lg font-semibold font-display mb-4 text-foreground flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-accent" />
            Trial Invite Links
          </h2>
          <Card className="border border-accent/20 bg-card">
            <CardContent className="pt-5 space-y-3">
              {trialLinks.map(
                (link: { slug: string; tier: string }, idx: number) => {
                  const fullUrl = `${appBaseUrl}/trial/${link.slug}`;
                  const linkTierConfig =
                    TIER_CONFIG[link.tier as TierKey] ?? TIER_CONFIG.tier10year;
                  return (
                    <div
                      key={link.slug}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
                      data-ocid={`subscription.trial_link.${idx + 1}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-semibold mb-0.5 ${linkTierConfig.color}`}
                        >
                          {linkTierConfig.label}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {fullUrl}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-accent/40 hover:bg-accent/10"
                        onClick={() => handleCopyLink(fullUrl)}
                        data-ocid={`subscription.copy_link_button.${idx + 1}`}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy
                      </Button>
                    </div>
                  );
                },
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing History */}
      <BillingHistorySection />

      {/* Cancel Trial Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent data-ocid="subscription.cancel_dialog">
          <DialogHeader>
            <DialogTitle className="text-destructive">Cancel Trial</DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              Are you sure you want to cancel your trial?
              <br />
              <br />
              <strong>This will end your free access immediately.</strong> All
              project data will be available in read-only mode. This action
              cannot be undone — your trial will not restart, and no charges
              will be made.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              data-ocid="subscription.cancel_dialog.cancel_button"
            >
              Keep Trial
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelTrialMutation.isPending}
              data-ocid="subscription.cancel_dialog.confirm_button"
            >
              {cancelTrialMutation.isPending
                ? "Cancelling…"
                : "Yes, Cancel Trial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch Tier Confirmation Dialog */}
      <Dialog open={switchDialogOpen} onOpenChange={setSwitchDialogOpen}>
        <DialogContent data-ocid="subscription.switch_dialog">
          <DialogHeader>
            <DialogTitle>Switch Plan</DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              {pendingSwitchTier && (
                <>
                  You are switching to the{" "}
                  <strong>{TIER_CONFIG[pendingSwitchTier].label}</strong> at{" "}
                  <strong>
                    ${TIER_CONFIG[pendingSwitchTier].monthlyPrice}/month
                  </strong>
                  .
                  <br />
                  <br />
                  Your remaining trial days carry over to the new plan. After
                  day 29 at 11:59 PM, your card on file will be charged the
                  monthly rate for your chosen plan to begin the 30-day trial
                  period.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSwitchDialogOpen(false)}
              data-ocid="subscription.switch_dialog.cancel_button"
            >
              Keep Current Plan
            </Button>
            <Button
              type="button"
              onClick={confirmSwitch}
              disabled={switchTierMutation.isPending}
              data-ocid="subscription.switch_dialog.confirm_button"
            >
              {switchTierMutation.isPending ? "Switching…" : "Confirm Switch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
