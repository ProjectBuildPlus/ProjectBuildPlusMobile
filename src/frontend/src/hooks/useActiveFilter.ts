import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

interface ActiveFilterStore {
  activeCategoryId: string | null;
  activeSubtopicId: string | null;
  setFilter: (categoryId: string | null, subtopicId: string | null) => void;
}

export const useActiveFilterStore = create<ActiveFilterStore>((set) => ({
  activeCategoryId: null,
  activeSubtopicId: null,
  setFilter: (categoryId, subtopicId) =>
    set({ activeCategoryId: categoryId, activeSubtopicId: subtopicId }),
}));

export function useActiveFilter() {
  const { actor, isFetching } = useActor(createActor);
  const { setFilter } = useActiveFilterStore();
  return useQuery<{
    activeCategoryId: string | null;
    activeSubtopicId: string | null;
  }>({
    queryKey: ["activeFilter"],
    queryFn: async () => {
      if (!actor) return { activeCategoryId: null, activeSubtopicId: null };
      const result = await actor.getActiveFilter();
      const [categoryId, subtopicId] = result;
      setFilter(categoryId, subtopicId);
      return { activeCategoryId: categoryId, activeSubtopicId: subtopicId };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSetActiveFilter() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const { setFilter } = useActiveFilterStore();
  return useMutation<
    void,
    Error,
    { categoryId: string | null; subtopicId: string | null }
  >({
    mutationFn: async ({ categoryId, subtopicId }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setActiveFilter(categoryId, subtopicId);
    },
    onSuccess: (_data, variables) => {
      setFilter(variables.categoryId, variables.subtopicId);
      queryClient.invalidateQueries({ queryKey: ["activeFilter"] });
    },
  });
}
