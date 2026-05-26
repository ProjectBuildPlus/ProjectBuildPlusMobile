import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SESSION_KEY = "pbp_session";

export interface PbpSession {
  email: string;
  name: string;
  isLoggedIn: boolean;
}

export function getSession(): PbpSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PbpSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: PbpSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Email + password login — calls actor.emailLogin, stores session on success */
export function useEmailLogin() {
  const { actor } = useActor(createActor);
  return useMutation<
    { name: string; email: string },
    Error,
    { email: string; password: string }
  >({
    mutationFn: async ({ email, password }) => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.emailLogin(
        email,
        password,
        navigator.userAgent,
        "",
      );
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
  });
}

/** Register a new email user account */
export function useRegisterEmailUser() {
  const { actor } = useActor(createActor);
  return useMutation<
    void,
    Error,
    { email: string; password: string; name: string; phone: string }
  >({
    mutationFn: async ({ email, password, name, phone }) => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.registerEmailUser(email, password, name, phone);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
  });
}

/** Generate a 6-char reset code; returns it on success */
export function useResetCode() {
  const { actor } = useActor(createActor);
  return useMutation<string, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.generateResetCode(email);
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
  });
}

/** Validate reset code and set a new password */
export function useValidateResetCode() {
  const { actor } = useActor(createActor);
  return useMutation<
    void,
    Error,
    { email: string; code: string; newPassword: string }
  >({
    mutationFn: async ({ email, code, newPassword }) => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.validateResetCode(email, code, newPassword);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
  });
}

/** Change password: validate current password then set new password */
export function useChangePassword() {
  const { actor } = useActor(createActor);
  return useMutation<
    void,
    Error,
    { email: string; currentPassword: string; newPassword: string }
  >({
    mutationFn: async ({ email, currentPassword, newPassword }) => {
      if (!actor) throw new Error("Actor not ready");
      const actorWithChangePassword = actor as unknown as {
        changePassword: (
          email: string,
          currentPassword: string,
          newPassword: string,
        ) => Promise<
          { __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }
        >;
      };
      const res = await actorWithChangePassword.changePassword(
        email,
        currentPassword,
        newPassword,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
    },
  });
}

/** Fetch the controller profile (name, email, phone) */
export function useControllerProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<{ name: string; email: string; phone: string }>({
    queryKey: ["controllerProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.getControllerProfile();
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Update the controller profile */
// ─── Session types ────────────────────────────────────────────────────────────

export interface LoginSnapshot {
  id: string;
  timestamp: number;
  userAgent: string;
  ipAddress: string;
}

export interface SessionSnapshot {
  sessionId: string;
  userAgent: string;
  lastActive: number;
  isCurrent: boolean;
}

export interface FeatureLocks {
  scheduling: boolean;
  cost: boolean;
  resources: boolean;
  compliance: boolean;
  participants: boolean;
  documents: boolean;
  oacMeetings: boolean;
  subscriptions: boolean;
}

/** Fetch login history — returns past sign-in snapshots */
export function useLoginHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<LoginSnapshot[]>({
    queryKey: ["loginHistory"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as unknown as {
        getLoginHistory: () => Promise<LoginSnapshot[]>;
      };
      if (typeof a.getLoginHistory !== "function") return [];
      return a.getLoginHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch currently active sessions */
export function useActiveSessions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SessionSnapshot[]>({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as unknown as {
        getActiveSessions: () => Promise<SessionSnapshot[]>;
      };
      if (typeof a.getActiveSessions !== "function") return [];
      return a.getActiveSessions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

/** End a specific session by ID */
export function useEndSession() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { sessionId: string }>({
    mutationFn: async ({ sessionId }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        endSession: (id: string) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.endSession !== "function") return;
      const res = await a.endSession(sessionId);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
    },
  });
}

/** Fetch feature lock states */
export function useFeatureLocks() {
  const { actor, isFetching } = useActor(createActor);
  const unlocked: FeatureLocks = {
    scheduling: true,
    cost: true,
    resources: true,
    compliance: true,
    participants: true,
    documents: true,
    oacMeetings: true,
    subscriptions: true,
  };
  return useQuery<FeatureLocks>({
    queryKey: ["featureLocks"],
    queryFn: async () => {
      if (!actor) return unlocked;
      const a = actor as unknown as {
        getFeatureLocks: () => Promise<FeatureLocks>;
      };
      if (typeof a.getFeatureLocks !== "function") return unlocked;
      return a.getFeatureLocks();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Set lock state for a specific feature */
export function useSetFeatureLock() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { feature: string; locked: boolean }>({
    mutationFn: async ({ feature, locked }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        setFeatureLock: (
          feature: string,
          locked: boolean,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.setFeatureLock !== "function") return;
      const res = await a.setFeatureLock(feature, locked);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureLocks"] });
    },
  });
}

export function useUpdateControllerProfile() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    void,
    Error,
    { name: string; email: string; phone: string }
  >({
    mutationFn: async ({ name, email, phone }) => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.updateControllerProfile(name, email, phone);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controllerProfile"] });
    },
  });
}
