import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { usePhases } from "@/hooks/useQueries";
import {
  useCompareScenarios,
  useCreateScenario,
  useDeleteScenario,
  useScenario,
  useScenarioBenchmarkVariances,
  useScenarioCashProjection,
  useScenarioEVMSummary,
  useScenariosList,
  useUpdateScenario,
} from "@/hooks/useScenarios";
import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  BarChart3,
  CheckSquare,
  Edit3,
  LineChart as LineChartIcon,
  Plus,
  Square,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COMPARE_COLORS = ["#06b6d4", "#f59e0b", "#22c55e", "#a855f7", "#ef4444"];

interface ScenarioFormData {
  name: string;
  description: string;
  phaseOverrides: Record<
    string,
    { crashFactor: number; resourceMultiplier: number }
  >;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16 text-center">
      <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ScenarioForm({
  initial,
  phases,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: ScenarioFormData;
  phases: import("@/backend").Phase[];
  onSave: (data: ScenarioFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ScenarioFormData>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    phaseOverrides: initial?.phaseOverrides ?? {},
  });

  const updatePhase = (
    phaseId: string,
    field: "crashFactor" | "resourceMultiplier",
    value: number,
  ) => {
    setForm((prev) => ({
      ...prev,
      phaseOverrides: {
        ...prev.phaseOverrides,
        [phaseId]: {
          crashFactor: prev.phaseOverrides[phaseId]?.crashFactor ?? 1.0,
          resourceMultiplier:
            prev.phaseOverrides[phaseId]?.resourceMultiplier ?? 1.0,
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="scenario-name">Scenario Name</Label>
        <Input
          id="scenario-name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="e.g. Aggressive Crash Schedule"
          data-ocid="scenario.input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scenario-desc">Description</Label>
        <Textarea
          id="scenario-desc"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="What does this scenario explore?"
          rows={3}
          data-ocid="scenario.textarea"
        />
      </div>
      <div className="space-y-2">
        <Label>Phase Overrides</Label>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
          {phases.map((phase) => {
            const po = form.phaseOverrides[String(phase.id)] ?? {
              crashFactor: 1.0,
              resourceMultiplier: 1.0,
            };
            return (
              <div
                key={String(phase.id)}
                className="grid grid-cols-3 items-center gap-3 text-sm"
              >
                <span className="truncate font-medium">{phase.name}</span>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Crash</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0.1}
                    max={5}
                    value={po.crashFactor}
                    onChange={(e) =>
                      updatePhase(
                        String(phase.id),
                        "crashFactor",
                        Number.parseFloat(e.target.value) || 1,
                      )
                    }
                    className="h-8 w-20"
                    data-ocid="scenario.crash_input"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Resource
                  </Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0.1}
                    max={5}
                    value={po.resourceMultiplier}
                    onChange={(e) =>
                      updatePhase(
                        String(phase.id),
                        "resourceMultiplier",
                        Number.parseFloat(e.target.value) || 1,
                      )
                    }
                    className="h-8 w-20"
                    data-ocid="scenario.resource_input"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || isPending}
          data-ocid="scenario.save_button"
        >
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="scenario.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function SingleScenarioView({ scenarioId }: { scenarioId: string }) {
  const { data: cash } = useScenarioCashProjection(scenarioId);
  const { data: evm } = useScenarioEVMSummary(scenarioId);
  const { data: benchmarks } = useScenarioBenchmarkVariances(scenarioId);

  const cashChartData = useMemo(() => {
    if (!cash?.cumulativePoints) return [];
    return cash.cumulativePoints.map(([step, amount]) => ({
      step: Number(step),
      amount,
    }));
  }, [cash]);

  const benchmarkChartData = useMemo(() => {
    if (!benchmarks) return [];
    return benchmarks.map((b) => ({
      name: b.divisionName,
      variance: b.variance,
    }));
  }, [benchmarks]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold">
        Scenario Projections
      </h2>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <LineChartIcon className="h-4 w-4 text-primary" />
            Cash Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cashChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cashChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="step" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="Cumulative Cash"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No cash projection data available for this scenario." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">EVM Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {evm ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Planned Value", value: evm.plannedValue },
                { label: "Earned Value", value: evm.earnedValue },
                { label: "Actual Cost", value: evm.actualCost },
                { label: "Cost Variance", value: evm.cv },
                { label: "Schedule Variance", value: evm.sv },
                { label: "CPI", value: evm.cpi },
                { label: "SPI", value: evm.spi },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-md border bg-muted/30 p-3"
                >
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="mt-1 font-mono text-sm font-semibold">
                    {typeof m.value === "number" && m.value > 1000
                      ? formatCurrency(m.value)
                      : (m.value?.toFixed(2) ?? "—")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No EVM data available for this scenario." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Benchmark Variances</CardTitle>
        </CardHeader>
        <CardContent>
          {benchmarkChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={benchmarkChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="variance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No benchmark variance data available." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScenarioEVMCell({
  scenarioId,
  label,
}: {
  scenarioId: string;
  label: string;
}) {
  const { data } = useScenarioEVMSummary(scenarioId);
  if (!data) return <td className="px-3 py-2 font-mono">—</td>;
  const map: Record<string, number | undefined> = {
    "Planned Value": data.plannedValue,
    "Earned Value": data.earnedValue,
    "Actual Cost": data.actualCost,
    "Cost Variance": data.cv,
    "Schedule Variance": data.sv,
    CPI: data.cpi,
    SPI: data.spi,
  };
  const v = map[label];
  if (v === undefined) return <td className="px-3 py-2 font-mono">—</td>;
  return (
    <td className="px-3 py-2 font-mono">
      {v > 1000 ? formatCurrency(v) : v.toFixed(2)}
    </td>
  );
}

function BenchmarkComparisonChart({ ids }: { ids: string[] }) {
  const q0 = useScenarioBenchmarkVariances(ids[0] ?? "");
  const q1 = useScenarioBenchmarkVariances(ids[1] ?? "");
  const q2 = useScenarioBenchmarkVariances(ids[2] ?? "");
  const q3 = useScenarioBenchmarkVariances(ids[3] ?? "");
  const q4 = useScenarioBenchmarkVariances(ids[4] ?? "");

  const benchmarkQueries = [
    { id: ids[0] ?? "", ...q0 },
    { id: ids[1] ?? "", ...q1 },
    { id: ids[2] ?? "", ...q2 },
    { id: ids[3] ?? "", ...q3 },
    { id: ids[4] ?? "", ...q4 },
  ].filter((_, i) => i < ids.length);

  const benchmarkChartData = useMemo(() => {
    const allDivisions = new Set<string>();
    for (const q of benchmarkQueries) {
      if (q.data) {
        for (const b of q.data) allDivisions.add(b.divisionName);
      }
    }
    const divisions = Array.from(allDivisions);
    return divisions.map((name) => {
      const row: Record<string, number | string> = { name };
      for (const q of benchmarkQueries) {
        const found = q.data?.find((b) => b.divisionName === name);
        row[q.id] = found?.variance ?? 0;
      }
      return row;
    });
  }, [benchmarkQueries]);

  if (benchmarkChartData.length === 0) {
    return <EmptyState message="No benchmark comparison data available." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={benchmarkChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Legend />
        {ids.slice(0, 5).map((id, i) => (
          <Bar
            key={id}
            dataKey={id}
            fill={COMPARE_COLORS[i % COMPARE_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function ComparisonView({ ids }: { ids: string[] }) {
  const { data: compareCash } = useCompareScenarios(ids);

  const cashChartData = useMemo(() => {
    if (!compareCash || compareCash.length === 0) return [];
    const maxLen = Math.max(
      ...compareCash.map((c) => c.cumulativePoints.length),
    );
    const out: Array<Record<string, number | string>> = [];
    for (let i = 0; i < maxLen; i++) {
      const row: Record<string, number | string> = { step: i };
      for (const sc of compareCash) {
        const pt = sc.cumulativePoints[i];
        row[sc.scenarioName] = pt ? pt[1] : 0;
      }
      out.push(row);
    }
    return out;
  }, [compareCash]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold">
        Scenario Comparison
      </h2>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <LineChartIcon className="h-4 w-4 text-primary" />
            Cash Projection Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cashChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="step" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                {compareCash?.map((sc, i) => (
                  <Line
                    key={sc.scenarioId}
                    type="monotone"
                    dataKey={sc.scenarioName}
                    stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No comparison data available." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">EVM Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Metric
                  </th>
                  {ids.map((id, i) => (
                    <th
                      key={id}
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                      style={{
                        color: COMPARE_COLORS[i % COMPARE_COLORS.length],
                      }}
                    >
                      Scenario {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Planned Value",
                  "Earned Value",
                  "Actual Cost",
                  "Cost Variance",
                  "Schedule Variance",
                  "CPI",
                  "SPI",
                ].map((label) => (
                  <tr key={label} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{label}</td>
                    {ids.map((id) => (
                      <ScenarioEVMCell key={id} scenarioId={id} label={label} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Benchmark Variance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BenchmarkComparisonChart ids={ids} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ScenariosPage() {
  const { data: scenarios } = useScenariosList();
  const { data: phases } = usePhases();
  const createMutation = useCreateScenario();
  const updateMutation = useUpdateScenario();
  const deleteMutation = useDeleteScenario();
  const { isOffline } = useOfflineSync();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selectedScenario = scenarios?.find((s) => s.id === selectedId);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = (form: ScenarioFormData) => {
    const phaseOverrides = Object.entries(form.phaseOverrides).map(
      ([phaseId, vals]) => ({
        phaseId,
        crashFactor: vals.crashFactor,
        resourceMultiplier: vals.resourceMultiplier,
      }),
    );

    const req = {
      name: form.name,
      description: form.description,
      phaseOverrides,
      participantOverrides: [],
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, req },
        {
          onSuccess: () => {
            setEditingId(null);
            setShowCreate(false);
          },
        },
      );
    } else {
      createMutation.mutate(req, {
        onSuccess: () => {
          setShowCreate(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this scenario?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (selectedId === id) setSelectedId(null);
          setCompareIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      });
    }
  };

  const isCompareMode = compareIds.size >= 2;

  const { activeCategoryId, activeSubtopicId } = useCategoryStore();

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left: Scenario List */}
      <div className="w-full space-y-4 lg:w-1/3">
        <p className="text-xs text-muted-foreground mb-2">
          {activeCategoryId
            ? `Filtered by: ${activeCategoryId}${activeSubtopicId ? ` > ${activeSubtopicId}` : ""}`
            : "Showing all phases"}
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">Scenarios</h1>
          <Button
            size="sm"
            onClick={() => {
              setShowCreate(true);
              setEditingId(null);
            }}
            disabled={isOffline}
            data-ocid="scenario.new_button"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Scenario
          </Button>
        </div>

        {showCreate && (
          <ScenarioForm
            phases={phases ?? []}
            onSave={handleSave}
            onCancel={() => {
              setShowCreate(false);
              setEditingId(null);
            }}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {editingId && selectedScenario && (
          <ScenarioForm
            initial={{
              name: selectedScenario.name,
              description: selectedScenario.description,
              phaseOverrides: {},
            }}
            phases={phases ?? []}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            isPending={updateMutation.isPending}
          />
        )}

        <div className="space-y-2">
          {scenarios?.map((s) => {
            const isSelected = selectedId === s.id;
            const isCompared = compareIds.has(s.id);
            return (
              <Card
                key={s.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected && !isCompareMode
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/40",
                )}
                onClick={() => {
                  if (!isCompareMode) {
                    setSelectedId(s.id);
                    setEditingId(null);
                  }
                }}
                data-ocid={`scenario.item.${s.id}`}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.description || "No description"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                      {new Date(
                        Number(s.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(s.id);
                      }}
                      aria-label="Toggle comparison"
                      data-ocid="scenario.compare_toggle"
                    >
                      {isCompared ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(s.id);
                        setEditingId(s.id);
                        setShowCreate(false);
                      }}
                      aria-label="Edit scenario"
                      data-ocid="scenario.edit_button"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(s.id);
                      }}
                      aria-label="Delete scenario"
                      data-ocid="scenario.delete_button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {isCompareMode && (
          <Button
            className="w-full"
            onClick={() => setSelectedId("__compare__")}
            data-ocid="scenario.compare_button"
          >
            Compare Selected ({compareIds.size})
          </Button>
        )}
      </div>

      {/* Right: Content */}
      <div className="w-full lg:w-2/3">
        {selectedId === "__compare__" && isCompareMode ? (
          <ComparisonView ids={Array.from(compareIds)} />
        ) : selectedId ? (
          <SingleScenarioView scenarioId={selectedId} />
        ) : (
          <EmptyState message="Select a scenario from the list or create a new one to see its projections." />
        )}
      </div>
    </div>
  );
}
