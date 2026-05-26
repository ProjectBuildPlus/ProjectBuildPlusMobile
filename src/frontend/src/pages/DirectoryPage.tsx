import { ParticipantCard } from "@/components/ParticipantCard";
import { ROLE_LABELS } from "@/components/ParticipantCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Participant, ParticipantRole } from "@/hooks/useParticipants";
import { useParticipantsList } from "@/hooks/useParticipants";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Search, Users } from "lucide-react";
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "name" | "company" | "role" | "date";

const ALL_ROLES = Object.keys(ROLE_LABELS) as ParticipantRole[];

function ParticipantDetailDialog({
  participant,
  open,
  onClose,
}: {
  participant: Participant | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!participant) return null;
  const addr = participant.residentialAddress;
  const co = participant.company;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg bg-card border-border"
        data-ocid="directory.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {participant.firstName} {participant.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role & Status */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {ROLE_LABELS[participant.role]}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                participant.status === "approved"
                  ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-400"
                  : participant.status === "rejected"
                    ? "border-red-600/30 bg-red-600/10 text-red-400"
                    : "border-amber-600/30 bg-amber-600/10 text-amber-400"
              }`}
            >
              {participant.status.charAt(0).toUpperCase() +
                participant.status.slice(1)}
            </span>
          </div>

          {/* Contact */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </p>
            <a
              href={`mailto:${participant.contact.email}`}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {participant.contact.email}
            </a>
            {participant.contact.officePhone && (
              <a
                href={`tel:${participant.contact.officePhone}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {participant.contact.officePhone}{" "}
                <span className="text-xs text-muted-foreground">(office)</span>
              </a>
            )}
            {participant.contact.mobilePhone && (
              <a
                href={`tel:${participant.contact.mobilePhone}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                {participant.contact.mobilePhone}{" "}
                <span className="text-xs text-muted-foreground">(mobile)</span>
              </a>
            )}
          </div>

          {/* Residential */}
          {addr.street && (
            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Residential Address
              </p>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span>
                  {addr.street}, {addr.city}, {addr.state} {addr.zip}
                  {addr.country ? `, ${addr.country}` : ""}
                </span>
              </div>
            </div>
          )}

          {/* Company */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{co.name}</span>
              {co.trade && (
                <span className="text-muted-foreground text-xs">
                  · {co.trade}
                </span>
              )}
            </div>
            {co.address.street && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span>
                  {co.address.street}, {co.address.city}, {co.address.state}{" "}
                  {co.address.zip}
                </span>
              </div>
            )}
            {co.licenseNumber && (
              <p className="text-xs text-muted-foreground">
                License #: {co.licenseNumber}
              </p>
            )}
            {co.website && (
              <a
                href={co.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {co.website}
              </a>
            )}
          </div>

          {/* Notes */}
          {participant.notes && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
              </div>
              <p className="text-sm text-foreground">{participant.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="directory.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DirectoryPage() {
  const { data: participants = [], isLoading } = useParticipantsList();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<ParticipantRole | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [selected, setSelected] = useState<Participant | null>(null);

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
    if (roleFilter !== "all") {
      list = list.filter((p) => p.role === roleFilter);
    }
    list.sort((a, b) => {
      if (sortKey === "name")
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
      if (sortKey === "company")
        return a.company.name.localeCompare(b.company.name);
      if (sortKey === "role") return a.role.localeCompare(b.role);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [participants, search, roleFilter, sortKey]);

  const { activeCategoryId, activeSubtopicId } = useCategoryStore();

  return (
    <div className="space-y-6" data-ocid="directory.page">
      <p className="text-xs text-muted-foreground mb-2">
        {activeCategoryId
          ? `Filtered by: ${activeCategoryId}${activeSubtopicId ? ` > ${activeSubtopicId}` : ""}`
          : "Showing all phases"}
      </p>
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Project Directory
            </h1>
            <p className="text-sm text-muted-foreground">
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""} on this project
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="directory.search_input"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as ParticipantRole | "all")}
        >
          <SelectTrigger
            className="w-full sm:w-48"
            data-ocid="directory.role_filter_select"
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
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger
            className="w-full sm:w-44"
            data-ocid="directory.sort_select"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="company">Sort: Company</SelectItem>
            <SelectItem value="role">Sort: Role</SelectItem>
            <SelectItem value="date">Sort: Date Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"].map((k) => (
            <Skeleton key={k} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-16"
          data-ocid="directory.empty_state"
        >
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">
            {search || roleFilter !== "all"
              ? "No participants match your filters."
              : "No participants added yet."}
          </p>
          <p className="text-sm text-muted-foreground/70">
            Add participants from the Participants page.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <div key={p.id} data-ocid={`directory.item.${i + 1}`}>
              <ParticipantCard
                participant={p}
                onViewDetails={(participant) => setSelected(participant)}
              />
            </div>
          ))}
        </div>
      )}

      <ParticipantDetailDialog
        participant={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
