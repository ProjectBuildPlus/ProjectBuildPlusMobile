import type { NCCERCertShared } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParticipantsList } from "@/hooks/useParticipants";
import {
  useAddNCCERCertification,
  useNCCERCertificationsForParticipant,
} from "@/hooks/useSafetyStandards";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function certStatusColor(status: string) {
  switch (status) {
    case "Current":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "Expiring":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Expired":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function isExpiringSoon(expiresAt: bigint) {
  const now = Date.now();
  const exp = Number(expiresAt) / 1_000_000;
  const days = (exp - now) / 86400000;
  return days > 0 && days <= 30;
}

function AddCertModal({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const { data: participants = [] } = useParticipantsList();
  const addCert = useAddNCCERCertification();

  const [participantId, setParticipantId] = useState("");
  const [trade, setTrade] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [level, setLevel] = useState("");
  const [state, setState] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participantId || !trade || !certNumber || !issuedAt || !expiresAt) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await addCert.mutateAsync({
        participantId,
        trade,
        discipline,
        level,
        state,
        certNumber,
        issuedAt: BigInt(new Date(issuedAt).getTime() * 1_000_000),
        expiresAt: BigInt(new Date(expiresAt).getTime() * 1_000_000),
      });
      toast.success("Certification added");
      setOpen(false);
      onAdded();
    } catch {
      toast.error("Failed to add certification");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-ocid="safety.nccer.add_cert_button">
          <Plus className="mr-1 h-4 w-4" />
          Add Certification
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add NCCER Certification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Participant</Label>
            <Select value={participantId} onValueChange={setParticipantId}>
              <SelectTrigger data-ocid="safety.nccer.modal.participant_select">
                <SelectValue placeholder="Select participant" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Trade</Label>
              <Input
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                data-ocid="safety.nccer.modal.trade_input"
              />
            </div>
            <div>
              <Label>Discipline</Label>
              <Input
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                data-ocid="safety.nccer.modal.discipline_input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Level</Label>
              <Input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                data-ocid="safety.nccer.modal.level_input"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                data-ocid="safety.nccer.modal.state_input"
              />
            </div>
          </div>
          <div>
            <Label>Certification Number</Label>
            <Input
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              data-ocid="safety.nccer.modal.cert_number_input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Issued Date</Label>
              <Input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                data-ocid="safety.nccer.modal.issued_input"
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                data-ocid="safety.nccer.modal.expires_input"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={addCert.isPending}
            data-ocid="safety.nccer.modal.submit_button"
          >
            {addCert.isPending ? "Saving…" : "Save Certification"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NCCERCertsTab() {
  const { data: participants = [] } = useParticipantsList();
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [_refreshKey, setRefreshKey] = useState(0);

  const _allCerts: (NCCERCertShared & {
    participantName: string;
    participantRole: string;
  })[] = useMemo(() => {
    const list: (NCCERCertShared & {
      participantName: string;
      participantRole: string;
    })[] = [];
    for (const _p of participants) {
      // In a real app we'd query per participant; here we use a hook per participant which isn't ideal.
      // For simplicity, we'll show a message that certs are per-participant.
    }
    return list;
  }, [participants]);

  // Since we can't call hooks in a loop, let's show a participant selector and list their certs
  const [selectedParticipantId, setSelectedParticipantId] =
    useState<string>("");
  const { data: certs = [] } = useNCCERCertificationsForParticipant(
    selectedParticipantId,
  );

  const filteredCerts = useMemo(() => {
    let list = certs.map((c) => ({
      ...c,
      participantName: participants.find((p) => p.id === c.participantId)
        ? `${participants.find((p) => p.id === c.participantId)?.firstName} ${participants.find((p) => p.id === c.participantId)?.lastName}`
        : c.participantId,
      participantRole:
        participants.find((p) => p.id === c.participantId)?.role ?? "",
    }));
    if (roleFilter !== "All") {
      list = list.filter((c) => c.participantRole === roleFilter);
    }
    if (statusFilter !== "All") {
      list = list.filter((c) => c.status === statusFilter);
    }
    return list;
  }, [certs, participants, roleFilter, statusFilter]);

  const uniqueRoles = useMemo(
    () => Array.from(new Set(participants.map((p) => p.role))),
    [participants],
  );

  return (
    <div className="space-y-4" data-ocid="safety.nccer.section">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selectedParticipantId}
          onValueChange={setSelectedParticipantId}
        >
          <SelectTrigger
            className="w-[220px]"
            data-ocid="safety.nccer.participant_select"
          >
            <SelectValue placeholder="Select participant" />
          </SelectTrigger>
          <SelectContent>
            {participants.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger
            className="w-[160px]"
            data-ocid="safety.nccer.role_filter"
          >
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            {uniqueRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-[160px]"
            data-ocid="safety.nccer.status_filter"
          >
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Current">Current</SelectItem>
            <SelectItem value="Expiring">Expiring</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <AddCertModal onAdded={() => setRefreshKey((k) => k + 1)} />
      </div>

      {filteredCerts.length === 0 && selectedParticipantId && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No certifications found for this participant.
          </p>
        </div>
      )}
      {filteredCerts.length === 0 && !selectedParticipantId && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select a participant to view their certifications.
          </p>
        </div>
      )}

      {filteredCerts.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Participant</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Trade</TableHead>
                <TableHead className="text-xs">Discipline</TableHead>
                <TableHead className="text-xs">Level</TableHead>
                <TableHead className="text-xs">State</TableHead>
                <TableHead className="text-xs">Cert #</TableHead>
                <TableHead className="text-xs">Issued</TableHead>
                <TableHead className="text-xs">Expires</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCerts.map((cert) => {
                const expSoon = isExpiringSoon(cert.expiresAt);
                return (
                  <TableRow
                    key={cert.id}
                    data-ocid={`safety.nccer.item.${cert.id}.row`}
                  >
                    <TableCell className="text-xs">
                      {cert.participantName}
                    </TableCell>
                    <TableCell className="text-xs">
                      {cert.participantRole}
                    </TableCell>
                    <TableCell className="text-xs">{cert.trade}</TableCell>
                    <TableCell className="text-xs">{cert.discipline}</TableCell>
                    <TableCell className="text-xs">{cert.level}</TableCell>
                    <TableCell className="text-xs">{cert.state}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {cert.certNumber}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(
                        Number(cert.issuedAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span
                        className={expSoon ? "text-amber-400 font-medium" : ""}
                      >
                        {new Date(
                          Number(cert.expiresAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </span>
                      {expSoon && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]"
                        >
                          Expiring Soon
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${certStatusColor(cert.status)}`}
                      >
                        {cert.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
