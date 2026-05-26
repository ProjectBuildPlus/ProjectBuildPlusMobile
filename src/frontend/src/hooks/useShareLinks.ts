import { createActor } from "@/backend";
import type { ShareLink } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGenerateShareLink() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<ShareLink, Error, string>({
    mutationFn: async (projectId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.generateShareLink(projectId);
    },
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["projectShareLinks", projectId],
      });
    },
  });
}

export function useProjectShareLinks(projectId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ShareLink[]>({
    queryKey: ["projectShareLinks", projectId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjectShareLinks(projectId);
    },
    enabled: !!actor && !isFetching && !!projectId,
  });
}

export function useDeactivateShareLink() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deactivateShareLink(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectShareLinks"] });
    },
  });
}
