import { ROLE_LABELS } from "@/components/ParticipantCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Participant, ParticipantRole } from "@/hooks/useParticipants";
import { useParticipantsList } from "@/hooks/useParticipants";
import {
  useAdminDocuments,
  useAdminSubscribers,
  useAdminTrialMembers,
  useAssignAdmin,
  useGetAdminList,
  useIsAdmin,
  useIsController,
  useRevokeAdmin,
} from "@/hooks/useSubscription";
import type {
  AdminDocStatus,
  AdminDocument,
  AdminSubscriber,
  AdminTrialMember,
} from "@/hooks/useSubscription";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ComplianceTab,
  CostTab,
  ResourcesTab,
  SchedulingTab,
} from "./AdminModuleTabs";
import BankAccountTab from "./BankAccountTab";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
}

function mkEntry(action: string, actor = "Admin"): AuditEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    action,
    actor,
  };
}

// ─── Audit Log Panel ──────────────────────────────────────────────────────────

function AuditLogPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <div
      className="mt-6 rounded-xl border border-border bg-muted/20"
      data-ocid="admin.audit_log_panel"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Audit Log — Last {entries.length} actions this session
        </span>
      </div>
      {entries.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">No actions yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border max-h-48 overflow-y-auto">
          {[...entries].reverse().map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 px-4 py-2.5"
              data-ocid="admin.audit_entry"
            >
              <span className="text-xs text-muted-foreground/60 tabular-nums w-20 shrink-0">
                {e.timestamp}
              </span>
              <span className="text-xs text-foreground flex-1 min-w-0">
                {e.action}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {e.actor}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Metric Item ──────────────────────────────────────────────────────────────

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: documents = [] } = useAdminDocuments();
  const { data: subscribers = [] } = useAdminSubscribers();
  const { data: trials = [] } = useAdminTrialMembers();

  const pendingDocs = documents.filter((d) => d.status === "Pending").length;
  const activeTrials = trials.filter((t) => t.status === "Active").length;
  const converted = trials.filter((t) => t.status === "Converted").length;
  const cancelled = trials.filter((t) => t.status === "Cancelled").length;
  const activeSubs = subscribers.filter((s) => s.status === "Active").length;

  return (
    <div className="space-y-6" data-ocid="admin.overview_panel">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">
              Document Queue
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricItem label="Pending" value={pendingDocs} />
            <MetricItem
              label="Approved"
              value={documents.filter((d) => d.status === "Approved").length}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">
              Trial Members
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricItem label="Active" value={activeTrials} />
            <MetricItem label="Converted" value={converted} />
            <MetricItem label="Cancelled" value={cancelled} />
            <MetricItem
              label="Expiring Soon"
              value={
                trials.filter(
                  (t) => t.daysRemaining <= 3 && t.status === "Active",
                ).length
              }
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">
              Subscriptions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricItem label="Active" value={activeSubs} />
            <MetricItem
              label="Expired"
              value={subscribers.filter((s) => s.status === "Expired").length}
            />
            <MetricItem
              label="Suspended"
              value={subscribers.filter((s) => s.status === "Suspended").length}
            />
            <MetricItem
              label="Failed"
              value={subscribers.filter((s) => s.status === "Failed").length}
            />
          </div>
        </div>
      </div>
      <AdminUsersSection />
    </div>
  );
}

// ─── Participants Tab ─────────────────────────────────────────────────────────

const ALL_ROLES: ParticipantRole[] = [
  "Owner",
  "Architect",
  "Designer",
  "CivilEngineer",
  "MechanicalEngineer",
  "SpecialtyEngineer",
  "ConstructionManager",
  "Contractor",
];

const P_STATUS_STYLES: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  active: "border-primary/30 bg-primary/10 text-primary",
  inactive: "border-border bg-muted text-muted-foreground",
};

function ParticipantsTab({ onAudit }: { onAudit: (e: AuditEntry) => void }) {
  const { data: participants = [], isLoading } = useParticipantsList();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<ParticipantRole | "all">("all");
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    {},
  );
  const [editRoles, setEditRoles] = useState<Record<string, ParticipantRole>>(
    {},
  );
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  function addAudit(action: string) {
    const e = mkEntry(action);
    setAudit((prev) => [...prev.slice(-19), e]);
    onAudit(e);
  }

  const filtered = useMemo(() => {
    return participants
      .filter((p) => !removedIds.has(p.id))
      .filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.contact.email.toLowerCase().includes(q) ||
          (editRoles[p.id] ?? p.role).toLowerCase().includes(q)
        );
      })
      .filter(
        (p) =>
          roleFilter === "all" || (editRoles[p.id] ?? p.role) === roleFilter,
      );
  }, [participants, removedIds, search, roleFilter, editRoles]);

  function toggleStatus(p: Participant) {
    const cur = localStatuses[p.id] ?? p.status;
    const next = cur === "active" || cur === "approved" ? "inactive" : "active";
    setLocalStatuses((prev) => ({ ...prev, [p.id]: next }));
    addAudit(
      `Set ${p.firstName} ${p.lastName} to ${next === "inactive" ? "Inactive" : "Active"}`,
    );
  }

  function changeRole(p: Participant, role: ParticipantRole) {
    setEditRoles((prev) => ({ ...prev, [p.id]: role }));
    addAudit(
      `Changed ${p.firstName} ${p.lastName} role to ${ROLE_LABELS[role]}`,
    );
    toast.success(`Role updated to ${ROLE_LABELS[role]}`);
  }

  function confirmRemove() {
    if (!confirmRemoveId) return;
    const p = participants.find((x) => x.id === confirmRemoveId);
    setRemovedIds((prev) => new Set([...prev, confirmRemoveId]));
    if (p) addAudit(`Removed participant ${p.firstName} ${p.lastName}`);
    toast.success("Participant removed.");
    setConfirmRemoveId(null);
  }

  return (
    <div className="space-y-4" data-ocid="admin.participants_panel">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="admin.participants_search_input"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as ParticipantRole | "all")}
        >
          <SelectTrigger
            className="w-full sm:w-48"
            data-ocid="admin.participants_role_filter"
          >
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-14"
          data-ocid="admin.participants_empty_state"
        >
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search || roleFilter !== "all"
              ? "No participants match your filters."
              : "No participants yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1fr_200px_160px_140px_160px_100px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Assigned Phases</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((p, idx) => {
              const displayStatus = localStatuses[p.id] ?? p.status;
              const displayRole = editRoles[p.id] ?? p.role;
              return (
                <div
                  key={p.id}
                  className="px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.participants_item.${idx + 1}`}
                >
                  <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[1fr_200px_160px_140px_160px_100px] lg:items-center lg:gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.contact.email}
                    </p>
                    <Select
                      value={displayRole}
                      onValueChange={(v) => changeRole(p, v as ParticipantRole)}
                    >
                      <SelectTrigger
                        className="h-7 text-xs"
                        data-ocid={`admin.participants_role_select.${idx + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => toggleStatus(p)}
                      className="w-fit"
                      data-ocid={`admin.participants_status_toggle.${idx + 1}`}
                    >
                      <Badge
                        variant="outline"
                        className={`cursor-pointer text-xs border ${P_STATUS_STYLES[displayStatus === "inactive" ? "inactive" : displayStatus] ?? P_STATUS_STYLES.pending}`}
                      >
                        {displayStatus === "inactive"
                          ? "Inactive"
                          : displayStatus.charAt(0).toUpperCase() +
                            displayStatus.slice(1)}
                      </Badge>
                    </button>
                    <p className="text-xs text-muted-foreground">—</p>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setConfirmRemoveId(p.id)}
                        className="h-7 text-xs px-2"
                        data-ocid={`admin.participants_remove_button.${idx + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {confirmRemoveId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80"
          data-ocid="admin.participants_confirm_dialog"
        >
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-display text-base font-semibold mb-2">
              Remove Participant?
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              This will remove the participant from the admin view.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmRemoveId(null)}
                data-ocid="admin.participants_cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmRemove}
                data-ocid="admin.participants_confirm_button"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      <AuditLogPanel entries={audit} />
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

const DOC_STATUS_STYLES: Record<AdminDocStatus, string> = {
  Pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  Approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Rejected: "border-red-500/30 bg-red-500/10 text-red-400",
};

function DocumentsTab({ onAudit }: { onAudit: (e: AuditEntry) => void }) {
  const { data: docs = [], isLoading } = useAdminDocuments();
  const [localStatus, setLocalStatus] = useState<
    Record<string, AdminDocStatus>
  >({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminDocStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  function addAudit(action: string) {
    const e = mkEntry(action);
    setAudit((prev) => [...prev.slice(-19), e]);
    onAudit(e);
  }

  function applyStatus(doc: AdminDocument, status: AdminDocStatus) {
    setLocalStatus((prev) => ({ ...prev, [doc.id]: status }));
    const verb =
      status === "Approved"
        ? "Approved"
        : status === "Rejected"
          ? "Rejected"
          : "Requested resubmission for";
    addAudit(`${verb} ${doc.documentType} for ${doc.userEmail}`);
    toast.success(
      `Document ${status === "Pending" ? "flagged for resubmission" : status.toLowerCase()}.`,
    );
  }

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const status = localStatus[d.id] ?? d.status;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (typeFilter !== "all" && d.documentType !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.userName.toLowerCase().includes(q) ||
          d.userEmail.toLowerCase().includes(q) ||
          d.documentType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [docs, localStatus, search, statusFilter, typeFilter]);

  return (
    <div className="space-y-4" data-ocid="admin.documents_panel">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="admin.documents_search_input"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AdminDocStatus | "all")}
        >
          <SelectTrigger
            className="w-full sm:w-40"
            data-ocid="admin.documents_status_filter"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger
            className="w-full sm:w-48"
            data-ocid="admin.documents_type_filter"
          >
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="EIN">EIN</SelectItem>
            <SelectItem value="Proof of Address">Proof of Address</SelectItem>
            <SelectItem value="Government ID">Government ID</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-14"
          data-ocid="admin.documents_empty_state"
        >
          <FileCheck className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No documents match your filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_180px_110px_120px_240px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>User Name</span>
            <span>Email</span>
            <span>Document Type</span>
            <span>Upload Date</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((doc, idx) => {
              const status = localStatus[doc.id] ?? doc.status;
              return (
                <div
                  key={doc.id}
                  className="px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.documents_item.${idx + 1}`}
                >
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_1fr_180px_110px_120px_240px] md:items-center md:gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {doc.userName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.userEmail}
                    </p>
                    <p className="text-xs text-foreground">
                      {doc.documentType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.uploadDate}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs border w-fit ${DOC_STATUS_STYLES[status]}`}
                    >
                      {status}
                    </Badge>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => applyStatus(doc, "Approved")}
                        disabled={status === "Approved"}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40"
                        data-ocid={`admin.documents_approve_button.${idx + 1}`}
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => applyStatus(doc, "Rejected")}
                        disabled={status === "Rejected"}
                        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
                        data-ocid={`admin.documents_reject_button.${idx + 1}`}
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyStatus(doc, "Pending")}
                        disabled={status === "Pending"}
                        className="h-7 text-xs border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-40"
                        data-ocid={`admin.documents_resubmit_button.${idx + 1}`}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Resubmit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <AuditLogPanel entries={audit} />
    </div>
  );
}

// ─── Subscriptions Tab ────────────────────────────────────────────────────────

const SUB_STATUS_STYLES: Record<string, string> = {
  Active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Expired: "border-border bg-muted text-muted-foreground",
  Failed: "border-red-500/30 bg-red-500/10 text-red-400",
  Suspended: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
};

function SubscriptionsTab({ onAudit }: { onAudit: (e: AuditEntry) => void }) {
  const { data: subscribers = [], isLoading } = useAdminSubscribers();
  const [localData, setLocalData] = useState<
    Record<string, Partial<AdminSubscriber>>
  >({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  function addAudit(action: string) {
    const e = mkEntry(action);
    setAudit((prev) => [...prev.slice(-19), e]);
    onAudit(e);
  }

  function suspend(sub: AdminSubscriber) {
    setLocalData((prev) => ({
      ...prev,
      [sub.id]: { ...prev[sub.id], status: "Suspended" },
    }));
    addAudit(`Suspended subscription for ${sub.userEmail}`);
    toast.success("Subscription suspended.");
  }

  function reactivate(sub: AdminSubscriber) {
    setLocalData((prev) => ({
      ...prev,
      [sub.id]: { ...prev[sub.id], status: "Active" },
    }));
    addAudit(`Reactivated subscription for ${sub.userEmail}`);
    toast.success("Subscription reactivated.");
  }

  function extendTerm(sub: AdminSubscriber) {
    const current = (localData[sub.id]?.endDate ?? sub.endDate) as string;
    const d = new Date(current);
    d.setDate(d.getDate() + 30);
    const newEnd = d.toISOString().split("T")[0];
    setLocalData((prev) => ({
      ...prev,
      [sub.id]: { ...prev[sub.id], endDate: newEnd },
    }));
    addAudit(`Extended term +30d for ${sub.userEmail} → ${newEnd}`);
    toast.success(`Term extended to ${newEnd}`);
  }

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const merged = { ...s, ...localData[s.id] };
      if (statusFilter !== "all" && merged.status !== statusFilter)
        return false;
      if (
        search.trim() &&
        !merged.userEmail.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [subscribers, localData, search, statusFilter]);

  return (
    <div className="space-y-4" data-ocid="admin.subscriptions_panel">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="admin.subscriptions_search_input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-44"
            data-ocid="admin.subscriptions_status_filter"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-14"
          data-ocid="admin.subscriptions_empty_state"
        >
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No subscriptions match your filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="hidden xl:grid grid-cols-[1.2fr_1.4fr_100px_100px_110px_100px_110px_190px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Email</span>
            <span>Plan</span>
            <span>Start</span>
            <span>End</span>
            <span>Monthly</span>
            <span>Next Bill</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((sub, idx) => {
              const merged = {
                ...sub,
                ...localData[sub.id],
              } as AdminSubscriber;
              return (
                <div
                  key={sub.id}
                  className="px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.subscriptions_item.${idx + 1}`}
                >
                  <div className="flex flex-col gap-2 xl:grid xl:grid-cols-[1.2fr_1.4fr_100px_100px_110px_100px_110px_190px] xl:items-center xl:gap-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {merged.userEmail}
                    </p>
                    <p className="text-xs text-foreground font-medium">
                      {merged.plan}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {merged.startDate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {merged.endDate}
                    </p>
                    <p className="text-xs text-foreground font-medium">
                      ${merged.monthlyCharge}/mo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {merged.nextBilling}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs border w-fit ${SUB_STATUS_STYLES[merged.status] ?? SUB_STATUS_STYLES.Expired}`}
                    >
                      {merged.status}
                    </Badge>
                    <div className="flex items-center justify-end gap-1.5">
                      {merged.status !== "Suspended" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => suspend(sub)}
                          className="h-7 text-xs border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                          data-ocid={`admin.subscriptions_suspend_button.${idx + 1}`}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => reactivate(sub)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          data-ocid={`admin.subscriptions_reactivate_button.${idx + 1}`}
                        >
                          Reactivate
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => extendTerm(sub)}
                        className="h-7 text-xs"
                        data-ocid={`admin.subscriptions_extend_button.${idx + 1}`}
                      >
                        +30d
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <AuditLogPanel entries={audit} />
    </div>
  );
}

// ─── Trial Members Tab ────────────────────────────────────────────────────────

const TRIAL_STATUS_STYLES: Record<string, string> = {
  Active: "border-primary/30 bg-primary/10 text-primary",
  Converted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Cancelled: "border-border bg-muted text-muted-foreground",
};

function TrialMembersTab({ onAudit }: { onAudit: (e: AuditEntry) => void }) {
  const { data: trials = [], isLoading } = useAdminTrialMembers();
  const [localData, setLocalData] = useState<
    Record<string, Partial<AdminTrialMember>>
  >({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  function addAudit(action: string) {
    const e = mkEntry(action);
    setAudit((prev) => [...prev.slice(-19), e]);
    onAudit(e);
  }

  function convertToPaid(trial: AdminTrialMember) {
    setLocalData((prev) => ({
      ...prev,
      [trial.id]: { ...prev[trial.id], status: "Converted", daysRemaining: 0 },
    }));
    addAudit(
      `Converted trial to paid for ${trial.userEmail} (${trial.planSelected})`,
    );
    toast.success(`Trial converted to paid for ${trial.userEmail}`);
  }

  function cancelTrial(trial: AdminTrialMember) {
    setLocalData((prev) => ({
      ...prev,
      [trial.id]: { ...prev[trial.id], status: "Cancelled", daysRemaining: 0 },
    }));
    addAudit(`Cancelled trial for ${trial.userEmail}`);
    toast.warning("Trial cancelled.");
  }

  const filtered = useMemo(() => {
    return trials.filter((t) => {
      const merged = { ...t, ...localData[t.id] };
      if (statusFilter !== "all" && merged.status !== statusFilter)
        return false;
      if (
        search.trim() &&
        !merged.userEmail.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [trials, localData, search, statusFilter]);

  return (
    <div className="space-y-4" data-ocid="admin.trials_panel">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="admin.trials_search_input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-44"
            data-ocid="admin.trials_status_filter"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-14"
          data-ocid="admin.trials_empty_state"
        >
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No trial members match your filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_130px_100px_110px_200px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Email</span>
            <span>Plan Selected</span>
            <span>Trial Start</span>
            <span>Days Left</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((trial, idx) => {
              const merged = {
                ...trial,
                ...localData[trial.id],
              } as AdminTrialMember;
              const isExpiringSoon =
                merged.status === "Active" && merged.daysRemaining <= 3;
              return (
                <div
                  key={trial.id}
                  className="px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.trials_item.${idx + 1}`}
                >
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-[1.5fr_1.5fr_130px_100px_110px_200px] md:items-center md:gap-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {merged.userEmail}
                    </p>
                    <p className="text-xs text-foreground">
                      {merged.planSelected}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {merged.trialStartDate}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {isExpiringSoon && (
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs font-semibold ${isExpiringSoon ? "text-yellow-400" : "text-foreground"}`}
                      >
                        {merged.daysRemaining}d
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs border w-fit ${TRIAL_STATUS_STYLES[merged.status] ?? TRIAL_STATUS_STYLES.Cancelled}`}
                    >
                      {merged.status}
                    </Badge>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => convertToPaid(trial)}
                        disabled={merged.status !== "Active"}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40"
                        data-ocid={`admin.trials_convert_button.${idx + 1}`}
                      >
                        Convert
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelTrial(trial)}
                        disabled={merged.status !== "Active"}
                        className="h-7 text-xs disabled:opacity-40"
                        data-ocid={`admin.trials_cancel_button.${idx + 1}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <AuditLogPanel entries={audit} />
    </div>
  );
}

// ─── Admin Users Section ──────────────────────────────────────────────────────

function truncatePrincipal(p: Principal) {
  const t = p.toText();
  return t.length > 16 ? `${t.slice(0, 8)}…${t.slice(-8)}` : t;
}

function AdminUsersSection() {
  const { data: admins = [], isLoading } = useGetAdminList();
  const revoke = useRevokeAdmin();
  const assign = useAssignAdmin();
  const [principalInput, setPrincipalInput] = useState("");
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal() ?? null;
  const { data: isController } = useIsController(currentPrincipal);

  function handleAssign() {
    try {
      const p = Principal.fromText(principalInput.trim());
      assign.mutate(
        { principal: p },
        {
          onSuccess: () => {
            toast.success("Admin role assigned.");
            setPrincipalInput("");
          },
          onError: (e) => toast.error(e.message),
        },
      );
    } catch {
      toast.error("Invalid Principal ID.");
    }
  }

  function handleRevoke(p: Principal) {
    revoke.mutate(
      { principal: p },
      {
        onSuccess: () => toast.success("Admin role revoked."),
        onError: (e) => toast.error(e.message),
      },
    );
  }

  return (
    <div
      className="rounded-xl border border-border bg-card"
      data-ocid="admin.admin_users_card"
    >
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-display text-sm font-semibold">Admin Users</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Only the app controller can assign or revoke admin roles.
        </p>
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label
              htmlFor="admin-principal-input"
              className="text-xs font-medium text-muted-foreground"
            >
              Principal ID
            </label>
            <Input
              id="admin-principal-input"
              placeholder="Enter Principal ID to assign admin…"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              disabled={!isController}
              data-ocid="admin.assign_input"
            />
          </div>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={
              !principalInput.trim() || assign.isPending || !isController
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="admin.assign_button"
          >
            {assign.isPending ? "Assigning…" : "Assign Admin"}
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        ) : admins.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No admins assigned yet.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_160px_100px] gap-3 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Principal</span>
              <span>Date Assigned</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {admins.map((admin, idx) => (
                <div
                  key={admin.assignedPrincipal.toText()}
                  className="px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.admin_item.${idx + 1}`}
                >
                  <div className="flex flex-col gap-1 md:grid md:grid-cols-[1fr_160px_100px] md:items-center md:gap-3">
                    <p className="text-sm font-medium text-foreground font-mono">
                      {truncatePrincipal(admin.assignedPrincipal)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        Number(admin.assignedAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                    <div className="flex justify-start md:justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevoke(admin.assignedPrincipal)}
                        disabled={revoke.isPending || !isController}
                        data-ocid={`admin.revoke_button.${idx + 1}`}
                      >
                        Revoke
                      </Button>
                    </div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin(principal);
  const { data: isController } = useIsController(principal);
  const [_globalAudit, setGlobalAudit] = useState<AuditEntry[]>([]);

  function handleAudit(entry: AuditEntry) {
    setGlobalAudit((prev) => [...prev.slice(-99), entry]);
  }

  if (isAdminLoading) {
    return (
      <div className="space-y-6" data-ocid="admin.page">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 py-24"
        data-ocid="admin.forbidden_state"
      >
        <ShieldAlert className="h-12 w-12 text-destructive/60" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Access Denied
        </h2>
        <p className="text-sm text-muted-foreground">
          You do not have admin privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="admin.page">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <ShieldAlert className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Full management of participants, documents, subscriptions, and
              trial members
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" data-ocid="admin.tabs">
        <TabsList className="bg-muted/30 border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger
            value="overview"
            className="text-xs sm:text-sm"
            data-ocid="admin.overview_tab"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="text-xs sm:text-sm"
            data-ocid="admin.participants_tab"
          >
            Participants
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="text-xs sm:text-sm"
            data-ocid="admin.documents_tab"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="text-xs sm:text-sm"
            data-ocid="admin.subscriptions_tab"
          >
            Subscriptions
          </TabsTrigger>
          <TabsTrigger
            value="trials"
            className="text-xs sm:text-sm"
            data-ocid="admin.trials_tab"
          >
            Trial Members
          </TabsTrigger>
          <TabsTrigger
            value="scheduling"
            className="text-xs sm:text-sm"
            data-ocid="admin.scheduling_tab"
          >
            Scheduling
          </TabsTrigger>
          <TabsTrigger
            value="cost"
            className="text-xs sm:text-sm"
            data-ocid="admin.cost_tab"
          >
            Cost
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="text-xs sm:text-sm"
            data-ocid="admin.resources_tab"
          >
            Resources
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="text-xs sm:text-sm"
            data-ocid="admin.compliance_tab"
          >
            Compliance
          </TabsTrigger>
          {isController && (
            <TabsTrigger
              value="bank_account"
              className="text-xs sm:text-sm"
              data-ocid="admin.bank_account_tab"
            >
              Bank Account
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="participants" className="mt-6">
          <ParticipantsTab onAudit={handleAudit} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <DocumentsTab onAudit={handleAudit} />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionsTab onAudit={handleAudit} />
        </TabsContent>
        <TabsContent value="trials" className="mt-6">
          <TrialMembersTab onAudit={handleAudit} />
        </TabsContent>
        <TabsContent value="scheduling" className="mt-6">
          <SchedulingTab />
        </TabsContent>
        <TabsContent value="cost" className="mt-6">
          <CostTab />
        </TabsContent>
        <TabsContent value="resources" className="mt-6">
          <ResourcesTab />
        </TabsContent>
        <TabsContent value="compliance" className="mt-6">
          <ComplianceTab />
        </TabsContent>
        <TabsContent value="bank_account" className="mt-6">
          {isController ? (
            <BankAccountTab />
          ) : (
            <div
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 py-16"
              data-ocid="bank_account.restricted_state"
            >
              <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">
                Access restricted to controller only
              </p>
              <p className="text-xs text-muted-foreground">
                Only the app controller can manage bank account and payout
                settings.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
