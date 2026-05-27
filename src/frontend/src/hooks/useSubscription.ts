import { createActor } from "@/backend";
import type {
  SubscriptionStatus,
  SubscriptionTier,
  TrialLink,
  UserSubscription,
  Variant_Failed_Paid_Cancelled_Pending,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ReminderState {
  principal: string;
  day26Dismissed: boolean;
  day28Dismissed: boolean;
  day26EmailSent: boolean;
  day28EmailSent: boolean;
}

export interface VerificationDocument {
  documentType: string;
  storageKey: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: bigint;
  reviewedAt?: bigint;
  reviewNotes?: string;
}

export interface AdminRole {
  assignedPrincipal: Principal;
  assignedBy: Principal;
  assignedAt: bigint;
}

export interface PaymentMethodInfo {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface RenewalHistoryEntry {
  id: string;
  principal: Principal;
  tier: SubscriptionTier;
  startDate: bigint;
  endDate: bigint;
  monthlyCharge: bigint;
  totalPaid: bigint;
  status: Variant_Failed_Paid_Cancelled_Pending;
  createdAt: bigint;
}

export function useGetSubscriptionStatus() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SubscriptionStatus>({
    queryKey: ["subscriptionStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSubscriptionStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useGetUserSubscription() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserSubscription | null>({
    queryKey: ["userSubscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserSubscription();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useGetTrialLinks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TrialLink[]>({
    queryKey: ["trialLinks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrialLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEnrollTrial() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    UserSubscription,
    Error,
    {
      tier: SubscriptionTier;
      stripeCustomerId: string;
      stripePaymentMethodId: string;
    }
  >({
    mutationFn: async ({ tier, stripeCustomerId, stripePaymentMethodId }) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.enrollTrial(
        tier,
        stripeCustomerId,
        stripePaymentMethodId,
      );
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
}

export function useSwitchTrialTier() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<UserSubscription, Error, { newTier: SubscriptionTier }>({
    mutationFn: async ({ newTier }) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.switchTrialTier(newTier);
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
}

export function useCancelTrial() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.cancelTrial();
      if (res.__kind__ === "ok") return;
      throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
}

export function useSubmitDocumentForReview() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { documentType: string; storageKey: string }>(
    {
      mutationFn: async ({ documentType, storageKey }) => {
        if (!actor) throw new Error("Actor not available");
        const a = actor as unknown as Record<
          string,
          (...args: unknown[]) => unknown
        >;
        const res = (await a.submitDocumentForReview(
          documentType,
          storageKey,
        )) as Record<string, unknown>;
        if (res && res.__kind__ === "err") throw new Error(res.err as string);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documentReviewStatus"] });
      },
    },
  );
}

export function useGetDocumentReviewStatus() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<VerificationDocument[]>({
    queryKey: ["documentReviewStatus"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      if (typeof a.getDocumentReviewStatus !== "function") return [];
      return a.getDocumentReviewStatus() as Promise<VerificationDocument[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useGetPaymentMethods() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PaymentMethodInfo[]>({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      if (typeof a.getPaymentMethods !== "function") return [];
      return a.getPaymentMethods() as Promise<PaymentMethodInfo[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { setupIntentId: string }>({
    mutationFn: async ({ setupIntentId }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      const res = (await a.addPaymentMethod(setupIntentId)) as Record<
        string,
        unknown
      >;
      if (res && res.__kind__ === "err") throw new Error(res.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
}

export function useIsController(principal: Principal | null | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isController", principal?.toText()],
    queryFn: async () => {
      if (!actor || !principal) return false;
      return actor.isController(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}
export function useClaimController() {
  const { actor } = useActor(createActor);
  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.claimController();
      if (res.__kind__ === "err") throw new Error(res.err);
    },
  });
}

export function useIsAdmin(principal: Principal | null | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAdmin", principal?.toText()],
    queryFn: async () => {
      if (!actor || !principal) return false;
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      if (typeof a.isAdmin !== "function") return false;
      return a.isAdmin(principal) as Promise<boolean>;
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetAdminList() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminRole[]>({
    queryKey: ["adminList"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      if (typeof a.getAdminList !== "function") return [];
      return a.getAdminList() as Promise<AdminRole[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignAdmin() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { principal: Principal }>({
    mutationFn: async ({ principal }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      const res = (await a.assignAdmin(principal)) as Record<string, unknown>;
      if (res && res.__kind__ === "err") throw new Error(res.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminList"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useRevokeAdmin() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { principal: Principal }>({
    mutationFn: async ({ principal }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      const res = (await a.revokeAdmin(principal)) as Record<string, unknown>;
      if (res && res.__kind__ === "err") throw new Error(res.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminList"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useGetRenewalHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<RenewalHistoryEntry[]>({
    queryKey: ["renewalHistory"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      if (typeof a.getRenewalHistory !== "function") return [];
      return a.getRenewalHistory() as Promise<RenewalHistoryEntry[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetReminderState() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ReminderState | null>({
    queryKey: ["reminderState"],
    queryFn: async () => {
      if (!actor) return null;
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      if (typeof a.getReminderState !== "function") return null;
      return a.getReminderState() as Promise<ReminderState | null>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, number>({
    mutationFn: async (day: number) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      const res = (await a.dismissReminder(BigInt(day))) as Record<
        string,
        unknown
      >;
      if (res && res.__kind__ === "err") throw new Error(res.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminderState"] });
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as Record<
        string,
        (...args: unknown[]) => unknown
      >;
      const res = (await a.renewSubscription()) as Record<string, unknown>;
      if (res && res.__kind__ === "err") throw new Error(res.err as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["documentReviewStatus"] });
    },
  });
}
// ─── Admin management mock data types & hooks ────────────────────────────────

export type AdminDocStatus = "Pending" | "Approved" | "Rejected";
export type AdminDocType = "EIN" | "Proof of Address" | "Government ID";

export interface AdminDocument {
  id: string;
  userName: string;
  userEmail: string;
  documentType: AdminDocType;
  uploadDate: string;
  status: AdminDocStatus;
}

export type SubscriptionPlan =
  | "1-Year $299/mo"
  | "5-Year $199/mo"
  | "10-Year $99/mo";
export type SubscriberStatus = "Active" | "Expired" | "Failed" | "Suspended";

export interface AdminSubscriber {
  id: string;
  userEmail: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  monthlyCharge: number;
  nextBilling: string;
  status: SubscriberStatus;
}

export type TrialStatus = "Active" | "Converted" | "Cancelled";

export interface AdminTrialMember {
  id: string;
  userEmail: string;
  planSelected: SubscriptionPlan;
  trialStartDate: string;
  daysRemaining: number;
  status: TrialStatus;
}

const MOCK_DOCUMENTS: AdminDocument[] = [
  {
    id: "doc-1",
    userName: "Marcus Rivera",
    userEmail: "m.rivera@buildcorp.com",
    documentType: "EIN",
    uploadDate: "2026-05-10",
    status: "Pending",
  },
  {
    id: "doc-2",
    userName: "Sarah Chen",
    userEmail: "s.chen@archdesign.com",
    documentType: "Proof of Address",
    uploadDate: "2026-05-12",
    status: "Pending",
  },
  {
    id: "doc-3",
    userName: "James Okafor",
    userEmail: "j.okafor@civilworks.com",
    documentType: "Government ID",
    uploadDate: "2026-05-14",
    status: "Approved",
  },
  {
    id: "doc-4",
    userName: "Laura Kim",
    userEmail: "l.kim@structpro.com",
    documentType: "EIN",
    uploadDate: "2026-05-15",
    status: "Rejected",
  },
  {
    id: "doc-5",
    userName: "Daniel Torres",
    userEmail: "d.torres@mepgroup.com",
    documentType: "Government ID",
    uploadDate: "2026-05-20",
    status: "Pending",
  },
];

const MOCK_SUBSCRIBERS: AdminSubscriber[] = [
  {
    id: "sub-1",
    userEmail: "m.rivera@buildcorp.com",
    plan: "1-Year $299/mo",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    monthlyCharge: 299,
    nextBilling: "2026-06-01",
    status: "Active",
  },
  {
    id: "sub-2",
    userEmail: "s.chen@archdesign.com",
    plan: "5-Year $199/mo",
    startDate: "2025-06-01",
    endDate: "2030-05-31",
    monthlyCharge: 199,
    nextBilling: "2026-06-01",
    status: "Active",
  },
  {
    id: "sub-3",
    userEmail: "j.okafor@civilworks.com",
    plan: "10-Year $99/mo",
    startDate: "2024-03-15",
    endDate: "2034-03-14",
    monthlyCharge: 99,
    nextBilling: "2026-06-15",
    status: "Active",
  },
  {
    id: "sub-4",
    userEmail: "l.kim@structpro.com",
    plan: "1-Year $299/mo",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    monthlyCharge: 299,
    nextBilling: "—",
    status: "Expired",
  },
];

const MOCK_TRIAL_MEMBERS: AdminTrialMember[] = [
  {
    id: "trial-1",
    userEmail: "d.torres@mepgroup.com",
    planSelected: "1-Year $299/mo",
    trialStartDate: "2026-05-20",
    daysRemaining: 27,
    status: "Active",
  },
  {
    id: "trial-2",
    userEmail: "a.nguyen@homeconstruct.com",
    planSelected: "10-Year $99/mo",
    trialStartDate: "2026-05-22",
    daysRemaining: 2,
    status: "Active",
  },
  {
    id: "trial-3",
    userEmail: "r.patel@urbandev.com",
    planSelected: "5-Year $199/mo",
    trialStartDate: "2026-04-01",
    daysRemaining: 0,
    status: "Converted",
  },
  {
    id: "trial-4",
    userEmail: "c.morgan@greensite.com",
    planSelected: "10-Year $99/mo",
    trialStartDate: "2026-04-15",
    daysRemaining: 0,
    status: "Cancelled",
  },
];

export function useAdminDocuments() {
  return useQuery<AdminDocument[]>({
    queryKey: ["adminDocuments"],
    queryFn: async () => MOCK_DOCUMENTS,
    staleTime: 0,
  });
}

export function useAdminSubscribers() {
  return useQuery<AdminSubscriber[]>({
    queryKey: ["adminSubscribers"],
    queryFn: async () => MOCK_SUBSCRIBERS,
    staleTime: 0,
  });
}

export function useAdminTrialMembers() {
  return useQuery<AdminTrialMember[]>({
    queryKey: ["adminTrialMembers"],
    queryFn: async () => MOCK_TRIAL_MEMBERS,
    staleTime: 0,
  });
}

// ─── Admin subscription management hooks ─────────────────────────────────────

export interface CancellationRequest {
  id: string;
  email: string;
  requestedDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Denied";
}

export interface ActiveRecurringCharge {
  email: string;
  tier: string;
  monthlyCharge: number;
  nextBillingDate: string;
  status: string;
}

export interface ManagedSubscription {
  email: string;
  tier: string;
  status: "Active" | "Frozen" | "Cancelled";
  startDate: string;
  frozenReason?: string;
}

const MOCK_CANCELLATION_REQUESTS: CancellationRequest[] = [
  {
    id: "cr-1",
    email: "m.rivera@buildcorp.com",
    requestedDate: "2026-05-24",
    reason: "Project completed, no longer need the service.",
    status: "Pending",
  },
  {
    id: "cr-2",
    email: "a.nguyen@homeconstruct.com",
    requestedDate: "2026-05-26",
    reason: "Budget constraints for the quarter.",
    status: "Pending",
  },
];

const MOCK_MANAGED_SUBSCRIPTIONS: ManagedSubscription[] = [
  {
    email: "m.rivera@buildcorp.com",
    tier: "1-Year $299/mo",
    status: "Active",
    startDate: "2026-01-01",
  },
  {
    email: "s.chen@archdesign.com",
    tier: "5-Year $199/mo",
    status: "Active",
    startDate: "2025-06-01",
  },
  {
    email: "j.okafor@civilworks.com",
    tier: "10-Year $99/mo",
    status: "Active",
    startDate: "2024-03-15",
  },
  {
    email: "r.patel@urbandev.com",
    tier: "5-Year $199/mo",
    status: "Frozen",
    startDate: "2026-02-01",
    frozenReason: "Payment dispute under review.",
  },
];

export function useGetAllCancellationRequests() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CancellationRequest[]>({
    queryKey: ["allCancellationRequests"],
    queryFn: async () => {
      if (!actor) return MOCK_CANCELLATION_REQUESTS;
      const a = actor as unknown as {
        getAllCancellationRequests: () => Promise<CancellationRequest[]>;
      };
      if (typeof a.getAllCancellationRequests !== "function")
        return MOCK_CANCELLATION_REQUESTS;
      return a.getAllCancellationRequests();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useApproveCancellationRequest() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { requestId: string }>({
    mutationFn: async ({ requestId }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as {
        approveCancellationRequest: (
          id: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.approveCancellationRequest !== "function") return;
      const res = await a.approveCancellationRequest(requestId);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCancellationRequests"] });
      queryClient.invalidateQueries({ queryKey: ["managedSubscriptions"] });
    },
  });
}

export function useDenyCancellationRequest() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { requestId: string }>({
    mutationFn: async ({ requestId }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as {
        denyCancellationRequest: (
          id: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.denyCancellationRequest !== "function") return;
      const res = await a.denyCancellationRequest(requestId);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCancellationRequests"] });
    },
  });
}

export function useDirectCancelSubscription() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as {
        directCancelSubscription: (
          email: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.directCancelSubscription !== "function") return;
      const res = await a.directCancelSubscription(email);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managedSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["adminSubscribers"] });
    },
  });
}

export function useGetManagedSubscriptions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ManagedSubscription[]>({
    queryKey: ["managedSubscriptions"],
    queryFn: async () => {
      if (!actor) return MOCK_MANAGED_SUBSCRIPTIONS;
      const a = actor as unknown as {
        getManagedSubscriptions: () => Promise<ManagedSubscription[]>;
      };
      if (typeof a.getManagedSubscriptions !== "function")
        return MOCK_MANAGED_SUBSCRIPTIONS;
      return a.getManagedSubscriptions();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useFreezeSubscription() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { email: string; reason: string }>({
    mutationFn: async ({ email, reason }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as {
        freezeSubscription: (
          email: string,
          reason: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.freezeSubscription !== "function") return;
      const res = await a.freezeSubscription(email, reason);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managedSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["adminSubscribers"] });
    },
  });
}

export function useUnfreezeSubscription() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as unknown as {
        unfreezeSubscription: (
          email: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.unfreezeSubscription !== "function") return;
      const res = await a.unfreezeSubscription(email);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managedSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["adminSubscribers"] });
    },
  });
}
