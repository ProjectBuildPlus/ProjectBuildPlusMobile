import type { CriticalPathNode, Phase } from "@/backend";
import type { GanttPhase } from "@/components/GanttChart";
import { GanttChart } from "@/components/GanttChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhases } from "@/hooks/useQueries";
import { useCriticalPath } from "@/hooks/useResources";
import { Activity, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
function useHighlightParam(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("phase") ?? params.get("activity");
}

export default function CriticalPathPage() {
  const [viewMode, setViewMode] = useState<"gantt" | "table">("gantt");
  const { data: phases = [], isLoading: phasesLoading } = usePhases();
  const ganttPhases = useMemo(() => buildGanttPhases(phases), [phases]);
  const highlightParam = useHighlightParam();
  const highlightedPhase = highlightParam
    ? decodeURIComponent(highlightParam)
    : null;
  const highlightRef = useRef<HTMLDivElement>(null);

  const {
    data: criticalPathNodes = [] as CriticalPathNode[],
    isLoading: cpLoading,
    error,
  } = useCriticalPath(ganttPhases);

  const isLoading = phasesLoading || cpLoading;
  useEffect(() => {
    if (!isLoading && highlightedPhase && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [isLoading, highlightedPhase]);

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

      {/* Highlight banner when navigated from milestones */}
      {!isLoading && highlightedPhase && (
        <div
          className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3"
          data-ocid="critical-path.highlight_banner"
        >
          <Activity className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            Highlighting phase:{" "}
            <span className="font-semibold text-white">{highlightedPhase}</span>
          </p>
        </div>
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
            {highlightedPhase && (
              <div
                ref={highlightRef}
                className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm"
                data-ocid="critical-path.highlighted_row"
              >
                <span className="text-amber-300">
                  Phase highlighted:{" "}
                  <span className="font-bold text-white">
                    {highlightedPhase}
                  </span>
                </span>
              </div>
            )}
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
