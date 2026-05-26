import type { CriticalChangePlanShared, CriticalPlanStatus } from "@/backend";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { usePhases } from "@/hooks/useQueries";
import {
  useApproveCriticalChangePlan,
  useCreateCriticalChangePlan,
  useCriticalChangePlansForPhase,
  useSubmitPlanForApproval,
} from "@/hooks/useSafetyStandards";
import { Lock, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EHS_ROLES } from "./safetyData";

function statusBadgeColor(status: CriticalPlanStatus) {
  switch (status) {
    case "Approved":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "PendingApproval":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Rejected":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function PlanCard({
  plan,
  currentRole,
}: {
  plan: CriticalChangePlanShared;
  currentRole: string;
}) {
  const submitApproval = useSubmitPlanForApproval();
  const approvePlan = useApproveCriticalChangePlan();
  const isEHS = EHS_ROLES.includes(currentRole);

  async function handleSubmitForApproval() {
    try {
      await submitApproval.mutateAsync(plan.id);
      toast.success("Plan submitted for approval");
    } catch {
      toast.error("Failed to submit plan");
    }
  }

  async function handleApprove(approved: boolean) {
    try {
      await approvePlan.mutateAsync({ planId: plan.id, approved });
      toast.success(approved ? "Plan approved" : "Plan rejected");
    } catch {
      toast.error("Failed to update approval");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            {plan.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            Created by {plan.createdBy} on{" "}
            {new Date(Number(plan.createdAt) / 1_000_000).toLocaleDateString()}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-xs ${statusBadgeColor(plan.status)}`}
        >
          {plan.status}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {plan.phaseIds.map((pid) => (
          <span
            key={pid}
            className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
          >
            Phase {pid}
          </span>
        ))}
        {plan.csiCodes.map((c) => (
          <span
            key={c}
            className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">Hazard Analysis</p>
        <p className="text-xs text-muted-foreground">{plan.hazardAnalysis}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">Control Measures</p>
        <p className="text-xs text-muted-foreground">{plan.controlMeasures}</p>
      </div>
      <Separator />
      <div className="flex flex-wrap items-center gap-2">
        {plan.status === "Draft" && (
          <Button
            size="sm"
            onClick={handleSubmitForApproval}
            disabled={submitApproval.isPending}
            data-ocid={`safety.critical_plan.${plan.id}.submit_button`}
          >
            Submit for Approval
          </Button>
        )}
        {plan.status === "PendingApproval" && isEHS && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApprove(true)}
              disabled={approvePlan.isPending}
              data-ocid={`safety.critical_plan.${plan.id}.approve_button`}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApprove(false)}
              disabled={approvePlan.isPending}
              data-ocid={`safety.critical_plan.${plan.id}.reject_button`}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function CreatePlanModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const { data: phases = [] } = usePhases();
  const createPlan = useCreateCriticalChangePlan();

  const [name, setName] = useState("");
  const [phaseIds, setPhaseIds] = useState<string[]>([]);
  const [csiCodes, setCsiCodes] = useState<string>("");
  const [hazardAnalysis, setHazardAnalysis] = useState("");
  const [controlMeasures, setControlMeasures] = useState("");
  const [affectedStandardIds, setAffectedStandardIds] = useState<string>("");
  const [responsibleParticipantIds, setResponsibleParticipantIds] =
    useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPlan.mutateAsync({
        name,
        phaseIds,
        csiCodes: csiCodes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        hazardAnalysis,
        controlMeasures,
        affectedStandardIds: affectedStandardIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        responsibleParticipantIds: responsibleParticipantIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Critical change plan created");
      setOpen(false);
      onCreated();
    } catch {
      toast.error("Failed to create plan");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-ocid="safety.critical_plan.create_button">
          <Plus className="mr-1 h-4 w-4" />
          Create Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Critical Change Safety Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Plan Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="safety.critical_plan.modal.name_input"
            />
          </div>
          <div>
            <Label>Affected Phases</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {phases.map((p) => {
                const pid = String(p.id);
                const selected = phaseIds.includes(pid);
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() =>
                      setPhaseIds((prev) =>
                        selected
                          ? prev.filter((id) => id !== pid)
                          : [...prev, pid],
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    data-ocid={`safety.critical_plan.modal.phase_toggle.${pid}`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label>Affected CSI Codes (comma-separated)</Label>
            <Input
              value={csiCodes}
              onChange={(e) => setCsiCodes(e.target.value)}
              placeholder="e.g. 03-30-00, 05-12-00"
              data-ocid="safety.critical_plan.modal.csi_input"
            />
          </div>
          <div>
            <Label>Hazard Analysis</Label>
            <Textarea
              value={hazardAnalysis}
              onChange={(e) => setHazardAnalysis(e.target.value)}
              rows={3}
              data-ocid="safety.critical_plan.modal.hazard_input"
            />
          </div>
          <div>
            <Label>Control Measures</Label>
            <Textarea
              value={controlMeasures}
              onChange={(e) => setControlMeasures(e.target.value)}
              rows={3}
              data-ocid="safety.critical_plan.modal.control_input"
            />
          </div>
          <div>
            <Label>Affected Standard IDs (comma-separated)</Label>
            <Input
              value={affectedStandardIds}
              onChange={(e) => setAffectedStandardIds(e.target.value)}
              placeholder="e.g. osha-1926-501, ansi-a10-32"
              data-ocid="safety.critical_plan.modal.standards_input"
            />
          </div>
          <div>
            <Label>Responsible Participant IDs (comma-separated)</Label>
            <Input
              value={responsibleParticipantIds}
              onChange={(e) => setResponsibleParticipantIds(e.target.value)}
              data-ocid="safety.critical_plan.modal.participants_input"
            />
          </div>
          <Button
            type="submit"
            disabled={createPlan.isPending}
            data-ocid="safety.critical_plan.modal.submit_button"
          >
            {createPlan.isPending ? "Creating…" : "Create Plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CriticalChangePlansTab({
  currentRole,
}: {
  currentRole: string;
}) {
  const { data: phases = [] } = usePhases();
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const { data: plans = [] } = useCriticalChangePlansForPhase(selectedPhaseId);
  const [_refreshKey, setRefreshKey] = useState(0);

  const isEHS = EHS_ROLES.includes(currentRole);

  if (!isEHS) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center"
        data-ocid="safety.critical_plan.denied"
      >
        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">Permission Denied</p>
        <p className="text-xs text-muted-foreground mt-1">
          Critical Change Safety Plans are only accessible to EHS
          Representatives, Safety Engineers, and Safety Inspectors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="safety.critical_plan.section">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={selectedPhaseId}
          onChange={(e) => setSelectedPhaseId(e.target.value)}
          data-ocid="safety.critical_plan.phase_select"
        >
          <option value="">All Phases</option>
          {phases.map((p) => (
            <option key={String(p.id)} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        <CreatePlanModal onCreated={() => setRefreshKey((k) => k + 1)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} currentRole={currentRole} />
        ))}
      </div>
      {plans.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No critical change plans found. Create one to get started.
          </p>
        </div>
      )}
    </div>
  );
}
