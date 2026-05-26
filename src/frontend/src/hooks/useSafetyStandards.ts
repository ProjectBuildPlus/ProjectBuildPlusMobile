import { createActor } from "@/backend";
import type {
  ComplianceItemShared,
  ComplianceSeverity,
  ComplianceStatus,
  CriticalChangePlanShared,
  CriticalPlanStatus,
  NCCERCertShared,
  NCCERCertStatus,
  ParticipantRole,
  PhaseComplianceSummary,
  PhaseSignOffShared,
  SafetyStandard,
  StandardCategory,
} from "@/backend";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStandardsLibrary(
  searchText: string,
  category: StandardCategory | null,
  state: string | null,
) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<SafetyStandard[]>({
    queryKey: ["standardsLibrary", searchText, category, state],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.searchStandards(searchText, category, state);
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useFilteredStandards(
  projectCategory: string,
  projectSubtype: string,
  state: string | null,
) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<SafetyStandard[]>({
    queryKey: ["filteredStandards", projectCategory, projectSubtype, state],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.getFilteredStandards(projectCategory, projectSubtype, state);
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useStandard(id: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<SafetyStandard | null>({
    queryKey: ["standard", id],
    queryFn: async () => {
      if (isOffline || !actor) return null;
      return actor.getStandard(id);
    },
    enabled: isOffline || (!!actor && !isFetching && !!id),
  });
}

export function useStandardsForPhase(phaseId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<SafetyStandard[]>({
    queryKey: ["standardsForPhase", phaseId],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.getStandardsForPhase(phaseId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!phaseId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useLinkStandardToPhase() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    unknown,
    Error,
    { phaseId: string; csiCode: string; standardId: string }
  >({
    mutationFn: async ({ phaseId, csiCode, standardId }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.linkStandardToPhase(phaseId, csiCode, standardId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["standardsForPhase", variables.phaseId],
      });
    },
  });
}

export function useUnlinkStandardFromPhase() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    boolean,
    Error,
    { phaseId: string; csiCode: string; standardId: string }
  >({
    mutationFn: async ({ phaseId, csiCode, standardId }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unlinkStandardFromPhase(phaseId, csiCode, standardId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["standardsForPhase", variables.phaseId],
      });
    },
  });
}

export function useAutoLinkStandards() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    string[],
    Error,
    { projectCategory: string; projectSubtype: string; state: string | null }
  >({
    mutationFn: async ({ projectCategory, projectSubtype, state }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.autoLinkStandardsForCategory(
        projectCategory,
        projectSubtype,
        state,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standardsForPhase"] });
    },
  });
}

export function useComplianceItemsForPhase(phaseId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<ComplianceItemShared[]>({
    queryKey: ["complianceItems", phaseId],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.getComplianceItemsForPhase(phaseId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!phaseId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function usePhaseComplianceStatus(phaseId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<PhaseComplianceSummary | null>({
    queryKey: ["phaseComplianceStatus", phaseId],
    queryFn: async () => {
      if (isOffline || !actor) return null;
      return actor.getPhaseComplianceStatus(phaseId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!phaseId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useUpsertComplianceItem() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    ComplianceItemShared,
    Error,
    {
      phaseId: string;
      standardId: string;
      status: ComplianceStatus;
      severity: ComplianceSeverity;
      notes: string;
    }
  >({
    mutationFn: async ({ phaseId, standardId, status, severity, notes }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.upsertComplianceItem(
        phaseId,
        standardId,
        status,
        severity,
        notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["complianceItems", variables.phaseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["phaseComplianceStatus", variables.phaseId],
      });
    },
  });
}

export function useSignOffsForPhase(phaseId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<PhaseSignOffShared[]>({
    queryKey: ["signOffs", phaseId],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.getSignOffsForPhase(phaseId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!phaseId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useSubmitPhaseSignOff() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    PhaseSignOffShared,
    Error,
    { phaseId: string; approved: boolean; comments: string }
  >({
    mutationFn: async ({ phaseId, approved, comments }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitPhaseSignOff(phaseId, approved, comments);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["signOffs", variables.phaseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["phaseComplianceStatus", variables.phaseId],
      });
    },
  });
}

export function useIsPhaseSignedOff(phaseId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<boolean>({
    queryKey: ["isPhaseSignedOff", phaseId],
    queryFn: async () => {
      if (isOffline || !actor) return false;
      return actor.isPhaseSignedOff(phaseId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!phaseId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useNCCERCertificationsForParticipant(participantId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<NCCERCertShared[]>({
    queryKey: ["nccerCerts", participantId],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.getNCCERCertificationsForParticipant(participantId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!participantId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useCertificationsForPhase(phaseId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<NCCERCertShared[]>({
    queryKey: ["nccerCertsForPhase", phaseId],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.getCertificationsForPhase(phaseId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!phaseId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useAddNCCERCertification() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    NCCERCertShared,
    Error,
    {
      participantId: string;
      trade: string;
      discipline: string;
      level: string;
      state: string;
      certNumber: string;
      issuedAt: bigint;
      expiresAt: bigint;
    }
  >({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addNCCERCertification(
        params.participantId,
        params.trade,
        params.discipline,
        params.level,
        params.state,
        params.certNumber,
        params.issuedAt,
        params.expiresAt,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nccerCerts"] });
    },
  });
}

export function useUpdateNCCERCertification() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    NCCERCertShared | null,
    Error,
    {
      id: string;
      trade?: string | null;
      discipline?: string | null;
      level?: string | null;
      certNumber?: string | null;
      issuedAt?: bigint | null;
      expiresAt?: bigint | null;
      status?: NCCERCertStatus | null;
    }
  >({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateNCCERCertification(
        params.id,
        params.trade ?? null,
        params.discipline ?? null,
        params.level ?? null,
        params.certNumber ?? null,
        params.issuedAt ?? null,
        params.expiresAt ?? null,
        params.status ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nccerCerts"] });
    },
  });
}

export function useCriticalChangePlansForPhase(phaseId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<CriticalChangePlanShared[]>({
    queryKey: ["criticalChangePlans", phaseId],
    queryFn: async () => {
      if (isOffline || !actor) return [];
      return actor.getCriticalChangePlansForPhase(phaseId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!phaseId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useCreateCriticalChangePlan() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    CriticalChangePlanShared,
    Error,
    {
      name: string;
      phaseIds: string[];
      csiCodes: string[];
      hazardAnalysis: string;
      controlMeasures: string;
      affectedStandardIds: string[];
      responsibleParticipantIds: string[];
    }
  >({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createCriticalChangePlan(
        params.name,
        params.phaseIds,
        params.csiCodes,
        params.hazardAnalysis,
        params.controlMeasures,
        params.affectedStandardIds,
        params.responsibleParticipantIds,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criticalChangePlans"] });
    },
  });
}

export function useUpdateCriticalChangePlan() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    CriticalChangePlanShared | null,
    Error,
    {
      id: string;
      name?: string | null;
      phaseIds?: string[] | null;
      csiCodes?: string[] | null;
      hazardAnalysis?: string | null;
      controlMeasures?: string | null;
      affectedStandardIds?: string[] | null;
      responsibleParticipantIds?: string[] | null;
    }
  >({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCriticalChangePlan(
        params.id,
        params.name ?? null,
        params.phaseIds ?? null,
        params.csiCodes ?? null,
        params.hazardAnalysis ?? null,
        params.controlMeasures ?? null,
        params.affectedStandardIds ?? null,
        params.responsibleParticipantIds ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criticalChangePlans"] });
    },
  });
}

export function useSubmitPlanForApproval() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<CriticalChangePlanShared | null, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitPlanForApproval(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criticalChangePlans"] });
    },
  });
}

export function useApproveCriticalChangePlan() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<unknown, Error, { planId: string; approved: boolean }>({
    mutationFn: async ({ planId, approved }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveCriticalChangePlan(planId, approved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criticalChangePlans"] });
    },
  });
}

export function useIsPlanFullyApproved(planId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<boolean>({
    queryKey: ["isPlanFullyApproved", planId],
    queryFn: async () => {
      if (isOffline || !actor) return false;
      return actor.isPlanFullyApproved(planId);
    },
    enabled: isOffline || (!!actor && !isFetching && !!planId),
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useCanAccessCompliance(role: ParticipantRole | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["canAccessCompliance", role],
    queryFn: async () => {
      if (!actor || !role) return false;
      return actor.canAccessCompliance(role);
    },
    enabled: !!actor && !isFetching && !!role,
  });
}

export function useCanManageCriticalPlans(role: ParticipantRole | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["canManageCriticalPlans", role],
    queryFn: async () => {
      if (!actor || !role) return false;
      return actor.canManageCriticalPlans(role);
    },
    enabled: !!actor && !isFetching && !!role,
  });
}
