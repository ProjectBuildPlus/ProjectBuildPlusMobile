import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useProjectCategories() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["projectCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjectCategories();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useProjectSubtopic(categoryId: string, subtopicId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["projectSubtopic", categoryId, subtopicId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProjectSubtopic(categoryId, subtopicId);
    },
    enabled: !!actor && !isFetching && !!categoryId && !!subtopicId,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useApplyProjectTemplate() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      categoryId,
      subtopicId,
    }: {
      categoryId: string;
      subtopicId: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.applyProjectTemplate(categoryId, subtopicId);
      if ("ok" in res) return res.ok;
      throw new Error("err" in res ? res.err : "Unknown error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCashRequirement"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCrashedRequirement"],
      });
      queryClient.invalidateQueries({ queryKey: ["cumulativeWithBreakdown"] });
      queryClient.invalidateQueries({ queryKey: ["earnedValueMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["projectEVMSummary"] });
      toast.success("Project template applied successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to apply project template");
    },
  });
}
