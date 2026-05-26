import { ControllerOnly } from "@/components/ControllerOnly";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useChangePassword,
  useControllerProfile,
  useResetCode,
  useUpdateControllerProfile,
  useValidateResetCode,
} from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ClipboardCopy,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  User,
  UserCog,
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
    </div>
  );
}
