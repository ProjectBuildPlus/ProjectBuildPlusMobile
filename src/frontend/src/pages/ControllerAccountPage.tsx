import { ControllerOnly } from "@/components/ControllerOnly";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  useActiveSessions,
  useAddLoginEmail,
  useChangeControllerPassword,
  useEndSession,
  useFeatureLocks,
  useGetLoginEmails,
  useLoginHistory,
  useRemoveLoginEmail,
  useSetFeatureLock,
} from "@/hooks/useAuth";
import type {
  FeatureLocks,
  LoginSnapshot,
  SessionSnapshot,
} from "@/hooks/useAuth";
import {
  useAssignAdmin,
  useGetAdminList,
  useRevokeAdmin,
} from "@/hooks/useSubscription";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  Key,
  KeyRound,
  Laptop,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Monitor,
  PlusCircle,
  Shield,
  Smartphone,
  Trash2,
  Unlock,
  UserCheck,
  UserX,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FeatureKey = keyof FeatureLocks;

const FEATURES: {
  key: FeatureKey;
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  {
    key: "scheduling",
    label: "Scheduling",
    desc: "Gantt charts, CPM, crash factors",
    Icon: CalendarDays,
  },
  {
    key: "cost",
    label: "Cost",
    desc: "Cash curves, cost code breakdowns",
    Icon: DollarSign,
  },
  {
    key: "resources",
    label: "Resources",
    desc: "Labor, equipment, resource leveling",
    Icon: Wrench,
  },
  {
    key: "compliance",
    label: "Compliance",
    desc: "OSHA, ANSI, IBC, safety standards",
    Icon: Shield,
  },
  {
    key: "participants",
    label: "Participants",
    desc: "Roles, directory, assignments",
    Icon: Users,
  },
  {
    key: "documents",
    label: "Documents",
    desc: "AIA forms, submittals, uploads",
    Icon: FileText,
  },
  {
    key: "oacMeetings",
    label: "OAC Meetings",
    desc: "Meeting tabs, Zoom, minutes",
    Icon: BookOpen,
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    desc: "Billing, trials, renewals",
    Icon: Briefcase,
  },
];

const MOCK_LOGIN_HISTORY: LoginSnapshot[] = [
  {
    id: "l1",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0",
    ipAddress: "192.168.1.1",
  },
  {
    id: "l2",
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile/15E148",
    ipAddress: "192.168.1.2",
  },
  {
    id: "l3",
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/124.0",
    ipAddress: "192.168.1.3",
  },
  {
    id: "l4",
    timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    ipAddress: "192.168.1.1",
  },
  {
    id: "l5",
    timestamp: Date.now() - 28 * 24 * 60 * 60 * 1000,
    userAgent: "Mozilla/5.0 (Linux; Android 13) Chrome/124.0 Mobile",
    ipAddress: "192.168.1.4",
  },
];

const MOCK_ACTIVE_SESSIONS: SessionSnapshot[] = [
  {
    sessionId: "sess-current",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0",
    lastActive: Date.now() - 60 * 1000,
    isCurrent: true,
  },
];

const MOCK_FEATURE_LOCKS: FeatureLocks = {
  scheduling: true,
  cost: true,
  resources: true,
  compliance: true,
  participants: true,
  documents: true,
  oacMeetings: true,
  subscriptions: true,
};

function parseBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Browser";
}

function isMobileUA(ua: string): boolean {
  return /iPhone|Android|iPad|Mobile/.test(ua);
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function ControllerAccountPage() {
  return (
    <ControllerOnly>
      <ControllerAccountContent />
    </ControllerOnly>
  );
}

function ControllerAccountContent() {
  const { data: loginHistory, isLoading: historyLoading } = useLoginHistory();
  const { data: activeSessions, isLoading: sessionsLoading } =
    useActiveSessions();
  const { data: featureLocks, isLoading: locksLoading } = useFeatureLocks();
  const { data: adminList, isLoading: adminsLoading } = useGetAdminList();

  const endSession = useEndSession();
  const setFeatureLock = useSetFeatureLock();
  const _assignAdmin = useAssignAdmin();
  const revokeAdmin = useRevokeAdmin();

  const { data: loginEmails, isLoading: emailsLoading } = useGetLoginEmails();
  const addLoginEmail = useAddLoginEmail();
  const removeLoginEmail = useRemoveLoginEmail();
  const changeControllerPassword = useChangeControllerPassword();

  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  // Controller Email & Password Management state
  const [ctrlEmails, setCtrlEmails] = useState<string[]>([
    "pwarre12@mail.ccsf.edu",
  ]);
  const [addCtrlEmail, setAddCtrlEmail] = useState("");
  const [addCtrlEmailError, setAddCtrlEmailError] = useState("");
  const [ctrlPwNew, setCtrlPwNew] = useState("");
  const [ctrlPwConfirm, setCtrlPwConfirm] = useState("");
  const [ctrlPwError, setCtrlPwError] = useState("");
  const [ctrlPwSuccess, setCtrlPwSuccess] = useState("");

  const history =
    loginHistory && loginHistory.length > 0 ? loginHistory : MOCK_LOGIN_HISTORY;
  const sessions =
    activeSessions && activeSessions.length > 0
      ? activeSessions
      : MOCK_ACTIVE_SESSIONS;
  const locks: FeatureLocks = featureLocks ?? MOCK_FEATURE_LOCKS;

  async function handleToggleLock(key: FeatureKey, currentLocked: boolean) {
    try {
      await setFeatureLock.mutateAsync({
        feature: key,
        locked: !currentLocked,
      });
      toast.success(`${key} ${!currentLocked ? "locked" : "unlocked"}.`);
    } catch {
      toast.error("Failed to update feature lock.");
    }
  }

  async function handleEndSession(sessionId: string) {
    try {
      await endSession.mutateAsync({ sessionId });
      toast.success("Session signed out.");
    } catch {
      toast.error("Failed to end session.");
    }
  }

  async function handleAssignAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!addAdminEmail.trim()) return;
    toast.info(
      "Admin assignment requires a valid Principal. Use the admin panel for email-based assignment.",
    );
    setAddAdminEmail("");
    setShowAddAdmin(false);
  }

  async function handleRevokeAdmin(principal: unknown) {
    try {
      await revokeAdmin.mutateAsync({ principal: principal as never });
      toast.success("Admin access revoked.");
    } catch {
      toast.error("Failed to revoke admin.");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!newPassword.trim()) {
      setPasswordError("Password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    try {
      await changeControllerPassword.mutateAsync({ newPassword });
      setPasswordSuccess("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    }
  }

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    if (!newEmailInput.trim()) {
      setEmailError("Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailInput.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    try {
      await addLoginEmail.mutateAsync({ email: newEmailInput.trim() });
      setNewEmailInput("");
      toast.success("Email added successfully.");
    } catch (err) {
      setEmailError(
        err instanceof Error ? err.message : "Failed to add email.",
      );
    }
  }

  async function handleRemoveEmail(email: string) {
    try {
      await removeLoginEmail.mutateAsync({ email });
      toast.success("Email removed.");
    } catch {
      toast.error("Failed to remove email.");
    }
  }

  const emails = loginEmails ?? ["pwarre12@mail.ccsf.edu"];
  const primaryEmail = "pwarre12@mail.ccsf.edu";

  // ── Controller Email & Password handlers ──
  function handleAddCtrlEmail(e: React.FormEvent) {
    e.preventDefault();
    setAddCtrlEmailError("");
    const trimmed = addCtrlEmail.trim();
    if (!trimmed) {
      setAddCtrlEmailError("Email is required.");
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(trimmed)) {
      setAddCtrlEmailError("Please enter a valid email address.");
      return;
    }
    if (ctrlEmails.includes(trimmed)) {
      setAddCtrlEmailError("This email is already on the list.");
      return;
    }
    setCtrlEmails((prev) => [...prev, trimmed]);
    setAddCtrlEmail("");
  }

  function handleRemoveCtrlEmail(em: string) {
    if (em === primaryEmail) return;
    setCtrlEmails((prev) => prev.filter((e) => e !== em));
  }

  async function handleCtrlPasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setCtrlPwError("");
    setCtrlPwSuccess("");
    if (!ctrlPwNew.trim()) {
      setCtrlPwError("Password is required.");
      return;
    }
    if (ctrlPwNew.length < 6) {
      setCtrlPwError("Password must be at least 6 characters.");
      return;
    }
    if (ctrlPwNew !== ctrlPwConfirm) {
      setCtrlPwError("Passwords do not match.");
      return;
    }
    try {
      await changeControllerPassword.mutateAsync({ newPassword: ctrlPwNew });
      setCtrlPwSuccess("Controller password updated successfully.");
      setCtrlPwNew("");
      setCtrlPwConfirm("");
    } catch (err) {
      setCtrlPwError(
        err instanceof Error ? err.message : "Failed to update password.",
      );
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Controller Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Master access control and session management
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-sm">Joseph Warren</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              pwarre12@mail.ccsf.edu
            </span>
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 border text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Controller Active
            </Badge>
          </div>
        </div>
      </div>

      {/* ── ACCESS RIGHTS SUMMARY ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-amber-400" />
            Access Rights Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURES.map(({ key, label, Icon }) => {
              const locked = locks[key];
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-3 text-center"
                  data-ocid={`access_rights.${key}_card`}
                >
                  <Icon
                    className={`h-5 w-5 ${locked ? "text-red-400" : "text-emerald-400"}`}
                  />
                  <span className="text-xs font-medium leading-tight">
                    {label}
                  </span>
                  <Badge
                    className={
                      locked
                        ? "bg-red-600/20 text-red-400 border-red-500/30 border text-[10px] px-1.5 py-0"
                        : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 border text-[10px] px-1.5 py-0"
                    }
                  >
                    {locked ? "Locked" : "Unlocked"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── MASTER FEATURE LOCK/UNLOCK TOGGLES ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            Feature Lock Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {locksLoading ? (
            <div
              className="flex justify-center py-6"
              data-ocid="feature_locks.loading_state"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            FEATURES.map(({ key, label, desc, Icon }, idx) => {
              const locked = locks[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
                    locked
                      ? "bg-amber-900/20 border border-amber-500/30"
                      : "bg-muted/20 border border-border"
                  }`}
                  data-ocid={`feature_locks.item.${idx + 1}`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${locked ? "text-amber-400" : "text-muted-foreground"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {desc}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {locked ? "Locked" : "Unlocked"}
                    </span>
                    {locked ? (
                      <Lock className="h-3 w-3 text-amber-400" />
                    ) : (
                      <Unlock className="h-3 w-3 text-emerald-400" />
                    )}
                    <Switch
                      checked={locked}
                      onCheckedChange={() => handleToggleLock(key, locked)}
                      aria-label={`${locked ? "Unlock" : "Lock"} ${label}`}
                      data-ocid={`feature_locks.toggle.${idx + 1}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* ── LOGIN HISTORY ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LogIn className="h-4 w-4 text-amber-400" />
            Sign-in History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div
              className="flex justify-center py-6"
              data-ocid="login_history.loading_state"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((entry, idx) => {
                const mobile = isMobileUA(entry.userAgent);
                const browser = parseBrowser(entry.userAgent);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border px-4 py-3"
                    data-ocid={`login_history.item.${idx + 1}`}
                  >
                    {mobile ? (
                      <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{browser}</div>
                      <div className="text-xs text-muted-foreground">
                        {mobile ? "Mobile" : "Desktop"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 text-right">
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ACTIVE SESSIONS ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Laptop className="h-4 w-4 text-amber-400" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div
              className="flex justify-center py-6"
              data-ocid="active_sessions.loading_state"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session, idx) => {
                const mobile = isMobileUA(session.userAgent);
                const browser = parseBrowser(session.userAgent);
                return (
                  <div
                    key={session.sessionId}
                    className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border px-4 py-3"
                    data-ocid={`active_sessions.item.${idx + 1}`}
                  >
                    {mobile ? (
                      <Smartphone className="h-5 w-5 shrink-0 text-blue-400" />
                    ) : (
                      <Monitor className="h-5 w-5 shrink-0 text-blue-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{browser}</span>
                        {session.isCurrent && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-emerald-600/20 text-emerald-400 border-emerald-500/30 border">
                            This device
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active: {timeAgo(session.lastActive)}
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleEndSession(session.sessionId)}
                        disabled={endSession.isPending}
                        data-ocid={`active_sessions.sign_out_button.${idx + 1}`}
                      >
                        {endSession.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Sign Out"
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ADMIN USER ASSIGNMENTS ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              Admin User Assignments
            </CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              data-ocid="admin_assignments.open_modal_button"
            >
              {showAddAdmin ? "Cancel" : "Add Admin"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddAdmin && (
            <form onSubmit={handleAssignAdmin} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs">
                  Admin Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={addAdminEmail}
                  onChange={(e) => setAddAdminEmail(e.target.value)}
                  data-ocid="admin_assignments.email_input"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                data-ocid="admin_assignments.submit_button"
              >
                Assign
              </Button>
            </form>
          )}
          <Separator />
          {adminsLoading ? (
            <div
              className="flex justify-center py-4"
              data-ocid="admin_assignments.loading_state"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : !adminList || adminList.length === 0 ? (
            <div
              className="text-center py-6 text-sm text-muted-foreground"
              data-ocid="admin_assignments.empty_state"
            >
              No additional admins assigned.
            </div>
          ) : (
            <div className="space-y-2">
              {adminList.map((admin, idx) => (
                <div
                  key={admin.assignedPrincipal.toText()}
                  className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border px-4 py-3"
                  data-ocid={`admin_assignments.item.${idx + 1}`}
                >
                  <Shield className="h-4 w-4 shrink-0 text-amber-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {admin.assignedPrincipal.toText()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Assigned{" "}
                      {new Date(
                        Number(admin.assignedAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeAdmin(admin.assignedPrincipal)}
                    disabled={revokeAdmin.isPending}
                    data-ocid={`admin_assignments.delete_button.${idx + 1}`}
                  >
                    <UserX className="h-3.5 w-3.5 mr-1" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ACCOUNT SETTINGS ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-400" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Password */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  data-ocid="account_settings.new_password_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  data-ocid="account_settings.confirm_password_input"
                />
              </div>
              {passwordError && (
                <p
                  className="text-xs text-red-400"
                  data-ocid="account_settings.password_error"
                >
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p
                  className="text-xs text-emerald-400"
                  data-ocid="account_settings.password_success"
                >
                  {passwordSuccess}
                </p>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={changeControllerPassword.isPending}
                data-ocid="account_settings.save_password_button"
              >
                {changeControllerPassword.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                Save Password
              </Button>
            </form>
          </div>

          <Separator />

          {/* Login Email Addresses */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Login Email Addresses
            </h3>
            {emailsLoading ? (
              <div
                className="flex justify-center py-4"
                data-ocid="account_settings.emails_loading_state"
              >
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {emails.map((email, idx) => {
                  const isPrimary = email === primaryEmail;
                  return (
                    <div
                      key={email}
                      className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border px-4 py-3"
                      data-ocid={`account_settings.email_item.${idx + 1}`}
                    >
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {email}
                        </div>
                        {isPrimary && (
                          <div className="text-[10px] text-muted-foreground">
                            Primary — cannot be removed
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isPrimary || removeLoginEmail.isPending}
                        onClick={() => handleRemoveEmail(email)}
                        data-ocid={`account_settings.remove_email_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <form
              onSubmit={handleAddEmail}
              className="flex gap-2 items-end pt-2"
            >
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="new-login-email" className="text-xs">
                  Add New Email
                </Label>
                <Input
                  id="new-login-email"
                  type="email"
                  placeholder="newemail@example.com"
                  value={newEmailInput}
                  onChange={(e) => {
                    setNewEmailInput(e.target.value);
                    setEmailError("");
                  }}
                  data-ocid="account_settings.new_email_input"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={addLoginEmail.isPending}
                data-ocid="account_settings.add_email_button"
              >
                {addLoginEmail.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                Add Email
              </Button>
            </form>
            {emailError && (
              <p
                className="text-xs text-red-400"
                data-ocid="account_settings.email_error"
              >
                {emailError}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* ── CONTROLLER EMAIL & PASSWORD MANAGEMENT ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-400" />
            Controller Email &amp; Password Management
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage all authorized controller-level emails and set the controller
            login password.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ── Controller Email Addresses ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Controller Email Addresses
            </h3>
            <div className="space-y-2">
              {ctrlEmails.map((em, idx) => {
                const isPrimary = em === primaryEmail;
                return (
                  <div
                    key={em}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                      isPrimary
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-border bg-muted/20"
                    }`}
                    data-ocid={`ctrl_emails.item.${idx + 1}`}
                  >
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{em}</div>
                      {isPrimary && (
                        <div className="text-[10px] text-amber-400/80">
                          Primary controller — cannot be removed
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isPrimary}
                      onClick={() => handleRemoveCtrlEmail(em)}
                      data-ocid={`ctrl_emails.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={handleAddCtrlEmail}
              className="flex gap-2 items-end"
            >
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="ctrl-add-email" className="text-xs">
                  Add Controller Email
                </Label>
                <Input
                  id="ctrl-add-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={addCtrlEmail}
                  onChange={(e) => {
                    setAddCtrlEmail(e.target.value);
                    setAddCtrlEmailError("");
                  }}
                  data-ocid="ctrl_emails.input"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                data-ocid="ctrl_emails.add_button"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Add Email
              </Button>
            </form>
            {addCtrlEmailError && (
              <p
                className="text-xs text-red-400"
                data-ocid="ctrl_emails.error_state"
              >
                {addCtrlEmailError}
              </p>
            )}
          </div>

          <Separator />

          {/* ── Controller Password ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Controller Password
            </h3>
            <form onSubmit={handleCtrlPasswordSave} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ctrl-pw-new" className="text-xs">
                  New Password
                </Label>
                <Input
                  id="ctrl-pw-new"
                  type="password"
                  placeholder="Enter new password"
                  value={ctrlPwNew}
                  onChange={(e) => {
                    setCtrlPwNew(e.target.value);
                    setCtrlPwError("");
                    setCtrlPwSuccess("");
                  }}
                  data-ocid="ctrl_password.new_password_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctrl-pw-confirm" className="text-xs">
                  Confirm Password
                </Label>
                <Input
                  id="ctrl-pw-confirm"
                  type="password"
                  placeholder="Confirm new password"
                  value={ctrlPwConfirm}
                  onChange={(e) => {
                    setCtrlPwConfirm(e.target.value);
                    setCtrlPwError("");
                    setCtrlPwSuccess("");
                  }}
                  data-ocid="ctrl_password.confirm_password_input"
                />
              </div>
              {ctrlPwError && (
                <p
                  className="text-xs text-red-400"
                  data-ocid="ctrl_password.error_state"
                >
                  {ctrlPwError}
                </p>
              )}
              {ctrlPwSuccess && (
                <div
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
                  data-ocid="ctrl_password.success_state"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {ctrlPwSuccess}
                </div>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={changeControllerPassword.isPending}
                data-ocid="ctrl_password.save_button"
              >
                {changeControllerPassword.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                Save Password
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
