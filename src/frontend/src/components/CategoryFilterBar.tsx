import {
  ALL_CATEGORIES_OPTION,
  PROJECT_CATEGORIES,
  getCategoryById,
} from "@/data/projectCategories";
import {
  useActiveFilterStore,
  useSetActiveFilter,
} from "@/hooks/useActiveFilter";
import { Filter, X } from "lucide-react";

export function CategoryFilterBar() {
  const { activeCategoryId, activeSubtopicId } = useActiveFilterStore();
  const setActiveFilter = useSetActiveFilter();

  const selectedCategory = activeCategoryId
    ? getCategoryById(activeCategoryId)
    : null;
  const subtopics = selectedCategory?.subtopics ?? [];

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val) {
      setActiveFilter.mutate({ categoryId: null, subtopicId: null });
    } else {
      setActiveFilter.mutate({ categoryId: val, subtopicId: null });
    }
  }

  function handleSubtopicChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setActiveFilter.mutate({
      categoryId: activeCategoryId,
      subtopicId: val || null,
    });
  }

  function handleClear() {
    setActiveFilter.mutate({ categoryId: null, subtopicId: null });
  }

  const hasFilter = !!activeCategoryId;

  return (
    <fieldset
      className="flex flex-wrap items-center gap-2 border-0 p-0 m-0"
      data-ocid="category_filter.bar"
      aria-label="Project category filter"
    >
      <Filter
        className="h-4 w-4 text-muted-foreground shrink-0"
        aria-hidden="true"
      />

      <select
        value={activeCategoryId ?? ""}
        onChange={handleCategoryChange}
        className="min-w-0 rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring transition-colors cursor-pointer"
        aria-label="Select project category"
        data-ocid="category_filter.category_select"
      >
        <option value="">{ALL_CATEGORIES_OPTION.name}</option>
        {PROJECT_CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {subtopics.length > 0 && (
        <select
          value={activeSubtopicId ?? ""}
          onChange={handleSubtopicChange}
          className="min-w-0 rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring transition-colors cursor-pointer"
          aria-label="Select project subtopic"
          data-ocid="category_filter.subtopic_select"
        >
          <option value="">All Subtopics</option>
          {subtopics.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      )}

      {hasFilter && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs
            text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Clear category filter"
          data-ocid="category_filter.clear_button"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}

      {setActiveFilter.isPending && (
        <span
          className="text-xs text-muted-foreground animate-pulse"
          aria-live="polite"
        >
          Saving…
        </span>
      )}
    </fieldset>
  );
}
