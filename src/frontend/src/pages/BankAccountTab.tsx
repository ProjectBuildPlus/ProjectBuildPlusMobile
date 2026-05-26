import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Pencil,
  Save,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface BankAccount {
  accountHolderName: string;
  accountNumberLast4: string;
  routingNumber: string;
  isVerified: boolean;
  connectedToStripe: boolean;
  nextPayoutDate?: string;
}

interface PayoutRecord {
  amount: number;
  date: string;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  succeeded: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  failed: "border-red-500/40 bg-red-500/10 text-red-400",
};

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function BankAccountTab() {
  const { actor, isFetching } = useActor(createActor);

  const [account, setAccount] = useState<BankAccount | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [nextPayoutDate, setNextPayoutDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Edit form state
  const [editHolder, setEditHolder] = useState("");
  const [editLast4, setEditLast4] = useState("");
  const [editRouting, setEditRouting] = useState("");

  useEffect(() => {
    if (!actor || isFetching) return;
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, isFetching]);

  async function loadData() {
    if (!actor) return;
    setLoading(true);
    setError(null);
    try {
      // Cast to access bank account methods added to backend
      const a = actor as typeof actor & {
        getBankAccount(): Promise<BankAccount | null>;
        getPayoutRecords(): Promise<PayoutRecord[]>;
        getNextPayoutDate(): Promise<string | null>;
      };
      const [acctResult, payoutResult, nextDateResult] = await Promise.all([
        a.getBankAccount(),
        a.getPayoutRecords(),
        a.getNextPayoutDate(),
      ]);
      setAccount(
        acctResult !== null && acctResult !== undefined ? acctResult : null,
      );
      setPayouts((payoutResult ?? []).slice(-5).reverse());
      setNextPayoutDate(
        nextDateResult !== null && nextDateResult !== undefined
          ? nextDateResult
          : null,
      );
    } catch {
      setError("Unable to load bank account data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setEditHolder(account?.accountHolderName ?? "");
    setEditLast4(account?.accountNumberLast4 ?? "");
    setEditRouting(account?.routingNumber ?? "");
    setEditMode(true);
  }

  function handleCancel() {
    setEditMode(false);
  }

  async function handleSave() {
    if (!actor) return;
    const last4 = editLast4.replace(/\D/g, "").slice(-4);
    if (!editHolder.trim() || last4.length !== 4 || editRouting.length !== 9) {
      setError(
        "Please fill in all fields. Account number must end with 4 digits; routing number must be 9 digits.",
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const a = actor as typeof actor & {
        saveBankAccount(
          holderName: string,
          accountNumberLast4: string,
          routingNumber: string,
        ): Promise<void>;
      };
      await a.saveBankAccount(editHolder.trim(), last4, editRouting.trim());
      setAccount({
        accountHolderName: editHolder.trim(),
        accountNumberLast4: last4,
        routingNumber: editRouting.trim(),
        isVerified: false,
        connectedToStripe: account?.connectedToStripe ?? false,
        nextPayoutDate: account?.nextPayoutDate,
      });
      setEditMode(false);
    } catch {
      setError("Failed to save bank account. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || isFetching) {
    return (
      <div className="space-y-4" data-ocid="bank_account.loading_state">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="bank_account.panel">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700/20">
            <Building2 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Bank Account & Payouts
            </h2>
            <p className="text-xs text-muted-foreground">
              Receive subscription payments directly from Stripe
            </p>
          </div>
        </div>
        <a
          href="https://dashboard.stripe.com/settings/payouts"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="bank_account.stripe_button"
        >
          <Button
            type="button"
            size="sm"
            className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Connect to Stripe Payout Settings
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          data-ocid="bank_account.error_state"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Account Details Card */}
      <div
        className="rounded-xl border border-border bg-card p-5 space-y-5"
        data-ocid="bank_account.details_card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-foreground">
              Bank Account Details
            </span>
          </div>
          {account && (
            <Badge
              variant="outline"
              className={`text-xs border ${
                account.isVerified
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-400"
              }`}
              data-ocid="bank_account.verified_badge"
            >
              {account.isVerified ? (
                <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Unverified
                </span>
              )}
            </Badge>
          )}
        </div>

        {!account && !editMode ? (
          <div
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 py-10"
            data-ocid="bank_account.empty_state"
          >
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No bank account connected yet.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleEdit}
              className="bg-blue-700 hover:bg-blue-800 text-white"
              data-ocid="bank_account.add_button"
            >
              Add Bank Account
            </Button>
          </div>
        ) : editMode ? (
          <div className="space-y-4" data-ocid="bank_account.edit_form">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Account Holder Name
                </Label>
                <Input
                  value={editHolder}
                  onChange={(e) => setEditHolder(e.target.value)}
                  placeholder="Full legal name"
                  className="border-blue-700/30 focus-visible:ring-blue-700/40"
                  data-ocid="bank_account.holder_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Account Number (last 4 digits)
                </Label>
                <Input
                  value={editLast4}
                  onChange={(e) =>
                    setEditLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="e.g. 4321"
                  maxLength={4}
                  className="border-blue-700/30 focus-visible:ring-blue-700/40"
                  data-ocid="bank_account.account_number_input"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  Routing Number (9 digits)
                </Label>
                <Input
                  value={editRouting}
                  onChange={(e) =>
                    setEditRouting(
                      e.target.value.replace(/\D/g, "").slice(0, 9),
                    )
                  }
                  placeholder="e.g. 021000021"
                  maxLength={9}
                  className="border-blue-700/30 focus-visible:ring-blue-700/40"
                  data-ocid="bank_account.routing_number_input"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
                data-ocid="bank_account.cancel_button"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-700 hover:bg-blue-800 text-white"
                data-ocid="bank_account.save_button"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving…" : "Save Account"}
              </Button>
            </div>
          </div>
        ) : (
          account && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Account Holder
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {account.accountHolderName}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Account Number
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    •••• •••• {account.accountNumberLast4}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Routing Number
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {account.routingNumber}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="border-blue-700/40 text-blue-500 hover:bg-blue-700/10"
                  data-ocid="bank_account.edit_button"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Next Payout Section */}
      <div
        className="rounded-xl border border-border bg-card p-5"
        data-ocid="bank_account.next_payout_section"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">
            Next Payout
          </span>
        </div>
        {nextPayoutDate ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Scheduled for{" "}
                <span className="text-amber-400 font-semibold">
                  {new Date(nextPayoutDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stripe processes payouts automatically based on your payout
                schedule.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No scheduled payout found. Connect your bank account and configure
            payouts in Stripe to set up automatic transfers.
          </p>
        )}
      </div>

      {/* Recent Payouts Table */}
      <div
        className="rounded-xl border border-border bg-card overflow-hidden"
        data-ocid="bank_account.payouts_table"
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <CheckCircle2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-foreground">
            Recent Payouts
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            Last 5 entries
          </span>
        </div>

        {payouts.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 py-10"
            data-ocid="bank_account.payouts_empty_state"
          >
            <CreditCard className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No payouts recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2.5 text-left">Date</th>
                  <th className="px-5 py-2.5 text-right">Amount</th>
                  <th className="px-5 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((payout, idx) => (
                  <tr
                    key={`${payout.date}-${idx}`}
                    className="hover:bg-muted/10 transition-colors"
                    data-ocid={`bank_account.payout_item.${idx + 1}`}
                  >
                    <td className="px-5 py-3 text-muted-foreground">
                      {payout.date}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-medium text-foreground tabular-nums">
                      {formatUSD(payout.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Badge
                        variant="outline"
                        className={`text-xs border capitalize ${
                          STATUS_STYLES[payout.status.toLowerCase()] ??
                          "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {payout.status.toLowerCase() === "succeeded" && (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {payout.status.toLowerCase() === "failed" && (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {payout.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
