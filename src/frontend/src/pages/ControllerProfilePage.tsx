import { createActor } from "@/backend";
import { AdminControlPanel } from "@/components/AdminControlPanel";
import { ControllerOnly } from "@/components/ControllerOnly";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChangePassword,
  useControllerProfile,
  useResetCode,
  useUpdateControllerProfile,
  useValidateResetCode,
} from "@/hooks/useAuth";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCopy,
  CreditCard,
  ExternalLink,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  Save,
  User,
  UserCog,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProfileView =
  | "main"
  | "change-password"
  | "reset-step1"
  | "reset-step2"
  | "reset-step3"
  | "reset-success";
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

const PAYOUT_STATUS_STYLES: Record<string, string> = {
  succeeded: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  failed: "border-red-500/40 bg-red-500/10 text-red-400",
};

function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents);
}

export default function ControllerProfilePage() {
  return (
    <ControllerOnly>
      <ControllerProfileContent />
    </ControllerOnly>
  );
}

function ControllerProfileContent() {
  const [view, setView] = useState<ProfileView>("main");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [resetNewPw, setResetNewPw] = useState("");
  const [resetConfirmPw, setResetConfirmPw] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const { data: profile, isLoading } = useControllerProfile();
  const updateProfile = useUpdateControllerProfile();
  const generateCode = useResetCode();
  const validateCode = useValidateResetCode();
  const changePassword = useChangePassword();

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone);
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await updateProfile.mutateAsync({ name, email, phone });
      toast.success("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPw !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await changePassword.mutateAsync({
        email,
        currentPassword: currentPw,
        newPassword: newPw,
      });
      toast.success("Password changed.");
      setView("main");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed.");
    }
  }

  async function handleGetResetCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const code = await generateCode.mutateAsync({ email: resetEmail });
      setGeneratedCode(code);
      setView("reset-step2");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email not found.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (resetNewPw !== resetConfirmPw) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await validateCode.mutateAsync({
        email: resetEmail,
        code: resetCode,
        newPassword: resetNewPw,
      });
      setView("reset-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid reset code.");
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">
            Controller Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account credentials and contact information.
          </p>
        </div>
        <Link to="/controller-account">
          <div
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-900/20 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-900/40 transition-colors"
            data-ocid="controller_profile.account_page_link"
          >
            <UserCog className="h-4 w-4" />
            Controller Account
          </div>
        </Link>
      </div>

      {/* ── MAIN PROFILE VIEW ── */}
      {view === "main" && (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Profile Information
              </h2>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctrl-name">Full Name</Label>
              <Input
                id="ctrl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Joseph Warren"
                data-ocid="controller_profile.name_input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctrl-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ctrl-email"
                  type="email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pwarre12@mail.ccsf.edu"
                  data-ocid="controller_profile.email_input"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctrl-phone">Phone Number (reference only)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ctrl-phone"
                  type="tel"
                  className="pl-9"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1(281) 787-4910"
                  data-ocid="controller_profile.phone_input"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Stored for reference. SMS is not available on this platform.
              </p>
            </div>
            {error && (
              <p
                className="text-sm text-red-500"
                data-ocid="controller_profile.error_state"
              >
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full"
            data-ocid="controller_profile.save_button"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Profile
          </Button>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setView("change-password");
                setError("");
              }}
              className="flex-1"
              data-ocid="controller_profile.change_password_button"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setView("reset-step1");
                setResetEmail(email);
                setError("");
              }}
              className="flex-1 text-muted-foreground"
              data-ocid="controller_profile.reset_password_link"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Reset my password
            </Button>
          </div>
        </form>
      )}

      {/* ── CHANGE PASSWORD ── */}
      {view === "change-password" && (
        <form
          onSubmit={handleChangePassword}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h2 className="font-semibold">Change Password</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-pw">Current Password</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              data-ocid="controller_profile.current_password_input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-pw">New Password</Label>
            <Input
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              data-ocid="controller_profile.new_password_input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-pw">Confirm New Password</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              data-ocid="controller_profile.confirm_password_input"
            />
          </div>
          {error && (
            <p
              className="text-sm text-red-500"
              data-ocid="controller_profile.error_state"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={changePassword.isPending}
              className="flex-1"
              data-ocid="controller_profile.save_password_button"
            >
              {changePassword.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update Password"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setView("main");
                setError("");
              }}
              data-ocid="controller_profile.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ── RESET STEP 1 ── */}
      {view === "reset-step1" && (
        <form
          onSubmit={handleGetResetCode}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h2 className="font-semibold">Reset Password — Step 1</h2>
          <p className="text-sm text-muted-foreground">
            Confirm your email to generate a reset code.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-em">Email</Label>
            <Input
              id="reset-em"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              data-ocid="controller_profile.reset_email_input"
            />
          </div>
          {error && (
            <p
              className="text-sm text-red-500"
              data-ocid="controller_profile.error_state"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={generateCode.isPending}
              className="flex-1"
              data-ocid="controller_profile.get_code_button"
            >
              {generateCode.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Get Reset Code"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setView("main");
                setError("");
              }}
              data-ocid="controller_profile.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ── RESET STEP 2: Show code ── */}
      {view === "reset-step2" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Your Reset Code</h2>
          <p className="text-sm text-muted-foreground">
            Copy this code to use in the next step.
          </p>
          <div
            className="w-full rounded-xl border-2 border-emerald-400/60 bg-emerald-900/30 py-5 text-center"
            data-ocid="controller_profile.reset_code_display"
          >
            <span className="font-mono text-3xl font-bold tracking-[0.25em] text-emerald-300">
              {generatedCode}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={copyCode}
            className="w-full flex items-center gap-2 border-emerald-400/40 text-emerald-300"
            data-ocid="controller_profile.copy_code_button"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setView("reset-step3");
              setError("");
            }}
            className="w-full"
            data-ocid="controller_profile.enter_new_password_button"
          >
            Got it — enter my new password
          </Button>
        </div>
      )}

      {/* ── RESET STEP 3 ── */}
      {view === "reset-step3" && (
        <form
          onSubmit={handleResetPassword}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h2 className="font-semibold">Set New Password</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-code-field">Reset Code</Label>
            <Input
              id="reset-code-field"
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="font-mono tracking-widest"
              maxLength={6}
              required
              data-ocid="controller_profile.reset_code_input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-new-pw">New Password</Label>
            <Input
              id="reset-new-pw"
              type="password"
              value={resetNewPw}
              onChange={(e) => setResetNewPw(e.target.value)}
              required
              data-ocid="controller_profile.reset_new_password_input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-confirm-pw">Confirm Password</Label>
            <Input
              id="reset-confirm-pw"
              type="password"
              value={resetConfirmPw}
              onChange={(e) => setResetConfirmPw(e.target.value)}
              required
              data-ocid="controller_profile.reset_confirm_password_input"
            />
          </div>
          {error && (
            <p
              className="text-sm text-red-500"
              data-ocid="controller_profile.error_state"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={validateCode.isPending}
              className="flex-1"
              data-ocid="controller_profile.set_password_button"
            >
              {validateCode.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Set New Password"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setView("main");
                setError("");
              }}
              data-ocid="controller_profile.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ── RESET SUCCESS ── */}
      {view === "reset-success" && (
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900/40 border border-emerald-400/40">
            <Check className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="font-semibold text-lg">Password Updated!</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been reset successfully.
          </p>
          <Button
            type="button"
            onClick={() => setView("main")}
            className="w-full"
            data-ocid="controller_profile.done_button"
          >
            Done
          </Button>
        </div>
      )}

      {/* ── PAYMENT ACCOUNT ── */}
      <PaymentAccountSection />

      {/* ── ADMIN CONTROL PANEL ── */}
      <AdminControlPanel />
    </div>
  );
}

function PaymentAccountSection() {
  const { actor, isFetching } = useActor(createActor);

  const [account, setAccount] = useState<BankAccount | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [nextPayoutDate, setNextPayoutDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);

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
    setSectionError(null);
    try {
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
      setSectionError("Unable to load payment account data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setEditHolder(account?.accountHolderName ?? "");
    setEditLast4(account?.accountNumberLast4 ?? "");
    setEditRouting(account?.routingNumber ?? "");
    setSectionError(null);
    setEditMode(true);
  }

  async function handleSave() {
    if (!actor) return;
    const last4 = editLast4.replace(/\D/g, "").slice(-4);
    if (
      !editHolder.trim() ||
      last4.length !== 4 ||
      editRouting.replace(/\D/g, "").length !== 9
    ) {
      setSectionError(
        "Please fill in all fields. Account number requires 4 digits; routing number must be exactly 9 digits.",
      );
      return;
    }
    setSaving(true);
    setSectionError(null);
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
      toast.success("Payment account saved.");
    } catch {
      setSectionError("Failed to save payment account. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5" data-ocid="payment_account.section">
      <Separator />

      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700/20 border border-blue-700/30">
          <Wallet className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h2 className="font-semibold text-base font-display">
            Payment Account
          </h2>
          <p className="text-xs text-muted-foreground">
            Receive monthly subscription payments
          </p>
        </div>
        <a
          href="https://dashboard.stripe.com/settings/payouts"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto"
          data-ocid="payment_account.stripe_link"
        >
          <Button
            type="button"
            size="sm"
            className="bg-blue-700 hover:bg-blue-800 text-white gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Manage in Stripe Dashboard
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>

      {/* Loading skeleton */}
      {(loading || isFetching) && (
        <div className="space-y-3" data-ocid="payment_account.loading_state">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      )}

      {!loading && !isFetching && (
        <>
          {/* Error */}
          {sectionError && (
            <div
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              data-ocid="payment_account.error_state"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {sectionError}
            </div>
          )}

          {/* Account details card */}
          <div
            className="rounded-xl border border-border bg-card p-5 space-y-5"
            data-ocid="payment_account.details_card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold">
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
                  data-ocid="payment_account.verified_badge"
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

            {/* Empty state */}
            {!account && !editMode && (
              <div
                className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 py-10"
                data-ocid="payment_account.empty_state"
              >
                <Building2 className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No payment account connected yet.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleEdit}
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                  data-ocid="payment_account.add_button"
                >
                  Add Bank Account
                </Button>
              </div>
            )}

            {/* Edit / add form */}
            {editMode && (
              <div className="space-y-4" data-ocid="payment_account.edit_form">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label
                      htmlFor="pa-holder"
                      className="text-xs text-muted-foreground"
                    >
                      Account Holder Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pa-holder"
                        value={editHolder}
                        onChange={(e) => setEditHolder(e.target.value)}
                        placeholder="Full legal name on account"
                        className="pl-9 border-blue-700/30 focus-visible:ring-blue-700/40"
                        data-ocid="payment_account.holder_name_input"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="pa-routing"
                      className="text-xs text-muted-foreground"
                    >
                      Routing Number (9 digits)
                    </Label>
                    <Input
                      id="pa-routing"
                      value={editRouting}
                      onChange={(e) =>
                        setEditRouting(
                          e.target.value.replace(/\D/g, "").slice(0, 9),
                        )
                      }
                      placeholder="e.g. 021000021"
                      maxLength={9}
                      className="border-blue-700/30 focus-visible:ring-blue-700/40"
                      data-ocid="payment_account.routing_number_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="pa-acct"
                      className="text-xs text-muted-foreground"
                    >
                      Account Number (last 4 digits)
                    </Label>
                    <Input
                      id="pa-acct"
                      value={editLast4}
                      onChange={(e) =>
                        setEditLast4(
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      placeholder="e.g. 4321"
                      maxLength={4}
                      className="border-blue-700/30 focus-visible:ring-blue-700/40"
                      data-ocid="payment_account.account_number_input"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(false);
                      setSectionError(null);
                    }}
                    disabled={saving}
                    data-ocid="payment_account.cancel_button"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                    data-ocid="payment_account.save_button"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1" />
                    )}
                    {saving ? "Saving…" : "Save Account"}
                  </Button>
                </div>
              </div>
            )}

            {/* Saved account summary */}
            {account && !editMode && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Account Holder
                    </p>
                    <p className="text-sm font-medium truncate">
                      {account.accountHolderName}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Account Number
                    </p>
                    <p className="text-sm font-medium">
                      •••• •••• {account.accountNumberLast4}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Routing Number
                    </p>
                    <p className="text-sm font-medium">
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
                    data-ocid="payment_account.edit_button"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Next payout */}
          <div
            className="rounded-xl border border-border bg-card p-5"
            data-ocid="payment_account.next_payout_section"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold">
                Next Scheduled Payout
              </span>
            </div>
            {nextPayoutDate ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
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
                No scheduled payout found. Connect your bank account and
                configure payouts in Stripe to set up automatic transfers.
              </p>
            )}
          </div>

          {/* Recent payouts */}
          {payouts.length > 0 && (
            <div
              className="rounded-xl border border-border bg-card overflow-hidden"
              data-ocid="payment_account.payouts_table"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold">Recent Payouts</span>
                <Badge
                  variant="outline"
                  className="ml-auto text-xs border-blue-500/30 bg-blue-500/10 text-blue-400"
                >
                  Last {payouts.length}
                </Badge>
              </div>
              <div className="divide-y divide-border">
                {payouts.map((p, i) => (
                  <div
                    key={`${p.date}-${p.amount}-${i}`}
                    className="flex items-center justify-between px-5 py-3"
                    data-ocid={`payment_account.payout.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatUSD(p.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize border ${
                        PAYOUT_STATUS_STYLES[p.status.toLowerCase()] ??
                        "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
