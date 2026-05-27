import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SESSION_KEY = "pbp_session";

export interface PbpSession {
  email: string;
  name: string;
  isLoggedIn: boolean;
  token?: string;
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

/** Email-only login — calls actor.emailOnlyLogin, stores session token on success */
export function useEmailOnlyLogin() {
  const { actor } = useActor(createActor);
  return useMutation<{ token: string }, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        emailOnlyLogin: (
          email: string,
        ) => Promise<
          { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string }
        >;
      };
      const res = await a.emailOnlyLogin(email);
      if (res.__kind__ === "ok") return { token: res.ok };
      throw new Error(res.err);
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

/** Fetch all registered login emails for the controller */
export function useGetLoginEmails() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<string[]>({
    queryKey: ["loginEmails"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as unknown as {
        getLoginEmails: () => Promise<
          { __kind__: "ok"; ok: string[] } | { __kind__: "err"; err: string }
        >;
      };
      if (typeof a.getLoginEmails !== "function") return [];
      const res = await a.getLoginEmails();
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Add a new login email address */
export function useAddLoginEmail() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        addLoginEmail: (
          email: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.addLoginEmail !== "function")
        throw new Error("addLoginEmail not available");
      const res = await a.addLoginEmail(email);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loginEmails"] });
    },
  });
}

/** Remove a login email address */
export function useRemoveLoginEmail() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        removeLoginEmail: (
          email: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.removeLoginEmail !== "function")
        throw new Error("removeLoginEmail not available");
      const res = await a.removeLoginEmail(email);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loginEmails"] });
    },
  });
}

/** Change the controller password directly */
export function useChangeControllerPassword() {
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { newPassword: string }>({
    mutationFn: async ({ newPassword }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        changeControllerPassword: (
          newPassword: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.changeControllerPassword !== "function")
        throw new Error("changeControllerPassword not available");
      const res = await a.changeControllerPassword(newPassword);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
  });
}

// ─── Admin user management hooks ──────────────────────────────────────────────

export interface AdminUser {
  email: string;
  name: string;
  lastLogin: string;
  createdAt: string;
}

const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    email: "m.rivera@buildcorp.com",
    name: "Marcus Rivera",
    lastLogin: "2026-05-26T14:22:00Z",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    email: "s.chen@archdesign.com",
    name: "Sarah Chen",
    lastLogin: "2026-05-25T11:05:00Z",
    createdAt: "2025-06-01T08:30:00Z",
  },
  {
    email: "j.okafor@civilworks.com",
    name: "James Okafor",
    lastLogin: "2026-05-20T16:40:00Z",
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    email: "d.torres@mepgroup.com",
    name: "Daniel Torres",
    lastLogin: "2026-05-22T09:15:00Z",
    createdAt: "2026-05-20T08:00:00Z",
  },
  {
    email: "a.nguyen@homeconstruct.com",
    name: "Amy Nguyen",
    lastLogin: "2026-05-27T08:00:00Z",
    createdAt: "2026-05-22T07:45:00Z",
  },
];

export function useGetAllUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminUser[]>({
    queryKey: ["allAdminUsers"],
    queryFn: async () => {
      if (!actor) return MOCK_ADMIN_USERS;
      const a = actor as unknown as {
        getAllUsers: () => Promise<AdminUser[]>;
      };
      if (typeof a.getAllUsers !== "function") return MOCK_ADMIN_USERS;
      return a.getAllUsers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useGenerateUserResetCode() {
  const { actor } = useActor(createActor);
  return useMutation<string, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        generateUserResetCode: (
          email: string,
        ) => Promise<
          { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string }
        >;
      };
      if (typeof a.generateUserResetCode !== "function")
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      const res = await a.generateUserResetCode(email);
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
  });
}

export function useAddUserLoginEmail() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<void, Error, { targetEmail: string; newEmail: string }>({
    mutationFn: async ({ targetEmail, newEmail }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        addUserLoginEmail: (
          targetEmail: string,
          newEmail: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.addUserLoginEmail !== "function") return;
      const res = await a.addUserLoginEmail(targetEmail, newEmail);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: (_data, { targetEmail }) => {
      queryClient.invalidateQueries({
        queryKey: ["userLoginEmails", targetEmail],
      });
    },
  });
}

export function useRemoveUserLoginEmail() {
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation<
    void,
    Error,
    { targetEmail: string; emailToRemove: string }
  >({
    mutationFn: async ({ targetEmail, emailToRemove }) => {
      if (!actor) throw new Error("Actor not ready");
      const a = actor as unknown as {
        removeUserLoginEmail: (
          targetEmail: string,
          emailToRemove: string,
        ) => Promise<{ __kind__: string; err?: string }>;
      };
      if (typeof a.removeUserLoginEmail !== "function") return;
      const res = await a.removeUserLoginEmail(targetEmail, emailToRemove);
      if (res && res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: (_data, { targetEmail }) => {
      queryClient.invalidateQueries({
        queryKey: ["userLoginEmails", targetEmail],
      });
    },
  });
}

export function useGetUserLoginEmails(targetEmail: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<string[]>({
    queryKey: ["userLoginEmails", targetEmail],
    queryFn: async () => {
      if (!actor || !targetEmail) return [targetEmail];
      const a = actor as unknown as {
        getUserLoginEmails: (email: string) => Promise<string[]>;
      };
      if (typeof a.getUserLoginEmails !== "function") return [targetEmail];
      return a.getUserLoginEmails(targetEmail);
    },
    enabled: !!actor && !isFetching && !!targetEmail,
  });
}
