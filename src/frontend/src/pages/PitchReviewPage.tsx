import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  ChevronLeft,
  CreditCard,
  FileText,
  FolderOpen,
  HardHat,
  LayoutDashboard,
  Lock,
  Play,
  Printer,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

const PITCH_REVIEW_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/pitch-review`
    : "https://project-build-plus.caffeine.ai/pitch-review";

const slides = [
  {
    id: 1,
    accentColor: "from-red-600/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-red-600/20 text-red-400 border-red-600/40",
    icon: HardHat,
    iconColor: "text-red-400",
    title: "Project Build Plus",
    subtitle:
      "Cloud-Based Construction Management — Built for Complex Projects",
    description:
      "Project Build Plus is a comprehensive cloud-based construction management platform designed for the most demanding commercial and infrastructure projects. It combines advanced scheduling, cost control, resource management, compliance tracking, and real-time team collaboration into a single unified platform. The app is fully accessible via web and mobile with a single responsive codebase, ensuring stakeholders and field crews have real-time data at their fingertips. Live sync keeps all devices current, and an offline read-only mode ensures uninterrupted access even without connectivity. Dual login options — Internet Identity (device/biometric) and traditional email/password — provide flexible, secure authentication for all project participants.",
    bullets: [
      "Cloud-based SaaS platform accessible from any web browser or mobile device",
      "Live data sync across all connected devices — changes reflect instantly",
      "Offline read-only mode with clear status banners for field crews",
      "Dual login: Internet Identity (biometric/device) + email/password",
      "Controller-secured architecture with PIN/passcode gates on sensitive modules",
      "Unified dashboard bringing every module into a single cohesive view",
      "Designed for US construction standards — public and private sector",
    ],
  },
  {
    id: 2,
    accentColor: "from-blue-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-blue-600/20 text-blue-300 border-blue-500/40",
    icon: FolderOpen,
    iconColor: "text-blue-400",
    title: "Project Type & Setup",
    subtitle:
      "16 Project Categories × 8 Subtopics — Auto-Populated CSI Framework",
    description:
      "Every project begins with a guided type selection system offering 16 industry-standard project categories, each with 8 detailed subtopics covering the full spectrum of construction and engineering work. Upon selection, the platform automatically populates project phases, cost codes aligned to CSI divisions, and compliance requirements — eliminating hours of manual setup. All activities, modules, and data entries are cross-linked to the selected project categories and subtopics, creating a fully integrated data model. This ensures that scheduling milestones, cost codes, resource assignments, and compliance items all trace back to the project's defined scope. The result is a coherent, traceable project record from day one.",
    bullets: [
      "16 project categories: Commercial, Infrastructure, Healthcare, Industrial, and more",
      "8 subtopics per category for granular scope definition",
      "Auto-populated CSI divisions and cost codes on project creation",
      "Phase structures generated from project type selection",
      "All modules cross-linked to categories and subtopics",
      "Compliance requirements pre-loaded based on project type",
      "Fully traceable data model from scope to closeout",
    ],
  },
  {
    id: 3,
    accentColor: "from-cyan-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-cyan-600/20 text-cyan-300 border-cyan-500/40",
    icon: Calendar,
    iconColor: "text-cyan-400",
    title: "Advanced Scheduling",
    subtitle: "Critical Path, Schedule Crashing & Resource Leveling Built-In",
    description:
      "The scheduling engine provides full critical path method (CPM) analysis with Gantt-style visualization and a structured table view showing early start, early finish, late start, late finish, and total float for every activity. Schedule crashing functionality allows project managers to selectively compress durations by applying crash factors per phase, instantly recalculating the critical path and displaying the cost impact. Resource leveling algorithms automatically redistribute over-allocated resources across the schedule to eliminate peaks and valleys. Each phase supports independent crash factor and resource multiplier inputs, giving fine-grained control over the schedule optimization process. The platform tracks both baseline and crashed schedules for comparison and audit purposes.",
    bullets: [
      "Full CPM analysis with Gantt visualization and table view",
      "Early/late start, early/late finish, and total float per activity",
      "Schedule crashing with per-phase crash factor controls",
      "Resource leveling with automated redistribution algorithms",
      "Resource multiplier toggles per phase for scenario modeling",
      "Baseline vs. crashed schedule comparison",
      "Critical path highlighting with float-based color coding",
    ],
  },
  {
    id: 4,
    accentColor: "from-emerald-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-emerald-600/20 text-emerald-300 border-emerald-500/40",
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    title: "Cost & Value Management",
    subtitle: "S-Curves, EVM, CPI/SPI Indices & Scenario Comparison",
    description:
      "The cost management suite delivers enterprise-grade financial control through interactive cash requirement S-curves, bar charts, and schedule of values curves that dynamically update when schedule crashing or resource leveling is applied. Earned Value Management (EVM) provides CPI, SPI, and combined productivity indices at both the phase level and individual cost code level, with a baseline selector allowing comparison against multiple frozen snapshots. A scenario comparison tool enables project teams to model alternative team assignments, resource allocations, and cost impacts side by side before committing to a plan. All cost data integrates directly with CSI cost codes, RSMeans benchmarks, and participant billing rates, ensuring every dollar is traceable to a work item.",
    bullets: [
      "Cash requirement S-curve, bar chart, and schedule of values curve",
      "Dynamic curves that update with schedule crashing and resource leveling",
      "Earned Value Management: CPI, SPI, and combined productivity indices",
      "EVM at phase level and cost code level granularity",
      "Baseline selector for comparison against frozen snapshots",
      "Scenario comparison: model alternative resource and cost allocations",
      "Full CSI code integration for traceable cost breakdowns",
    ],
  },
  {
    id: 5,
    accentColor: "from-orange-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-orange-600/20 text-orange-300 border-orange-500/40",
    icon: Wrench,
    iconColor: "text-orange-400",
    title: "Resource Management",
    subtitle: "Labor, Equipment, RSMeans Integration & Idle Time Forecasting",
    description:
      "Resource management covers both labor and equipment at the individual worker and crew level, with data sourced from RSMeans live API, project participants, manual entry, or cost code breakdowns. The platform supports a live RSMeans enterprise API key for real-time cost benchmarking, with a manual entry fallback for offline or non-API environments. Resource multiplier toggles allow project managers to scale crew sizes or equipment counts per phase without manually editing each activity. Idle time forecasting algorithms identify periods of underutilization and surface them as optimization opportunities. The system tracks variance between RSMeans benchmarks and actual costs, providing continuous productivity feedback throughout the project lifecycle.",
    bullets: [
      "Labor and equipment tracking at individual and crew level",
      "RSMeans live API integration for real-time cost benchmarks",
      "Manual entry fallback for offline environments",
      "Resource multiplier toggles per phase for rapid scaling",
      "Idle time forecasting with underutilization alerts",
      "Variance tracking: RSMeans benchmarks vs. actual costs",
      "Data sourced from participants, cost codes, or manual input",
    ],
  },
  {
    id: 6,
    accentColor: "from-violet-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-violet-600/20 text-violet-300 border-violet-500/40",
    icon: Users,
    iconColor: "text-violet-400",
    title: "Participants & Directory",
    subtitle: "Role-Based Profiles, Access Control & Phase Assignment",
    description:
      "The participants module maintains detailed profiles for every project stakeholder — Architect, Designer, Structural/MEP/Civil Engineers, Owner, Construction Manager, and General Contractor — each linked to specific phases and cost codes. Role-based access control determines which modules and data each participant can view or edit, with passcode and email approval workflows for granting elevated permissions. A project-wide directory provides instant access to all contact information, roles, and assignments. Participants can be assigned to multiple phases and cost codes, allowing the platform to accurately calculate billing rates, resource utilization, and earned value contributions at the individual level. The directory serves as the single source of truth for team composition throughout the project.",
    bullets: [
      "Profiles for Architect, Designer, Engineers, Owner, CM, and Contractor",
      "Role-based access control with granular module permissions",
      "Passcode and email approval workflows for permission escalation",
      "Phase and cost code assignment per participant",
      "Project-wide directory with contact info, roles, and assignments",
      "Individual billing rates for EVM and cost tracking",
      "Single source of truth for team composition throughout project lifecycle",
    ],
  },
  {
    id: 7,
    accentColor: "from-yellow-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-yellow-600/20 text-yellow-300 border-yellow-500/40",
    icon: Shield,
    iconColor: "text-yellow-400",
    title: "Compliance & Standards",
    subtitle: "OSHA, ANSI, IBC, NCCER, IEEE & Critical Change Safety Plans",
    description:
      "The compliance module provides a comprehensive reference library covering OSHA, ANSI, IEEE, NCCER, IBC, and applicable federal and state codes, all filtered and linked to the project's specific phases and CSI codes. Compliance checklists with electronic sign-off workflows ensure that every required inspection, certification, and safety review is documented and attributable to a responsible team member. NCCER certification tracking monitors crew qualification status and flags expiring certifications before they become safety or contract liabilities. The Critical Change Safety Plan tool, designed for EHS Engineers and Safety Inspectors, provides a structured workflow for documenting, reviewing, and approving safety plan modifications when project conditions change. All compliance records are stored in the project record for audit and closeout documentation.",
    bullets: [
      "OSHA, ANSI, IEEE, NCCER, IBC, and federal/state code reference library",
      "Standards filtered and linked to project phases and CSI codes",
      "Compliance checklists with electronic sign-off workflows",
      "NCCER certification tracking with expiration alerts",
      "Critical Change Safety Plan tool for EHS and Safety Inspectors",
      "All compliance records stored for audit and project closeout",
      "Attributable sign-offs: every record linked to a responsible team member",
    ],
  },
  {
    id: 8,
    accentColor: "from-sky-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-sky-600/20 text-sky-300 border-sky-500/40",
    icon: Building2,
    iconColor: "text-sky-400",
    title: "OAC Meetings",
    subtitle:
      "AIA Forms, Zoom Integration, Addendums & Participant Coordination",
    description:
      "The OAC Meeting module provides a complete Owner-Architect-Contractor meeting management system with fillable AIA forms (G702 Application and Certificate for Payment, G703 Continuation Sheet, G701 Change Order, custom meeting minutes, and addendum forms) stored directly in the project record. Zoom integration supports both API-configured meetings and fixed meeting links, with copy-to-clipboard and direct email invite functionality for rapid participant distribution. Addendum attachments allow any team member to attach supporting documents to the meeting record, with Edit and Remove options for agenda management. All project participants are visible in the OAC tab, ensuring meeting coordinators have a complete attendance and distribution list at a glance. Review requests from the Drawings module automatically generate addendum entries linked to the relevant meeting.",
    bullets: [
      "Fillable AIA G702, G703, G701, custom minutes, and addendum forms",
      "Zoom integration: API-configured or fixed meeting link",
      "Copy-to-clipboard and email invite for participant distribution",
      "Addendum attachments with Edit and Remove options",
      "All project participants visible in OAC tab",
      "Auto-attached addendums from Drawings review requests",
      "Meeting records stored in project for compliance and closeout",
    ],
  },
  {
    id: 9,
    accentColor: "from-teal-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-teal-600/20 text-teal-300 border-teal-500/40",
    icon: FileText,
    iconColor: "text-teal-400",
    title: "Drawings & Documents",
    subtitle: "Six Drawing Types, Review Requests & Addendum Auto-Attach",
    description:
      "The Drawings & Documents module organizes all project drawings into six type tabs: Photographs, Blueprints (including power line distribution and power station blueprints), Architect Drawings, Construction Drawings with specifications and details, CAD Files (AutoCAD DWG/DXF, AutoCAD Mechanical, and SolidWorks), and Engineering Drawings. Users can upload files in JPG, PNG, PDF, DWG, and DXF formats with a real-time progress bar showing upload percentage. Any drawing can be viewed inline, saved/downloaded, or submitted as a review request to selected participants. Review requests generate dual notifications: an in-app dashboard notification and an automatic addendum entry in the OAC Meeting tab with Edit and Remove controls. A unified list view with type filter chips provides a streamlined sharing interface for distributing specific drawings to all participants or attaching them to Zoom meeting invites.",
    bullets: [
      "Six type tabs: Photographs, Blueprints, Architect, Construction, CAD, Engineering",
      "Upload JPG, PNG, PDF, DWG, DXF with real-time progress bar",
      "Inline viewer, download/save, and review request actions per drawing",
      "Review requests → in-app dashboard notification + OAC addendum auto-attach",
      "Addendum entries include Edit and Remove options",
      "Unified list view with type filter chips for sharing",
      "Share to all participants and attach to Zoom meeting invites",
    ],
  },
  {
    id: 10,
    accentColor: "from-indigo-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-indigo-600/20 text-indigo-300 border-indigo-500/40",
    icon: LayoutDashboard,
    iconColor: "text-indigo-400",
    title: "Admin Dashboard",
    subtitle: "Full Module Control, Inline Editing & Controller-Only Access",
    description:
      "The Admin Dashboard provides the app controller with complete visibility and control over every project module from a single master control panel. Each module — Scheduling, Cost, Resources, Compliance, Participants, Documents, Subscriptions, and Bank Account/Stripe Payouts — is presented as a dedicated tab with a view-only summary card and an Edit button that activates full inline editing, mirroring the depth of the Participants module. Subscription management includes full visibility into active plans, trial members, billing history, and the ability to approve or revoke access. The Bank Account tab connects directly to Stripe's payout settings while storing account details locally — account holder name, routing number, and last four digits — alongside a recent payouts summary and next payout date. Access to the Admin Dashboard is restricted exclusively to the app controller account.",
    bullets: [
      "Master control panel with tabs for all 8 project modules",
      "View-only summaries with full inline editing per module tab",
      "Subscription management: active plans, trials, billing history",
      "Bank Account tab: Stripe payout integration with local storage",
      "Recent payouts summary and next scheduled payout date",
      "Document approval and participant management workflows",
      "Controller-only access — no delegation or shared admin roles",
    ],
  },
  {
    id: 11,
    accentColor: "from-rose-700/20 via-blue-900/20 to-blue-950",
    badgeColor: "bg-rose-600/20 text-rose-300 border-rose-500/40",
    icon: CreditCard,
    iconColor: "text-rose-400",
    title: "Subscription & Security",
    subtitle:
      "Three-Tier Pricing, Stripe Integration & Enterprise-Grade Security",
    description:
      "Project Build Plus offers three subscription tiers designed to match project duration and organizational commitment: $299/month (1-year term), $199/month (5-year term), and $99/month (10-year term), each including a 30-day free trial with mid-trial tier switching. Payment verification is required before trial access, collecting card details, company information, personal identification, EIN, and proof of address, with Stripe handling all payment processing and an admin review workflow for manual verification. Security is multi-layered: Internet Identity provides device-based biometric authentication, while the email/password login offers a traditional credential option. The controller account is protected by an additional PIN/passcode gate, and every app feature can be individually locked or unlocked by the controller with a master toggle — locked features remain visible but are grayed out and disabled, with a 'locked by controller' label for transparency.",
    bullets: [
      "$299/mo (1 yr), $199/mo (5 yr), $99/mo (10 yr) subscription tiers",
      "30-day free trial with mid-trial tier switching available",
      "Stripe payment processing with full verification workflow",
      "Verification: card, company info, EIN, ID, proof of address",
      "Internet Identity (biometric) + email/password dual authentication",
      "Controller PIN/passcode gate on sensitive modules",
      "Per-feature lock/unlock toggles with grayed-out locked state",
    ],
  },
  {
    id: 12,
    accentColor: "from-blue-800/30 via-blue-900/20 to-blue-950",
    badgeColor: "bg-blue-600/20 text-blue-300 border-blue-500/40",
    icon: Play,
    iconColor: "text-blue-400",
    title: "App Demo Video",
    subtitle: "3:30 Walkthrough — Platform Functionality & User Workflows",
    description:
      "This final slide features a comprehensive 3-minute and 30-second video demonstration of the Project Build Plus platform, walking through every major module, navigation flow, and user interaction from onboarding to project closeout. The demo covers scheduling, cost tracking, drawings management, OAC meetings, compliance, and admin controls, providing all stakeholders with a clear operational understanding of the platform before deployment.",
    bullets: [
      "Full 3:30 platform walkthrough from login to closeout",
      "Covers all 10 major modules with live interaction demos",
      "Navigation flows and user permission scenarios demonstrated",
      "Mobile and desktop views shown side by side",
      "Admin Dashboard and Controller Account deep-dive included",
    ],
    isVideo: true,
  },
];

function PitchQR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, PITCH_REVIEW_URL, {
      width: 160,
      margin: 2,
      color: { dark: "#0d1117", light: "#e0f2fe" },
      errorCorrectionLevel: "H",
    })
      .then(() => setQrReady(true))
      .catch(() => setQrReady(true));
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(PITCH_REVIEW_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-center gap-4"
      data-ocid="pitch_review.qr.container"
    >
      <div className="relative rounded-xl border-2 border-blue-500/40 p-2 bg-sky-50 shadow-lg shrink-0">
        {!qrReady && (
          <div className="h-[160px] w-[160px] rounded-lg bg-blue-900/40 animate-pulse" />
        )}
        <canvas
          ref={canvasRef}
          className={
            qrReady ? "rounded-lg opacity-100" : "rounded-lg opacity-0 absolute"
          }
          aria-label="QR code for Pitch Review page"
        />
      </div>
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm font-medium text-blue-300">
          Scan to share this Pitch Review
        </p>
        <code className="rounded border border-blue-500/30 bg-blue-900/30 px-2.5 py-1 font-mono text-xs text-blue-300 truncate max-w-[240px]">
          {PITCH_REVIEW_URL}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          data-ocid="pitch_review.qr.copy_button"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition-all hover:bg-blue-500/20"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

function VideoSlide() {
  return (
    <div className="space-y-4">
      <div
        className="relative w-full overflow-hidden rounded-2xl border-2 border-blue-500/40 shadow-2xl"
        style={{
          aspectRatio: "16/9",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0c2340 70%, #0f172a 100%)",
        }}
        data-ocid="pitch_review.video_player"
      >
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(56,189,248,0.4) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(56,189,248,0.4) 40px)",
          }}
        />
        {/* Center play button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-400/80 bg-blue-500/20 shadow-lg shadow-blue-500/30 backdrop-blur-sm">
            <Play className="h-9 w-9 fill-blue-400 text-blue-400 ml-1" />
          </div>
          <div className="text-center px-6">
            <p className="font-display text-xl font-bold text-white tracking-tight sm:text-2xl">
              Project Build Plus — 3:30 App Demo
            </p>
            <p className="mt-1.5 text-sm text-blue-300 max-w-md">
              Showcasing App Functionality &amp; Operational Details for
              User-Friendly Understanding
            </p>
          </div>
          {/* Duration badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-900/60 px-3 py-1 text-xs font-mono font-bold text-blue-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            3:30
          </div>
        </div>
        {/* Fake controls bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-blue-500/20 bg-blue-950/80 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3">
          <Play className="h-4 w-4 text-blue-400 fill-blue-400 shrink-0" />
          <div className="flex-1 h-1 rounded-full bg-blue-900">
            <div className="h-full w-0 rounded-full bg-blue-400" />
          </div>
          <span className="font-mono text-xs text-blue-400 shrink-0">
            0:00 / 3:30
          </span>
          <Settings className="h-3.5 w-3.5 text-blue-500/70 shrink-0" />
        </div>
      </div>
      <div className="rounded-xl border border-blue-500/20 bg-blue-900/20 px-4 py-3">
        <p className="text-sm text-blue-300">
          This video provides a comprehensive walkthrough of the Project Build
          Plus platform, demonstrating key workflows, navigation, and module
          interactions for all user types.
        </p>
        <p className="mt-2 text-xs text-blue-400/70 italic">
          Video player will load the full 3:30 demonstration when available.
        </p>
      </div>
    </div>
  );
}

export default function PitchReviewPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const slideRefs = useRef<Record<number, HTMLElement | null>>({});
  const totalSlides = slides.length;

  function scrollToSlide(num: number) {
    const el = slideRefs.current[num];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setCurrentSlide(num);
  }

  function handlePrev() {
    if (currentSlide > 1) scrollToSlide(currentSlide - 1);
  }

  function handleNext() {
    if (currentSlide < totalSlides) scrollToSlide(currentSlide + 1);
  }

  // Intersection observer to update current slide on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-slide-id");
            if (id) setCurrentSlide(Number(id));
          }
        }
      },
      { threshold: 0.4 },
    );
    for (const [, el] of Object.entries(slideRefs.current)) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.1 0.02 240)" }}>
      {/* Hero Header */}
      <header
        className="relative overflow-hidden border-b border-blue-500/30 px-4 py-10 sm:py-14"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.04 20) 0%, oklch(0.12 0.05 250) 40%, oklch(0.10 0.06 260) 100%)",
        }}
        data-ocid="pitch_review.header"
      >
        {/* Stars pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Red stripe accents */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600/80 via-white/40 to-blue-700/80" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-700/50 via-white/20 to-red-600/50" />

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <HardHat className="h-7 w-7 text-blue-400" />
            <Badge className="border-blue-500/40 bg-blue-500/10 text-blue-300 text-xs">
              12 Slides
            </Badge>
            <Badge className="border-red-500/40 bg-red-500/10 text-red-300 text-xs">
              Pitch Review
            </Badge>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Project Build Plus
          </h1>
          <p className="mt-1 text-lg font-semibold text-blue-400 sm:text-xl">
            — Pitch Review
          </p>
          <p className="mt-3 max-w-2xl text-sm text-blue-200/80 sm:text-base">
            A Comprehensive Overview of Platform Capabilities &amp; Project
            Management Design
          </p>

          <div className="mt-6 flex flex-wrap items-start gap-6">
            <PitchQR />
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 gap-2"
                onClick={() => window.print()}
                data-ocid="pitch_review.print_button"
              >
                <Printer className="h-4 w-4" />
                Print / Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky nav bar */}
      <div
        className="sticky top-0 z-40 border-b border-blue-500/20 px-4 py-2.5 backdrop-blur-md"
        style={{ background: "oklch(0.10 0.03 240 / 0.9)" }}
        data-ocid="pitch_review.slide_nav"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/30 bg-blue-900/40 text-blue-400 transition hover:bg-blue-800/60 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous slide"
            data-ocid="pitch_review.prev_button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {slides.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSlide(s.id)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === s.id
                    ? "w-6 bg-blue-400"
                    : "w-2 bg-blue-700/60 hover:bg-blue-500/70"
                }`}
                aria-label={`Go to slide ${s.id}`}
                data-ocid={`pitch_review.slide_dot.${s.id}`}
              />
            ))}
          </div>

          <div className="shrink-0 text-xs font-mono text-blue-400">
            {String(currentSlide).padStart(2, "0")} /{" "}
            {String(totalSlides).padStart(2, "0")}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentSlide === totalSlides}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/30 bg-blue-900/40 text-blue-400 transition hover:bg-blue-800/60 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next slide"
            data-ocid="pitch_review.next_button"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Slides */}
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {slides.map((slide) => {
          const Icon = slide.icon;
          return (
            <section
              key={slide.id}
              ref={(el) => {
                slideRefs.current[slide.id] = el;
              }}
              data-slide-id={slide.id}
              className="scroll-mt-20 overflow-hidden rounded-2xl border border-blue-500/20 shadow-xl"
              style={{ background: "oklch(0.13 0.03 240)" }}
              data-ocid={`pitch_review.slide.${slide.id}`}
            >
              {/* Slide gradient header */}
              <div
                className={`bg-gradient-to-br ${slide.accentColor} px-6 pt-6 pb-5 sm:px-8`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${slide.iconColor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge
                      className={`border text-xs font-mono ${slide.badgeColor}`}
                    >
                      Slide {String(slide.id).padStart(2, "0")} /{" "}
                      {String(totalSlides).padStart(2, "0")}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={slide.id === 1}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-20"
                      aria-label="Previous"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={slide.id === totalSlides}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-20"
                      aria-label="Next"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {slide.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-blue-200/70 sm:text-base">
                  {slide.subtitle}
                </p>
              </div>

              {/* Slide body */}
              <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-400/70">
                    Overview
                  </h3>
                  <p className="text-sm leading-relaxed text-blue-100/80">
                    {slide.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-400/70">
                    {slide.isVideo ? "Video Contents" : "Key Capabilities"}
                  </h3>
                  {slide.isVideo ? (
                    <VideoSlide />
                  ) : (
                    <ul className="space-y-2">
                      {slide.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-sm text-blue-100/80"
                        >
                          <span
                            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${slide.iconColor.replace("text-", "bg-")}`}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Slide footer */}
              <div className="border-t border-blue-500/10 px-6 py-3 sm:px-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-500/50 font-mono">
                    PROJECT BUILD PLUS · PITCH REVIEW · SLIDE{" "}
                    {String(slide.id).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-4 rounded-full bg-red-600/70" />
                    <div className="h-1.5 w-4 rounded-full bg-white/40" />
                    <div className="h-1.5 w-4 rounded-full bg-blue-700/70" />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* Floating Back to Home */}
      <div
        className="fixed bottom-6 left-6 z-50"
        data-ocid="pitch_review.back_home_button"
      >
        <Link to="/">
          <Button
            type="button"
            variant="outline"
            className="border-blue-500/40 bg-blue-950/90 text-blue-300 shadow-lg backdrop-blur-sm hover:bg-blue-900/80 hover:text-blue-200 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Bottom spacer for floating button */}
      <div className="h-20" />
    </div>
  );
}
