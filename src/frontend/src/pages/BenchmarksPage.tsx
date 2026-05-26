import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CSI_MASTER_FORMAT } from "@/data/csiMasterFormat";
import {
  type ParticipantRole,
  useFetchRSMeansBenchmarks,
  useParticipantAssignments,
  useParticipantsList,
} from "@/hooks/useParticipants";
import { usePhases } from "@/hooks/useQueries";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  DollarSign,
  Minus,
  Settings,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ROLE_OPTIONS: { value: ParticipantRole | "all"; label: string }[] = [
  { value: "all", label: "All Trades" },
  { value: "Architect", label: "Architect" },
  { value: "Designer", label: "Designer" },
  { value: "CivilEngineer", label: "Civil Engineer" },
  { value: "MechanicalEngineer", label: "Mechanical Engineer" },
  { value: "SpecialtyEngineer", label: "Specialty Engineer" },
  { value: "ConstructionManager", label: "Construction Manager" },
  { value: "Contractor", label: "Contractor" },
];

function getDivisionShortName(divNum: string): string {
  const entry = CSI_MASTER_FORMAT.find((e) => e.code.startsWith(divNum));
  if (!entry) return `Div ${divNum}`;
  const match = entry.division.match(/Division (\d+) - (.+)/);
  if (match) return `Div ${match[1]} - ${match[2]}`;
  return entry.division;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface DivisionData {
  division: string;
  divisionName: string;
  rsMeansTotal: number;
  actualTotal: number;
  variance: number;
  variancePct: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function BenchmarkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const rsMeans = payload.find((p) => p.name === "RSMeans")?.value ?? 0;
  const actual = payload.find((p) => p.name === "Actual")?.value ?? 0;
  const variance = actual - rsMeans;
  const variancePct = rsMeans > 0 ? (variance / rsMeans) * 100 : 0;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg">
      <p className="font-medium text-card-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {formatUSD(p.value)}
        </p>
      ))}
      <div className="mt-2 border-t border-border pt-2 text-sm text-muted-foreground">
        <p>
          Variance: {variance > 0 ? "+" : ""}
          {formatUSD(variance)}
        </p>
        <p>
          Variance %: {variancePct > 0 ? "+" : ""}
          {variancePct.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

export default function BenchmarksPage() {
  const [chartType, setChartType] = useState<"grouped" | "dual">("grouped");
  const [selectedRole, setSelectedRole] = useState<ParticipantRole | "all">(
    "all",
  );
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);

  const { data: phases, isLoading: phasesLoading } = usePhases();
  const { data: benchmarks, isLoading: benchmarksLoading } =
    useFetchRSMeansBenchmarks();
  const { data: participants } = useParticipantsList();
  const { data: assignments } = useParticipantAssignments();
  const { activeCategoryId, activeSubtopicId } = useCategoryStore();

  const allDivisionOptions = useMemo(() => {
    const divs = new Set<string>();
    for (const p of phases ?? []) {
      for (const cc of p.costCodes) {
        divs.add(cc.csiDivision || cc.csiCode.slice(0, 2));
      }
    }
    for (const b of benchmarks ?? []) {
      divs.add(b.csiDivision);
    }
    return Array.from(divs).sort();
  }, [phases, benchmarks]);

  const divisionData: DivisionData[] = useMemo(() => {
    if (!phases || !benchmarks) return [];

    const actualByDivision = new Map<string, number>();
    for (const phase of phases) {
      for (const cc of phase.costCodes) {
        const div = cc.csiDivision || cc.csiCode.slice(0, 2);
        actualByDivision.set(div, (actualByDivision.get(div) || 0) + cc.cost);
      }
    }

    const rsmeansByDivision = new Map<string, number>();
    for (const b of benchmarks) {
      rsmeansByDivision.set(
        b.csiDivision,
        (rsmeansByDivision.get(b.csiDivision) || 0) + b.nationalAvgTotal,
      );
    }

    const allDivisions = new Set([
      ...actualByDivision.keys(),
      ...rsmeansByDivision.keys(),
    ]);

    let allowedDivisions = allDivisions;
    if (selectedRole !== "all" && assignments && participants) {
      const roleParticipantIds = participants
        .filter((p) => p.role === selectedRole)
        .map((p) => p.id);
      const roleDivisions = new Set(
        assignments
          .filter((a) => roleParticipantIds.includes(a.participantId))
          .map((a) => a.csiDivision)
          .filter((d): d is string => !!d),
      );
      allowedDivisions = new Set(
        [...allDivisions].filter((d) => roleDivisions.has(d)),
      );
    }

    if (selectedDivisions.length > 0) {
      allowedDivisions = new Set(
        [...allowedDivisions].filter((d) => selectedDivisions.includes(d)),
      );
    }

    const result: DivisionData[] = [];
    for (const div of allowedDivisions) {
      const rsMeansTotal = rsmeansByDivision.get(div) || 0;
      const actualTotal = actualByDivision.get(div) || 0;
      const variance = actualTotal - rsMeansTotal;
      const variancePct =
        rsMeansTotal > 0 ? (variance / rsMeansTotal) * 100 : 0;
      result.push({
        division: div,
        divisionName: getDivisionShortName(div),
        rsMeansTotal,
        actualTotal,
        variance,
        variancePct,
      });
    }

    return result.sort((a, b) => a.division.localeCompare(b.division));
  }, [
    phases,
    benchmarks,
    selectedRole,
    assignments,
    participants,
    selectedDivisions,
  ]);

  const isLoading = phasesLoading || benchmarksLoading;

  const statusBadge = (variancePct: number) => {
    if (variancePct > 5)
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Over
        </Badge>
      );
    if (variancePct < -5)
      return (
        <Badge
          variant="secondary"
          className="gap-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
        >
          <TrendingDown className="h-3 w-3" />
          Under
        </Badge>
      );
    return (
      <Badge variant="outline" className="gap-1">
        <Minus className="h-3 w-3" />
        On Target
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (divisionData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          No Benchmark Data Available
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Add cost codes to your project phases and configure RSMeans settings
          to see benchmark comparisons.
        </p>
        <div className="flex gap-3">
          <Link to="/settings">
            <Button variant="outline" data-ocid="benchmarks.settings_link">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link to="/cash-requirement">
            <Button data-ocid="benchmarks.cash_link">
              <DollarSign className="h-4 w-4 mr-2" />
              Cash Requirement
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const chartData = divisionData.map((d) => ({
    name: d.divisionName,
    division: d.division,
    RSMeans: d.rsMeansTotal,
    Actual: d.actualTotal,
  }));

  return (
    <div className="space-y-6" data-ocid="benchmarks.page">
      <p className="text-xs text-muted-foreground mb-2">
        {activeCategoryId
          ? `Filtered by: ${activeCategoryId}${activeSubtopicId ? ` > ${activeSubtopicId}` : ""}`
          : "Showing all phases"}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            Benchmarks
          </h1>
          <p className="text-muted-foreground text-sm">
            RSMeans unit costs against actuals by CSI division
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as ParticipantRole | "all")
            }
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            data-ocid="benchmarks.role_filter"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setSelectedDivisions([])}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
                selectedDivisions.length === 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input hover:bg-muted"
              }`}
              data-ocid="benchmarks.div_all"
            >
              All
            </button>
            {allDivisionOptions.map((d) => {
              const active = selectedDivisions.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() =>
                    setSelectedDivisions((prev) =>
                      prev.includes(d)
                        ? prev.filter((x) => x !== d)
                        : [...prev, d],
                    )
                  }
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-muted"
                  }`}
                  data-ocid={`benchmarks.div_${d}`}
                >
                  {getDivisionShortName(d)}
                </button>
              );
            })}
          </div>

          <div className="flex rounded-md border border-input overflow-hidden">
            <button
              type="button"
              onClick={() => setChartType("grouped")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                chartType === "grouped"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              data-ocid="benchmarks.grouped_button"
            >
              Grouped Bar
            </button>
            <button
              type="button"
              onClick={() => setChartType("dual")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                chartType === "dual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              data-ocid="benchmarks.dual_button"
            >
              Dual Axis
            </button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Cost Comparison by Division
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "grouped" ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<BenchmarkTooltip />} />
                  <Legend />
                  <Bar dataKey="RSMeans" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<BenchmarkTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="Actual"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="RSMeans"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 4 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Summary Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                    Division
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    RSMeans
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    Actual
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    Variance $
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    Variance %
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {divisionData.map((d, i) => (
                  <tr
                    key={d.division}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    data-ocid={`benchmarks.item.${i + 1}`}
                  >
                    <td className="py-2 px-3 font-medium">{d.divisionName}</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {formatUSD(d.rsMeansTotal)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {formatUSD(d.actualTotal)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right tabular-nums ${
                        d.variance > 0
                          ? "text-destructive"
                          : d.variance < 0
                            ? "text-emerald-400"
                            : ""
                      }`}
                    >
                      {d.variance > 0 ? "+" : ""}
                      {formatUSD(d.variance)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right tabular-nums ${
                        d.variancePct > 0
                          ? "text-destructive"
                          : d.variancePct < 0
                            ? "text-emerald-400"
                            : ""
                      }`}
                    >
                      {d.variancePct > 0 ? "+" : ""}
                      {d.variancePct.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3">{statusBadge(d.variancePct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
