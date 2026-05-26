import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PROJECT_CATEGORIES,
  getCategoryById,
  getSubtopicById,
} from "@/data/projectTypeTemplates";
import { useApplyProjectTemplate } from "@/hooks/useProjectTypes";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Building2,
  Check,
  CheckCircle2,
  Droplets,
  Factory,
  Flower2,
  Hammer,
  HardHat,
  Home,
  Hotel,
  Landmark,
  Loader2,
  Mountain,
  Paintbrush,
  Route,
  Tractor,
  TrafficCone,
  TreePine,
} from "lucide-react";
import { useState } from "react";

const categoryIcons: Record<string, React.ReactNode> = {
  residential: <Home className="h-6 w-6" />,
  "building-construction": <Building2 className="h-6 w-6" />,
  "heavy-construction": <Mountain className="h-6 w-6" />,
  industrial: <Factory className="h-6 w-6" />,
  "syndicated-real-estate": <Landmark className="h-6 w-6" />,
  "public-government": <Building className="h-6 w-6" />,
  "duplex-apartment": <Hotel className="h-6 w-6" />,
  renovation: <Hammer className="h-6 w-6" />,
  remodeling: <Paintbrush className="h-6 w-6" />,
  "forestry-arboriculture": <TreePine className="h-6 w-6" />,
  "forestry-horticultural": <Flower2 className="h-6 w-6" />,
  "farming-land-grading": <Tractor className="h-6 w-6" />,
  "municipal-services": <Droplets className="h-6 w-6" />,
  "street-signals-mapping": <TrafficCone className="h-6 w-6" />,
  "public-highways": <Route className="h-6 w-6" />,
  "private-highways": <Landmark className="h-6 w-6" />,
};

const categoryColors: Record<string, string> = {
  residential: "border-red-500/60 hover:border-red-500",
  "building-construction": "border-blue-500/60 hover:border-blue-500",
  "heavy-construction": "border-amber-500/60 hover:border-amber-500",
  industrial: "border-slate-500/60 hover:border-slate-500",
  "syndicated-real-estate": "border-emerald-500/60 hover:border-emerald-500",
  "public-government": "border-indigo-500/60 hover:border-indigo-500",
  "duplex-apartment": "border-rose-500/60 hover:border-rose-500",
  renovation: "border-orange-500/60 hover:border-orange-500",
  remodeling: "border-cyan-500/60 hover:border-cyan-500",
  "forestry-arboriculture": "border-green-500/60 hover:border-green-500",
  "forestry-horticultural": "border-lime-500/60 hover:border-lime-500",
  "farming-land-grading": "border-yellow-500/60 hover:border-yellow-500",
  "municipal-services": "border-sky-500/60 hover:border-sky-500",
  "street-signals-mapping": "border-violet-500/60 hover:border-violet-500",
  "public-highways": "border-stone-500/60 hover:border-stone-500",
  "private-highways": "border-teal-500/60 hover:border-teal-500",
};

const categoryIconColors: Record<string, string> = {
  residential: "text-red-400",
  "building-construction": "text-blue-400",
  "heavy-construction": "text-amber-400",
  industrial: "text-slate-400",
  "syndicated-real-estate": "text-emerald-400",
  "public-government": "text-indigo-400",
  "duplex-apartment": "text-rose-400",
  renovation: "text-orange-400",
  remodeling: "text-cyan-400",
  "forestry-arboriculture": "text-green-400",
  "forestry-horticultural": "text-lime-400",
  "farming-land-grading": "text-yellow-400",
  "municipal-services": "text-sky-400",
  "street-signals-mapping": "text-violet-400",
  "public-highways": "text-stone-400",
  "private-highways": "text-teal-400",
};

type Step = "category" | "subtopic" | "confirm";

export default function ProjectSetupPage() {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const navigate = useNavigate();
  const applyTemplate = useApplyProjectTemplate();

  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  const subtopic =
    selectedCategory && selectedSubtopic
      ? getSubtopicById(selectedCategory, selectedSubtopic)
      : null;

  const handleApply = () => {
    if (!selectedCategory || !selectedSubtopic) return;
    applyTemplate.mutate(
      { categoryId: selectedCategory, subtopicId: selectedSubtopic },
      {
        onSuccess: () => {
          navigate({ to: "/cash-requirement" });
        },
      },
    );
  };

  const handleBack = () => {
    if (step === "confirm") {
      setSelectedSubtopic(null);
      setStep("subtopic");
    } else if (step === "subtopic") {
      setSelectedCategory(null);
      setSelectedSubtopic(null);
      setStep("category");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <HardHat className="h-7 w-7 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            New Project Setup
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a project type and subtopic to auto-populate phases and cost
            codes
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {(["category", "subtopic", "confirm"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step === "confirm" && s === "subtopic"
                    ? "bg-primary/20 text-primary"
                    : step === "confirm" && s === "category"
                      ? "bg-primary/20 text-primary"
                      : step === "subtopic" && s === "category"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
              )}
            >
              {s === "category" && <Building2 className="h-4 w-4" />}
              {s === "subtopic" && <CheckCircle2 className="h-4 w-4" />}
              {s === "confirm" && <Check className="h-4 w-4" />}
            </div>
            <span
              className={cn(
                "text-sm font-medium capitalize",
                step === s ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
            {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {step === "category" && (
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">
            Step 1 — Select a Project Category
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROJECT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setStep("subtopic");
                }}
                className={cn(
                  "group relative flex flex-col items-start gap-3 rounded-xl border-2 bg-card p-5 text-left transition-all duration-200 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  categoryColors[cat.id] ||
                    "border-border hover:border-primary",
                )}
                data-ocid={`project_setup.category.${cat.id}.button`}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-secondary",
                    categoryIconColors[cat.id] || "text-primary",
                  )}
                >
                  {categoryIcons[cat.id] || <Building2 className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                <ArrowRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "subtopic" && category && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1"
              data-ocid="project_setup.back_button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h2 className="font-display text-lg font-semibold">
              Step 2 — Select a Subtopic for{" "}
              <span className="text-primary">{category.name}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {category.subtopics.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setSelectedSubtopic(sub.id);
                  setStep("confirm");
                }}
                className={cn(
                  "group relative flex flex-col items-start gap-3 rounded-xl border-2 bg-card p-5 text-left transition-all duration-200 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  categoryColors[category.id] ||
                    "border-border hover:border-primary",
                )}
                data-ocid={`project_setup.subtopic.${sub.id}.button`}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-secondary",
                    categoryIconColors[category.id] || "text-primary",
                  )}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold">
                    {sub.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sub.defaultCsiDivisions.length} CSI divisions pre-loaded
                  </p>
                </div>
                <ArrowRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "confirm" && category && subtopic && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1"
              data-ocid="project_setup.back_button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h2 className="font-display text-lg font-semibold">
              Step 3 — Confirm & Apply Template
            </h2>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Selected Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    {category.name}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subtopic
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    {subtopic.name}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  Pre-populated CSI Divisions
                </p>
                <div className="flex flex-wrap gap-2">
                  {subtopic.defaultCsiDivisions.map((div) => (
                    <span
                      key={div}
                      className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      Division {div}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  This will create default phases and cost codes based on the
                  selected template. You can edit them afterward.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  data-ocid="project_setup.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applyTemplate.isPending}
                  data-ocid="project_setup.apply_template_button"
                >
                  {applyTemplate.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Apply Template
                    </>
                  )}
                </Button>
              </div>

              {applyTemplate.isError && (
                <p className="text-right text-sm text-destructive">
                  {applyTemplate.error?.message || "Failed to apply template"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
