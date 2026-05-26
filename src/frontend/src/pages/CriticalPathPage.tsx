import type { CriticalPathNode, Phase } from "@/backend";
import type { GanttPhase } from "@/components/GanttChart";
import { GanttChart } from "@/components/GanttChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhases } from "@/hooks/useQueries";
import { useCriticalPath } from "@/hooks/useResources";
import { Activity, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

function buildGanttPhases(phases: Phase[]): GanttPhase[] {
  const sorted = [...phases].sort(
    (a, b) => Number(a.phaseOrder) - Number(b.phaseOrder),
  );
  return sorted.map((p, idx) => ({
    id: p.id.toString(),
    name: p.name,
    startOffset: Number(p.startOffset),
    endOffset: Number(p.endOffset),
    // Sequential dependency: each phase depends on the previous one
    dependencies: idx > 0 ? [sorted[idx - 1].id.toString()] : [],
  }));
}

export default function CriticalPathPage() {
  const [viewMode, setViewMode] = useState<"gantt" | "table">("gantt");
  const { data: phases = [], isLoading: phasesLoading } = usePhases();
  const ganttPhases = useMemo(() => buildGanttPhases(phases), [phases]);

  const {
    data: criticalPathNodes = [] as CriticalPathNode[],
    isLoading: cpLoading,
    error,
  } = useCriticalPath(ganttPhases);

  const isLoading = phasesLoading || cpLoading;

  const criticalCount = criticalPathNodes.filter((n) => n.isCritical).length;
  const projectDuration = useMemo(() => {
    if (criticalPathNodes.length === 0) {
      return ganttPhases.length > 0
        ? Math.max(...ganttPhases.map((p) => p.endOffset))
        : 0;
    }
    return Math.max(...criticalPathNodes.map((n) => n.earlyFinish));
  }, [criticalPathNodes, ganttPhases]);

  return (
    <div className="space-y-6" data-ocid="critical-path.page">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          <h1 className="text-2xl font-bold font-display text-foreground">
            Critical Path Visualization
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          CPM analysis — early/late start &amp; finish dates, float, and the
          critical chain driving project completion.
        </p>
      </div>

      {/* Summary Banner */}
      {!isLoading && ganttPhases.length > 0 && (
        <div
          className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5"
          data-ocid="critical-path.summary_card"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-bold text-amber-400">
              {criticalCount} phase{criticalCount !== 1 ? "s" : ""} on critical
              path
            </span>
            <span className="text-amber-300/80">·</span>
            <span className="text-muted-foreground">
              Project duration:{" "}
              <span className="font-semibold text-foreground">
                {projectDuration} days
              </span>
            </span>
            <Badge
              variant="outline"
              className="border-amber-500/50 text-amber-400 text-[10px] tracking-wider"
            >
              {criticalCount === 0
                ? "No critical phases"
                : "⚡ Critical chain active"}
            </Badge>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" data-ocid="critical-path.loading_state">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Card
          className="border-destructive/50 bg-destructive/10"
          data-ocid="critical-path.error_state"
        >
          <CardContent className="py-6 text-sm text-destructive">
            Failed to compute critical path. Please check your phase data.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && ganttPhases.length === 0 && (
        <Card className="border-border" data-ocid="critical-path.empty_state">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Activity className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              No phases found. Add project phases in{" "}
              <a
                href="/project-setup"
                className="text-amber-400 hover:underline"
              >
                Project Setup
              </a>{" "}
              to visualize the critical path.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {!isLoading && !error && ganttPhases.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Schedule Network Diagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart
              phases={ganttPhases}
              criticalPathNodes={criticalPathNodes}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
