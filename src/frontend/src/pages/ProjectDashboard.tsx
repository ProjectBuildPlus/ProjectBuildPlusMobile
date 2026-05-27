import { BaselineType } from "@/backend";
import { CategoryFilterBar } from "@/components/CategoryFilterBar";
import { MobileAccessPanel } from "@/components/MobileAccessPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PROJECT_CATEGORIES,
  getCategoryById,
  getSubtopicById,
} from "@/data/projectCategories";
import { useActiveFilter, useActiveFilterStore } from "@/hooks/useActiveFilter";
import {
  useDismissDrawingNotification,
  useDrawingNotifications,
  useDrawingsList,
} from "@/hooks/useDrawings";
import { useParticipantsList } from "@/hooks/useParticipants";
import {
  useCumulativeCashRequirement,
  usePhases,
  useProjectEVMSummary,
} from "@/hooks/useQueries";
import { useScenariosList } from "@/hooks/useScenarios";
import { useGenerateShareLink } from "@/hooks/useShareLinks";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Eye,
  FileText,
  Flag,
  FolderOpen,
  GitBranch,
  GitCompare,
  Layers,
  Link2,
  Printer,
  Share2,
  Shield,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SectionConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: "schedule",
    label: "Schedule Phases",
    icon: <Layers className="h-5 w-5" />,
    to: "/project-setup",
  },
  {
    id: "cash",
    label: "Cash Requirement Curve",
    icon: <DollarSign className="h-5 w-5" />,
    to: "/cash-requirement",
  },
  {
    id: "sov",
    label: "Schedule of Values",
    icon: <BarChart3 className="h-5 w-5" />,
    to: "/cash-requirement",
  },
  {
    id: "evm",
    label: "Earned Value Management",
    icon: <TrendingUp className="h-5 w-5" />,
    to: "/earned-value",
  },
  {
    id: "participants",
    label: "Participants",
    icon: <Users className="h-5 w-5" />,
    to: "/participants",
  },
  {
    id: "benchmarks",
    label: "RSMeans Benchmarks",
    icon: <ClipboardList className="h-5 w-5" />,
    to: "/benchmarks",
  },
  {
    id: "scenarios",
    label: "Scenarios",
    icon: <GitCompare className="h-5 w-5" />,
    to: "/scenarios",
  },
  {
    id: "drawings",
    label: "Drawings & Documents",
    icon: <FileText className="h-5 w-5" />,
    to: "/drawings",
  },
  {
    id: "autodesk",
    label: "AutoDesk",
    icon: <FolderOpen className="h-5 w-5" />,
    to: "/autodesk",
  },
];

function StatPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function relativeTime(ts: bigint | number): string {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function SectionShell({
  section,
  defaultOpen = true,
  children,
}: {
  section: SectionConfig;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left
              hover:bg-muted/40 transition-colors"
            data-ocid={`dashboard.${section.id}.toggle`}
            aria-expanded={open}
          >
            <div className="flex items-center gap-3">
              <span className="text-primary">{section.icon}</span>
              <span className="font-display font-semibold text-foreground">
                {section.label}
              </span>
            </div>
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <div className="px-5 py-4">{children}</div>
          <div className="px-5 pb-4">
            <Link to={section.to}>
              <Button
                variant="outline"
                size="sm"
                data-ocid={`dashboard.${section.id}.view_button`}
              >
                View Full
              </Button>
            </Link>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function fmt(n: number | undefined, prefix = "") {
  if (n === undefined || Number.isNaN(n)) return "—";
  return `${prefix}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function fmtCurrency(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) return "—";
  return `$${(n / 1_000).toLocaleString("en-US", { maximumFractionDigits: 0 })}k`;
}

export default function ProjectDashboard() {
  useActiveFilter(); // keeps store synced from backend

  const { activeCategoryId, activeSubtopicId } = useActiveFilterStore();
  const { data: phases, isLoading: phasesLoading } = usePhases();
  const { data: cashPoints, isLoading: cashLoading } =
    useCumulativeCashRequirement();
  const { data: evmSummary, isLoading: evmLoading } = useProjectEVMSummary(
    BaselineType.original,
  );
  const { data: participants, isLoading: participantsLoading } =
    useParticipantsList();
  const { data: scenarios, isLoading: scenariosLoading } = useScenariosList();
  const { data: drawings, isLoading: drawingsLoading } = useDrawingsList();
  const { data: allNotifications } = useDrawingNotifications();
  const dismissNotification = useDismissDrawingNotification();
  const generateShareLink = useGenerateShareLink();

  const activeNotifications = (allNotifications ?? []).filter(
    (n) => !n.dismissed,
  );
  const pendingReviewCount = activeNotifications.length;

  const categoryLabel = activeCategoryId
    ? (getCategoryById(activeCategoryId)?.name ?? activeCategoryId)
    : null;
  const subtopicLabel =
    activeCategoryId && activeSubtopicId
      ? (getSubtopicById(activeCategoryId, activeSubtopicId)?.name ??
        activeSubtopicId)
      : null;

  const totalBudget =
    phases?.reduce((sum, p) => sum + p.requiredCash + p.scheduleOfValues, 0) ??
    0;
  const totalCashReq =
    cashPoints && cashPoints.length > 0
      ? cashPoints[cashPoints.length - 1].cumulativeCash
      : 0;

  const approvedParticipants =
    participants?.filter((p) => p.status === "approved").length ?? 0;

  const activeScenarios = scenarios?.length ?? 0;

  async function handleShare() {
    try {
      const link = await generateShareLink.mutateAsync("default");
      const url = `${window.location.origin}/share/${link.token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!", {
        description: url,
        duration: 5000,
      });
    } catch {
      toast.error("Failed to generate share link");
    }
  }

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Construction Project Management & Design Intelligence
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Unified view of all project modules
            </p>
            {(categoryLabel || subtopicLabel) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {categoryLabel && (
                  <Badge variant="secondary" className="text-xs">
                    {categoryLabel}
                  </Badge>
                )}
                {subtopicLabel && (
                  <Badge variant="outline" className="text-xs">
                    {subtopicLabel}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={generateShareLink.isPending}
              data-ocid="dashboard.share_button"
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              {generateShareLink.isPending ? "Generating…" : "Share"}
            </Button>
            <Link to="/export">
              <Button
                variant="outline"
                size="sm"
                data-ocid="dashboard.export_button"
              >
                <Printer className="mr-1.5 h-4 w-4" />
                Print / Export
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-4 pt-4 border-t border-border">
          <CategoryFilterBar />
        </div>
      </div>

      {/* Drawing Review Notifications */}
      {pendingReviewCount > 0 && (
        <div
          className="rounded-xl border border-amber-500/40 bg-amber-500/8 px-5 py-4 space-y-3"
          data-ocid="dashboard.review_notifications.panel"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <Bell className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-foreground">
                Drawing Review Requests
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingReviewCount} pending review
                {pendingReviewCount !== 1 ? "s" : ""} — added as OAC Meeting
                addenda
              </p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs"
              data-ocid="dashboard.review_notifications.badge"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {pendingReviewCount}
            </Badge>
          </div>
          <div className="space-y-2">
            {activeNotifications.map((notification, idx) => (
              <div
                key={notification.id}
                className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                data-ocid={`dashboard.review_notification.item.${idx + 1}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span className="font-medium text-sm text-foreground truncate">
                      {notification.drawingName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-500/40 text-amber-300"
                    >
                      Review Requested
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requested by{" "}
                    <span className="font-medium text-foreground">
                      {notification.requestedBy}
                    </span>
                    {" · "}
                    {relativeTime(notification.requestedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to="/drawings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/20"
                      data-ocid={`dashboard.review_notification.view_drawing.${idx + 1}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Drawing
                    </Button>
                  </Link>
                  <Link to="/oac-meeting">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/20"
                      data-ocid={`dashboard.review_notification.view_oac.${idx + 1}`}
                    >
                      View in OAC Meeting
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-amber-500/20 text-muted-foreground hover:text-foreground"
                    aria-label="Dismiss notification"
                    onClick={() => dismissNotification.mutate(notification.id)}
                    data-ocid={`dashboard.review_notification.dismiss.${idx + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {/* Schedule Phases */}
        <SectionShell section={SECTIONS[0]}>
          {phasesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-6">
              <StatPill label="Total Phases" value={phases?.length ?? 0} />
              <StatPill label="Total Budget" value={fmtCurrency(totalBudget)} />
              <StatPill
                label="Avg Crash Factor"
                value={
                  phases && phases.length > 0
                    ? fmt(
                        phases.reduce((s, p) => s + p.crashFactor, 0) /
                          phases.length,
                      )
                    : "—"
                }
              />
              <StatPill
                label="Avg Resource Mult."
                value={
                  phases && phases.length > 0
                    ? fmt(
                        phases.reduce((s, p) => s + p.resourceMultiplier, 0) /
                          phases.length,
                      )
                    : "—"
                }
              />
            </div>
          )}
        </SectionShell>

        {/* Cash Requirement */}
        <SectionShell section={SECTIONS[1]}>
          {cashLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-6">
              <StatPill
                label="Total Cash Required"
                value={fmtCurrency(totalCashReq)}
              />
              <StatPill label="Data Points" value={cashPoints?.length ?? 0} />
              <StatPill
                label="Peak Phase"
                value={
                  cashPoints && cashPoints.length > 0
                    ? cashPoints.reduce((a, b) =>
                        a.cumulativeCash > b.cumulativeCash ? a : b,
                      ).phaseName
                    : "—"
                }
              />
            </div>
          )}
        </SectionShell>

        {/* Schedule of Values */}
        <SectionShell section={SECTIONS[2]} defaultOpen={false}>
          {phasesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-6">
              <StatPill
                label="Total SOV"
                value={fmtCurrency(
                  phases?.reduce((s, p) => s + p.scheduleOfValues, 0),
                )}
              />
              <StatPill
                label="Phases w/ SOV"
                value={
                  phases?.filter((p) => p.scheduleOfValues > 0).length ?? 0
                }
              />
            </div>
          )}
        </SectionShell>

        {/* EVM */}
        <SectionShell section={SECTIONS[3]}>
          {evmLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-6">
              <StatPill label="CPI" value={fmt(evmSummary?.projectCPI)} />
              <StatPill label="SPI" value={fmt(evmSummary?.projectSPI)} />
              <StatPill
                label="Cost Variance"
                value={
                  <span
                    className={
                      (evmSummary?.totalCV ?? 0) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {fmtCurrency(evmSummary?.totalCV)}
                  </span>
                }
              />
              <StatPill
                label="Schedule Variance"
                value={
                  <span
                    className={
                      (evmSummary?.totalSV ?? 0) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {fmtCurrency(evmSummary?.totalSV)}
                  </span>
                }
              />
              <StatPill
                label="Earned Value"
                value={fmtCurrency(evmSummary?.totalEV)}
              />
              <StatPill
                label="Actual Cost"
                value={fmtCurrency(evmSummary?.totalAC)}
              />
            </div>
          )}
        </SectionShell>

        {/* Participants */}
        <SectionShell section={SECTIONS[4]}>
          {participantsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-6">
              <StatPill
                label="Total Participants"
                value={participants?.length ?? 0}
              />
              <StatPill label="Approved" value={approvedParticipants} />
              <StatPill
                label="Pending"
                value={
                  participants?.filter((p) => p.status === "pending").length ??
                  0
                }
              />
            </div>
          )}
        </SectionShell>

        {/* Benchmarks */}
        <SectionShell section={SECTIONS[5]} defaultOpen={false}>
          <div className="flex flex-wrap gap-6">
            <StatPill
              label="RSMeans Mode"
              value={
                <span className="flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5" />
                  Live API / Manual
                </span>
              }
            />
            <StatPill label="CSI Divisions" value={"16 tracked"} />
          </div>
        </SectionShell>

        {/* Scenarios */}
        <SectionShell section={SECTIONS[6]} defaultOpen={false}>
          {scenariosLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-6">
              <StatPill label="Active Scenarios" value={activeScenarios} />
              <StatPill
                label="Latest Scenario"
                value={
                  scenarios && scenarios.length > 0
                    ? scenarios[scenarios.length - 1].name
                    : "None"
                }
              />
            </div>
          )}
        </SectionShell>
        {/* Drawings & Documents */}
        <SectionShell section={SECTIONS[7]} defaultOpen={false}>
          {drawingsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-6 items-start">
              <StatPill label="Total Drawings" value={drawings?.length ?? 0} />
              <StatPill
                label="Photographs"
                value={
                  drawings?.filter((d) => d.category === "Photographs")
                    .length ?? 0
                }
              />
              <StatPill
                label="Blueprints"
                value={
                  drawings?.filter((d) => d.category === "Blueprints").length ??
                  0
                }
              />
              <StatPill
                label="CAD Files"
                value={
                  drawings?.filter((d) => d.category === "CADFiles").length ?? 0
                }
              />
              {pendingReviewCount > 0 && (
                <StatPill
                  label="Pending Reviews"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs"
                        data-ocid="dashboard.drawings.pending_reviews_badge"
                      >
                        {pendingReviewCount} pending
                      </Badge>
                    </span>
                  }
                />
              )}
            </div>
          )}
        </SectionShell>

        {/* Cost Schedule & Resource Control + Critical Path quick-access cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/cost-schedule-resource-control"
            data-ocid="dashboard.cost_schedule.card"
          >
            <div
              className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4
                hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground leading-tight">
                  Cost Schedule &amp; Resource Control
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Track resources, idle time, and forecasted spend
                </p>
              </div>
            </div>
          </Link>

          <Link to="/critical-path" data-ocid="dashboard.critical_path.card">
            <div
              className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4
                hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <GitBranch className="h-5 w-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground leading-tight">
                  Critical Path
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Gantt timeline and phase dependencies
                </p>
              </div>
            </div>
          </Link>
          <Link to="/milestones" data-ocid="dashboard.milestones.card">
            <div className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Flag className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground leading-tight">
                  Milestones
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Timeline graph and bar chart comparison
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Milestones quick-access card */}
        <Link to="/milestones" data-ocid="dashboard.milestones.card">
          <div className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Flag className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-foreground leading-tight">
                Milestones
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Phase targets, progress graphs, and budget comparison
              </p>
            </div>
          </div>
        </Link>

        {/* Safety Standards quick-access card */}
        <Link
          to="/safety-standards"
          data-ocid="dashboard.safety_standards.card"
        >
          <div
            className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4
              hover:border-safety/40 hover:bg-safety/5 transition-all cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-safety/10 group-hover:bg-safety/20 transition-colors">
              <Shield className="h-5 w-5 text-safety" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-foreground leading-tight">
                Safety Standards &amp; Compliance
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                OSHA, ANSI, IEEE, NCCER, IBC standards and compliance tracking
              </p>
            </div>
          </div>
        </Link>

        {/* Mobile App Access */}
        <MobileAccessPanel />
      </div>
    </div>
  );
}
