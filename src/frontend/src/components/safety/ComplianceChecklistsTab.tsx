import type { ComplianceItemShared, PhaseSignOffShared } from "@/backend";
import { ComplianceSeverity, ComplianceStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { usePhases } from "@/hooks/useQueries";
import {
  useComplianceItemsForPhase,
  usePhaseComplianceStatus,
  useSignOffsForPhase,
  useSubmitPhaseSignOff,
  useUpsertComplianceItem,
} from "@/hooks/useSafetyStandards";
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Lock,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SAFETY_SIGN_OFF_ROLES, SIGN_OFF_REQUIRED_ROLES } from "./safetyData";

const STATUS_OPTIONS: ComplianceStatus[] = [
  ComplianceStatus.Compliant,
  ComplianceStatus.NonCompliant,
  ComplianceStatus.NA,
];
const SEVERITY_OPTIONS: ComplianceSeverity[] = [
  ComplianceSeverity.Critical,
  ComplianceSeverity.Major,
  ComplianceSeverity.Minor,
  ComplianceSeverity.None,
];

function severityColor(sev: ComplianceSeverity) {
  switch (sev) {
    case ComplianceSeverity.Critical:
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case ComplianceSeverity.Major:
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case ComplianceSeverity.Minor:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function statusColor(st: ComplianceStatus) {
  switch (st) {
    case ComplianceStatus.Compliant:
      return "text-green-400";
    case ComplianceStatus.NonCompliant:
      return "text-red-400";
    default:
      return "text-muted-foreground";
  }
}

function PhaseComplianceCard({
  phaseId,
  phaseName,
  currentRole,
}: {
  phaseId: string;
  phaseName: string;
  currentRole: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: items = [] } = useComplianceItemsForPhase(phaseId);
  const { data: summary } = usePhaseComplianceStatus(phaseId);
  const { data: signOffs = [] } = useSignOffsForPhase(phaseId);
  const upsert = useUpsertComplianceItem();
  const submitSignOff = useSubmitPhaseSignOff();

  const checked = Number(summary?.compliant ?? 0);
  const total = Number(summary?.total ?? 0);
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  const canSignOff =
    SIGN_OFF_REQUIRED_ROLES.includes(currentRole) ||
    SAFETY_SIGN_OFF_ROLES.includes(currentRole);

  const hasRequiredSignOff = signOffs.some((s) =>
    SIGN_OFF_REQUIRED_ROLES.includes(s.role),
  );
  const hasSafetySignOff = signOffs.some((s) =>
    SAFETY_SIGN_OFF_ROLES.includes(s.role),
  );
  const fullySignedOff = hasRequiredSignOff && hasSafetySignOff;

  async function handleUpdate(
    standardId: string,
    status: ComplianceStatus,
    severity: ComplianceSeverity,
    notes: string,
  ) {
    try {
      await upsert.mutateAsync({
        phaseId,
        standardId,
        status,
        severity,
        notes,
      });
      toast.success("Compliance item updated");
    } catch {
      toast.error("Failed to update compliance item");
    }
  }

  async function handleSignOff(approved: boolean) {
    try {
      await submitSignOff.mutateAsync({
        phaseId,
        approved,
        comments: approved ? "Approved" : "Rejected",
      });
      toast.success(approved ? "Phase signed off" : "Sign-off rejected");
    } catch {
      toast.error("Failed to submit sign-off");
    }
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/40 transition-colors"
            data-ocid={`safety.compliance.phase.${phaseId}.toggle`}
            aria-expanded={open}
          >
            <div className="flex items-center gap-3 min-w-0">
              {fullySignedOff ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground text-sm">
                  {phaseName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-safety transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {checked}/{total} checked
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {fullySignedOff ? (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-400 border-green-500/20"
                >
                  Signed Off
                </Badge>
              ) : (
                <Badge variant="outline" className="compliance-pending">
                  Pending
                </Badge>
              )}
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <div className="px-5 py-4 space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No compliance items linked to this phase yet.
              </p>
            )}
            {items.map((item) => (
              <ComplianceItemRow
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
          {/* Sign-off section */}
          <Separator />
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-foreground mb-2">
              Phase Sign-Off
            </p>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {SIGN_OFF_REQUIRED_ROLES.map((role) => {
                  const so = signOffs.find((s) => s.role === role);
                  return (
                    <Badge
                      key={role}
                      variant="outline"
                      className={
                        so?.approved
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {role}: {so?.approved ? "Approved" : "Pending"}
                    </Badge>
                  );
                })}
                {SAFETY_SIGN_OFF_ROLES.map((role) => {
                  const so = signOffs.find((s) => s.role === role);
                  return (
                    <Badge
                      key={role}
                      variant="outline"
                      className={
                        so?.approved
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {role}: {so?.approved ? "Approved" : "Pending"}
                    </Badge>
                  );
                })}
              </div>
              {canSignOff && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSignOff(true)}
                    disabled={submitSignOff.isPending}
                    data-ocid={`safety.compliance.phase.${phaseId}.approve_button`}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSignOff(false)}
                    disabled={submitSignOff.isPending}
                    data-ocid={`safety.compliance.phase.${phaseId}.reject_button`}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function ComplianceItemRow({
  item,
  onUpdate,
}: {
  item: ComplianceItemShared;
  onUpdate: (
    standardId: string,
    status: ComplianceStatus,
    severity: ComplianceSeverity,
    notes: string,
  ) => void;
}) {
  const [status, setStatus] = useState<ComplianceStatus>(item.status);
  const [severity, setSeverity] = useState<ComplianceSeverity>(item.severity);
  const [notes, setNotes] = useState(item.notes);

  return (
    <div className="rounded-md border border-border bg-background p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {item.standardId}
        </span>
        <Badge
          variant="outline"
          className={`text-xs ${severityColor(severity)}`}
        >
          {severity}
        </Badge>
        <span className={`text-xs font-medium ${statusColor(status)}`}>
          {status}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as ComplianceStatus);
            onUpdate(item.standardId, v as ComplianceStatus, severity, notes);
          }}
        >
          <SelectTrigger
            className="w-[140px] h-8 text-xs"
            data-ocid={`safety.compliance.item.${item.id}.status_select`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={severity}
          onValueChange={(v) => {
            setSeverity(v as ComplianceSeverity);
            onUpdate(item.standardId, status, v as ComplianceSeverity, notes);
          }}
        >
          <SelectTrigger
            className="w-[120px] h-8 text-xs"
            data-ocid={`safety.compliance.item.${item.id}.severity_select`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onUpdate(item.standardId, status, severity, notes)}
          className="h-8 text-xs flex-1 min-w-[150px]"
          data-ocid={`safety.compliance.item.${item.id}.notes_input`}
        />
      </div>
      {item.checkedBy && (
        <p className="text-[10px] text-muted-foreground">
          Checked by {item.checkedBy} at{" "}
          {new Date(Number(item.checkedAt) / 1_000_000).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function ComplianceChecklistsTab({
  currentRole,
}: {
  currentRole: string;
}) {
  const { data: phases = [] } = usePhases();

  return (
    <div className="space-y-3" data-ocid="safety.compliance.section">
      {phases.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No phases found. Create phases in Project Setup to begin compliance
            tracking.
          </p>
        </div>
      )}
      {phases.map((phase) => (
        <PhaseComplianceCard
          key={String(phase.id)}
          phaseId={String(phase.id)}
          phaseName={phase.name}
          currentRole={currentRole}
        />
      ))}
    </div>
  );
}
