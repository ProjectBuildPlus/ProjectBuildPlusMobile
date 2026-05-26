import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";

const MODULES = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "New Project", to: "/project-setup" },
  { label: "Cash Requirement", to: "/cash-requirement" },
  { label: "Earned Value", to: "/earned-value" },
  { label: "Participants", to: "/participants" },
  { label: "Directory", to: "/directory" },
  { label: "Benchmarks", to: "/benchmarks" },
  { label: "Scenarios", to: "/scenarios" },
  { label: "Safety", to: "/safety-standards" },
  { label: "Settings", to: "/settings" },
] as const;

export function ModuleQuickJump() {
  const location = useLocation();

  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[2.5rem] items-center gap-1 py-1">
          {MODULES.map((mod) => {
            const isActive = location.pathname === mod.to;
            return (
              <Link
                key={mod.to}
                to={mod.to}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                data-ocid={`quick_jump.${mod.to.replace("/", "").replace("-", "_")}_link`}
              >
                {mod.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
