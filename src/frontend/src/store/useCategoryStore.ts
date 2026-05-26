import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CategoryStore {
  activeCategoryId: string | null;
  activeSubtopicId: string | null;
  setFilter: (categoryId: string | null, subtopicId: string | null) => void;
  clearFilter: () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      activeCategoryId: null,
      activeSubtopicId: null,
      setFilter: (categoryId, subtopicId) =>
        set({ activeCategoryId: categoryId, activeSubtopicId: subtopicId }),
      clearFilter: () =>
        set({ activeCategoryId: null, activeSubtopicId: null }),
    }),
    {
      name: "pbp-category-filter",
    },
  ),
);
