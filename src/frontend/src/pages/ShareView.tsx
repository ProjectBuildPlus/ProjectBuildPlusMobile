import { BaselineType } from "@/backend";
import type { EVMPoint } from "@/backend";
import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReadOnlyProvider } from "@/context/ReadOnlyContext";
import { useParticipantsList } from "@/hooks/useParticipants";
import {
  useCumulativeCashRequirement,
  useCumulativeCrashedRequirement,
  useEarnedValueMetrics,
  usePhases,
  useProjectEVMSummary,
} from "@/hooks/useQueries";
import { useScenariosList } from "@/hooks/useScenarios";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  DollarSign,
  HardHat,
  Link2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUSD(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function fmt(v: number, d = 2) {
  return v.toFixed(d);
}

// ─── Token-level share link query ─────────────────────────────────────────────

function useShareLink(token: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["shareLink", token],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getShareLink(token);
    },
    enabled: !!actor && !isFetching && !!token,
    retry: 1,
    staleTime: 60_000,
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IndexBadge({ value }: { value: number }) {
  const good = value >= 1;
  return (
    <Badge
      variant="outline"
      className={`font-mono font-semibold ${
        good
          ? "border-emerald-500 text-emerald-600 bg-emerald-50"
          : "border-red-500 text-red-600 bg-red-50"
      }`}
    >
      {fmt(value)}
    </Badge>
  );
}

function VarianceBadge({ value }: { value: number }) {
  const good = value >= 0;
  return (
    <span
      className={`font-mono font-semibold ${
        good ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {good ? "+" : ""}
      {fmtUSD(value)}
    </span>
  );
}

// ─── Cash Requirement Tab ─────────────────────────────────────────────────────

function CashTab() {
  const { data: phases, isLoading: phasesLoading } = usePhases();
  const { data: cumulative, isLoading: cumLoading } =
    useCumulativeCashRequirement();
  const { data: crashed, isLoading: crashedLoading } =
    useCumulativeCrashedRequirement();

  const isLoading = phasesLoading || cumLoading || crashedLoading;

  const sCurveData = (cumulative ?? []).map((p) => ({
    name: p.phaseName,
    offset: Number(p.endOffset),
    cash: p.cumulativeCash,
    sov: p.cumulativeSOV,
  }));

  return (
    <div className="space-y-6">
      <Card data-ocid="share.cash_curve_chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Cumulative Cash Requirement S-Curve
          </CardTitle>
          <CardDescription>
            Planned cash spend over project timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={sCurveData}
                margin={{ top: 8, right: 24, bottom: 8, left: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="offset"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Days",
                    position: "insideBottom",
                    offset: -2,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => fmtUSD(v)}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="cash"
                  name="Cash Required"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="sov"
                  name="Schedule of Values"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card data-ocid="share.phase_table">
        <CardHeader>
          <CardTitle className="font-display text-base">
            Phase Details
          </CardTitle>
          <CardDescription>
            Phase-by-phase cash breakdown (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {phasesLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Phase</TableHead>
                    <TableHead className="text-right">Required Cash</TableHead>
                    <TableHead className="text-right">SOV</TableHead>
                    <TableHead className="text-right">Crash Factor</TableHead>
                    <TableHead className="text-right">Resource Mult.</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(phases ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                        data-ocid="share.phases.empty_state"
                      >
                        No phases in this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (phases ?? []).map((p, idx) => (
                      <TableRow
                        key={p.id.toString()}
                        data-ocid={`share.phase.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtUSD(p.requiredCash)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtUSD(p.scheduleOfValues)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(p.crashFactor ?? 1).toFixed(1)}×
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(p.resourceMultiplier ?? 1).toFixed(1)}×
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(p.startOffset)}–{Number(p.endOffset)} days
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crashed Cash comparison */}
      {(crashed ?? []).length > 0 && (
        <Card data-ocid="share.crashed_summary">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Crashed Cash Summary
            </CardTitle>
            <CardDescription>
              Projected cash with crash factor applied per phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(crashed ?? []).slice(0, 4).map((p, i) => (
                <div
                  key={p.phaseName ?? i}
                  className="rounded-lg bg-muted/40 p-3"
                >
                  <p className="text-xs text-muted-foreground truncate">
                    {p.phaseName}
                  </p>
                  <p className="font-mono font-semibold">
                    {fmtUSD(p.crashedCash)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── EVM Tab ──────────────────────────────────────────────────────────────────

function EVMTab() {
  const [baseline, setBaseline] = useState<BaselineType>(BaselineType.original);
  const { data: metrics, isLoading: metricsLoading } =
    useEarnedValueMetrics(baseline);
  const { data: summary, isLoading: summaryLoading } =
    useProjectEVMSummary(baseline);

  const chartData = (metrics ?? []).map((m: EVMPoint) => ({
    name: m.phaseName,
    PV: Number(m.plannedValue),
    EV: Number(m.earnedValue),
    AC: Number(m.actualCost),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Baseline:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBaseline(BaselineType.original)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              baseline === BaselineType.original
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-ocid="share.evm.baseline_original"
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setBaseline(BaselineType.crashed)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              baseline === BaselineType.crashed
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-ocid="share.evm.baseline_crashed"
          >
            Crashed
          </button>
        </div>
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : summary ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          data-ocid="share.evm.summary"
        >
          {[
            {
              label: "CPI",
              value: fmt(Number(summary.projectCPI)),
              good: Number(summary.projectCPI) >= 1,
            },
            {
              label: "SPI",
              value: fmt(Number(summary.projectSPI)),
              good: Number(summary.projectSPI) >= 1,
            },
            {
              label: "Cost Variance",
              value: fmtUSD(Number(summary.totalCV)),
              good: Number(summary.totalCV) >= 0,
            },
            {
              label: "Schedule Variance",
              value: fmtUSD(Number(summary.totalSV)),
              good: Number(summary.totalSV) >= 0,
            },
          ].map((item) => (
            <Card
              key={item.label}
              className={`border-l-4 ${item.good ? "border-l-emerald-500" : "border-l-red-500"}`}
            >
              <CardContent className="pt-4 pb-3">
                <p
                  className={`text-xs font-medium uppercase tracking-wide ${item.good ? "text-emerald-600" : "text-red-600"}`}
                >
                  {item.label}
                </p>
                <p
                  className={`mt-1 text-xl font-bold font-mono ${item.good ? "text-emerald-700" : "text-red-700"}`}
                >
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card data-ocid="share.evm.chart">
        <CardHeader>
          <CardTitle className="font-display text-base">
            PV / EV / AC by Phase
          </CardTitle>
          <CardDescription>
            Planned Value, Earned Value, and Actual Cost
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [fmtUSD(v), name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="PV"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="EV"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="AC"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card data-ocid="share.evm.metrics_table">
        <CardHeader>
          <CardTitle className="font-display text-base">
            Phase EVM Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {metricsLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Phase</TableHead>
                    <TableHead className="text-right">PV</TableHead>
                    <TableHead className="text-right">EV</TableHead>
                    <TableHead className="text-right">AC</TableHead>
                    <TableHead className="text-right">CV</TableHead>
                    <TableHead className="text-right">SV</TableHead>
                    <TableHead className="text-right">CPI</TableHead>
                    <TableHead className="text-right">SPI</TableHead>
                    <TableHead className="text-right">PI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(metrics ?? []).map((m: EVMPoint, idx: number) => (
                    <TableRow
                      key={m.phaseId?.toString() ?? idx}
                      data-ocid={`share.evm.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {m.phaseName}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {fmtUSD(Number(m.plannedValue))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {fmtUSD(Number(m.earnedValue))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {fmtUSD(Number(m.actualCost))}
                      </TableCell>
                      <TableCell className="text-right">
                        <VarianceBadge value={Number(m.costVariance)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <VarianceBadge value={Number(m.scheduleVariance)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <IndexBadge value={Number(m.cpi)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <IndexBadge value={Number(m.spi)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <IndexBadge value={Number(m.cpi) * Number(m.spi)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Participants Tab ─────────────────────────────────────────────────────────

function ParticipantsTab() {
  const { data: participants, isLoading } = useParticipantsList();

  const ROLE_LABELS: Record<string, string> = {
    Owner: "Owner",
    Architect: "Architect",
    Designer: "Designer",
    CivilEngineer: "Civil Engineer",
    MechanicalEngineer: "Mechanical Engineer",
    SpecialtyEngineer: "Specialty Engineer",
    ConstructionManager: "Construction Manager",
    Contractor: "Contractor",
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (participants ?? []).length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="share.participants.empty_state"
        >
          No participants listed in this project.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(participants ?? []).map((p, idx) => (
            <Card
              key={p.id}
              className="border hover:shadow-sm transition-shadow"
              data-ocid={`share.participant.item.${idx + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {ROLE_LABELS[p.role] ?? p.role}
                    </Badge>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {(p.firstName?.[0] ?? "?").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {p.company?.name && (
                    <p className="truncate">🏢 {p.company?.name ?? ""}</p>
                  )}
                  {p.contact?.email && (
                    <p className="truncate">✉ {p.contact?.email ?? ""}</p>
                  )}
                  {p.contact?.officePhone && (
                    <p>📞 {p.contact?.officePhone ?? ""}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Scenarios Tab ────────────────────────────────────────────────────────────

function ScenariosTab() {
  const { data: scenarios, isLoading } = useScenariosList();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (scenarios ?? []).length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="share.scenarios.empty_state"
        >
          No scenarios in this project.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(scenarios ?? []).map((s, idx) => (
            <Card key={s.id} data-ocid={`share.scenario.item.${idx + 1}`}>
              <CardContent className="p-4">
                <p className="font-semibold">{s.name}</p>
                {s.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {s.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Created{" "}
                  {new Date(
                    Number(s.createdAt) / 1_000_000,
                  ).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ShareView component ─────────────────────────────────────────────────

type ShareRouteParams = { token: string };

export default function ShareView() {
  const { token } = useParams({ strict: false }) as ShareRouteParams;
  const { data: shareLink, isLoading } = useShareLink(token ?? "");

  // Invalid / not found
  if (
    !isLoading &&
    (shareLink === null || shareLink === undefined || !shareLink?.isActive)
  ) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center px-4"
        data-ocid="share.invalid_state"
      >
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Link Not Available
          </h1>
          <p className="mt-2 text-muted-foreground">
            This project link is not available. It may have been deactivated or
            never existed.
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="share.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
      </div>
    );
  }

  return (
    <ReadOnlyProvider>
      <div
        className="min-h-screen bg-background flex flex-col"
        data-ocid="share.page"
      >
        {/* Read-Only Header */}
        <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold tracking-tight">
                Project Build Plus
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">
                Read-Only Shared View
              </Badge>
            </div>
          </div>
        </header>

        {/* Shared View Banner */}
        <div
          className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800"
          data-ocid="share.readonly_banner"
        >
          <span className="font-medium">Shared Read-Only View</span> — editing
          is disabled. To make changes, open the project in Project Build Plus.
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Module tabs */}
            <Tabs defaultValue="cash" className="w-full" data-ocid="share.tabs">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Project Overview
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Full project data — read-only shared view
                  </p>
                </div>
              </div>

              <TabsList
                className="mb-6 flex flex-wrap gap-1 h-auto"
                data-ocid="share.tab_list"
              >
                <TabsTrigger
                  value="cash"
                  className="gap-1.5"
                  data-ocid="share.tab.cash"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  Cash & Phases
                </TabsTrigger>
                <TabsTrigger
                  value="evm"
                  className="gap-1.5"
                  data-ocid="share.tab.evm"
                >
                  <Activity className="h-3.5 w-3.5" />
                  Earned Value
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="gap-1.5"
                  data-ocid="share.tab.participants"
                >
                  <Users className="h-3.5 w-3.5" />
                  Participants
                </TabsTrigger>
                <TabsTrigger
                  value="scenarios"
                  className="gap-1.5"
                  data-ocid="share.tab.scenarios"
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  Scenarios
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cash">
                <CashTab />
              </TabsContent>
              <TabsContent value="evm">
                <EVMTab />
              </TabsContent>
              <TabsContent value="participants">
                <ParticipantsTab />
              </TabsContent>
              <TabsContent value="scenarios">
                <ScenariosTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/40">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
            <span>
              © {new Date().getFullYear()}. Built with love using caffeine.ai
            </span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </ReadOnlyProvider>
  );
}
