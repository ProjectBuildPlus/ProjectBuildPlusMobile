import type { Phase } from "@/backend";
import type { CriticalPathNode } from "@/backend";
import type { GanttPhase } from "@/components/GanttChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhases } from "@/hooks/useQueries";
import { useCriticalPath } from "@/hooks/useResources";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Check,
  Edit2,
  Flag,
  Plus,
  Printer,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  name: string;
  phaseName: string;
  day: number;
  type: "start" | "finish";
  isCritical: boolean;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  totalSlack: number;
  duration: number;
}

interface CustomMilestone {
  id: string;
  name: string;
  targetDate: string;
}

type FilterMode = "all" | "critical" | "noncritical" | "byphase";
type ViewMode = "both" | "timeline" | "chart";
type ExportOption = "timeline" | "chart" | "both";

// ── Helpers ───────────────────────────────────────────────────────────────

function truncate(s: string, len = 15): string {
  return s.length > len ? `${s.slice(0, len)}\u2026` : s;
}

function fmtDay(day: number): string {
  return `Day ${day}`;
}

function parseDateToDay(dateStr: string): number {
  const num = Number(dateStr);
  if (!Number.isNaN(num)) return num;
  try {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      const start = new Date(d.getFullYear(), 0, 1);
      return Math.round((d.getTime() - start.getTime()) / 86_400_000);
    }
  } catch {
    // ignore
  }
  return 0;
}

// ── Custom diamond dot for scatter chart ───────────────────────────────

interface DiamondDotProps {
  cx?: number;
  cy?: number;
  payload?: Milestone & { isCustom?: boolean };
}

function DiamondDot({ cx = 0, cy = 0, payload }: DiamondDotProps) {
  const isCustom = payload?.isCustom ?? false;
  const critical = payload?.isCritical ?? false;
  const fill = isCustom ? "#22c55e" : critical ? "#ef4444" : "#0ea5e9";
  const stroke = isCustom ? "#86efac" : critical ? "#fca5a5" : "#38bdf8";
  const size = isCustom ? 10 : 8;
  const pts = [
    `${cx},${cy - size}`,
    `${cx + size},${cy}`,
    `${cx},${cy + size}`,
    `${cx - size},${cy}`,
  ].join(" ");
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1.5} />;
}

// ── Scatter tooltip ────────────────────────────────────────────────────

interface ScatterTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Milestone & { isCustom?: boolean; customName?: string };
  }>;
}

function ScatterTooltipContent({ active, payload }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload;
  const isCustom = m.isCustom ?? false;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0f172a] p-3 text-xs shadow-xl">
      <p className="font-semibold text-white mb-1">
        {isCustom ? (m.customName ?? m.name) : m.name}
      </p>
      <p className="text-[#38bdf8]">{fmtDay(m.day)}</p>
      {!isCustom && (
        <>
          <p className="text-gray-400">Phase: {m.phaseName}</p>
          <p className="text-gray-400">Early Start: Day {m.earlyStart}</p>
          <p className="text-gray-400">Early Finish: Day {m.earlyFinish}</p>
          <p className="text-gray-400">Float / Slack: {m.totalSlack} days</p>
          {m.isCritical && (
            <p className="mt-1 text-red-400 font-semibold">⚠ Critical Path</p>
          )}
        </>
      )}
      {isCustom && (
        <p className="mt-1 text-green-400 font-semibold">✦ Custom Milestone</p>
      )}
    </div>
  );
}

// ── Bar tooltip ────────────────────────────────────────────────────────

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
  milestones: Milestone[];
}

function BarTooltipContent({
  active,
  payload,
  label,
  milestones,
}: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const full = milestones.find(
    (m) => truncate(m.phaseName, 15) === label || m.phaseName === label,
  );
  const isCustomLabel = typeof label === "string" && label.startsWith("✦");
  return (
    <div className="rounded-lg border border-white/10 bg-[#0f172a] p-3 text-xs shadow-xl max-w-56">
      <p className="font-semibold text-white mb-2 break-words">
        {isCustomLabel ? label : (full?.phaseName ?? label)}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ background: p.fill }}
          />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-medium">{p.value} days</span>
        </div>
      ))}
    </div>
  );
}

// ── Phase band colours ─────────────────────────────────────────────────

const BAND_STROKES = [
  "rgba(14,165,233,0.35)",
  "rgba(245,158,11,0.35)",
  "rgba(99,102,241,0.35)",
  "rgba(34,197,94,0.35)",
  "rgba(239,68,68,0.35)",
];

interface PhaseBand {
  label: string;
  start: number;
  stroke: string;
}

// ── Stat card ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent = "#0ea5e9",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3">
      <span className="shrink-0" style={{ color: accent }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// ── Filter chip ────────────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
        active
          ? "bg-[#0ea5e9] text-white shadow-md"
          : "border border-white/15 bg-[#1e293b] text-gray-300 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

// ── View toggle ────────────────────────────────────────────────────────
// ── Custom Milestone Form (inline panel) ───────────────────────────────

interface MilestoneFormProps {
  initial?: CustomMilestone;
  onSave: (name: string, targetDate: string) => void;
  onCancel: () => void;
}

function MilestoneForm({ initial, onSave, onCancel }: MilestoneFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? "");
  return (
    <div className="rounded-xl border border-green-500/30 bg-[#0f2a1e] px-5 py-4 space-y-3">
      <p className="text-sm font-semibold text-green-300">
        {initial ? "Edit Custom Milestone" : "Add Custom Milestone"}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label
            htmlFor="milestone-name-input"
            className="text-xs text-gray-400 mb-1 block"
          >
            Name
          </label>
          <input
            id="milestone-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Steel Delivery"
            className="w-full rounded-lg border border-white/15 bg-[#1e293b] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500/60"
            data-ocid="milestones.custom_name_input"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="milestone-date-input"
            className="text-xs text-gray-400 mb-1 block"
          >
            Target Date
          </label>
          <input
            id="milestone-date-input"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#1e293b] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500/60"
            data-ocid="milestones.custom_date_input"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
          data-ocid="milestones.custom_cancel_button"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (name.trim() && targetDate) onSave(name.trim(), targetDate);
          }}
          disabled={!name.trim() || !targetDate}
          className="bg-green-600 hover:bg-green-500 text-white"
          data-ocid="milestones.custom_save_button"
        >
          <Check className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}

// ── Delete confirm dialog ─────────────────────────────────────────────

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
}: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl border border-white/10 bg-[#1e293b] p-6 shadow-2xl max-w-sm w-full mx-4">
        <h3 className="font-semibold text-white mb-2">Delete Milestone?</h3>
        <p className="text-sm text-gray-400 mb-5">
          Remove{" "}
          <span className="text-white font-medium">&ldquo;{name}&rdquo;</span>{" "}
          from custom milestones? This cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
            data-ocid="milestones.delete_cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-500 text-white"
            data-ocid="milestones.delete_confirm_button"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── PDF Export Modal ────────────────────────────────────────────────

function ExportModal({
  onClose,
  onExport,
  isExporting,
}: {
  onClose: () => void;
  onExport: (opts: ExportOption) => void;
  isExporting: boolean;
}) {
  const [selected, setSelected] = useState<ExportOption>("both");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl border border-white/10 bg-[#1e293b] p-6 shadow-2xl max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Printer className="h-4 w-4 text-[#0ea5e9]" />
            Export PDF
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            data-ocid="milestones.export_modal_close_button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Choose which charts to include. Colors and critical path highlights
          are preserved.
        </p>
        <div className="space-y-2 mb-5">
          {[
            { value: "timeline" as ExportOption, label: "Timeline Graph" },
            { value: "chart" as ExportOption, label: "Bar Chart" },
            { value: "both" as ExportOption, label: "Both Charts" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                selected === opt.value
                  ? "border-[#0ea5e9]/60 bg-[#0ea5e9]/10 text-white"
                  : "border-white/10 bg-[#0f172a] text-gray-300 hover:bg-white/5"
              }`}
            >
              <input
                type="radio"
                name="export-option"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-[#0ea5e9]"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            data-ocid="milestones.export_cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isExporting}
            onClick={() => onExport(selected)}
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
            data-ocid="milestones.export_submit_button"
          >
            {isExporting ? "Exporting…" : "Export PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "bg-[#0ea5e9]/20 text-[#38bdf8] ring-1 ring-[#0ea5e9]/50"
          : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────

function buildGanttPhases(phases: Phase[]): GanttPhase[] {
  const sorted = [...phases].sort(
    (a, b) => Number(a.phaseOrder) - Number(b.phaseOrder),
  );
  return sorted.map((p, idx) => ({
    id: p.id.toString(),
    name: p.name,
    startOffset: Number(p.startOffset),
    endOffset: Number(p.endOffset),
    dependencies: idx > 0 ? [sorted[idx - 1].id.toString()] : [],
  }));
}

export default function MilestonesPage() {
  const { data: phases, isLoading: phasesLoading } = usePhases();
  const ganttPhases = useMemo(() => buildGanttPhases(phases ?? []), [phases]);
  const { data: cpNodes, isLoading: cpLoading } = useCriticalPath(ganttPhases);

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  // Custom milestones
  const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>(
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [editingCustom, setEditingCustom] = useState<CustomMilestone | null>(
    null,
  );
  const [deletingCustom, setDeletingCustom] = useState<CustomMilestone | null>(
    null,
  );

  // PDF export
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);

  const isLoading = phasesLoading || cpLoading;

  // Build cpMap keyed by phaseName
  const cpMap = useMemo(() => {
    const m = new Map<string, CriticalPathNode>();
    for (const node of cpNodes ?? []) m.set(node.phaseName, node);
    return m;
  }, [cpNodes]);

  // Derive milestones from phases
  const allMilestones = useMemo((): Milestone[] => {
    if (!phases) return [];
    const result: Milestone[] = [];
    for (const phase of phases) {
      const startDay = Number(phase.startOffset);
      const endDay = Number(phase.endOffset);
      const duration = endDay - startDay;
      const cp = cpMap.get(phase.name);
      const isCritical = cp?.isCritical ?? false;
      const earlyStart = cp?.earlyStart ?? startDay;
      const earlyFinish = cp?.earlyFinish ?? endDay;
      const lateStart = cp?.lateStart ?? startDay;
      const lateFinish = cp?.lateFinish ?? endDay;
      const totalSlack = cp?.totalSlack ?? 0;

      result.push({
        id: `${phase.name}-start`,
        name: `${phase.name} Start`,
        phaseName: phase.name,
        day: startDay,
        type: "start",
        isCritical,
        earlyStart,
        earlyFinish,
        lateStart,
        lateFinish,
        totalSlack,
        duration,
      });
      result.push({
        id: `${phase.name}-finish`,
        name: `${phase.name} Finish`,
        phaseName: phase.name,
        day: endDay,
        type: "finish",
        isCritical,
        earlyStart,
        earlyFinish,
        lateStart,
        lateFinish,
        totalSlack,
        duration,
      });
    }
    return result.sort((a, b) => a.day - b.day);
  }, [phases, cpMap]);

  // Unique phase names for "By Phase" filter
  const phaseNames = useMemo(
    () => [...new Set(allMilestones.map((m) => m.phaseName))],
    [allMilestones],
  );

  // Apply filters
  const milestones = useMemo(() => {
    let filtered = allMilestones;
    if (filterMode === "critical")
      filtered = filtered.filter((m) => m.isCritical);
    else if (filterMode === "noncritical")
      filtered = filtered.filter((m) => !m.isCritical);
    else if (filterMode === "byphase" && selectedPhase)
      filtered = filtered.filter((m) => m.phaseName === selectedPhase);
    return filtered;
  }, [allMilestones, filterMode, selectedPhase]);

  // Summary stats
  const totalMilestones = allMilestones.length;
  const criticalCount = allMilestones.filter((m) => m.isCritical).length;
  const projectSpan =
    allMilestones.length > 0
      ? Math.max(...allMilestones.map((m) => m.day)) -
        Math.min(...allMilestones.map((m) => m.day))
      : 0;
  const avgSlack =
    allMilestones.length > 0
      ? allMilestones.reduce((s, m) => s + m.totalSlack, 0) /
        allMilestones.length
      : 0;

  // Phase bands for timeline reference lines
  const phaseBands = useMemo((): PhaseBand[] => {
    if (!phases) return [];
    return phases.map((p, i) => ({
      label: p.name,
      start: Number(p.startOffset),
      stroke: BAND_STROKES[i % BAND_STROKES.length],
    }));
  }, [phases]);

  // Scatter data — phase milestones
  const scatterData = useMemo(
    () => milestones.map((m, i) => ({ ...m, y: (i % 5) + 1, isCustom: false })),
    [milestones],
  );

  // Custom milestones scatter data — at y=6
  const customScatterData = useMemo(
    () =>
      customMilestones.map((cm) => ({
        id: cm.id,
        name: `✦ ${cm.name}`,
        customName: cm.name,
        phaseName: "Custom",
        day: parseDateToDay(cm.targetDate),
        type: "start" as const,
        isCritical: false,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        totalSlack: 0,
        duration: 0,
        y: 6,
        isCustom: true,
      })),
    [customMilestones],
  );

  // Bar chart data — one row per phase + custom milestones
  const barData = useMemo(() => {
    const seen = new Set<string>();
    const data: Array<{
      name: string;
      "Planned Duration": number;
      "Float / Slack": number;
      "Early Finish": number;
      isCustom?: boolean;
    }> = [];
    for (const m of milestones) {
      if (seen.has(m.phaseName)) continue;
      seen.add(m.phaseName);
      data.push({
        name: truncate(m.phaseName, 15),
        "Planned Duration": Math.max(0, m.duration),
        "Float / Slack": Math.max(0, m.totalSlack),
        "Early Finish": m.earlyFinish,
        isCustom: false,
      });
    }
    for (const cm of customMilestones) {
      data.push({
        name: truncate(`✦ ${cm.name}`, 15),
        "Planned Duration": 0,
        "Float / Slack": 0,
        "Early Finish": parseDateToDay(cm.targetDate),
        isCustom: true,
      });
    }
    return data;
  }, [milestones, customMilestones]);

  const domainMax =
    allMilestones.length > 0
      ? Math.max(...allMilestones.map((m) => m.day)) + 10
      : 100;

  const showTimeline = viewMode === "both" || viewMode === "timeline";
  const showBarChart = viewMode === "both" || viewMode === "chart";

  // ── PDF export handler
  const handleExport = useCallback(async (opts: ExportOption) => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 30;
      const usableW = pageW - margin * 2;

      const addPage = async (
        ref: React.RefObject<HTMLDivElement | null>,
        title: string,
        isFirst: boolean,
      ) => {
        if (!ref.current) return;
        const canvas = await html2canvas(ref.current, {
          backgroundColor: "#1e293b",
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");
        if (!isFirst) pdf.addPage();
        pdf.setFillColor(30, 41, 59);
        pdf.rect(0, 0, pageW, pageH, "F");
        pdf.setFontSize(14);
        pdf.setTextColor(14, 165, 233);
        pdf.text(title, margin, margin + 4);
        const ratio = canvas.width / canvas.height;
        const imgH = usableW / ratio;
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin + 20,
          usableW,
          Math.min(imgH, pageH - margin * 2 - 30),
        );
      };

      if (opts === "timeline" || opts === "both") {
        await addPage(timelineRef, "Project Milestones — Timeline Graph", true);
      }
      if (opts === "chart") {
        await addPage(
          barChartRef,
          "Project Milestones — Bar Chart Comparison",
          true,
        );
      } else if (opts === "both") {
        await addPage(
          barChartRef,
          "Project Milestones — Bar Chart Comparison",
          false,
        );
      }

      pdf.save("milestones-export.pdf");
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  }, []);

  // ── Custom milestone handlers
  const handleSaveCustom = (name: string, targetDate: string) => {
    if (editingCustom) {
      setCustomMilestones((prev) =>
        prev.map((cm) =>
          cm.id === editingCustom.id ? { ...cm, name, targetDate } : cm,
        ),
      );
      setEditingCustom(null);
    } else {
      setCustomMilestones((prev) => [
        ...prev,
        { id: Date.now().toString(), name, targetDate },
      ]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    if (deletingCustom) {
      setCustomMilestones((prev) =>
        prev.filter((c) => c.id !== deletingCustom.id),
      );
      setDeletingCustom(null);
    }
  };

  const navigateToCriticalPath = (phaseName: string) => {
    window.location.href = `/critical-path?phase=${encodeURIComponent(phaseName)}`;
  };

  // ── Loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="milestones.page">
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  // ── Empty state
  if (!phases || phases.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#1e293b] py-20 text-center"
        data-ocid="milestones.empty_state"
      >
        <Flag className="mb-4 h-12 w-12 text-[#0ea5e9]/50" />
        <h2 className="font-display text-xl font-bold text-white">
          No Milestones Yet
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-400">
          Project phases haven&#39;t been defined yet. Head to Project Setup to
          create your schedule phases — milestones will appear here
          automatically.
        </p>
        <a href="/project-setup">
          <Button
            type="button"
            className="mt-6"
            variant="outline"
            data-ocid="milestones.setup_link"
          >
            Go to Project Setup
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="milestones.page">
      {/* ── Delete confirm dialog ── */}
      {deletingCustom && (
        <DeleteConfirm
          name={deletingCustom.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingCustom(null)}
        />
      )}

      {/* ── PDF Export Modal ── */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1e293b] px-6 py-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Flag className="h-6 w-6 text-[#0ea5e9]" />
            Project Milestones
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            All activity milestones — timeline graph and bar chart comparison
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCustom(null);
              setShowForm(true);
            }}
            className="border-green-500/40 text-green-300 hover:bg-green-500/10"
            data-ocid="milestones.add_milestone_button"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Milestone
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="border-white/20 text-gray-300 hover:bg-white/10"
            data-ocid="milestones.export_button"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* ── Add / Edit Milestone Form ── */}
      {(showForm || editingCustom) && (
        <MilestoneForm
          initial={editingCustom ?? undefined}
          onSave={handleSaveCustom}
          onCancel={() => {
            setShowForm(false);
            setEditingCustom(null);
          }}
        />
      )}

      {/* ── Summary stats ── */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        data-ocid="milestones.stats_row"
      >
        <StatCard
          icon={<Flag className="h-5 w-5" />}
          label="Total Milestones"
          value={totalMilestones}
          accent="#38bdf8"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Critical Milestones"
          value={criticalCount}
          accent="#ef4444"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Project Span"
          value={`${projectSpan} days`}
          accent="#f59e0b"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Float / Slack"
          value={`${avgSlack.toFixed(1)} days`}
          accent="#34d399"
        />
      </div>

      {/* ── Controls row ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1e293b] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter chips */}
        <div
          className="flex flex-wrap gap-2"
          data-ocid="milestones.filter_chips"
        >
          <FilterChip
            active={filterMode === "all"}
            onClick={() => {
              setFilterMode("all");
              setSelectedPhase(null);
            }}
          >
            All
          </FilterChip>
          <FilterChip
            active={filterMode === "critical"}
            onClick={() => {
              setFilterMode("critical");
              setSelectedPhase(null);
            }}
          >
            Critical Only
          </FilterChip>
          <FilterChip
            active={filterMode === "noncritical"}
            onClick={() => {
              setFilterMode("noncritical");
              setSelectedPhase(null);
            }}
          >
            Non-Critical
          </FilterChip>
          <FilterChip
            active={filterMode === "byphase"}
            onClick={() => setFilterMode("byphase")}
          >
            By Phase
          </FilterChip>
          {filterMode === "byphase" &&
            phaseNames.map((pn) => (
              <FilterChip
                key={pn}
                active={selectedPhase === pn}
                onClick={() => setSelectedPhase(pn)}
              >
                {truncate(pn, 18)}
              </FilterChip>
            ))}
        </div>

        {/* View mode toggle */}
        <div
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0f172a] p-1 shrink-0"
          data-ocid="milestones.view_toggle"
        >
          <ViewToggle
            active={viewMode === "both"}
            onClick={() => setViewMode("both")}
          >
            Both
          </ViewToggle>
          <ViewToggle
            active={viewMode === "timeline"}
            onClick={() => setViewMode("timeline")}
          >
            Timeline Only
          </ViewToggle>
          <ViewToggle
            active={viewMode === "chart"}
            onClick={() => setViewMode("chart")}
          >
            Chart Only
          </ViewToggle>
        </div>
      </div>

      {/* Active filter badge */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-[#0ea5e9]/15 text-[#38bdf8] border-[#0ea5e9]/30 text-xs"
          data-ocid="milestones.count_badge"
        >
          Showing {milestones.length} of {totalMilestones} milestones
        </Badge>
        {customMilestones.length > 0 && (
          <Badge
            variant="secondary"
            className="bg-green-500/15 text-green-400 border-green-500/30 text-xs"
          >
            ✦ {customMilestones.length} custom
          </Badge>
        )}
        {filterMode === "critical" && (
          <Badge
            variant="secondary"
            className="bg-red-500/15 text-red-400 border-red-500/30 text-xs"
          >
            <AlertTriangle className="mr-1 h-3 w-3" /> Critical Path Active
          </Badge>
        )}
      </div>

      {/* ── Timeline Graph ── */}
      {showTimeline && (
        <div
          ref={timelineRef}
          className="rounded-xl border border-white/10 bg-[#1e293b] px-5 py-5"
          data-ocid="milestones.timeline_section"
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Activity className="h-5 w-5 text-[#0ea5e9]" />
            <h2 className="font-display text-lg font-semibold text-white">
              Timeline Graph
            </h2>
            <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rotate-45 bg-red-500" />
                Critical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rotate-45 bg-[#0ea5e9]" />
                Non-Critical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rotate-45 bg-green-500" />
                Custom
              </span>
            </div>
          </div>

          {milestones.length === 0 && customMilestones.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No milestones match the current filter.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart
                margin={{ top: 20, right: 30, bottom: 40, left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  type="number"
                  dataKey="day"
                  name="Project Day"
                  domain={[0, domainMax]}
                  tickFormatter={fmtDay}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  label={{
                    value: "Project Day",
                    position: "insideBottom",
                    offset: -25,
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                />
                <YAxis type="number" dataKey="y" domain={[0, 8]} hide />
                {/* Phase boundary reference lines */}
                {phaseBands.map((band) => (
                  <ReferenceLine
                    key={`band-${band.label}`}
                    x={band.start}
                    stroke={band.stroke}
                    strokeDasharray="4 3"
                    label={{
                      value: truncate(band.label, 10),
                      position: "top",
                      fill: "#64748b",
                      fontSize: 9,
                    }}
                  />
                ))}
                <RechartsTooltip
                  content={<ScatterTooltipContent />}
                  cursor={false}
                />
                {/* Phase milestones scatter */}
                <Scatter
                  data={scatterData}
                  shape={(props: unknown) => {
                    const p = props as {
                      cx?: number;
                      cy?: number;
                      payload?: Milestone & { isCustom?: boolean };
                    };
                    return (
                      <DiamondDot cx={p.cx} cy={p.cy} payload={p.payload} />
                    );
                  }}
                  isAnimationActive={false}
                />
                {/* Custom milestones scatter — green diamonds */}
                {customScatterData.length > 0 && (
                  <Scatter
                    data={customScatterData}
                    shape={(props: unknown) => {
                      const p = props as {
                        cx?: number;
                        cy?: number;
                        payload?: Milestone & { isCustom?: boolean };
                      };
                      return (
                        <DiamondDot cx={p.cx} cy={p.cy} payload={p.payload} />
                      );
                    }}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── Bar Chart Comparison ── */}
      {showBarChart && (
        <div
          ref={barChartRef}
          className="rounded-xl border border-white/10 bg-[#1e293b] px-5 py-5"
          data-ocid="milestones.barchart_section"
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <BarChart3 className="h-5 w-5 text-[#f59e0b]" />
            <h2 className="font-display text-lg font-semibold text-white">
              Bar Chart Comparison
            </h2>
            <p className="ml-auto text-xs text-gray-500">
              Grouped by phase — planned duration, float, and early finish
            </p>
          </div>

          {barData.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No milestones match the current filter.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={barData}
                margin={{ top: 10, right: 30, bottom: 60, left: 10 }}
                barCategoryGap="25%"
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  label={{
                    value: "Days",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                />
                <RechartsTooltip
                  content={<BarTooltipContent milestones={milestones} />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: 12,
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                />
                <Bar
                  dataKey="Planned Duration"
                  fill="#0ea5e9"
                  radius={[3, 3, 0, 0]}
                >
                  {barData.map((entry) => (
                    <Cell
                      key={`dur-${entry.name}`}
                      fill={entry.isCustom ? "#22c55e" : "#0ea5e9"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="Float / Slack"
                  fill="#34d399"
                  radius={[3, 3, 0, 0]}
                >
                  {barData.map((entry) => (
                    <Cell
                      key={`slack-${entry.name}`}
                      fill={entry.isCustom ? "#16a34a" : "#34d399"}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="Early Finish"
                  fill="#f59e0b"
                  radius={[3, 3, 0, 0]}
                >
                  {barData.map((entry) => (
                    <Cell
                      key={`ef-${entry.name}`}
                      fill={entry.isCustom ? "#15803d" : "#f59e0b"}
                      opacity={0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── Phase Milestone Cards (clickable → Critical Path) ── */}
      <div className="space-y-3" data-ocid="milestones.phase_cards_section">
        <h2 className="font-display text-base font-semibold text-white px-1 flex items-center gap-2">
          <Flag className="h-4 w-4 text-[#0ea5e9]" />
          Phase Milestones
          <span className="text-xs text-gray-500 font-normal">
            (click to view in Critical Path)
          </span>
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {phaseNames.map((phaseName, idx) => {
            const phaseMilestones = allMilestones.filter(
              (m) => m.phaseName === phaseName,
            );
            const start = phaseMilestones.find((m) => m.type === "start");
            const finish = phaseMilestones.find((m) => m.type === "finish");
            const isCritical = start?.isCritical ?? false;
            return (
              <button
                key={phaseName}
                type="button"
                onClick={() => navigateToCriticalPath(phaseName)}
                className={`text-left rounded-xl border px-4 py-3 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                  isCritical
                    ? "border-red-500/40 bg-red-500/5 hover:bg-red-500/10"
                    : "border-white/10 bg-[#1e293b] hover:bg-white/5"
                }`}
                data-ocid={`milestones.phase_card.${idx + 1}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white truncate max-w-[70%]">
                    {phaseName}
                  </p>
                  {isCritical ? (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] shrink-0">
                      Critical
                    </Badge>
                  ) : (
                    <Badge className="bg-[#0ea5e9]/15 text-[#38bdf8] border-[#0ea5e9]/30 text-[10px] shrink-0">
                      On Schedule
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>
                    Start:{" "}
                    <span className="text-gray-200">
                      Day {start?.day ?? "—"}
                    </span>
                  </span>
                  <span>
                    Finish:{" "}
                    <span className="text-gray-200">
                      Day {finish?.day ?? "—"}
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[#0ea5e9]/70 flex items-center gap-1">
                  <Activity className="h-3 w-3" /> View in Critical Path →
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Custom Milestone Cards ── */}
      {customMilestones.length > 0 && (
        <div className="space-y-3" data-ocid="milestones.custom_cards_section">
          <h2 className="font-display text-base font-semibold text-white px-1 flex items-center gap-2">
            <span className="text-green-400">✦</span>
            Custom Milestones
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {customMilestones.map((cm, idx) => (
              <div
                key={cm.id}
                className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3"
                data-ocid={`milestones.custom_card.${idx + 1}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white truncate max-w-[60%]">
                    {cm.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${cm.name}`}
                      onClick={() => {
                        setEditingCustom(cm);
                        setShowForm(false);
                      }}
                      className="rounded p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      data-ocid={`milestones.custom_edit_button.${idx + 1}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${cm.name}`}
                      onClick={() => setDeletingCustom(cm)}
                      className="rounded p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      data-ocid={`milestones.custom_delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Target:{" "}
                  <span className="text-green-300">{cm.targetDate}</span>
                </p>
                <Badge className="mt-2 bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
                  Custom
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
