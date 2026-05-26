import { createActor } from "@/backend";
import type {
  CreateScenarioRequest,
  ParticipantOverride,
  PhaseOverride,
  Scenario,
  ScenarioBenchmarkVariance,
  ScenarioCashProjection,
  ScenarioEVMSummary,
  ScenarioSummary,
} from "@/backend";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type {
  CreateScenarioRequest,
  PhaseOverride,
  ParticipantOverride,
  Scenario,
  ScenarioBenchmarkVariance,
  ScenarioCashProjection,
  ScenarioEVMSummary,
  ScenarioSummary,
};

export function useScenariosList() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<ScenarioSummary[]>({
    queryKey: ["scenarios"],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          ((cachedData as unknown as Record<string, unknown>)
            ?.scenarios as ScenarioSummary[]) ?? []
        );
      try {
        return await actor.listScenarios();
      } catch {
        return (
          ((cachedData as unknown as Record<string, unknown>)
            ?.scenarios as ScenarioSummary[]) ?? []
        );
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useScenario(id: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<Scenario | null>({
    queryKey: ["scenario", id],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenario as Record<string, unknown>
          )?.[id] as Scenario) ?? null
        );
      try {
        return await actor.getScenario(id);
      } catch {
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenario as Record<string, unknown>
          )?.[id] as Scenario) ?? null
        );
      }
    },
    enabled: (!!id && !isOffline && !!actor && !isFetching) || isOffline,
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<Scenario, Error, CreateScenarioRequest>({
    mutationFn: async (req) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.createScenario(req);
      if ("ok" in res) return res.ok;
      throw new Error("err" in res ? res.err : "Unknown error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    Scenario,
    Error,
    { id: string; req: CreateScenarioRequest }
  >({
    mutationFn: async ({ id, req }) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.updateScenario(id, req);
      if ("ok" in res) return res.ok;
      throw new Error("err" in res ? res.err : "Unknown error");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      queryClient.invalidateQueries({
        queryKey: ["scenario", variables.id],
      });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.deleteScenario(id);
      if ("ok" in res) return;
      throw new Error("err" in res ? res.err : "Unknown error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
    },
  });
}

export function useScenarioCashProjection(id: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<ScenarioCashProjection | null>({
    queryKey: ["scenario-cash", id],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenarioCash as Record<string, unknown>
          )?.[id] as ScenarioCashProjection) ?? null
        );
      try {
        return await actor.getScenarioCashProjection(id);
      } catch {
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenarioCash as Record<string, unknown>
          )?.[id] as ScenarioCashProjection) ?? null
        );
      }
    },
    enabled: (!!id && !isOffline && !!actor && !isFetching) || isOffline,
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useScenarioEVMSummary(id: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<ScenarioEVMSummary | null>({
    queryKey: ["scenario-evm", id],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenarioEvm as Record<string, unknown>
          )?.[id] as ScenarioEVMSummary) ?? null
        );
      try {
        return await actor.getScenarioEVMSummary(id);
      } catch {
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenarioEvm as Record<string, unknown>
          )?.[id] as ScenarioEVMSummary) ?? null
        );
      }
    },
    enabled: (!!id && !isOffline && !!actor && !isFetching) || isOffline,
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useScenarioBenchmarkVariances(id: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<ScenarioBenchmarkVariance[]>({
    queryKey: ["scenario-benchmark", id],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenarioBenchmark as Record<string, unknown>
          )?.[id] as ScenarioBenchmarkVariance[]) ?? []
        );
      try {
        return await actor.getScenarioBenchmarkVariances(id);
      } catch {
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenarioBenchmark as Record<string, unknown>
          )?.[id] as ScenarioBenchmarkVariance[]) ?? []
        );
      }
    },
    enabled: (!!id && !isOffline && !!actor && !isFetching) || isOffline,
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useCompareScenarios(ids: string[]) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<ScenarioCashProjection[]>({
    queryKey: ["scenarios-compare", ids],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenariosCompare as Record<string, unknown>
          )?.[ids.join(",")] as ScenarioCashProjection[] | undefined) ?? []
        );
      try {
        return await actor.compareScenarios(ids);
      } catch {
        return (
          ((
            (cachedData as unknown as Record<string, unknown>)
              ?.scenariosCompare as Record<string, unknown>
          )?.[ids.join(",")] as ScenarioCashProjection[] | undefined) ?? []
        );
      }
    },
    enabled:
      ids.length >= 2 && ((!isOffline && !!actor && !isFetching) || isOffline),
    refetchInterval: isOffline ? false : 5000,
  });
}
