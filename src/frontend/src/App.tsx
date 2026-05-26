import { ControllerOnly } from "@/components/ControllerOnly";
import { Layout } from "@/components/Layout";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { OfflineSyncProvider } from "@/hooks/useOfflineSync";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import BenchmarksPage from "@/pages/BenchmarksPage";
import CashRequirementCurve from "@/pages/CashRequirementCurve";
import ControllerAccountPage from "@/pages/ControllerAccountPage";
import ControllerProfilePage from "@/pages/ControllerProfilePage";
import CostScheduleResourceControl from "@/pages/CostScheduleResourceControl";
import CriticalPathPage from "@/pages/CriticalPathPage";
import DirectoryPage from "@/pages/DirectoryPage";
import DrawingsPage from "@/pages/DrawingsPage";
import EarnedValueDashboard from "@/pages/EarnedValueDashboard";
import ExportView from "@/pages/ExportView";
import OACMeetingPage from "@/pages/OACMeetingPage";
import ParticipantsPage from "@/pages/ParticipantsPage";
import PaymentSettingsPage from "@/pages/PaymentSettingsPage";
import { PitchBreakdown } from "@/pages/PitchBreakdown";
import PitchReviewPage from "@/pages/PitchReviewPage";
import ProjectDashboard from "@/pages/ProjectDashboard";
import ProjectSetupPage from "@/pages/ProjectSetupPage";
import RenewalPage from "@/pages/RenewalPage";
import SafetyStandardsPage from "@/pages/SafetyStandardsPage";
import ScenariosPage from "@/pages/ScenariosPage";
import SettingsPage from "@/pages/SettingsPage";
import ShareView from "@/pages/ShareView";
import { SplashScreen } from "@/pages/SplashScreen";
import SubscriptionPage from "@/pages/SubscriptionPage";
import TrialEnrollPage from "@/pages/TrialEnrollPage";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import { FeatureLockProvider } from "./context/FeatureLockContext";

const rootRoute = createRootRoute();

const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SplashScreen,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: () => (
    <SubscriptionGate>
      <Layout />
    </SubscriptionGate>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "admin",
  component: AdminDashboardPage,
});

const cashRequirementRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "cash-requirement",
  component: CashRequirementCurve,
});

const pitchBreakdownRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "pitch-breakdown",
  component: PitchBreakdown,
});

const earnedValueRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "earned-value",
  component: EarnedValueDashboard,
});

const participantsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "participants",
  component: ParticipantsPage,
});

const directoryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "directory",
  component: DirectoryPage,
});

const projectSetupRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "project-setup",
  component: ProjectSetupPage,
});

const scenariosRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "scenarios",
  component: ScenariosPage,
});

const oacMeetingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "oac-meeting",
  component: OACMeetingPage,
});

const benchmarksRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "benchmarks",
  component: BenchmarksPage,
});

const criticalPathRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "critical-path",
  component: CriticalPathPage,
});

const costScheduleResourceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "cost-schedule-resource-control",
  component: CostScheduleResourceControl,
});

const safetyStandardsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "safety-standards",
  component: SafetyStandardsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "settings",
  component: SettingsPage,
});

const controllerProfileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "controller-profile",
  component: ControllerProfilePage,
});
const controllerAccountRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "controller-account",
  component: () => (
    <ControllerOnly>
      <ControllerAccountPage />
    </ControllerOnly>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "dashboard",
  component: ProjectDashboard,
});
const drawingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "drawings",
  component: DrawingsPage,
});

const exportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "export",
  component: ExportView,
});

const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "share/$token",
  component: ShareView,
});

const subscriptionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "subscription",
  component: SubscriptionPage,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "pricing",
  component: SplashScreen,
});

const paymentSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payment-settings",
  component: PaymentSettingsPage,
});

const renewalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "renewal",
  component: RenewalPage,
});

const pitchReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "pitch-review",
  component: PitchReviewPage,
});

const trialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "trial/$tier",
  component: TrialEnrollPage,
});

const routeTree = rootRoute.addChildren([
  splashRoute,
  pricingRoute,
  trialRoute,
  exportRoute,
  shareRoute,
  subscriptionRoute,
  paymentSettingsRoute,
  renewalRoute,
  pitchReviewRoute,
  layoutRoute.addChildren([
    adminRoute,
    cashRequirementRoute,
    pitchBreakdownRoute,
    earnedValueRoute,
    participantsRoute,
    directoryRoute,
    projectSetupRoute,
    scenariosRoute,
    oacMeetingRoute,
    benchmarksRoute,
    criticalPathRoute,
    costScheduleResourceRoute,
    safetyStandardsRoute,
    settingsRoute,
    controllerProfileRoute,
    controllerAccountRoute,
    dashboardRoute,
    drawingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <OfflineSyncProvider>
      <FeatureLockProvider>
        <RouterProvider router={router} />
      </FeatureLockProvider>
    </OfflineSyncProvider>
  );
}
