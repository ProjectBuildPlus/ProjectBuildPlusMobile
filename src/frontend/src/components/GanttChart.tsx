import type { CriticalPathNode } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, List } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export interface GanttPhase {
  id: string;
  name: string;
  startOffset: number;
  endOffset: number;
  dependencies: string[];
}

interface TooltipState {
  x: number;
  y: number;
  phase: GanttPhase;
  node?: CriticalPathNode;
}

interface Props {
  phases: GanttPhase[];
  criticalPathNodes: CriticalPathNode[];
  viewMode?: "gantt" | "table";
  onViewModeChange?: (mode: "gantt" | "table") => void;
}

function formatDay(val: number): string {
  return val % 1 === 0 ? `Day ${val}` : `Day ${val.toFixed(1)}`;
}

const CRITICAL_COLOR = "#d97706";
const NON_CRITICAL_COLOR = "#0d9488";
const CRITICAL_BORDER = "#f59e0b";
const NON_CRITICAL_BORDER = "#14b8a6";
const BAR_HEIGHT = 28;
const BAR_GAP = 14;
const LABEL_WIDTH = 160;
const AXIS_HEIGHT = 36;
const PADDING_RIGHT = 20;

export function GanttChart({
  phases,
  criticalPathNodes,
  viewMode: externalMode,
  onViewModeChange,
}: Props) {
  const [internalMode, setInternalMode] = useState<"gantt" | "table">("gantt");
  const mode = externalMode ?? internalMode;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const nodeMap = useMemo(() => {
    const m: Record<string, CriticalPathNode> = {};
    for (const n of criticalPathNodes) m[n.phaseId] = n;
    return m;
  }, [criticalPathNodes]);

  const handleModeChange = (m: "gantt" | "table") => {
    setInternalMode(m);
    onViewModeChange?.(m);
  };

  const projectEnd = useMemo(
    () => Math.max(0, ...phases.map((p) => p.endOffset)),
    [phases],
  );

  const sortedForTable = useMemo(() => {
    return [...criticalPathNodes].sort((a, b) => a.totalSlack - b.totalSlack);
  }, [criticalPathNodes]);

  // Build dependency arrows: from predecessor endOffset → successor startOffset
  const arrows = useMemo(() => {
    const phaseById: Record<string, GanttPhase> = {};
    phases.forEach((p, i) => {
      phaseById[p.id] = { ...p, _index: i } as GanttPhase & { _index: number };
    });
    const result: { x1: number; y1: number; x2: number; y2: number }[] = [];
    phases.forEach((p, succIdx) => {
      for (const depId of p.dependencies) {
        const depIdx = phases.findIndex((pp) => pp.id === depId);
        if (depIdx < 0) continue;
        result.push({
          x1: depIdx,
          y1: phases[depIdx].endOffset,
          x2: succIdx,
          y2: p.startOffset,
        });
      }
    });
    return result;
  }, [phases]);

  const svgWidth = Math.max(600, LABEL_WIDTH + 400 + PADDING_RIGHT);
  const chartWidth = svgWidth - LABEL_WIDTH - PADDING_RIGHT;
  const rowCount = phases.length;
  const svgHeight = AXIS_HEIGHT + rowCount * (BAR_HEIGHT + BAR_GAP) + BAR_GAP;

  function xFromDay(day: number): number {
    if (projectEnd <= 0) return LABEL_WIDTH;
    return LABEL_WIDTH + (day / projectEnd) * chartWidth;
  }

  function yFromRow(idx: number): number {
    return AXIS_HEIGHT + BAR_GAP + idx * (BAR_HEIGHT + BAR_GAP);
  }

  // Axis ticks
  const tickCount = Math.min(10, Math.max(2, Math.floor(projectEnd / 5) + 1));
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((projectEnd / tickCount) * i),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg w-fit border border-border">
        <Button
          type="button"
          size="sm"
          variant={mode === "gantt" ? "default" : "ghost"}
          onClick={() => handleModeChange("gantt")}
          data-ocid="critical-path.gantt_tab"
          className="gap-1.5 text-xs"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Gantt
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "table" ? "default" : "ghost"}
          onClick={() => handleModeChange("table")}
          data-ocid="critical-path.table_tab"
          className="gap-1.5 text-xs"
        >
          <List className="w-3.5 h-3.5" />
          Table
        </Button>
      </div>

      {mode === "gantt" ? (
        <GanttView
          phases={phases}
          nodeMap={nodeMap}
          arrows={arrows}
          svgRef={svgRef}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          chartWidth={chartWidth}
          ticks={ticks}
          projectEnd={projectEnd}
          tooltip={tooltip}
          setTooltip={setTooltip}
          xFromDay={xFromDay}
          yFromRow={yFromRow}
        />
      ) : (
        <TableView nodes={sortedForTable} />
      )}
    </div>
  );
}

// ── GANTT SUB-VIEW ──────────────────────────────────────────────────────────

interface GanttViewProps {
  phases: GanttPhase[];
  nodeMap: Record<string, CriticalPathNode>;
  arrows: { x1: number; y1: number; x2: number; y2: number }[];
  svgRef: React.RefObject<SVGSVGElement | null>;
  svgWidth: number;
  svgHeight: number;
  chartWidth: number;
  ticks: number[];
  projectEnd: number;
  tooltip: TooltipState | null;
  setTooltip: (t: TooltipState | null) => void;
  xFromDay: (d: number) => number;
  yFromRow: (i: number) => number;
}

function GanttView({
  phases,
  nodeMap,
  arrows,
  svgRef,
  svgWidth,
  svgHeight,
  ticks,
  projectEnd,
  tooltip,
  setTooltip,
  xFromDay,
  yFromRow,
}: GanttViewProps) {
  return (
    <div className="relative rounded-xl border border-border bg-card overflow-x-auto">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="block"
        onMouseLeave={() => setTooltip(null)}
        aria-label="Gantt chart timeline"
        role="img"
      >
        {/* Grid lines */}
        {ticks.map((t) => (
          <line
            key={t}
            x1={xFromDay(t)}
            y1={AXIS_HEIGHT}
            x2={xFromDay(t)}
            y2={svgHeight}
            stroke="oklch(0.4 0.02 260 / 0.3)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ))}

        {/* Axis labels */}
        {ticks.map((t) => (
          <text
            key={t}
            x={xFromDay(t)}
            y={AXIS_HEIGHT - 6}
            textAnchor="middle"
            fontSize={10}
            fill="oklch(0.7 0.04 260)"
          >
            {t === 0 ? "Start" : `Day ${t}`}
          </text>
        ))}

        {/* Phase bars */}
        {phases.map((phase, idx) => {
          const node = nodeMap[phase.id];
          const isCritical = node?.isCritical ?? false;
          const x1 = xFromDay(phase.startOffset);
          const x2 = xFromDay(phase.endOffset);
          const barW = Math.max(4, x2 - x1);
          const y = yFromRow(idx);
          const fill = isCritical ? CRITICAL_COLOR : NON_CRITICAL_COLOR;
          const stroke = isCritical ? CRITICAL_BORDER : NON_CRITICAL_BORDER;
          const slack = node?.totalSlack ?? 0;

          return (
            <g key={phase.id}>
              {/* Row label */}
              <text
                x={LABEL_WIDTH - 8}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fill="oklch(0.88 0.04 80)"
                className="select-none"
              >
                {phase.name.length > 18
                  ? `${phase.name.slice(0, 16)}…`
                  : phase.name}
              </text>

              {/* Bar background track */}
              <rect
                x={xFromDay(0)}
                y={y + 6}
                width={xFromDay(projectEnd) - xFromDay(0)}
                height={BAR_HEIGHT - 12}
                rx={2}
                fill="oklch(0.3 0.02 260 / 0.4)"
              />

              {/* Main bar */}
              <rect
                x={x1}
                y={y}
                width={barW}
                height={BAR_HEIGHT}
                rx={4}
                fill={fill}
                fillOpacity={0.85}
                stroke={stroke}
                strokeWidth={1.5}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => {
                  const svgEl = e.currentTarget.closest("svg");
                  const rect = svgEl?.getBoundingClientRect();
                  setTooltip({
                    x: e.clientX - (rect?.left ?? 0),
                    y: e.clientY - (rect?.top ?? 0),
                    phase,
                    node,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />

              {/* CRITICAL label */}
              {isCritical && barW > 64 && (
                <text
                  x={x1 + barW / 2}
                  y={y + BAR_HEIGHT / 2 + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="700"
                  fill="oklch(0.98 0.04 90)"
                  letterSpacing="1"
                  pointerEvents="none"
                >
                  CRITICAL
                </text>
              )}

              {/* Slack float bar */}
              {!isCritical && slack > 0 && (
                <rect
                  x={x2}
                  y={y + BAR_HEIGHT * 0.3}
                  width={Math.max(2, xFromDay(phase.endOffset + slack) - x2)}
                  height={BAR_HEIGHT * 0.4}
                  rx={2}
                  fill="oklch(0.55 0.06 180 / 0.5)"
                  strokeDasharray="3 2"
                  stroke="oklch(0.6 0.06 180 / 0.7)"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}

        {/* Dependency arrows */}
        {arrows.map(
          ({ x1: predIdx, y1: predEnd, x2: succIdx, y2: succStart }, _i) => {
            const fromX = xFromDay(predEnd);
            const fromY = yFromRow(predIdx) + BAR_HEIGHT / 2;
            const toX = xFromDay(succStart);
            const toY = yFromRow(succIdx) + BAR_HEIGHT / 2;
            const midX = (fromX + toX) / 2;
            return (
              <g key={`arrow-${predIdx}-${succIdx}`}>
                <path
                  d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                  fill="none"
                  stroke="oklch(0.75 0.08 80 / 0.6)"
                  strokeWidth={1.5}
                  markerEnd="url(#arrow)"
                  strokeDasharray="4 3"
                />
              </g>
            );
          },
        )}

        {/* Arrow marker def */}
        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="oklch(0.75 0.08 80 / 0.7)" />
          </marker>
        </defs>

        {/* Tooltip */}
        {tooltip && (
          <foreignObject
            x={Math.min(tooltip.x + 12, svgWidth - 200)}
            y={Math.max(tooltip.y - 70, 4)}
            width={190}
            height={110}
            style={{ pointerEvents: "none", overflow: "visible" }}
          >
            <div
              style={{
                background: "oklch(0.18 0.04 260)",
                border: "1px solid oklch(0.35 0.05 260)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 11,
                color: "oklch(0.88 0.04 80)",
                boxShadow: "0 4px 20px oklch(0 0 0 / 0.5)",
                lineHeight: 1.7,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                {tooltip.phase.name}
              </div>
              <div>Start: {formatDay(tooltip.phase.startOffset)}</div>
              <div>End: {formatDay(tooltip.phase.endOffset)}</div>
              <div>
                Slack: {tooltip.node ? formatDay(tooltip.node.totalSlack) : "—"}
              </div>
              {tooltip.node?.isCritical && (
                <div style={{ color: CRITICAL_BORDER, fontWeight: 700 }}>
                  ⚡ Critical Path
                </div>
              )}
            </div>
          </foreignObject>
        )}
      </svg>

      {/* Legend */}
      <div className="flex gap-5 px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: CRITICAL_COLOR }}
          />
          Critical Path
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: NON_CRITICAL_COLOR }}
          />
          Non-Critical
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-5 h-2 rounded-sm opacity-50"
            style={{
              background: "transparent",
              border: "1px dashed oklch(0.6 0.06 180)",
            }}
          />
          Float / Slack
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-5 h-0"
            style={{
              border: "1px dashed oklch(0.75 0.08 80 / 0.6)",
            }}
          />
          Dependency
        </span>
      </div>
    </div>
  );
}

// ── TABLE SUB-VIEW ───────────────────────────────────────────────────────────

function TableView({ nodes }: { nodes: CriticalPathNode[] }) {
  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden"
      data-ocid="critical-path.table"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-muted-foreground">Phase Name</TableHead>
            <TableHead className="text-muted-foreground text-right">
              Early Start
            </TableHead>
            <TableHead className="text-muted-foreground text-right">
              Early Finish
            </TableHead>
            <TableHead className="text-muted-foreground text-right">
              Late Start
            </TableHead>
            <TableHead className="text-muted-foreground text-right">
              Late Finish
            </TableHead>
            <TableHead className="text-muted-foreground text-right">
              Total Slack
            </TableHead>
            <TableHead className="text-muted-foreground text-center">
              Critical
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nodes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-10"
                data-ocid="critical-path.empty_state"
              >
                No critical path data available. Add phases to calculate.
              </TableCell>
            </TableRow>
          ) : (
            nodes.map((node, i) => (
              <TableRow
                key={node.phaseId}
                className="border-border"
                data-ocid={`critical-path.item.${i + 1}`}
              >
                <TableCell className="font-medium text-foreground">
                  {node.phaseName}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDay(node.earlyStart)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDay(node.earlyFinish)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDay(node.lateStart)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDay(node.lateFinish)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span
                    className={
                      node.totalSlack === 0
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }
                  >
                    {formatDay(node.totalSlack)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {node.isCritical ? (
                    <Badge
                      className="bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold text-[10px] tracking-wider"
                      variant="outline"
                    >
                      YES
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
