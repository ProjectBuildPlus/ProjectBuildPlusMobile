import { StandardCategory } from "@/backend";
import type { SafetyStandard } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStandardsLibrary } from "@/hooks/useSafetyStandards";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SAMPLE_STANDARDS, US_STATES } from "./safetyData";

const CATEGORY_OPTIONS: { value: StandardCategory | "All"; label: string }[] = [
  { value: "All", label: "All Categories" },
  { value: StandardCategory.OSHA, label: "OSHA" },
  { value: StandardCategory.ANSI, label: "ANSI" },
  { value: StandardCategory.IEEE, label: "IEEE" },
  { value: StandardCategory.NCCER, label: "NCCER" },
  { value: StandardCategory.IBC, label: "IBC" },
];

function categoryBadgeColor(cat: StandardCategory) {
  switch (cat) {
    case StandardCategory.OSHA:
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case StandardCategory.ANSI:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case StandardCategory.IEEE:
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case StandardCategory.NCCER:
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case StandardCategory.IBC:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function StandardCard({ standard }: { standard: SafetyStandard }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-smooth hover:border-primary/30 hover:bg-primary/5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${categoryBadgeColor(standard.category)}`}
            >
              {standard.category}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {standard.code}
            </span>
            {standard.state && (
              <Badge variant="secondary" className="text-xs">
                {standard.state}
              </Badge>
            )}
          </div>
          <h3 className="mt-1.5 font-display text-sm font-semibold text-foreground">
            {standard.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {standard.summary}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {standard.csiDivisions.map((d) => (
          <span
            key={d}
            className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
          >
            CSI {d}
          </span>
        ))}
        {standard.applicableTrades.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
          >
            {t}
          </span>
        ))}
      </div>
      {standard.relatedStandards.length > 0 && (
        <div className="mt-2 text-[10px] text-muted-foreground">
          Related: {standard.relatedStandards.join(", ")}
        </div>
      )}
    </div>
  );
}

export function ReferenceLibraryTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StandardCategory | "All">("All");
  const [state, setState] = useState<string>("All");
  const [filteredView, setFilteredView] = useState(false);
  const [projectType, setProjectType] = useState("");
  const [projectSubtype, setProjectSubtype] = useState("");

  const { data: backendStandards } = useStandardsLibrary(
    search,
    category === "All" ? null : category,
    state === "All" ? null : state,
  );

  const standards = backendStandards ?? SAMPLE_STANDARDS;

  const filtered = useMemo(() => {
    let list = standards;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q),
      );
    }
    if (category !== "All") {
      list = list.filter((s) => s.category === category);
    }
    if (state !== "All") {
      list = list.filter(
        (s) => s.state === state || s.state === undefined || s.state === null,
      );
    }
    if (filteredView && projectType && projectSubtype) {
      list = list.filter((s) =>
        s.applicableTrades.some((t) =>
          projectType.toLowerCase().includes(t.toLowerCase()),
        ),
      );
    }
    return list;
  }, [
    standards,
    search,
    category,
    state,
    filteredView,
    projectType,
    projectSubtype,
  ]);

  return (
    <div className="space-y-4" data-ocid="safety.reference_library.section">
      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search standards by code, title, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="safety.reference_library.search_input"
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as StandardCategory | "All")}
          >
            <SelectTrigger
              className="w-[160px]"
              data-ocid="safety.reference_library.category_select"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger
              className="w-[160px]"
              data-ocid="safety.reference_library.state_select"
            >
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All States</SelectItem>
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-3">
          <Switch
            id="filtered-view"
            checked={filteredView}
            onCheckedChange={setFilteredView}
            data-ocid="safety.reference_library.filtered_view_toggle"
          />
          <label
            htmlFor="filtered-view"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Filtered View — show only standards applicable to my project
          </label>
        </div>
        {filteredView && (
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Project type / trade"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-[200px]"
              data-ocid="safety.reference_library.project_type_input"
            />
            <Input
              placeholder="Project subtype"
              value={projectSubtype}
              onChange={(e) => setProjectSubtype(e.target.value)}
              className="w-[200px]"
              data-ocid="safety.reference_library.project_subtype_input"
            />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="text-xs text-muted-foreground">
        {filtered.length} standard{filtered.length !== 1 ? "s" : ""} found
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <StandardCard key={s.id} standard={s} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No standards match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
