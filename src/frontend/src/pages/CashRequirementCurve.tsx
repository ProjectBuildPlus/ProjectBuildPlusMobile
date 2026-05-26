import type { Phase, PhaseInput } from "@/backend";
import { CostCodeModal } from "@/components/CostCodeModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  useCostCodeCompletion,
  useCumulativeCashRequirement,
  useCumulativeCrashedRequirement,
  useCumulativeWithBreakdown,
  useDeleteCostCode,
  useDeletePhase,
  usePhases,
  useUpdateCostCodeCompletion,
  useUpsertCostCode,
  useUpsertPhase,
} from "@/hooks/useQueries";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  DollarSign,
  Layers,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";

const CostCodeCompletionInput = ({
  phaseId,
  cc,
}: {
  phaseId: bigint;
  cc: { id: bigint };
}) => {
  const mutation = useUpdateCostCodeCompletion();
  const { data: saved } = useCostCodeCompletion(phaseId, cc.id);
  const [val, setVal] = useState<number>(saved ?? 0);
  useEffect(() => {
    if (saved != null) setVal(saved);
  }, [saved]);
  return (
    <input
      type="number"
      min={0}
      max={100}
      value={val}
      onChange={(e) => setVal(Number(e.target.value))}
      onBlur={() => mutation.mutate({ phaseId, codeId: cc.id, pct: val })}
      className="w-16 border rounded px-1 py-0.5 text-xs text-right"
      data-ocid="cost-code.completion_input"
    />
  );
};
import { getCategoryById, getSubtopicById } from "@/data/projectCategories";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useIsFeatureLocked } from "../context/FeatureLockContext";

type SortKey =
  | "name"
  | "phaseOrder"
  | "requiredCash"
  | "cumulativeTotal"
  | "crashFactor"
  | "resourceMultiplier"
  | "crashedCash";
type SortDir = "asc" | "desc";

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function SCurveTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as {
    phaseName?: string;
    endOffset?: bigint;
    cumulativeCash?: number;
    cumulativeSOV?: number;
    cumulativeCrashed?: number;
  };
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{data.phaseName || label}</div>
      {data.endOffset !== undefined && (
        <div className="text-muted-foreground">
          Offset: {Number(data.endOffset)} days
        </div>
      )}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">
            {formatUSD(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: Record<string, unknown>;
  }>;
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as { name?: string };
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{data.name}</div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-muted-foreground">Required Cash:</span>
        <span className="font-mono font-medium">
          {formatUSD(payload[0].value)}
        </span>
      </div>
    </div>
  );
}

function PhaseForm({
  phase,
  onSave,
  onCancel,
}: {
  phase?: Phase;
  onSave: (input: PhaseInput) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(phase?.name ?? "");
  const [phaseOrder, setPhaseOrder] = useState(
    phase?.phaseOrder ? String(phase.phaseOrder) : "",
  );
  const [startOffset, setStartOffset] = useState(
    phase?.startOffset ? String(phase.startOffset) : "0",
  );
  const [endOffset, setEndOffset] = useState(
    phase?.endOffset ? String(phase.endOffset) : "",
  );
  const [requiredCash, setRequiredCash] = useState(
    phase?.requiredCash ? String(phase.requiredCash) : "",
  );
  const [sov, setSov] = useState(
    phase?.scheduleOfValues ? String(phase.scheduleOfValues) : "",
  );
  const [crashFactor, setCrashFactor] = useState(
    phase?.crashFactor != null ? String(phase.crashFactor) : "1.0",
  );
  const [resourceMultiplier, setResourceMultiplier] = useState(
    phase?.resourceMultiplier != null
      ? String(phase.resourceMultiplier)
      : "1.0",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phaseOrder || !endOffset || !requiredCash) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave({
      name: name.trim(),
      phaseOrder: BigInt(phaseOrder),
      startOffset: BigInt(startOffset || 0),
      endOffset: BigInt(endOffset),
      requiredCash: Number(requiredCash),
      scheduleOfValues: Number(sov || 0),
      crashFactor: crashFactor.trim() === "" ? undefined : Number(crashFactor),
      resourceMultiplier:
        resourceMultiplier.trim() === ""
          ? undefined
          : Number(resourceMultiplier),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border bg-card p-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="phase-name">Phase Name</Label>
          <Input
            id="phase-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Foundation"
            required
            data-ocid="phase.input.name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phase-order">Order</Label>
          <Input
            id="phase-order"
            type="number"
            min={0}
            value={phaseOrder}
            onChange={(e) => setPhaseOrder(e.target.value)}
            placeholder="0"
            required
            data-ocid="phase.input.order"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="start-offset">Start Offset (days)</Label>
          <Input
            id="start-offset"
            type="number"
            min={0}
            value={startOffset}
            onChange={(e) => setStartOffset(e.target.value)}
            placeholder="0"
            data-ocid="phase.input.start_offset"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-offset">End Offset (days)</Label>
          <Input
            id="end-offset"
            type="number"
            min={0}
            value={endOffset}
            onChange={(e) => setEndOffset(e.target.value)}
            placeholder="30"
            required
            data-ocid="phase.input.end_offset"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="required-cash">Required Cash (USD)</Label>
          <Input
            id="required-cash"
            type="number"
            min={0}
            step="0.01"
            value={requiredCash}
            onChange={(e) => setRequiredCash(e.target.value)}
            placeholder="50000.00"
            required
            data-ocid="phase.input.required_cash"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sov">Schedule of Values (USD)</Label>
          <Input
            id="sov"
            type="number"
            min={0}
            step="0.01"
            value={sov}
            onChange={(e) => setSov(e.target.value)}
            placeholder="55000.00"
            data-ocid="phase.input.sov"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="crash-factor">Crash Factor</Label>
          <Input
            id="crash-factor"
            type="number"
            min={0.1}
            max={2.0}
            step={0.1}
            value={crashFactor}
            onChange={(e) => setCrashFactor(e.target.value)}
            placeholder="1.0"
            data-ocid="phase.input.crash_factor"
          />
          <p className="text-xs text-muted-foreground">
            Compresses timeline by adding resources (1.0 = no crash)
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resource-multiplier">Resource Multiplier</Label>
          <Input
            id="resource-multiplier"
            type="number"
            min={0.5}
            max={3.0}
            step={0.1}
            value={resourceMultiplier}
            onChange={(e) => setResourceMultiplier(e.target.value)}
            placeholder="1.0"
            data-ocid="phase.input.resource_multiplier"
          />
          <p className="text-xs text-muted-foreground">
            Scales resource allocation for leveling (1.0 = baseline)
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" data-ocid="phase.save_button">
          {phase ? "Update Phase" : "Add Phase"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          data-ocid="phase.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function CashRequirementCurve() {
  const isLocked = useIsFeatureLocked("cost");
  const { data: phases, isLoading: phasesLoading } = usePhases();
  const { data: cumulative, isLoading: cumLoading } =
    useCumulativeCashRequirement();
  const { data: crashedCumulative, isLoading: crashedLoading } =
    useCumulativeCrashedRequirement();
  const upsertPhase = useUpsertPhase();
  const deletePhase = useDeletePhase();
  const { data: cumulativeWithCodes = [] } = useCumulativeWithBreakdown();
  const upsertCostCodeMutation = useUpsertCostCode();
  const deleteCostCodeMutation = useDeleteCostCode();
  const [costCodeModalPhaseId, setCostCodeModalPhaseId] = useState<
    number | null
  >(null);

  const [showSOV, setShowSOV] = useState(false);
  const [showCrashed, setShowCrashed] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("phaseOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sortedPhases = useMemo(() => {
    if (!phases) return [];
    const list = [...phases];
    list.sort((a, b) => Number(a.phaseOrder) - Number(b.phaseOrder));
    return list;
  }, [phases]);

  const tableData = useMemo(() => {
    let cumulativeTotal = 0;
    const crashedMap = new Map<number, number>();
    if (crashedCumulative) {
      for (const p of crashedCumulative) {
        crashedMap.set(Number(p.phaseOrder), p.crashedCash);
      }
    }
    return sortedPhases.map((p) => {
      cumulativeTotal += p.requiredCash;
      return {
        id: p.id,
        name: p.name,
        requiredCash: p.requiredCash,
        cumulativeTotal,
        phaseOrder: Number(p.phaseOrder),
        crashFactor: p.crashFactor ?? 1.0,
        resourceMultiplier: p.resourceMultiplier ?? 1.0,
        crashedCash: crashedMap.get(Number(p.phaseOrder)) ?? cumulativeTotal,
      };
    });
  }, [sortedPhases, crashedCumulative]);

  const sortedTableData = useMemo(() => {
    const data = [...tableData];
    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "requiredCash")
        cmp = a.requiredCash - b.requiredCash;
      else if (sortKey === "cumulativeTotal")
        cmp = a.cumulativeTotal - b.cumulativeTotal;
      else if (sortKey === "crashFactor") cmp = a.crashFactor - b.crashFactor;
      else if (sortKey === "resourceMultiplier")
        cmp = a.resourceMultiplier - b.resourceMultiplier;
      else if (sortKey === "crashedCash") cmp = a.crashedCash - b.crashedCash;
      else cmp = a.phaseOrder - b.phaseOrder;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [tableData, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleSave = (input: PhaseInput) => {
    const id = editingPhase ? editingPhase.id : BigInt(0);
    upsertPhase.mutate(
      { phaseId: id, input },
      {
        onSuccess: () => {
          toast.success(editingPhase ? "Phase updated" : "Phase added");
          setEditingPhase(null);
          setShowForm(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleDelete = (phase: Phase) => {
    if (!confirm(`Delete phase "${phase.name}"?`)) return;
    deletePhase.mutate(phase.id, {
      onSuccess: () => toast.success("Phase deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  const sCurveData = useMemo(() => {
    if (!cumulative) return [];
    const crashedMap = new Map<number, number>();
    if (crashedCumulative) {
      for (const p of crashedCumulative) {
        crashedMap.set(Number(p.phaseOrder), p.crashedCash);
      }
    }
    return cumulative.map((p) => ({
      phaseName: p.phaseName,
      endOffset: Number(p.endOffset),
      cumulativeCash: p.cumulativeCash,
      cumulativeSOV: p.cumulativeSOV,
      cumulativeCrashed:
        crashedMap.get(Number(p.phaseOrder)) ?? p.cumulativeCash,
    }));
  }, [cumulative, crashedCumulative]);

  const barData = useMemo(() => {
    return sortedPhases.map((p) => ({
      name: p.name,
      requiredCash: p.requiredCash,
    }));
  }, [sortedPhases]);

  const divisions = useMemo(() => {
    return Array.from(
      new Set(
        cumulativeWithCodes.flatMap((p) =>
          p.breakdown.map((b) => b.csiDivision),
        ),
      ),
    ).slice(0, 10);
  }, [cumulativeWithCodes]);

  const breakdownData = useMemo(() => {
    return cumulativeWithCodes.map((p) => {
      const obj: Record<string, number | string> = {
        name: p.phaseName,
        offset: Number(p.endOffset),
      };
      for (const b of p.breakdown) {
        obj[b.csiDivision] =
          ((obj[b.csiDivision] as number) || 0) + b.cumulativeCost;
      }
      return obj;
    });
  }, [cumulativeWithCodes]);

  const breakdownColors = [
    "#06b6d4",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#f97316",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#14b8a6",
    "#84cc16",
  ];

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return (
        <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground" />
      );
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />
    );
  };

  const isLoading = phasesLoading || cumLoading || crashedLoading;

  const { activeCategoryId, activeSubtopicId } = useCategoryStore();

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
        <div className="space-y-8">
          <p className="text-xs text-muted-foreground mb-2">
            {activeCategoryId
              ? `Filtered by: ${getCategoryById(activeCategoryId)?.name ?? activeCategoryId}${
                  activeSubtopicId
                    ? ` > ${getSubtopicById(activeCategoryId, activeSubtopicId)?.name ?? activeSubtopicId}`
                    : ""
                }`
              : "Showing all phases"}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Cash Requirement Curve
              </h1>
              <p className="text-sm text-muted-foreground">
                Cumulative cash projection and phase-by-phase breakdown
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  SOV Overlay
                </span>
                <Switch
                  checked={showSOV}
                  onCheckedChange={setShowSOV}
                  data-ocid="sov.toggle"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Crashed Curve
                </span>
                <Switch
                  checked={showCrashed}
                  onCheckedChange={setShowCrashed}
                  data-ocid="crashed.toggle"
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingPhase(null);
                  setShowForm(true);
                }}
                data-ocid="phase.open_modal_button"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Phase
              </Button>
              <Button
                size="sm"
                variant={showBreakdown ? "default" : "outline"}
                onClick={() => setShowBreakdown((v) => !v)}
                data-ocid="breakdown.toggle"
              >
                {showBreakdown
                  ? "Cost Code Breakdown: ON"
                  : "Cost Code Breakdown: OFF"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[320px] w-full rounded-xl" />
              <Skeleton className="h-[240px] w-full rounded-xl" />
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  {/* S-Curve */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        {showBreakdown
                          ? "Cost Code Breakdown"
                          : "Cumulative Cash Requirement"}
                      </CardTitle>
                      <CardDescription>
                        {showBreakdown
                          ? "Cumulative cost by CSI division"
                          : "S-curve showing cumulative cash needed over project timeline"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full">
                        <ResponsiveContainer width="100%" height={350}>
                          {showBreakdown ? (
                            <LineChart
                              data={breakdownData}
                              margin={{
                                top: 8,
                                right: 16,
                                bottom: 8,
                                left: 16,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                              />
                              <XAxis
                                dataKey="offset"
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                                label={{
                                  value: "Project Timeline (days)",
                                  position: "insideBottom",
                                  offset: -2,
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                              />
                              <YAxis
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                                tickFormatter={(v: number) =>
                                  `${(v / 1000).toFixed(0)}k`
                                }
                                label={{
                                  value: "Cumulative Cash (USD)",
                                  angle: -90,
                                  position: "insideLeft",
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                              />
                              <Tooltip content={<SCurveTooltip />} />
                              <Legend />
                              {divisions.map((div, i) => (
                                <Line
                                  key={div}
                                  type="monotone"
                                  dataKey={div}
                                  name={div}
                                  stroke={
                                    breakdownColors[i % breakdownColors.length]
                                  }
                                  strokeWidth={2}
                                  dot={{
                                    r: 3,
                                    fill: breakdownColors[
                                      i % breakdownColors.length
                                    ],
                                    strokeWidth: 0,
                                  }}
                                  activeDot={{ r: 5 }}
                                />
                              ))}
                            </LineChart>
                          ) : (
                            <LineChart
                              data={sCurveData}
                              margin={{
                                top: 8,
                                right: 16,
                                bottom: 8,
                                left: 16,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                              />
                              <XAxis
                                dataKey="endOffset"
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                                label={{
                                  value: "Project Timeline (days)",
                                  position: "insideBottom",
                                  offset: -2,
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                              />
                              <YAxis
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                                tickFormatter={(v: number) =>
                                  `${(v / 1000).toFixed(0)}k`
                                }
                                label={{
                                  value: "Cumulative Cash (USD)",
                                  angle: -90,
                                  position: "insideLeft",
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                              />
                              <Tooltip content={<SCurveTooltip />} />
                              <Line
                                type="monotone"
                                dataKey="cumulativeCash"
                                name="Cumulative Cash"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={2.5}
                                dot={{
                                  r: 4,
                                  fill: "hsl(var(--chart-1))",
                                  strokeWidth: 0,
                                }}
                                activeDot={{ r: 6 }}
                              />
                              {showSOV && (
                                <Line
                                  type="monotone"
                                  dataKey="cumulativeSOV"
                                  name="Cumulative SOV"
                                  stroke="hsl(var(--chart-2))"
                                  strokeWidth={2}
                                  strokeDasharray="6 4"
                                  dot={{
                                    r: 3,
                                    fill: "hsl(var(--chart-2))",
                                    strokeWidth: 0,
                                  }}
                                  activeDot={{ r: 5 }}
                                />
                              )}
                              {showCrashed && (
                                <Line
                                  type="monotone"
                                  dataKey="cumulativeCrashed"
                                  name="Crashed Cash"
                                  stroke="hsl(var(--chart-4))"
                                  strokeWidth={2}
                                  strokeDasharray="4 2"
                                  dot={{
                                    r: 3,
                                    fill: "hsl(var(--chart-4))",
                                    strokeWidth: 0,
                                  }}
                                  activeDot={{ r: 5 }}
                                />
                              )}
                              {sCurveData.map((point) => (
                                <ReferenceLine
                                  key={point.endOffset}
                                  x={point.endOffset}
                                  stroke="hsl(var(--border))"
                                  strokeDasharray="3 3"
                                  strokeOpacity={0.5}
                                />
                              ))}
                              {sCurveData.map((point) => (
                                <ReferenceDot
                                  key={`dot-${point.endOffset}`}
                                  x={point.endOffset}
                                  y={point.cumulativeCash}
                                  r={4}
                                  fill="hsl(var(--chart-1))"
                                  stroke="none"
                                />
                              ))}
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1 min-w-0">
                  {/* Bar Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <DollarSign className="h-4 w-4 text-primary" />
                        {showBreakdown
                          ? "Breakdown by Division"
                          : "Phase-by-Phase Cash Requirement"}
                      </CardTitle>
                      <CardDescription>
                        {showBreakdown
                          ? "Stacked cost by CSI division per phase"
                          : "Required cash amount for each project phase"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full">
                        <ResponsiveContainer width="100%" height={350}>
                          {showBreakdown ? (
                            <BarChart
                              data={breakdownData}
                              margin={{
                                top: 8,
                                right: 16,
                                bottom: 32,
                                left: 16,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                              />
                              <XAxis
                                dataKey="name"
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 11,
                                }}
                                angle={-30}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                                tickFormatter={(v: number) =>
                                  `${(v / 1000).toFixed(0)}k`
                                }
                              />
                              <Tooltip content={<BarTooltip />} />
                              <Legend />
                              {divisions.map((div, i) => (
                                <Bar
                                  key={div}
                                  dataKey={div}
                                  name={div}
                                  stackId="a"
                                  fill={
                                    breakdownColors[i % breakdownColors.length]
                                  }
                                  radius={[4, 4, 0, 0]}
                                />
                              ))}
                            </BarChart>
                          ) : (
                            <BarChart
                              data={barData}
                              margin={{
                                top: 8,
                                right: 16,
                                bottom: 32,
                                left: 16,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                              />
                              <XAxis
                                dataKey="name"
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 11,
                                }}
                                angle={-30}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                tick={{
                                  fill: "hsl(var(--muted-foreground))",
                                  fontSize: 12,
                                }}
                                tickFormatter={(v: number) =>
                                  `${(v / 1000).toFixed(0)}k`
                                }
                              />
                              <Tooltip content={<BarTooltip />} />
                              <Bar
                                dataKey="requiredCash"
                                name="Required Cash"
                                fill="hsl(var(--chart-1))"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Phase Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    Phase Detail
                  </CardTitle>
                  <CardDescription>
                    Breakdown of required cash and cumulative totals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("name")}
                            data-ocid="table.sort.name"
                          >
                            Phase Name <SortIcon col="name" />
                          </TableHead>
                          <TableHead
                            className="cursor-pointer text-right"
                            onClick={() => handleSort("requiredCash")}
                            data-ocid="table.sort.required_cash"
                          >
                            Required Cash <SortIcon col="requiredCash" />
                          </TableHead>
                          <TableHead
                            className="cursor-pointer text-right"
                            onClick={() => handleSort("cumulativeTotal")}
                            data-ocid="table.sort.cumulative_total"
                          >
                            Cumulative Total <SortIcon col="cumulativeTotal" />
                          </TableHead>
                          <TableHead
                            className="cursor-pointer text-right"
                            onClick={() => handleSort("crashFactor")}
                            data-ocid="table.sort.crash_factor"
                          >
                            Crash Factor <SortIcon col="crashFactor" />
                          </TableHead>
                          <TableHead
                            className="cursor-pointer text-right"
                            onClick={() => handleSort("resourceMultiplier")}
                            data-ocid="table.sort.resource_multiplier"
                          >
                            Resource Mult. <SortIcon col="resourceMultiplier" />
                          </TableHead>
                          <TableHead
                            className="cursor-pointer text-right"
                            onClick={() => handleSort("crashedCash")}
                            data-ocid="table.sort.crashed_cash"
                          >
                            Crashed Cash <SortIcon col="crashedCash" />
                          </TableHead>
                          <TableHead className="w-[100px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedTableData.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="py-8 text-center text-muted-foreground"
                              data-ocid="table.empty_state"
                            >
                              No phases yet. Add a phase to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedTableData.map((row, idx) => {
                            const phase = phases?.find(
                              (ph) => ph.id === row.id,
                            );
                            return (
                              <Fragment key={row.id}>
                                <TableRow
                                  data-ocid={`table.row.item.${idx + 1}`}
                                >
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      {row.name}
                                      {showBreakdown && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2 text-xs"
                                          onClick={() =>
                                            setCostCodeModalPhaseId(
                                              Number(row.id),
                                            )
                                          }
                                          data-ocid={`table.add_costcode_button.${idx + 1}`}
                                        >
                                          <Plus className="mr-1 h-3 w-3" />
                                          Add Cost Code
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatUSD(row.requiredCash)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatUSD(row.cumulativeTotal)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {row.crashFactor.toFixed(1)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {row.resourceMultiplier.toFixed(1)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatUSD(row.crashedCash)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          const p = phases?.find(
                                            (ph) => ph.id === row.id,
                                          );
                                          if (p) {
                                            setEditingPhase(p);
                                            setShowForm(true);
                                          }
                                        }}
                                        aria-label="Edit phase"
                                        data-ocid={`table.edit_button.${idx + 1}`}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => {
                                          const p = phases?.find(
                                            (ph) => ph.id === row.id,
                                          );
                                          if (p) handleDelete(p);
                                        }}
                                        aria-label="Delete phase"
                                        data-ocid={`table.delete_button.${idx + 1}`}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                {showBreakdown &&
                                  phase &&
                                  phase.costCodes &&
                                  phase.costCodes.length > 0 && (
                                    <TableRow className="bg-muted/30">
                                      <TableCell colSpan={7}>
                                        <div className="space-y-2 py-1">
                                          {phase.costCodes.map((cc) => (
                                            <div
                                              key={cc.id.toString()}
                                              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
                                            >
                                              <span className="text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  CSI:
                                                </span>{" "}
                                                {cc.csiCode}
                                              </span>
                                              <span className="text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  Div:
                                                </span>{" "}
                                                {cc.csiDivision}
                                              </span>
                                              <span className="text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  Proj#:
                                                </span>{" "}
                                                {cc.projectNumber}
                                              </span>
                                              <span className="text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  Area:
                                                </span>{" "}
                                                {cc.area}
                                              </span>
                                              <span className="text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  Op:
                                                </span>{" "}
                                                {cc.operation}
                                              </span>
                                              <span className="text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  Dist:
                                                </span>{" "}
                                                {cc.distribution}
                                              </span>
                                              <span className="ml-auto flex items-center gap-2 font-mono text-foreground">
                                                <CostCodeCompletionInput
                                                  phaseId={phase.id}
                                                  cc={cc}
                                                />
                                                {formatUSD(cc.cost)}
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                                  onClick={() =>
                                                    deleteCostCodeMutation.mutate(
                                                      {
                                                        phaseId: Number(
                                                          phase.id,
                                                        ),
                                                        codeId: Number(cc.id),
                                                      },
                                                    )
                                                  }
                                                  aria-label="Delete cost code"
                                                  data-ocid={`table.delete_costcode_button.${idx + 1}`}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                              </Fragment>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Phase Editor */}
              {showForm && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">
                      {editingPhase ? "Edit Phase" : "Add New Phase"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhaseForm
                      phase={editingPhase ?? undefined}
                      onSave={handleSave}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingPhase(null);
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Phase List (quick view) */}
              {!showForm && phases && phases.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">
                      All Phases
                    </CardTitle>
                    <CardDescription>
                      Quick overview of all project phases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {sortedPhases.map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-lg border bg-card p-3 transition-smooth hover:bg-muted/30"
                          data-ocid={`phase.card.item.${idx + 1}`}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {p.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Number(p.startOffset)}–{Number(p.endOffset)} days
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm font-medium">
                              {formatUSD(p.requiredCash)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              SOV {formatUSD(p.scheduleOfValues)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              CF {(p.crashFactor ?? 1.0).toFixed(1)} × RM{" "}
                              {(p.resourceMultiplier ?? 1.0).toFixed(1)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cost Code Modal */}
              {costCodeModalPhaseId !== null && (
                <CostCodeModal
                  isOpen={true}
                  onClose={() => setCostCodeModalPhaseId(null)}
                  phaseId={costCodeModalPhaseId}
                  onSave={(input) => {
                    upsertCostCodeMutation.mutate({
                      phaseId: costCodeModalPhaseId,
                      input,
                    });
                    setCostCodeModalPhaseId(null);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
