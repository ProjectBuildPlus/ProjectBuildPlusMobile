import {
  ParticipantCard,
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/components/ParticipantCard";
import { RSMeansPanel } from "@/components/RSMeansPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAppSettings,
  useApproveParticipant,
  useCreateParticipant,
  useDeleteParticipant,
  useParticipantAssignments,
  useParticipantsList,
  useRSMeansSettings,
  useRejectParticipant,
  useResendPasscode,
  useUpdateParticipant,
} from "@/hooks/useParticipants";
import type {
  Participant,
  ParticipantInput,
  ParticipantRole,
} from "@/hooks/useParticipants";
import {
  useAssignAdmin,
  useGetAdminList,
  useIsAdmin,
  useRevokeAdmin,
} from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  ChevronDown,
  Mail,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useIsFeatureLocked } from "../context/FeatureLockContext";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const _GATEKEEPER_ROLES: ParticipantRole[] = ["Owner", "Designer"];

const EMPTY_ADDRESS = {
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "USA",
};
const EMPTY_CONTACT = { officePhone: "", mobilePhone: "", fax: "", email: "" };
const EMPTY_COMPANY = {
  name: "",
  address: EMPTY_ADDRESS,
  trade: "",
  licenseNumber: "",
  website: "",
};

const EMPTY_FORM: ParticipantInput = {
  role: "Contractor",
  firstName: "",
  lastName: "",
  residentialAddress: EMPTY_ADDRESS,
  contact: EMPTY_CONTACT,
  company: EMPTY_COMPANY,
  notes: "",
};

// ─── Add / Edit Participant Modal ────────────────────────────────────────────

function ParticipantFormModal({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: Participant | null;
  onClose: () => void;
}) {
  const create = useCreateParticipant();
  const update = useUpdateParticipant();
  const [form, setForm] = useState<ParticipantInput>(() =>
    initial
      ? {
          role: initial.role,
          firstName: initial.firstName,
          lastName: initial.lastName,
          residentialAddress: initial.residentialAddress,
          contact: initial.contact,
          company: initial.company,
          notes: initial.notes,
        }
      : EMPTY_FORM,
  );

  function field<K extends keyof ParticipantInput>(
    key: K,
    val: ParticipantInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSubmit() {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.contact.email.trim()
    ) {
      toast.error("First name, last name, and email are required.");
      return;
    }
    if (initial) {
      update.mutate(
        { id: initial.id, input: form },
        {
          onSuccess: () => {
            toast.success("Participant updated.");
            onClose();
          },
        },
      );
    } else {
      create.mutate(form, {
        onSuccess: () => {
          toast.success("Participant added. Pending approval.");
          onClose();
        },
      });
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border"
        data-ocid="participants.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {initial ? "Edit Participant" : "Add Participant"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select
              value={form.role}
              onValueChange={(v) => field("role", v as ParticipantRole)}
            >
              <SelectTrigger data-ocid="participants.role_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-first">First Name *</Label>
              <Input
                id="pf-first"
                value={form.firstName}
                onChange={(e) => field("firstName", e.target.value)}
                placeholder="Jane"
                data-ocid="participants.first_name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-last">Last Name *</Label>
              <Input
                id="pf-last"
                value={form.lastName}
                onChange={(e) => field("lastName", e.target.value)}
                placeholder="Smith"
                data-ocid="participants.last_name_input"
              />
            </div>
          </div>

          {/* Contact */}
          <fieldset className="space-y-3 rounded-lg border border-border p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Information
            </legend>
            <div className="space-y-1.5">
              <Label htmlFor="pf-email">Email *</Label>
              <Input
                id="pf-email"
                type="email"
                value={form.contact.email}
                onChange={(e) =>
                  field("contact", { ...form.contact, email: e.target.value })
                }
                placeholder="jane@example.com"
                data-ocid="participants.email_input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pf-office">Office Phone</Label>
                <Input
                  id="pf-office"
                  value={form.contact.officePhone}
                  onChange={(e) =>
                    field("contact", {
                      ...form.contact,
                      officePhone: e.target.value,
                    })
                  }
                  placeholder="(555) 123-4567"
                  data-ocid="participants.office_phone_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-mobile">Mobile Phone</Label>
                <Input
                  id="pf-mobile"
                  value={form.contact.mobilePhone}
                  onChange={(e) =>
                    field("contact", {
                      ...form.contact,
                      mobilePhone: e.target.value,
                    })
                  }
                  placeholder="(555) 987-6543"
                  data-ocid="participants.mobile_phone_input"
                />
              </div>
            </div>
          </fieldset>

          {/* Residential address */}
          <fieldset className="space-y-3 rounded-lg border border-border p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Residential Address
            </legend>
            <Input
              value={form.residentialAddress.street}
              onChange={(e) =>
                field("residentialAddress", {
                  ...form.residentialAddress,
                  street: e.target.value,
                })
              }
              placeholder="Street address"
              data-ocid="participants.street_input"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={form.residentialAddress.city}
                onChange={(e) =>
                  field("residentialAddress", {
                    ...form.residentialAddress,
                    city: e.target.value,
                  })
                }
                placeholder="City"
                data-ocid="participants.city_input"
              />
              <Input
                value={form.residentialAddress.state}
                onChange={(e) =>
                  field("residentialAddress", {
                    ...form.residentialAddress,
                    state: e.target.value,
                  })
                }
                placeholder="State"
                data-ocid="participants.state_input"
              />
              <Input
                value={form.residentialAddress.zip}
                onChange={(e) =>
                  field("residentialAddress", {
                    ...form.residentialAddress,
                    zip: e.target.value,
                  })
                }
                placeholder="ZIP"
                data-ocid="participants.zip_input"
              />
            </div>
          </fieldset>

          {/* Company */}
          <fieldset className="space-y-3 rounded-lg border border-border p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company Information
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pf-coname">Company Name</Label>
                <Input
                  id="pf-coname"
                  value={form.company.name}
                  onChange={(e) =>
                    field("company", { ...form.company, name: e.target.value })
                  }
                  placeholder="Smith & Associates"
                  data-ocid="participants.company_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-trade">Trade / Type</Label>
                <Input
                  id="pf-trade"
                  value={form.company.trade}
                  onChange={(e) =>
                    field("company", { ...form.company, trade: e.target.value })
                  }
                  placeholder="General Contractor"
                  data-ocid="participants.trade_input"
                />
              </div>
            </div>
            <Input
              value={form.company.address.street}
              onChange={(e) =>
                field("company", {
                  ...form.company,
                  address: { ...form.company.address, street: e.target.value },
                })
              }
              placeholder="Company street address"
              data-ocid="participants.company_street_input"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={form.company.licenseNumber}
                onChange={(e) =>
                  field("company", {
                    ...form.company,
                    licenseNumber: e.target.value,
                  })
                }
                placeholder="License #"
                data-ocid="participants.license_input"
              />
              <Input
                value={form.company.website}
                onChange={(e) =>
                  field("company", { ...form.company, website: e.target.value })
                }
                placeholder="https://company.com"
                data-ocid="participants.website_input"
              />
            </div>
          </fieldset>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-notes">Notes</Label>
            <Textarea
              id="pf-notes"
              value={form.notes}
              onChange={(e) => field("notes", e.target.value)}
              placeholder="Optional notes about this participant…"
              rows={3}
              data-ocid="participants.notes_textarea"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="participants.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="participants.submit_button"
          >
            {isPending
              ? "Saving…"
              : initial
                ? "Update Participant"
                : "Add Participant"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Roster Tab ───────────────────────────────────────────────────────────────

function RosterTab() {
  const { data: participants = [], isLoading } = useParticipantsList();
  const { data: appSettings } = useAppSettings();
  const approve = useApproveParticipant();
  const reject = useRejectParticipant();
  const resend = useResendPasscode();
  const del = useDeleteParticipant();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<ParticipantRole | "all">("all");
  const [editTarget, setEditTarget] = useState<Participant | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Determine current user's role from appSettings — gatekeeper if Owner or Designer scope
  const isGatekeeper = true; // UI shows controls; access enforced server-side

  const filtered = useMemo(() => {
    let list = [...participants];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.company.name.toLowerCase().includes(q) ||
          p.contact.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "all") list = list.filter((p) => p.role === roleFilter);
    return list;
  }, [participants, search, roleFilter]);

  function handleApprove(p: Participant) {
    approve.mutate(
      { id: p.id, approvedBy: "Owner" },
      {
        onSuccess: () =>
          toast.success(`${p.firstName} approved. Passcode generated.`),
      },
    );
  }

  function handleReject(p: Participant) {
    reject.mutate(
      { id: p.id },
      { onSuccess: () => toast.warning(`${p.firstName} rejected.`) },
    );
  }

  function handleResend(p: Participant) {
    resend.mutate(p.id, {
      onSuccess: (updated) =>
        toast.success(
          `Passcode ${updated.passcode} ${appSettings?.passcodeDelivery === "email" ? `sent to ${p.contact.email}` : "displayed below"}.`,
        ),
      onError: (e) => toast.error(e.message),
    });
  }

  function handleDelete(id: string) {
    del.mutate(id, {
      onSuccess: () => {
        toast.success("Participant removed.");
        setDeleteConfirmId(null);
      },
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search participants…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="participants.search_input"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as ParticipantRole | "all")}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              data-ocid="participants.role_filter_select"
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
        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          data-ocid="participants.add_button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Participant
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {["sk-a", "sk-b", "sk-c", "sk-d"].map((k) => (
            <Skeleton key={k} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-16"
          data-ocid="participants.empty_state"
        >
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">
            {search || roleFilter !== "all"
              ? "No participants match your filters."
              : "No participants yet."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAddOpen(true)}
            data-ocid="participants.add_first_button"
          >
            <Plus className="mr-2 h-4 w-4" /> Add First Participant
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[1fr_140px_160px_120px_200px] gap-3 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Participant</span>
            <span>Company</span>
            <span>Email</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((p, idx) => (
              <div
                key={p.id}
                className="px-4 py-3 hover:bg-muted/10 transition-colors"
                data-ocid={`participants.item.${idx + 1}`}
              >
                {/* Mobile: card layout */}
                <div className="md:hidden mb-3">
                  <ParticipantCard participant={p} compact />
                </div>

                {/* Desktop: row layout */}
                <div className="hidden md:grid grid-cols-[1fr_140px_160px_120px_200px] gap-3 items-center">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs border mt-0.5 ${
                        p.role === "Owner" || p.role === "Designer"
                          ? "border-red-600/30 bg-red-600/10 text-red-400"
                          : "border-primary/30 bg-primary/10 text-primary"
                      }`}
                    >
                      {ROLE_LABELS[p.role]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {p.company.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {p.contact.email}
                  </p>
                  <Badge
                    variant="outline"
                    className={`border text-xs w-fit ${STATUS_STYLES[p.status]}`}
                  >
                    {STATUS_LABELS[p.status]}
                  </Badge>

                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditTarget(p)}
                      aria-label="Edit"
                      data-ocid={`participants.edit_button.${idx + 1}`}
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                    </Button>

                    {isGatekeeper && p.status === "pending" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300"
                          onClick={() => handleApprove(p)}
                          aria-label="Approve"
                          data-ocid={`participants.approve_button.${idx + 1}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                          onClick={() => handleReject(p)}
                          aria-label="Reject"
                          data-ocid={`participants.reject_button.${idx + 1}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}

                    {isGatekeeper && p.status === "approved" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        onClick={() => handleResend(p)}
                        aria-label="Resend Passcode"
                        data-ocid={`participants.resend_passcode_button.${idx + 1}`}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteConfirmId(p.id)}
                      aria-label="Delete"
                      data-ocid={`participants.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Mobile action row */}
                <div className="md:hidden flex gap-2 mt-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditTarget(p)}
                    data-ocid={`participants.edit_button.${idx + 1}`}
                  >
                    <PencilLine className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  {isGatekeeper && p.status === "pending" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => handleApprove(p)}
                        data-ocid={`participants.approve_button.${idx + 1}`}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(p)}
                        data-ocid={`participants.reject_button.${idx + 1}`}
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  {isGatekeeper && p.status === "approved" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleResend(p)}
                      data-ocid={`participants.resend_passcode_button.${idx + 1}`}
                    >
                      <Mail className="mr-1 h-3.5 w-3.5" /> Resend Passcode
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirmId(p.id)}
                    data-ocid={`participants.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <ParticipantFormModal
        open={addOpen || !!editTarget}
        initial={editTarget}
        onClose={() => {
          setAddOpen(false);
          setEditTarget(null);
        }}
      />

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(v) => !v && setDeleteConfirmId(null)}
      >
        <DialogContent
          className="max-w-sm bg-card border-border"
          data-ocid="participants.delete_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Remove Participant?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the participant and all their
            assignments.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              data-ocid="participants.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={del.isPending}
              data-ocid="participants.confirm_button"
            >
              {del.isPending ? "Removing…" : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Assignments Tab ──────────────────────────────────────────────────────────

function AssignmentsTab() {
  const { data: participants = [] } = useParticipantsList();
  const { data: allAssignments = [] } = useParticipantAssignments();
  const { data: rsSettings } = useRSMeansSettings();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const apiEnabled = rsSettings?.enabled && rsSettings?.mode === "live_api";

  const rows = useMemo(() => {
    return participants.map((p) => {
      const assignments = allAssignments.filter(
        (a) => a.participantId === p.id,
      );
      const phases = [
        ...new Set(
          assignments.filter((a) => a.phaseId).map((a) => a.phaseId ?? ""),
        ),
      ].join(", ");
      const codes = [
        ...new Set(
          assignments
            .filter((a) => a.csiDivision)
            .map((a) => a.csiDivision ?? ""),
        ),
      ].join(", ");
      const primaryDivision = assignments[0]?.csiDivision;
      return { participant: p, assignments, phases, codes, primaryDivision };
    });
  }, [participants, allAssignments]);

  const { activeCategoryId, activeSubtopicId } = useCategoryStore();

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground mb-2">
        {activeCategoryId
          ? `Filtered by: ${activeCategoryId}${activeSubtopicId ? ` > ${activeSubtopicId}` : ""}`
          : "Showing all phases"}
      </p>
      <p className="text-sm text-muted-foreground">
        Each row shows a participant&apos;s phase and CSI cost code assignments
        with RSMeans benchmarks. Click{" "}
        <ChevronDown className="inline h-3.5 w-3.5" /> to edit RSMeans data for
        that row.
      </p>

      {rows.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-16"
          data-ocid="participants.assignments_empty_state"
        >
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">
            No participants yet.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Add participants in the Team Roster tab first.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_150px_180px_120px_100px_44px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Participant</span>
            <span>Phases</span>
            <span>CSI Codes</span>
            <span>RSMeans Source</span>
            <span>Actual Cost</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {rows.map(
              ({ participant: p, phases, codes, primaryDivision }, idx) => (
                <div
                  key={p.id}
                  data-ocid={`participants.assignment_row.${idx + 1}`}
                >
                  <div
                    className={cn(
                      "grid grid-cols-1 md:grid-cols-[1fr_150px_180px_120px_100px_44px] gap-2 items-center px-4 py-3 hover:bg-muted/10 transition-colors",
                    )}
                  >
                    {/* Name + role */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {p.firstName} {p.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {ROLE_LABELS[p.role]}
                      </span>
                    </div>
                    {/* Phases */}
                    <p className="text-xs text-muted-foreground truncate hidden md:block">
                      {phases || <span className="opacity-50">—</span>}
                    </p>
                    {/* CSI codes */}
                    <p className="text-xs text-muted-foreground truncate hidden md:block">
                      {codes || <span className="opacity-50">—</span>}
                    </p>
                    {/* RSMeans source */}
                    <span
                      className={cn(
                        "hidden md:inline-flex rounded-full border px-2 py-0.5 text-xs font-medium w-fit",
                        apiEnabled
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {apiEnabled ? "Live API" : "Manual"}
                    </span>
                    {/* Actual cost placeholder */}
                    <p className="text-xs text-muted-foreground hidden md:block">
                      $—
                    </p>
                    {/* Expand */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                      onClick={() =>
                        setExpandedId(expandedId === p.id ? null : p.id)
                      }
                      aria-label="Edit RSMeans"
                      data-ocid={`participants.rsmeans_expand.${idx + 1}`}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedId === p.id && "rotate-180",
                        )}
                      />
                    </Button>
                  </div>

                  {/* Expandable RSMeans panel */}
                  {expandedId === p.id && primaryDivision && (
                    <div className="px-4 pb-4">
                      <RSMeansPanel
                        participantId={p.id}
                        csiDivision={primaryDivision}
                        apiEnabled={!!apiEnabled}
                        onClose={() => setExpandedId(null)}
                      />
                    </div>
                  )}
                  {expandedId === p.id && !primaryDivision && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3">
                        Assign a CSI division to this participant first to
                        enable RSMeans benchmarks.
                      </p>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParticipantsPage() {
  const isLocked = useIsFeatureLocked("participants");
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  const { data: isAdmin } = useIsAdmin(principal);

  return (
    <>
      {isLocked && (
        <div className="bg-amber-900/30 border border-amber-500 text-amber-200 px-4 py-3 rounded mb-4 text-sm font-medium">
          This feature is currently locked by the controller.
        </div>
      )}
      <div
        className={isLocked ? "opacity-50 pointer-events-none select-none" : ""}
      >
        <div className="space-y-6" data-ocid="participants.page">
          {/* Header */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/20">
                <Users className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Participants
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage project team, assignments, and RSMeans benchmarks
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="roster">
            <TabsList className="bg-muted/30 border border-border">
              <TabsTrigger value="roster" data-ocid="participants.roster_tab">
                Team Roster
              </TabsTrigger>
              <TabsTrigger
                value="assignments"
                data-ocid="participants.assignments_tab"
              >
                Assignments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roster" className="mt-6">
              <RosterTab />
            </TabsContent>

            <TabsContent value="assignments" className="mt-6">
              <AssignmentsTab />
            </TabsContent>
          </Tabs>

          {/* Admin Role Management */}
          {isAdmin && <AdminRoleSection />}
        </div>
      </div>
    </>
  );
}

function truncatePrincipal(p: Principal) {
  const t = p.toText();
  return t.length > 16 ? `${t.slice(0, 8)}…${t.slice(-8)}` : t;
}

function AdminRoleSection() {
  const { data: admins = [], isLoading } = useGetAdminList();
  const revoke = useRevokeAdmin();
  const assign = useAssignAdmin();
  const [principalInput, setPrincipalInput] = useState("");
  const [open, setOpen] = useState(false);

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
      data-ocid="participants.admin_role_section"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/10 transition-colors"
        data-ocid="participants.admin_role_toggle"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-semibold text-foreground">
            Admin Role Management
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Assign */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="assign-admin-principal"
                className="text-xs font-medium text-muted-foreground"
              >
                Principal ID
              </label>
              <Input
                id="assign-admin-principal"
                placeholder="Enter Principal ID to assign admin…"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                data-ocid="participants.admin_assign_input"
              />
            </div>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={!principalInput.trim() || assign.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="participants.admin_assign_button"
            >
              {assign.isPending ? "Assigning…" : "Assign Admin"}
            </Button>
          </div>

          {/* List */}
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
                    data-ocid={`participants.admin_item.${idx + 1}`}
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
                          disabled={revoke.isPending}
                          data-ocid={`participants.admin_revoke_button.${idx + 1}`}
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
      )}
    </div>
  );
}
