import { getCategoryById, getSubtopicById } from "@/data/projectCategories";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, HardHat } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/project-setup": "New Project",
  "/cash-requirement": "Cash Requirement",
  "/earned-value": "Earned Value",
  "/participants": "Participants",
  "/directory": "Directory",
  "/benchmarks": "Benchmarks",
  "/scenarios": "Scenarios",
  "/settings": "Settings",
  "/pitch-breakdown": "Pitch Breakdown",
};

export function ModuleBreadcrumb() {
  const location = useLocation();
  const { activeCategoryId, activeSubtopicId } = useCategoryStore();

  const moduleLabel = ROUTE_LABELS[location.pathname] ?? "Dashboard";
  const activeCategory = activeCategoryId
    ? getCategoryById(activeCategoryId)
    : null;
  const activeSubtopic =
    activeCategoryId && activeSubtopicId
      ? getSubtopicById(activeCategoryId, activeSubtopicId)
      : null;

  return (
    <nav
      className="flex min-h-[2rem] items-center gap-1.5 overflow-x-auto px-4 py-1.5 text-xs text-muted-foreground sm:px-6 lg:px-8"
      aria-label="Breadcrumb"
      data-ocid="breadcrumb.nav"
    >
      <Link
        to="/project-setup"
        className="flex items-center gap-1 whitespace-nowrap hover:text-foreground transition-colors"
        data-ocid="breadcrumb.home_link"
      >
        <HardHat className="h-3.5 w-3.5" />
        <span className="font-medium">Project Build Plus</span>
      </Link>

      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />

      <span className="whitespace-nowrap">
        {activeCategory ? (
          <span className="text-foreground/70">{activeCategory.name}</span>
        ) : (
          <span className="italic">All Categories</span>
        )}
      </span>

      {activeSubtopic && (
        <>
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          <span className="whitespace-nowrap text-foreground/70">
            {activeSubtopic.name}
          </span>
        </>
      )}

      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />

      <span
        className="whitespace-nowrap font-semibold text-foreground"
        data-ocid="breadcrumb.current_module"
      >
        {moduleLabel}
      </span>
    </nav>
  );
}
