import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Code2,
  Cpu,
  Database,
  FileBox,
  FileText,
  Gauge,
  HardHat,
  Layers,
  LayoutDashboard,
  LineChart,
  Milestone,
  Network,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: HardHat,
    title: "Project Setup & CSI Framework",
    description:
      "16 project categories with 8 subtopics each. Auto-populates phases, CSI cost codes, and compliance requirements on project creation. All modules cross-linked to selected category and subtopic.",
  },
  {
    icon: Activity,
    title: "Scheduling & Critical Path",
    description:
      "Full CPM analysis with Gantt visualization and table view. Early/late dates, float/slack per activity, schedule crashing with per-phase crash factors, and resource leveling with automated redistribution.",
  },
  {
    icon: Milestone,
    title: "Milestones Page",
    description:
      "Dedicated timeline graph and grouped bar chart. Custom milestone creation with name and target date. Clickable milestone cards link to Critical Path page. PDF export with colors and critical path highlights preserved.",
  },
  {
    icon: LineChart,
    title: "Cost Management & EVM",
    description:
      "Cash requirement S-curve, bar chart, and schedule of values. EVM with CPI/SPI indices at phase and cost code level. Baseline selector, scenario comparison tool. Dynamically updates with crashing and leveling.",
  },
  {
    icon: Wrench,
    title: "Resource Tracking",
    description:
      "Labor and equipment tracked at individual and crew level. RSMeans live API with manual fallback. Resource multiplier toggles per phase. Idle time forecasting and variance tracking vs. RSMeans benchmarks.",
  },
  {
    icon: Users,
    title: "Participants & Directory",
    description:
      "Profiles for Architect, Designer, Engineers, Owner, CM, Contractor. Role-based access control, passcode/email approval. Phase and cost code assignment. Project-wide directory with individual billing rates.",
  },
  {
    icon: Shield,
    title: "Compliance & Standards",
    description:
      "OSHA, ANSI, IEEE, NCCER, IBC, and federal/state code library. Standards linked to phases and CSI codes. Compliance checklists with electronic sign-off. NCCER certification tracking. Critical Change Safety Plan tool.",
  },
  {
    icon: Building2,
    title: "OAC Meetings & Collaboration",
    description:
      "Fillable AIA forms (G702, G703, G701, custom minutes, addendum). Zoom API or fixed link with copy-to-clipboard and email invite. All participants visible. Auto-attached addendums from Drawings review requests.",
  },
  {
    icon: FileText,
    title: "Drawings & Documents",
    description:
      "6 type tabs: Photographs, Blueprints, Architect, Construction, CAD Files, Engineering. JPG/PNG/PDF/DWG/DXF upload with progress bar. Inline viewer, download, review request with OAC addendum auto-attach.",
  },
  {
    icon: FileBox,
    title: "AutoDesk Module",
    description:
      "5 category tabs for AutoDesk Files, Drawings, Specs, Mechanical Docs, and Civil Docs. Drag-and-drop upload with progress bar. Autodesk Cloud gateway section with links to cloud services and subscription button.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description:
      "9 tabs: Participants, Documents, Subscriptions, Trial Members, Scheduling, Cost, Resources, Compliance, Bank Account. Each tab has view-only summary + full inline editing. Bank Account tab integrates with Stripe payouts.",
  },
  {
    icon: Settings,
    title: "Controller Profile & Admin Control Panel",
    description:
      "Payment Account section with bank details, payout history, and Stripe link. 4-tab Admin Control Panel: Subscription Management, Recurring Payments, Subscription Access (freeze/unfreeze/cancel), and User Accounts.",
  },
  {
    icon: ClipboardCheck,
    title: "Controller Account Page",
    description:
      "Login history log with timestamps and live active sessions list. Master lock/unlock toggles for 8 app features — locked features stay visible but grayed out. Admin User Management and Controller Email & Password Management.",
  },
  {
    icon: BarChart3,
    title: "Subscriptions & Payments",
    description:
      "Three tiers: $299/mo (1yr), $199/mo (5yr), $99/mo (10yr). 30-day trial with mid-trial switching. Stripe processing with full verification (card, company, EIN, ID, proof of address). Admin review workflow.",
  },
  {
    icon: Zap,
    title: "Security & Access Control",
    description:
      "Dual login: Internet Identity (biometric) and email/password. Email-only entry option for quick access. Controller PIN/passcode gate. Per-feature lock/unlock by controller. On-screen password reset codes.",
  },
  {
    icon: TrendingUp,
    title: "Sharing & Export",
    description:
      "PDF exports for Milestones (timeline + bar chart), reports, and pitch pages. QR codes on dashboard and pitch pages. Shareable read-only project links. Print-to-PDF support. Drawings shareable to all participants.",
  },
];

const dataModelFields = [
  { name: "id", type: "Nat", description: "Unique phase identifier" },
  { name: "name", type: "Text", description: "Phase display name" },
  { name: "phaseOrder", type: "Nat", description: "Execution order index" },
  {
    name: "startOffsetDays",
    type: "Nat",
    description: "Days from project start",
  },
  {
    name: "endOffsetDays",
    type: "Nat",
    description: "Days from project start to phase end",
  },
  {
    name: "requiredCash",
    type: "Float",
    description: "Cash required for the phase (USD)",
  },
  {
    name: "scheduleOfValues",
    type: "Float",
    description: "Contract value allocated to phase (USD)",
  },
  {
    name: "crashFactor",
    type: "Float",
    description: "Timeline compression multiplier (≥0.1)",
  },
  {
    name: "resourceMultiplier",
    type: "Float",
    description: "Resource load adjustment multiplier",
  },
  {
    name: "milestones",
    type: "[Milestone]",
    description: "Phase milestone records (name, targetDate, isCustom)",
  },
  {
    name: "costCodes",
    type: "[CostCode]",
    description: "CSI cost codes assigned to this phase",
  },
];

const costCodeFields = [
  { name: "id", type: "Nat", description: "Unique cost code identifier" },
  { name: "phaseId", type: "Nat", description: "Parent phase identifier" },
  { name: "csiCode", type: "Text", description: "CSI MasterFormat code" },
  { name: "csiDivision", type: "Text", description: "CSI division name" },
  {
    name: "projectNumber",
    type: "Text",
    description: "Project reference number",
  },
  { name: "area", type: "Text", description: "Project area or zone" },
  { name: "operation", type: "Text", description: "Type of work operation" },
  {
    name: "distribution",
    type: "Text",
    description: "Cost distribution method",
  },
  { name: "cost", type: "Float", description: "Cost amount in USD" },
];

const apiEndpoints = [
  {
    name: "getPhases",
    signature: "() -> async [Phase]",
    description:
      "Retrieve all project phases with current crash and leveling settings.",
  },
  {
    name: "upsertPhase",
    signature: "(Phase) -> async Nat",
    description: "Create or update a phase. Returns the phase id.",
  },
  {
    name: "deletePhase",
    signature: "(Nat) -> async ()",
    description: "Remove a phase by id.",
  },
  {
    name: "getMilestones",
    signature: "() -> async [Milestone]",
    description:
      "Retrieve all milestones (auto-generated + custom) with phase linkage.",
  },
  {
    name: "upsertMilestone",
    signature: "(Milestone) -> async Nat",
    description:
      "Create or update a custom milestone with name and target date.",
  },
  {
    name: "deleteMilestone",
    signature: "(Nat) -> async ()",
    description: "Remove a custom milestone by id.",
  },
  {
    name: "getCumulativeCashRequirement",
    signature: "() -> async [{ day: Nat; cumulative: Nat }]",
    description: "Baseline S-curve data: cumulative cash required by day.",
  },
  {
    name: "getCumulativeCrashedRequirement",
    signature: "() -> async [{ day: Nat; cumulative: Nat }]",
    description:
      "Crashed/leveled S-curve reflecting adjusted timelines and costs.",
  },
  {
    name: "getDrawings",
    signature: "() -> async [Drawing]",
    description:
      "Retrieve all uploaded drawings and documents with category and metadata.",
  },
  {
    name: "requestDrawingReview",
    signature: "(Nat, [Principal]) -> async ()",
    description:
      "Submit a drawing review request — generates dashboard notification and OAC addendum.",
  },
];

const PITCH_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/pitch-breakdown`
    : "";

function PresentationQR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, PITCH_URL || "https://caffeine.ai", {
      width: 180,
      margin: 2,
      color: { dark: "#0d1117", light: "#fffbeb" },
      errorCorrectionLevel: "H",
    })
      .then(() => setQrReady(true))
      .catch(() => setQrReady(true));
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(PITCH_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  }

  const copyBtnClass = copied
    ? "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 border-green-500/50 bg-green-500/10 text-green-500"
    : "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20";

  return (
    <section
      className="rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-card p-5 sm:p-8 shadow-subtle"
      data-ocid="pitch_breakdown.share_qr.section"
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div
            className="relative rounded-xl border-2 border-amber-500/40 p-2.5 bg-[oklch(0.98_0.02_85)] shadow-lg"
            data-ocid="pitch_breakdown.share_qr.canvas"
          >
            {!qrReady && (
              <div className="h-[180px] w-[180px] rounded-lg bg-muted/40 animate-pulse" />
            )}
            <canvas
              ref={canvasRef}
              className={
                qrReady
                  ? "rounded-lg opacity-100"
                  : "rounded-lg opacity-0 absolute"
              }
              aria-label="QR code to share this presentation"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start text-center sm:text-left">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Share This Presentation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Scan to open on any device — share live during presentations or
              send to stakeholders before the meeting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <code className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 font-mono text-xs text-amber-600 max-w-[260px] truncate">
              {PITCH_URL || "loading..."}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              data-ocid="pitch_breakdown.share_qr.copy_button"
              className={copyBtnClass}
            >
              {copied ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <rect
                      x="5"
                      y="5"
                      width="8"
                      height="8"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M3 11V3h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Works on iPhone, Android, or any QR scanner app
          </p>
        </div>
      </div>
    </section>
  );
}

export function PitchBreakdown() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Pitch Breakdown
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Public feature overview and internal technical specification for
          Project Build Plus.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList
          className="bg-card border border-border h-auto flex-wrap gap-1 p-1"
          data-ocid="pitch_breakdown.tab_list"
        >
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs sm:text-sm"
            data-ocid="pitch_breakdown.overview_tab"
          >
            Feature Overview
          </TabsTrigger>
          <TabsTrigger
            value="spec"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs sm:text-sm"
            data-ocid="pitch_breakdown.spec_tab"
          >
            Technical Spec
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="mt-4 sm:mt-6 space-y-6 sm:space-y-8"
        >
          <section className="rounded-xl border bg-card p-4 sm:p-6 shadow-subtle">
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
              What Project Build Plus Does
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
              A comprehensive cloud-based construction management platform
              unifying advanced scheduling, cost control, resource management,
              compliance, and team collaboration into a single
              controller-secured hub. 16 project categories auto-populate CSI
              codes, phases, and compliance requirements — with Milestones,
              Drawings, AutoDesk, and full Admin Control Panel built in.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Feature Areas", value: "16" },
                { label: "Project Categories", value: "16" },
                { label: "Subtopics / Category", value: "8" },
                { label: "Admin Dashboard Tabs", value: "9" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border bg-muted/30 p-3 text-center"
                >
                  <div className="font-display text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-4 sm:p-5 shadow-subtle transition-smooth hover:border-primary/30 hover:shadow-md"
                  data-ocid={`pitch_breakdown.feature.item.${index + 1}`}
                >
                  <div className="mb-3 inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-foreground sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="rounded-xl border bg-muted/30 p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
              Why Teams Choose It
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "16 project categories auto-populate phases, CSI codes, and compliance",
                "Dedicated Milestones page with PDF export and Critical Path linkage",
                "AutoDesk module for Autodesk-native file management and cloud gateway",
                "Admin Control Panel: freeze/unfreeze, cancel, and email/password management",
                "Controller Account: login history, active sessions, 8-feature lock/unlock",
                "Stripe payout integration with bank account management in Admin Dashboard",
                "Internet Computer hosting — no cloud servers, globally replicated compute",
                "Dual auth: Internet Identity biometric + email/password + email-only entry",
              ].map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                  data-ocid={`pitch_breakdown.why.item.${i + 1}`}
                >
                  <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>

        <TabsContent
          value="spec"
          className="mt-4 sm:mt-6 space-y-6 sm:space-y-8"
        >
          <section className="rounded-xl border bg-card p-4 sm:p-6 shadow-subtle">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                Data Model
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              The core{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                Phase
              </code>{" "}
              record stored in canister state, including the new{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                milestones
              </code>{" "}
              sub-array for custom and auto-generated milestone tracking.
            </p>
            <div className="mt-4 overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Field
                    </th>
                    <th className="px-3 sm:px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-3 sm:px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dataModelFields.map((field) => (
                    <tr key={field.name} className="hover:bg-muted/30">
                      <td className="px-3 sm:px-4 py-2 font-mono text-xs text-primary">
                        {field.name}
                      </td>
                      <td className="px-3 sm:px-4 py-2 font-mono text-xs text-accent">
                        {field.type}
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-muted-foreground">
                        {field.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                CostCode Sub-type
              </h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Field
                      </th>
                      <th className="px-3 sm:px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Type
                      </th>
                      <th className="px-3 sm:px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {costCodeFields.map((field) => (
                      <tr key={field.name} className="hover:bg-muted/30">
                        <td className="px-3 sm:px-4 py-2 font-mono text-xs text-primary">
                          {field.name}
                        </td>
                        <td className="px-3 sm:px-4 py-2 font-mono text-xs text-accent">
                          {field.type}
                        </td>
                        <td className="px-3 sm:px-4 py-2 text-muted-foreground">
                          {field.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-6 shadow-subtle">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                API Endpoints
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Motoko actor methods exposed to the frontend via generated
              bindings. Now includes milestone CRUD, drawing management, and
              review request endpoints.
            </p>
            <div className="mt-4 space-y-3">
              {apiEndpoints.map((ep) => (
                <div
                  key={ep.name}
                  className="rounded-lg border bg-background p-3 sm:p-4"
                  data-ocid={`pitch_breakdown.api.item.${ep.name}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {ep.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {ep.signature}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ep.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-6 shadow-subtle">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                Performance & Infrastructure
              </h2>
            </div>
            <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Canister State
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Phase data, milestones, drawings metadata, compliance records,
                  and OAC meeting addendums are stored in Motoko stable
                  variables. Upgrades preserve state without external databases.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-accent" />
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Internet Computer Hosting
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deployed on the IC for censorship-resistant, globally
                  replicated compute. No traditional cloud servers required.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Query Latency
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Read operations use IC query calls — sub-second response for
                  phase lists and cash curve data.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-accent" />
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Update Throughput
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Phase mutations are update calls with consensus finality.
                  Optimistic UI with React Query keeps the interface responsive.
                </p>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <PresentationQR />
    </div>
  );
}
