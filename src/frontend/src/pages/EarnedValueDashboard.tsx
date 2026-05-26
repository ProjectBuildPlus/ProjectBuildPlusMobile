import { BaselineType } from "@/backend";
import type { EVMPoint, ProjectEVMSummary } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getCategoryById, getSubtopicById } from "@/data/projectCategories";
import {
  useEarnedValueMetrics,
  useProjectEVMSummary,
} from "@/hooks/useQueries";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Activity, BarChart2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v == null) return "—";
  return v.toFixed(decimals);
}

function fmtCurrency(v: number | null | undefined): string {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function IndexBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
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

function VarianceBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const good = value >= 0;
  return (
    <span
      className={`font-mono font-semibold ${
        good ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {good ? "+" : ""}
      {fmtCurrency(value)}
    </span>
  );
}

const CHART_COLORS = {
  pv: "hsl(var(--chart-1))",
  ev: "hsl(var(--chart-2))",
  ac: "hsl(var(--chart-3))",
};

export default function EarnedValueDashboard() {
  const [baselineType, setBaselineType] = useState<BaselineType>(
    BaselineType.original,
  );
  const [showCustomPI, setShowCustomPI] = useState(false);

  const { data: metrics, isLoading: metricsLoading } =
    useEarnedValueMetrics(baselineType);
  const { data: summary, isLoading: summaryLoading } =
    useProjectEVMSummary(baselineType);

  const isLoading = metricsLoading || summaryLoading;
  const { activeCategoryId, activeSubtopicId } = useCategoryStore();

  const baselineLabel =
    baselineType === BaselineType.original
      ? "Original Baseline"
      : "Crashed Baseline";

  const chartData = (metrics ?? []).map((m: EVMPoint) => ({
    name: m.phaseName,
    PV: Number(m.plannedValue),
    EV: Number(m.earnedValue),
    AC: Number(m.actualCost),
  }));

  const customPI = (m: EVMPoint) => {
    const cpi = Number(m.cpi);
    const resourceUtil = Number(m.earnedValue) / (Number(m.plannedValue) || 1);
    return (cpi * resourceUtil).toFixed(3);
  };

  return (
    <div className="min-h-screen bg-background" data-ocid="evm.page">
      {/* Header */}
      <div className="bg-card border-b shadow-sm px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Earned Value Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Cost &amp; Schedule Performance · EVM Indices · Productivity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label
              htmlFor="baseline-select"
              className="text-sm font-medium text-muted-foreground"
            >
              Baseline
            </Label>
            <Select
              value={
                baselineType === BaselineType.original ? "original" : "crashed"
              }
              onValueChange={(v) => {
                setBaselineType(
                  v === "original"
                    ? BaselineType.original
                    : BaselineType.crashed,
                );
              }}
            >
              <SelectTrigger
                id="baseline-select"
                className="w-44"
                data-ocid="evm.baseline_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original Baseline</SelectItem>
                <SelectItem value="crashed">Crashed Baseline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Active filter caption */}
        {(activeCategoryId || activeSubtopicId) && (
          <p className="text-sm text-muted-foreground">
            Filtered by:{" "}
            <span className="font-medium text-foreground">
              {[
                activeCategoryId
                  ? (getCategoryById(activeCategoryId)?.name ??
                    activeCategoryId)
                  : null,
                activeCategoryId && activeSubtopicId
                  ? (getSubtopicById(activeCategoryId, activeSubtopicId)
                      ?.name ?? activeSubtopicId)
                  : null,
              ]
                .filter(Boolean)
                .join(" › ")}
            </span>
          </p>
        )}

        {/* Summary KPI Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={`sk-summary-${k}`} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : summary ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            data-ocid="evm.summary_section"
          >
            <SummaryCard
              label="Cost Performance Index"
              value={fmt(Number(summary.projectCPI))}
              good={Number(summary.projectCPI) >= 1}
              icon={<BarChart2 className="h-4 w-4" />}
            />
            <SummaryCard
              label="Schedule Performance Index"
              value={fmt(Number(summary.projectSPI))}
              good={Number(summary.projectSPI) >= 1}
              icon={<Activity className="h-4 w-4" />}
            />
            <SummaryCard
              label="Cost Variance"
              value={fmtCurrency(Number(summary.totalCV))}
              good={Number(summary.totalCV) >= 0}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <SummaryCard
              label="Schedule Variance"
              value={fmtCurrency(Number(summary.totalSV))}
              good={Number(summary.totalSV) >= 0}
              icon={<TrendingDown className="h-4 w-4" />}
            />
          </div>
        ) : null}

        {/* Metrics Table */}
        <Card data-ocid="evm.metrics_table">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display text-lg">
                Phase EVM Metrics
              </CardTitle>
              <CardDescription>
                Comparing against <strong>{baselineLabel}</strong>. Green =
                healthy, Red = at risk.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="custom-pi-toggle"
                checked={showCustomPI}
                onCheckedChange={setShowCustomPI}
                data-ocid="evm.custom_pi_toggle"
              />
              <Label
                htmlFor="custom-pi-toggle"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Custom PI
              </Label>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-2">
                {["a", "b", "c", "d", "e"].map((k) => (
                  <Skeleton
                    key={`sk-table-${k}`}
                    className="h-10 w-full rounded"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold">Phase</TableHead>
                      <TableHead className="text-right font-semibold">
                        PV
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        EV
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        AC
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        CV
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        SV
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        CPI
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        SPI
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        {showCustomPI ? "Custom PI" : "PI"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(metrics ?? []).map((m: EVMPoint, idx: number) => (
                      <TableRow
                        key={m.phaseId?.toString() ?? idx}
                        data-ocid={`evm.metrics_row.${idx + 1}`}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {m.phaseName}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {fmtCurrency(Number(m.plannedValue))}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {fmtCurrency(Number(m.earnedValue))}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {fmtCurrency(Number(m.actualCost))}
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
                          {showCustomPI ? (
                            <Badge
                              variant="outline"
                              className="font-mono font-semibold border-violet-500 text-violet-600 bg-violet-50"
                            >
                              {customPI(m)}
                            </Badge>
                          ) : (
                            <IndexBadge value={Number(m.cpi) * Number(m.spi)} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Project Summary Row */}
                    {summary && (
                      <TableRow
                        className="bg-muted/40 font-bold border-t-2 border-border"
                        data-ocid="evm.summary_row"
                      >
                        <TableCell className="font-bold text-foreground">
                          PROJECT TOTAL
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtCurrency(Number(summary.totalPV))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtCurrency(Number(summary.totalEV))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmtCurrency(Number(summary.totalAC))}
                        </TableCell>
                        <TableCell className="text-right">
                          <VarianceBadge value={Number(summary.totalCV)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <VarianceBadge value={Number(summary.totalSV)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <IndexBadge value={Number(summary.projectCPI)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <IndexBadge value={Number(summary.projectSPI)} />
                        </TableCell>
                        <TableCell className="text-right">
                          {showCustomPI ? (
                            <Badge
                              variant="outline"
                              className="font-mono font-semibold border-violet-500 text-violet-600 bg-violet-50"
                            >
                              {(
                                Number(summary.projectCPI) *
                                Number(summary.projectSPI)
                              ).toFixed(3)}
                            </Badge>
                          ) : (
                            <IndexBadge
                              value={
                                Number(summary.projectCPI) *
                                Number(summary.projectSPI)
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PV / EV / AC Chart */}
        <Card data-ocid="evm.pv_ev_ac_chart">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              PV / EV / AC by Phase
            </CardTitle>
            <CardDescription>
              Planned Value, Earned Value, and Actual Cost — {baselineLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      fmtCurrency(value),
                      name,
                    ]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="PV"
                    stroke={CHART_COLORS.pv}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="EV"
                    stroke={CHART_COLORS.ev}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="AC"
                    stroke={CHART_COLORS.ac}
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Legend / Performance Guide */}
        <Card className="bg-muted/30" data-ocid="evm.performance_guide">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Performance Index Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-semibold">CPI = EV / AC</p>
                <p className="text-muted-foreground">
                  Cost efficiency. ≥1.0 = under budget.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold">SPI = EV / PV</p>
                <p className="text-muted-foreground">
                  Schedule efficiency. ≥1.0 = ahead of schedule.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold">PI = CPI × SPI</p>
                <p className="text-muted-foreground">
                  Overall productivity. Custom PI uses resource utilization
                  weighting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  good,
  icon,
}: {
  label: string;
  value: string;
  good: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card
      className={`border-l-4 ${
        good ? "border-l-emerald-500" : "border-l-red-500"
      }`}
    >
      <CardContent className="pt-4 pb-3">
        <div
          className={`flex items-center gap-2 mb-1 ${
            good ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>
        <p
          className={`text-xl font-bold font-mono ${
            good ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
