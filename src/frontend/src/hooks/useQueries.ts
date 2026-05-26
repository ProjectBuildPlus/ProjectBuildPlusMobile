import { createActor } from "@/backend";
import type {
  BaselineType,
  CostCode,
  CostCodeInput,
  CumulativePoint,
  CumulativePointWithCodes,
  EVMPoint,
  Phase,
  PhaseInput,
  ProjectEVMSummary,
} from "@/backend";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePhases() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<Phase[]>({
    queryKey: ["phases"],
    queryFn: async () => {
      if (isOffline || !actor) return (cachedData?.phases as Phase[]) ?? [];
      try {
        return await actor.getPhases();
      } catch {
        return (cachedData?.phases as Phase[]) ?? [];
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useCumulativeCashRequirement() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<CumulativePoint[]>({
    queryKey: ["cumulativeCashRequirement"],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          (cachedData?.cumulativeCashRequirement as CumulativePoint[]) ?? []
        );
      try {
        return await actor.getCumulativeCashRequirement();
      } catch {
        return (
          (cachedData?.cumulativeCashRequirement as CumulativePoint[]) ?? []
        );
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useCumulativeCrashedRequirement() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<CumulativePoint[]>({
    queryKey: ["cumulativeCrashedRequirement"],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          (cachedData?.cumulativeCrashedRequirement as CumulativePoint[]) ?? []
        );
      try {
        return await actor.getCumulativeCrashedRequirement();
      } catch {
        return (
          (cachedData?.cumulativeCrashedRequirement as CumulativePoint[]) ?? []
        );
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useUpsertPhase() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<Phase, Error, { phaseId: bigint; input: PhaseInput }>({
    mutationFn: async ({ phaseId, input }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.upsertPhase(phaseId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCashRequirement"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCrashedRequirement"],
      });
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (phaseId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePhase(phaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCashRequirement"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCrashedRequirement"],
      });
    },
  });
}

export function useCostCodesForPhase(phaseId: number) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<CostCode[]>({
    queryKey: ["costCodes", phaseId],
    queryFn: async () => {
      if (isOffline || !actor)
        return (cachedData?.costCodes?.[String(phaseId)] as CostCode[]) ?? [];
      try {
        const res = await actor.getCostCodesForPhase(BigInt(phaseId));
        if ("ok" in res) return res.ok;
        return (cachedData?.costCodes?.[String(phaseId)] as CostCode[]) ?? [];
      } catch {
        return (cachedData?.costCodes?.[String(phaseId)] as CostCode[]) ?? [];
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useUpsertCostCode() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    CostCode,
    Error,
    { phaseId: number; input: CostCodeInput }
  >({
    mutationFn: async ({ phaseId, input }) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.upsertCostCode(BigInt(phaseId), input);
      if ("ok" in res) return res.ok;
      throw new Error("err" in res ? res.err : "Unknown error");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["costCodes", variables.phaseId],
      });
      queryClient.invalidateQueries({ queryKey: ["cumulativeWithBreakdown"] });
    },
  });
}

export function useDeleteCostCode() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { phaseId: number; codeId: number }>({
    mutationFn: async ({ phaseId, codeId }) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.deleteCostCode(BigInt(phaseId), BigInt(codeId));
      if ("ok" in res) return;
      throw new Error("err" in res ? res.err : "Unknown error");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["costCodes", variables.phaseId],
      });
      queryClient.invalidateQueries({ queryKey: ["cumulativeWithBreakdown"] });
    },
  });
}

export function useCumulativeWithBreakdown() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<CumulativePointWithCodes[]>({
    queryKey: ["cumulativeWithBreakdown"],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          (cachedData?.cumulativeWithBreakdown as CumulativePointWithCodes[]) ??
          []
        );
      try {
        const data = await actor.getCumulativeWithBreakdown();
        return data.map((d) => ({
          ...d,
          phaseOrder: Number(d.phaseOrder),
          endOffset: Number(d.endOffset),
        })) as unknown as CumulativePointWithCodes[];
      } catch {
        return (
          (cachedData?.cumulativeWithBreakdown as CumulativePointWithCodes[]) ??
          []
        );
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useSetPhases() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, PhaseInput[]>({
    mutationFn: async (inputs) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setPhases(inputs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCashRequirement"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cumulativeCrashedRequirement"],
      });
    },
  });
}

export function useEarnedValueMetrics(baselineType: BaselineType) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<EVMPoint[]>({
    queryKey: ["earnedValueMetrics", baselineType],
    queryFn: async () => {
      if (isOffline || !actor)
        return (
          (cachedData?.earnedValueMetrics?.[
            String(baselineType)
          ] as EVMPoint[]) ?? []
        );
      try {
        return await actor.getEarnedValueMetrics(baselineType);
      } catch {
        return (
          (cachedData?.earnedValueMetrics?.[
            String(baselineType)
          ] as EVMPoint[]) ?? []
        );
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useProjectEVMSummary(baselineType: BaselineType) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline, cachedData } = useOfflineSync();
  return useQuery<ProjectEVMSummary>({
    queryKey: ["projectEVMSummary", baselineType],
    queryFn: async () => {
      if (isOffline || !actor) {
        const cached = cachedData?.projectEVMSummary?.[String(baselineType)] as
          | ProjectEVMSummary
          | undefined;
        if (cached) return cached;
        throw new Error("Actor not available");
      }
      try {
        return await actor.getProjectEVMSummary(baselineType);
      } catch {
        const cached = cachedData?.projectEVMSummary?.[String(baselineType)] as
          | ProjectEVMSummary
          | undefined;
        if (cached) return cached;
        throw new Error("Actor not available");
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useCostCodeCompletion(phaseId: bigint, codeId: bigint) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<number | null>({
    queryKey: ["costCodeCompletion", phaseId.toString(), codeId.toString()],
    queryFn: async () => {
      if (isOffline || !actor) return null;
      try {
        const res = await actor.getCostCodeCompletion(phaseId, codeId);
        return res ?? null;
      } catch {
        return null;
      }
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 3000,
  });
}

export function useUpdateCostCodeCompletion() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    void,
    Error,
    { phaseId: bigint; codeId: bigint; pct: number }
  >({
    mutationFn: async ({ phaseId, codeId, pct }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCostCodeCompletion(phaseId, codeId, pct);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "costCodeCompletion",
          variables.phaseId.toString(),
          variables.codeId.toString(),
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["earnedValueMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["projectEVMSummary"] });
    },
  });
}
