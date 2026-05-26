import type { PhaseAllocationInput, ResourceInput } from "@/backend";
import { IdleTimeMode, ResourceType, TrackingLevel } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhases } from "@/hooks/useQueries";
import {
  useDeleteResource,
  useIdleTimeSetting,
  usePhaseAllocations,
  usePhaseAllocationsByResource,
  useResourceSummaries,
  useResources,
  useSetIdleTimeSetting,
  useUpsertPhaseAllocation,
  useUpsertResource,
} from "@/hooks/useResources";
import type {
  PhaseAllocation,
  Resource,
  ResourceSummary,
} from "@/hooks/useResources";
import {
  Activity,
  Clock,
  DollarSign,
  HardHat,
  PencilLine,
  Plus,
  Trash2,
  TrendingDown,
  Users,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useIsFeatureLocked } from "../context/FeatureLockContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtHours(v: number): string {
  return `${v.toFixed(1)} h`;
}

function fmtCost(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function IdleModeBadge({ mode }: { mode: IdleTimeMode }) {
  const isHold = mode === IdleTimeMode.holdThroughProject;
  return (
    <Badge
      variant="outline"
      className={`text-xs ${
        isHold
          ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
          : "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
      }`}
    >
      {isHold ? "Hold" : "Release"}
    </Badge>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${accent ?? "bg-primary/10"}`}>
            <Icon
              className={`h-4 w-4 ${accent ? "text-primary" : "text-primary"}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold text-foreground font-mono">
              {value}
            </p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Resource Form ─────────────────────────────────────────────────────────────

const EMPTY_FORM: ResourceInput = {
  name: "",
  resourceType: ResourceType.labor,
  trackingLevel: TrackingLevel.individual,
  crewSize: undefined,
  csiCode: "",
  hourlyRate: 0,
  hourlyRateSource: "Manual",
  idleTimeMode: IdleTimeMode.releaseAtPhaseEnd,
};

function ResourceFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ResourceInput;
  onSave: (input: ResourceInput) => void;
}) {
  const [form, setForm] = useState<ResourceInput>(initial ?? EMPTY_FORM);
  const isCrew = form.trackingLevel === TrackingLevel.crew;

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (form.hourlyRate < 0) {
      toast.error("Hourly rate must be positive");
      return;
    }
    const input: ResourceInput = {
      ...form,
      crewSize:
        isCrew && form.crewSize ? BigInt(Number(form.crewSize)) : undefined,
      csiCode: form.csiCode?.trim() || undefined,
    };
    onSave(input);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {initial ? "Edit Resource" : "Add Resource"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Name */}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-sm">Name</Label>
            <Input
              data-ocid="resource.name_input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Carpenter #1"
              className="bg-background border-border"
            />
          </div>
          {/* Resource Type */}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-sm">
              Resource Type
            </Label>
            <div className="flex gap-4">
              {(
                [ResourceType.labor, ResourceType.equipment] as ResourceType[]
              ).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    className="accent-primary"
                    checked={form.resourceType === t}
                    onChange={() => setForm((f) => ({ ...f, resourceType: t }))}
                    data-ocid={`resource.type_${t}`}
                  />
                  <span className="text-sm capitalize text-foreground">
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {/* Tracking Level */}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-sm">
              Tracking Level
            </Label>
            <div className="flex gap-4">
              {(
                [
                  TrackingLevel.individual,
                  TrackingLevel.crew,
                ] as TrackingLevel[]
              ).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    className="accent-primary"
                    checked={form.trackingLevel === t}
                    onChange={() =>
                      setForm((f) => ({ ...f, trackingLevel: t }))
                    }
                    data-ocid={`resource.tracking_${t}`}
                  />
                  <span className="text-sm capitalize text-foreground">
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {/* Crew Size — only for crew */}
          {isCrew && (
            <div className="grid gap-1.5">
              <Label className="text-muted-foreground text-sm">
                Crew Size (people)
              </Label>
              <Input
                data-ocid="resource.crew_size_input"
                type="number"
                min={1}
                value={form.crewSize !== undefined ? Number(form.crewSize) : ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    crewSize: e.target.value
                      ? BigInt(e.target.value)
                      : undefined,
                  }))
                }
                className="bg-background border-border"
              />
            </div>
          )}
          {/* CSI Code */}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-sm">
              CSI Code (optional)
            </Label>
            <Input
              data-ocid="resource.csi_code_input"
              value={form.csiCode ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, csiCode: e.target.value }))
              }
              placeholder="e.g. 03 11 00"
              className="bg-background border-border"
            />
          </div>
          {/* Hourly Rate */}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-sm">
              Hourly Rate ($)
            </Label>
            <Input
              data-ocid="resource.hourly_rate_input"
              type="number"
              min={0}
              step={0.01}
              value={form.hourlyRate}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  hourlyRate: Number.parseFloat(e.target.value) || 0,
                }))
              }
              className="bg-background border-border"
            />
          </div>
          {/* Rate Source */}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-sm">Rate Source</Label>
            <Select
              value={form.hourlyRateSource}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, hourlyRateSource: v }))
              }
            >
              <SelectTrigger
                data-ocid="resource.rate_source_select"
                className="bg-background border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RSMeans">RSMeans</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="CostCode">Cost Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Idle Time Mode */}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-sm">
              Idle Time Mode
            </Label>
            <div className="flex gap-4">
              {(
                [
                  {
                    v: IdleTimeMode.releaseAtPhaseEnd,
                    label: "Release at Phase End",
                  },
                  {
                    v: IdleTimeMode.holdThroughProject,
                    label: "Hold Through Project",
                  },
                ] as { v: IdleTimeMode; label: string }[]
              ).map(({ v, label }) => (
                <label
                  key={v}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    className="accent-primary"
                    checked={form.idleTimeMode === v}
                    onChange={() => setForm((f) => ({ ...f, idleTimeMode: v }))}
                    data-ocid={`resource.idle_mode_${v}`}
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="resource.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            data-ocid="resource.save_button"
            className="bg-primary text-primary-foreground"
          >
            Save Resource
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Allocation Edit Row ────────────────────────────────────────────────────────

function AllocationEditRow({
  allocation,
  onSave,
  onCancel,
}: {
  allocation: PhaseAllocation;
  onSave: (updated: PhaseAllocationInput) => void;
  onCancel: () => void;
}) {
  const [fields, setFields] = useState({
    allocatedHours: allocation.allocatedHours,
    availableHours: allocation.availableHours,
    actualHours: allocation.actualHours ?? 0,
    laborCostSource: allocation.laborCostSource,
    manualLaborCost: allocation.manualLaborCost ?? 0,
  });

  function handleSave() {
    onSave({
      resourceId: allocation.resourceId,
      phaseId: allocation.phaseId,
      allocatedHours: fields.allocatedHours,
      availableHours: fields.availableHours,
      actualHours: fields.actualHours,
      laborCostSource: fields.laborCostSource,
      manualLaborCost:
        fields.manualLaborCost > 0 ? fields.manualLaborCost : undefined,
    });
  }

  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={2} className="py-2">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            type="number"
            value={fields.allocatedHours}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                allocatedHours: Number.parseFloat(e.target.value) || 0,
              }))
            }
            className="w-28 h-7 text-xs bg-background border-border"
            placeholder="Alloc hrs"
          />
          <Input
            type="number"
            value={fields.availableHours}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                availableHours: Number.parseFloat(e.target.value) || 0,
              }))
            }
            className="w-28 h-7 text-xs bg-background border-border"
            placeholder="Avail hrs"
          />
          <Input
            type="number"
            value={fields.actualHours}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                actualHours: Number.parseFloat(e.target.value) || 0,
              }))
            }
            className="w-28 h-7 text-xs bg-background border-border"
            placeholder="Actual hrs"
          />
          <Select
            value={fields.laborCostSource}
            onValueChange={(v) =>
              setFields((f) => ({ ...f, laborCostSource: v }))
            }
          >
            <SelectTrigger className="w-28 h-7 text-xs bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RSMeans">RSMeans</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="CostCode">Cost Code</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={fields.manualLaborCost}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                manualLaborCost: Number.parseFloat(e.target.value) || 0,
              }))
            }
            className="w-28 h-7 text-xs bg-background border-border"
            placeholder="Override cost"
          />
        </div>
      </TableCell>
      <TableCell colSpan={4} className="py-2">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="h-7 text-xs bg-primary text-primary-foreground"
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Phase Allocations Panel ───────────────────────────────────────────────────

function PhaseAllocationsPanel({ resourceId }: { resourceId: string }) {
  const { data: allocations = [], isLoading } =
    usePhaseAllocationsByResource(resourceId);
  const { data: phases = [] } = usePhases();
  const upsertAllocation = useUpsertPhaseAllocation();
  const [editId, setEditId] = useState<string | null>(null);

  const phaseNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ph of phases) map[ph.id.toString()] = ph.name;
    return map;
  }, [phases]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div
        data-ocid="allocations.empty_state"
        className="py-6 text-center text-muted-foreground text-sm"
      >
        No phase allocations recorded for this resource.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground text-xs">
              Phase
            </TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">
              Allocated
            </TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">
              Available
            </TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">
              Actual
            </TableHead>
            <TableHead className="text-muted-foreground text-xs">
              Cost Source
            </TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">
              Override Cost
            </TableHead>
            <TableHead className="text-muted-foreground text-xs">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.map((alloc, idx) =>
            editId === alloc.id ? (
              <AllocationEditRow
                key={alloc.id}
                allocation={alloc}
                onSave={async (updated) => {
                  try {
                    await upsertAllocation.mutateAsync(updated);
                    toast.success("Allocation updated");
                    setEditId(null);
                  } catch {
                    toast.error("Failed to update allocation");
                  }
                }}
                onCancel={() => setEditId(null)}
              />
            ) : (
              <TableRow
                key={alloc.id}
                data-ocid={`allocation.item.${idx + 1}`}
                className="border-border hover:bg-muted/20 transition-colors"
              >
                <TableCell className="font-medium text-foreground text-sm">
                  {phaseNameMap[alloc.phaseId] ?? alloc.phaseId}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {fmtHours(alloc.allocatedHours)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {fmtHours(alloc.availableHours)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  {alloc.actualHours != null
                    ? fmtHours(alloc.actualHours)
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-xs border-border text-muted-foreground"
                  >
                    {alloc.laborCostSource}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  {alloc.manualLaborCost != null
                    ? fmtCost(alloc.manualLaborCost)
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setEditId(alloc.id)}
                    data-ocid={`allocation.edit_button.${idx + 1}`}
                  >
                    <PencilLine className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Resource Summary Card ─────────────────────────────────────────────────────

function ResourceSummaryCard({ summary }: { summary: ResourceSummary }) {
  const idlePct =
    summary.totalAvailableHours > 0
      ? ((summary.totalIdleHours / summary.totalAvailableHours) * 100).toFixed(
          1,
        )
      : "0.0";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-foreground truncate">
          {summary.resourceName}
        </CardTitle>
        <Badge
          variant="outline"
          className="w-fit text-xs capitalize border-border text-muted-foreground"
        >
          {summary.trackingLevel}
        </Badge>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <span className="text-muted-foreground">Allocated</span>
          <span className="text-right font-mono text-foreground">
            {fmtHours(summary.totalAllocatedHours)}
          </span>
          <span className="text-muted-foreground">Available</span>
          <span className="text-right font-mono text-foreground">
            {fmtHours(summary.totalAvailableHours)}
          </span>
          <span className="text-muted-foreground">Idle</span>
          <span className="text-right font-mono text-amber-400">
            {fmtHours(summary.totalIdleHours)}
            <span className="text-muted-foreground ml-1">({idlePct}%)</span>
          </span>
          <span className="text-muted-foreground">Original Baseline Idle</span>
          <span className="text-right font-mono text-foreground">
            {fmtHours(summary.idleHoursOriginalBaseline)}
          </span>
          <span className="text-muted-foreground">Crashed Baseline Idle</span>
          <span className="text-right font-mono text-foreground">
            {fmtHours(summary.idleHoursCrashedBaseline)}
          </span>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Cost</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {fmtCost(summary.totalLaborCost)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Resource Table ────────────────────────────────────────────────────────

function ResourceTable({
  resourceType,
  crewView,
}: {
  resourceType: ResourceType;
  crewView: boolean;
}) {
  const { data: resources = [], isLoading } = useResources(resourceType);
  const { data: allocations = [] } = usePhaseAllocations();
  const { data: summaries = [] } = useResourceSummaries();
  const upsertResource = useUpsertResource();
  const deleteResource = useDeleteResource();
  const _setIdleTime = useSetIdleTimeSetting();

  const [showAdd, setShowAdd] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );

  // Group or flatten based on crewView
  const rows = useMemo(() => {
    if (!crewView) return resources;
    // Crew view: group by crew (already individual from backend, just show crew-level ones)
    return resources.filter((r) => r.trackingLevel === TrackingLevel.crew);
  }, [resources, crewView]);

  const allocationCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const alloc of allocations) {
      map[alloc.resourceId] = (map[alloc.resourceId] ?? 0) + 1;
    }
    return map;
  }, [allocations]);

  const summaryMap = useMemo(() => {
    const map: Record<string, ResourceSummary> = {};
    for (const s of summaries) map[s.resourceId] = s;
    return map;
  }, [summaries]);

  async function handleSave(input: ResourceInput) {
    try {
      await upsertResource.mutateAsync(input);
      toast.success(`Resource "${input.name}" saved`);
      setShowAdd(false);
      setEditResource(null);
    } catch {
      toast.error("Failed to save resource");
    }
  }

  async function handleDelete(id: string, name: string) {
    try {
      await deleteResource.mutateAsync(id);
      toast.success(`Deleted "${name}"`);
      if (selectedResourceId === id) setSelectedResourceId(null);
    } catch {
      toast.error("Failed to delete resource");
    }
  }

  async function handleIdleModeToggle(resource: Resource) {
    const newMode =
      resource.idleTimeMode === IdleTimeMode.releaseAtPhaseEnd
        ? IdleTimeMode.holdThroughProject
        : IdleTimeMode.releaseAtPhaseEnd;
    try {
      await upsertResource.mutateAsync({
        name: resource.name,
        resourceType: resource.resourceType,
        trackingLevel: resource.trackingLevel,
        crewSize: resource.crewSize,
        csiCode: resource.csiCode,
        hourlyRate: resource.hourlyRate,
        hourlyRateSource: resource.hourlyRateSource,
        idleTimeMode: newMode,
      });
      toast.success("Idle mode updated");
    } catch {
      toast.error("Failed to update idle mode");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Resource */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setShowAdd(true)}
          data-ocid="resource.add_button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Main Table */}
      {rows.length === 0 ? (
        <div
          data-ocid="resource.empty_state"
          className="py-12 text-center rounded-lg border border-dashed border-border"
        >
          <HardHat className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            No {crewView ? "crew" : resourceType} resources yet.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => setShowAdd(true)}
            data-ocid="resource.empty_add_button"
          >
            <Plus className="h-4 w-4 mr-1" /> Add First Resource
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Resource Name
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  CSI Code
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Phase Assignments
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">
                  Allocated
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">
                  Available
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">
                  Idle
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">
                  Labor Cost
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Idle Mode
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, idx) => {
                const sum = summaryMap[r.id];
                const phaseCount = allocationCountMap[r.id] ?? 0;
                const isSelected = selectedResourceId === r.id;
                const displayName =
                  crewView && r.crewSize
                    ? `${r.name} (${Number(r.crewSize)} people)`
                    : r.name;
                return (
                  <TableRow
                    key={r.id}
                    data-ocid={`resource.item.${idx + 1}`}
                    className={`border-border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : "hover:bg-muted/20"
                    }`}
                    onClick={() =>
                      setSelectedResourceId(isSelected ? null : r.id)
                    }
                  >
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {resourceType === ResourceType.labor ? (
                          <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Wrench className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[140px]">
                          {displayName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {r.csiCode ?? "—"}
                    </TableCell>
                    <TableCell>
                      {phaseCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="text-xs border-primary/30 text-primary"
                        >
                          {phaseCount} phase{phaseCount !== 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {sum ? fmtHours(sum.totalAllocatedHours) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {sum ? fmtHours(sum.totalAvailableHours) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {sum ? (
                        <span
                          className={
                            sum.totalIdleHours > 0
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          }
                        >
                          {fmtHours(sum.totalIdleHours)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {sum ? fmtCost(sum.totalLaborCost) : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={
                          r.idleTimeMode === IdleTimeMode.holdThroughProject
                        }
                        onCheckedChange={() => handleIdleModeToggle(r)}
                        data-ocid={`resource.idle_toggle.${idx + 1}`}
                        aria-label="Toggle idle time mode"
                      />
                      <IdleModeBadge mode={r.idleTimeMode} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditResource(r)}
                          data-ocid={`resource.edit_button.${idx + 1}`}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                          onClick={() => handleDelete(r.id, r.name)}
                          data-ocid={`resource.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Selected resource allocations */}
      {selectedResourceId && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Phase Allocations —{" "}
              {rows.find((r) => r.id === selectedResourceId)?.name ??
                selectedResourceId}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <PhaseAllocationsPanel resourceId={selectedResourceId} />
          </CardContent>
        </Card>
      )}

      {/* Resource Summaries Grid */}
      {rows.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Resource Summaries
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {summaries
              .filter((s) => rows.some((r) => r.id === s.resourceId))
              .map((summary) => (
                <ResourceSummaryCard
                  key={summary.resourceId}
                  summary={summary}
                />
              ))}
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <ResourceFormDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
      />

      {/* Edit Dialog */}
      {editResource && (
        <ResourceFormDialog
          open
          onClose={() => setEditResource(null)}
          initial={{
            name: editResource.name,
            resourceType: editResource.resourceType,
            trackingLevel: editResource.trackingLevel,
            crewSize: editResource.crewSize,
            csiCode: editResource.csiCode,
            hourlyRate: editResource.hourlyRate,
            hourlyRateSource: editResource.hourlyRateSource,
            idleTimeMode: editResource.idleTimeMode,
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CostScheduleResourceControl() {
  const isLocked = useIsFeatureLocked("resources");
  const [activeTab, setActiveTab] = useState<"labor" | "equipment">("labor");
  const [crewView, setCrewView] = useState(false);

  const { data: allResources = [] } = useResources();
  const { data: summaries = [] } = useResourceSummaries();
  const { data: idleSetting } = useIdleTimeSetting();
  const setIdleTimeSetting = useSetIdleTimeSetting();

  const totalResources = allResources.length;
  const totalLaborCost = summaries.reduce(
    (acc, s) => acc + s.totalLaborCost,
    0,
  );
  const totalIdleHours = summaries.reduce(
    (acc, s) => acc + s.totalIdleHours,
    0,
  );

  const _resourceType =
    activeTab === "labor" ? ResourceType.labor : ResourceType.equipment;

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
        <div data-ocid="cost-schedule-resource.page" className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Cost Schedule &amp; Resource Control
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track labor and equipment allocation, idle time, and project
                cost performance.
              </p>
            </div>
            {/* Global Idle Mode Setting */}
            {idleSetting && (
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  Default Idle Mode:
                </span>
                <Switch
                  checked={
                    idleSetting.defaultIdleMode ===
                    IdleTimeMode.holdThroughProject
                  }
                  onCheckedChange={async (checked) => {
                    try {
                      await setIdleTimeSetting.mutateAsync(
                        checked
                          ? IdleTimeMode.holdThroughProject
                          : IdleTimeMode.releaseAtPhaseEnd,
                      );
                      toast.success("Default idle mode updated");
                    } catch {
                      toast.error("Failed to update default idle mode");
                    }
                  }}
                  data-ocid="resource.global_idle_toggle"
                  aria-label="Global idle time mode"
                />
                <span className="text-xs font-medium text-foreground">
                  {idleSetting.defaultIdleMode ===
                  IdleTimeMode.holdThroughProject
                    ? "Hold Through Project"
                    : "Release at Phase End"}
                </span>
              </div>
            )}
          </div>

          {/* KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={HardHat}
              label="Total Resources"
              value={String(totalResources)}
              sub={`${allResources.filter((r) => r.resourceType === ResourceType.labor).length} labor · ${allResources.filter((r) => r.resourceType === ResourceType.equipment).length} equipment`}
              accent="bg-primary/10"
            />
            <StatCard
              icon={DollarSign}
              label="Total Labor Cost"
              value={fmtCost(totalLaborCost)}
              accent="bg-emerald-500/10"
            />
            <StatCard
              icon={Clock}
              label="Total Idle Hours"
              value={fmtHours(totalIdleHours)}
              sub="across all resources"
              accent="bg-amber-500/10"
            />
          </div>

          {/* Labor / Equipment Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "labor" | "equipment")}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabsList className="bg-muted/30 border border-border">
                <TabsTrigger
                  value="labor"
                  data-ocid="resource.labor_tab"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Labor
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  data-ocid="resource.equipment_tab"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Wrench className="h-3.5 w-3.5 mr-1.5" /> Equipment
                </TabsTrigger>
              </TabsList>

              {/* Individual / Crew toggle */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm transition-colors ${!crewView ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  Individual
                </span>
                <Switch
                  checked={crewView}
                  onCheckedChange={setCrewView}
                  data-ocid="resource.crew_view_toggle"
                  aria-label="Toggle crew view"
                />
                <span
                  className={`text-sm transition-colors ${crewView ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  Crew View
                </span>
              </div>
            </div>

            <TabsContent value="labor" className="mt-4">
              <ResourceTable
                resourceType={ResourceType.labor}
                crewView={crewView}
              />
            </TabsContent>

            <TabsContent value="equipment" className="mt-4">
              <ResourceTable
                resourceType={ResourceType.equipment}
                crewView={crewView}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
