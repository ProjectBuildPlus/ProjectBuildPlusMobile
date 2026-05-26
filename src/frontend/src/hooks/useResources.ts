import { type CriticalPathNode, createActor } from "@/backend";
import type {
  IdleTimeMode,
  IdleTimeSetting,
  PhaseAllocation,
  PhaseAllocationInput,
  Resource,
  ResourceInput,
  ResourceSummary,
  ResourceType,
} from "@/backend";
import type { GanttPhase } from "@/components/GanttChart";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type {
  Resource,
  ResourceSummary,
  PhaseAllocation,
  IdleTimeSetting,
  ResourceType,
  IdleTimeMode,
};

export function useResources(resourceType?: ResourceType) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Resource[]>({
    queryKey: ["resources", resourceType ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      if (resourceType) return actor.getResourcesByType(resourceType);
      return actor.getResources();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function usePhaseAllocations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PhaseAllocation[]>({
    queryKey: ["phaseAllocations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPhaseAllocations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function usePhaseAllocationsByResource(resourceId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PhaseAllocation[]>({
    queryKey: ["phaseAllocations", "byResource", resourceId],
    queryFn: async () => {
      if (!actor || !resourceId) return [];
      return actor.getPhaseAllocationsByResource(resourceId);
    },
    enabled: !!actor && !isFetching && !!resourceId,
    refetchInterval: 5000,
  });
}

export function useResourceSummaries() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ResourceSummary[]>({
    queryKey: ["resourceSummaries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.computeResourceSummaries(1.0, 1.0);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useUpsertResource() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<Resource, Error, ResourceInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Actor not available");
      return actor.upsertResource(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["resourceSummaries"] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteResource(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["phaseAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["resourceSummaries"] });
    },
  });
}

export function useUpsertPhaseAllocation() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<PhaseAllocation, Error, PhaseAllocationInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Actor not available");
      return actor.upsertPhaseAllocation(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phaseAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["resourceSummaries"] });
    },
  });
}

export function useIdleTimeSetting() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<IdleTimeSetting | null>({
    queryKey: ["idleTimeSetting"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getIdleTimeSetting();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetIdleTimeSetting() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<IdleTimeSetting, Error, IdleTimeMode>({
    mutationFn: async (mode) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setIdleTimeSetting(mode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idleTimeSetting"] });
      queryClient.invalidateQueries({ queryKey: ["resourceSummaries"] });
    },
  });
}
export function useCriticalPath(phases: GanttPhase[]) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CriticalPathNode[]>({
    queryKey: [
      "criticalPath",
      phases.map((p) => `${p.id}:${p.startOffset}:${p.endOffset}`).join(","),
    ],
    queryFn: async () => {
      if (!actor || phases.length === 0) return [];
      const input = phases.map((p) => ({
        id: p.id,
        name: p.name,
        startOffset: p.startOffset,
        endOffset: p.endOffset,
        dependencies: p.dependencies,
      }));
      return actor.computeCriticalPath(input);
    },
    enabled: !!actor && !isFetching && phases.length > 0,
    staleTime: 5000,
  });
}
