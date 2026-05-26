import { CategoryFilterBar } from "@/components/CategoryFilterBar";
import { ModuleBreadcrumb } from "@/components/ModuleBreadcrumb";
import { ModuleQuickJump } from "@/components/ModuleQuickJump";
import { OfflineBanner } from "@/components/OfflineBanner";
import { TrialReminderBanner } from "@/components/TrialReminderBanner";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useIsAdmin } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  FolderPlus,
  GitCompare,
  HardHat,
  Menu,
  Settings,
  Shield,
  ShieldAlert,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const baseNavItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "New Project", to: "/project-setup" },
  { label: "Cash Requirement", to: "/cash-requirement" },
  { label: "Earned Value", to: "/earned-value" },
  { label: "Participants", to: "/participants" },
  { label: "OAC Meeting", to: "/oac-meeting" },
  { label: "Benchmarks", to: "/benchmarks" },
  { label: "Scenarios", to: "/scenarios" },
  { label: "Cost & Resources", to: "/cost-schedule-resource-control" },
  { label: "Critical Path", to: "/critical-path" },
  { label: "Directory", to: "/directory" },
  { label: "Safety Standards", to: "/safety-standards" },
  { label: "Settings", to: "/settings" },
  { label: "Controller Profile", to: "/controller-profile" },
  { label: "Payment & Billing", to: "/payment-settings" },
  { label: "Subscription", to: "/subscription" },
  { label: "Pitch Breakdown", to: "/pitch-breakdown" },
];

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const { isOffline, lastSynced } = useOfflineSync();
  const [showSynced, setShowSynced] = useState(false);
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  const { data: isAdmin } = useIsAdmin(principal);

  useEffect(() => {
    if (!isOffline && lastSynced) {
      setShowSynced(true);
      const t = setTimeout(() => setShowSynced(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOffline, lastSynced]);

  return (
    <div
      className={`flex min-h-screen flex-col bg-background ${isOffline ? "offline-mode" : ""}`}
    >
      <OfflineBanner isOffline={isOffline} showSynced={showSynced} />
      <TrialReminderBanner />
      <header className="sticky top-0 z-50 border-b bg-card shadow-subtle">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Project Build Plus
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              ...baseNavItems,
              ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : []),
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                data-ocid="nav.link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.mobile_toggle"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t bg-card px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {[
                ...baseNavItems,
                ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === item.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setMobileOpen(false)}
                  data-ocid="nav.mobile_link"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="bg-card border-b">
        <div className="mx-auto max-w-7xl">
          <ModuleBreadcrumb />
        </div>
      </div>
      <ModuleQuickJump />
      <CategoryFilterBar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>© {currentYear}. Built with love using caffeine.ai</span>
          <div className="flex items-center gap-4">
            {lastSynced && (
              <span className="hidden sm:inline text-muted-foreground/70">
                Last synced: {formatTimeAgo(lastSynced)}
              </span>
            )}
            <Link
              to="/pitch-breakdown"
              className="hover:text-foreground"
              data-ocid="footer.pitch_breakdown_link"
            >
              Pitch Breakdown
            </Link>
            <Link
              to="/pitch-review"
              className="hover:text-foreground"
              data-ocid="footer.pitch_review_link"
            >
              Pitch Review
            </Link>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
