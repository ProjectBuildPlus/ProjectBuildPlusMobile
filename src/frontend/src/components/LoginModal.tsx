import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearSession,
  setSession,
  useEmailLogin,
  useResetCode,
  useValidateResetCode,
} from "@/hooks/useAuth";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Check,
  ClipboardCopy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

type ModalView =
  | "login"
  | "reset-step1"
  | "reset-step2"
  | "reset-step3"
  | "reset-success";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [view, setView] = useState<ModalView>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const emailLogin = useEmailLogin();
  const generateCode = useResetCode();
  const validateCode = useValidateResetCode();
  const { login } = useInternetIdentity();

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // ── Step 1: sign in with email + password
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await emailLogin.mutateAsync({ email, password });
      clearSession();
      setSession({ email: res.email, name: res.name, isLoggedIn: true });
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password.",
      );
    }
  }

  // ── Reset Step 1: request reset code
  async function handleGetCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const code = await generateCode.mutateAsync({ email });
      setGeneratedCode(code);
      setView("reset-step2");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email not found.");
    }
  }

  // ── Reset Step 3: set new password
  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await validateCode.mutateAsync({ email, code: resetCode, newPassword });
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

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[oklch(0.14_0.015_260)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            {view === "login" && <LogIn className="h-5 w-5 text-amber-400" />}
            {view.startsWith("reset") && (
              <KeyRound className="h-5 w-5 text-teal-400" />
            )}
            <span className="font-display text-base font-semibold text-white">
              {view === "login" && "Sign In to Project Build Plus"}
              {view === "reset-step1" && "Reset Password — Step 1"}
              {view === "reset-step2" && "Your Reset Code"}
              {view === "reset-step3" && "Set New Password"}
              {view === "reset-success" && "Password Updated"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/50 hover:text-white transition-colors"
            aria-label="Close"
            data-ocid="login_modal.close_button"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {/* ── LOGIN VIEW ── */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-white/80 text-sm" htmlFor="login-email">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="pwarre12@mail.ccsf.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-amber-400/60"
                    required
                    data-ocid="login_modal.email_input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  className="text-white/80 text-sm"
                  htmlFor="login-password"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-amber-400/60"
                    required
                    data-ocid="login_modal.password_input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-white/40 hover:text-white/70"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="text-sm text-red-400"
                  data-ocid="login_modal.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={emailLogin.isPending}
                className="w-full bg-gradient-to-r from-amber-400 to-teal-400 text-slate-900 font-semibold hover:scale-[1.02] transition-all"
                data-ocid="login_modal.submit_button"
              >
                {emailLogin.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing
                    in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setView("reset-step1");
                    setError("");
                  }}
                  className="text-sm text-amber-400/80 hover:text-amber-300 transition-colors"
                  data-ocid="login_modal.forgot_password_link"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => login()}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                  data-ocid="login_modal.ii_login_link"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Sign in with Internet Identity instead
                </button>
              </div>
            </form>
          )}

          {/* ── RESET STEP 1: Enter name + email ── */}
          {view === "reset-step1" && (
            <form onSubmit={handleGetCode} className="flex flex-col gap-4">
              <p className="text-sm text-white/60">
                Enter your name and email to receive a reset code.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label className="text-white/80 text-sm" htmlFor="reset-name">
                  Full Name
                </Label>
                <Input
                  id="reset-name"
                  type="text"
                  placeholder="Joseph Warren"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                  data-ocid="login_modal.reset_name_input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-white/80 text-sm" htmlFor="reset-email">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="pwarre12@mail.ccsf.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                  data-ocid="login_modal.reset_email_input"
                />
              </div>
              {error && (
                <p
                  className="text-sm text-red-400"
                  data-ocid="login_modal.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={generateCode.isPending}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white"
                data-ocid="login_modal.get_code_button"
              >
                {generateCode.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Get Reset Code"
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setError("");
                }}
                className="text-sm text-white/40 hover:text-white/70 text-center"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* ── RESET STEP 2: Display code ── */}
          {view === "reset-step2" && (
            <div className="flex flex-col items-center gap-5">
              <p className="text-sm text-white/60 text-center">
                Here is your 6-character reset code. Copy it and use it in the
                next step.
              </p>
              <div
                className="w-full rounded-xl border-2 border-emerald-400/60 bg-emerald-900/30 py-5 text-center"
                data-ocid="login_modal.reset_code_display"
              >
                <span className="font-mono text-3xl font-bold tracking-[0.25em] text-emerald-300">
                  {generatedCode}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={copyCode}
                className="flex items-center gap-2 border-emerald-400/40 text-emerald-300 hover:bg-emerald-900/40"
                data-ocid="login_modal.copy_code_button"
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
                className="w-full bg-gradient-to-r from-amber-400 to-teal-400 text-slate-900 font-semibold"
                data-ocid="login_modal.enter_new_password_button"
              >
                Got it — enter my new password
              </Button>
            </div>
          )}

          {/* ── RESET STEP 3: Enter code + new password ── */}
          {view === "reset-step3" && (
            <form
              onSubmit={handleSetNewPassword}
              className="flex flex-col gap-4"
            >
              <p className="text-sm text-white/60">
                Enter the reset code and your new password.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label
                  className="text-white/80 text-sm"
                  htmlFor="confirm-email"
                >
                  Email
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="pwarre12@mail.ccsf.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                  data-ocid="login_modal.confirm_email_input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  className="text-white/80 text-sm"
                  htmlFor="reset-code-input"
                >
                  Reset Code
                </Label>
                <Input
                  id="reset-code-input"
                  type="text"
                  placeholder="ABC123"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  className="font-mono bg-white/5 border-white/15 text-white placeholder:text-white/30 tracking-widest"
                  maxLength={6}
                  required
                  data-ocid="login_modal.reset_code_input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-white/80 text-sm" htmlFor="new-password">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                  data-ocid="login_modal.new_password_input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  className="text-white/80 text-sm"
                  htmlFor="confirm-password"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                  data-ocid="login_modal.confirm_password_input"
                />
              </div>
              {error && (
                <p
                  className="text-sm text-red-400"
                  data-ocid="login_modal.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={validateCode.isPending}
                className="w-full bg-gradient-to-r from-amber-400 to-teal-400 text-slate-900 font-semibold"
                data-ocid="login_modal.set_new_password_button"
              >
                {validateCode.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Set New Password"
                )}
              </Button>
            </form>
          )}

          {/* ── RESET SUCCESS ── */}
          {view === "reset-success" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/40 border border-emerald-400/40">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Password Updated!
              </h3>
              <p className="text-sm text-white/60">
                Your password has been changed. Sign in with your new
                credentials.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setView("login");
                  setPassword("");
                  setError("");
                }}
                className="w-full bg-gradient-to-r from-amber-400 to-teal-400 text-slate-900 font-semibold"
                data-ocid="login_modal.back_to_login_button"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
