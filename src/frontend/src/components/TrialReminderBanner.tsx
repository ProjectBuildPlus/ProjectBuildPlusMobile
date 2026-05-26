import {
  useDismissReminder,
  useGetReminderState,
  useGetUserSubscription,
} from "@/hooks/useSubscription";
import { Link } from "@tanstack/react-router";
import { AlertCircle, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

const TIER_NAMES: Record<string, string> = {
  tier1year: "1-Year",
  tier5year: "5-Year",
  tier10year: "10-Year",
};

const TIER_AMOUNTS: Record<string, string> = {
  tier1year: "$299.00",
  tier5year: "$199.00",
  tier10year: "$99.00",
};

export function TrialReminderBanner() {
  const { data: subscription } = useGetUserSubscription();
  const { data: reminderState } = useGetReminderState();
  const dismissReminder = useDismissReminder();
  const [hidden, setHidden] = useState(false);

  if (!subscription || subscription.status !== "trial") return null;
  if (hidden) return null;

  const trialStartMs = Number(subscription.trialStartAt / 1_000_000n);
  const daysSinceStart = Math.floor(
    (Date.now() - trialStartMs) / (1000 * 60 * 60 * 24),
  );
  const daysRemaining = Math.max(0, 30 - daysSinceStart);

  const isDay26Dismissed = reminderState?.day26Dismissed ?? false;
  const isDay28Dismissed = reminderState?.day28Dismissed ?? false;

  const showDay28 = daysSinceStart >= 28 && !isDay28Dismissed;
  const showDay26 = daysSinceStart >= 26 && !isDay26Dismissed && !showDay28;

  if (!showDay26 && !showDay28) return null;

  const planName = TIER_NAMES[subscription.tier] || subscription.tier;
  const amount = TIER_AMOUNTS[subscription.tier] || "";

  const handleDismiss = (day: number) => {
    dismissReminder.mutate(day);
    setHidden(true);
    // TODO: When email extension is enabled, setReminderEmailSent(day) should be called here to trigger the email reminder
  };

  if (showDay28) {
    return (
      <div
        className="relative border-b bg-destructive/10 px-4 py-3"
        data-ocid="trial_reminder.banner.day28"
      >
        <div className="mx-auto flex max-w-7xl items-start gap-3 sm:items-center">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive sm:mt-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-destructive">Urgent:</span> Your{" "}
            {planName} trial ends in {daysRemaining} day
            {daysRemaining !== 1 ? "s" : ""} — your card will be charged{" "}
            {amount} tomorrow at 11:59 PM.{" "}
            <Link
              to="/subscription"
              className="font-medium underline text-destructive hover:text-destructive/80"
              data-ocid="trial_reminder.manage_link"
            >
              Manage payment settings.
            </Link>
          </div>
          <button
            type="button"
            onClick={() => handleDismiss(28)}
            className="rounded-md p-1 text-destructive hover:bg-destructive/20"
            aria-label="Dismiss reminder"
            data-ocid="trial_reminder.dismiss_button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative border-b bg-accent/10 px-4 py-3"
      data-ocid="trial_reminder.banner.day26"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 sm:items-center">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent sm:mt-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold text-accent-foreground">
            Reminder:
          </span>{" "}
          Your {planName} trial ends in {daysRemaining} day
          {daysRemaining !== 1 ? "s" : ""} — your card will be charged {amount}{" "}
          on day 29 at 11:59 PM.{" "}
          <Link
            to="/subscription"
            className="font-medium underline text-accent-foreground hover:text-accent-foreground/80"
            data-ocid="trial_reminder.manage_link"
          >
            Manage payment settings.
          </Link>
        </div>
        <button
          type="button"
          onClick={() => handleDismiss(26)}
          className="rounded-md p-1 text-accent-foreground hover:bg-accent/20"
          aria-label="Dismiss reminder"
          data-ocid="trial_reminder.dismiss_button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
