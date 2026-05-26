/**
 * useOACMeeting.ts
 * React Query hooks for OAC Meeting operations, Zoom integration, and AIA forms.
 */
import { createActor } from "@/backend";
import type {
  AIAFormEntry as BackendAIAFormEntry,
  MeetingPackage as BackendMeetingPackage,
  OACMeetingSession as BackendOACMeetingSession,
  ZoomSettings as BackendZoomSettings,
} from "@/backend";
import { FormType } from "@/backend";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ZoomSettings {
  clientId: string;
  clientSecret: string;
  fixedZoomLinks: Array<[string, string]>;
}

export interface OACMeetingSession {
  id: string;
  sessionDate: string;
  sessionTime: string;
  projectId: string;
  zoomLink?: string;
  zoomMeetingId?: string;
  linkedCategoryId?: string;
  createdAt: string;
}

export interface AIAFormEntry {
  id: string;
  sessionId: string;
  formType: "MeetingMinutes" | "G701" | "G702" | "G703" | "Addendum";
  submittedByRole: string;
  fieldData: Record<string, string>;
  submittedAt: string;
  lastModified: string;
}

export interface MeetingPackage {
  link: string;
  date: string;
  time: string;
  participants: string[];
}

export interface ZoomMeetingResult {
  success: boolean;
  joinUrl?: string;
  meetingId?: string;
  error?: string;
}

// ─── Local storage helpers ────────────────────────────────────────────────────

const CACHE_KEYS = {
  zoomSettings: "pbp_cache_zoom_settings",
  oacSessions: "pbp_cache_oac_sessions",
  aiaForms: "pbp_cache_aia_forms",
  meetingPackage: "pbp_cache_meeting_package",
} as const;

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function toFrontendZoomSettings(s: BackendZoomSettings): ZoomSettings {
  return {
    clientId: s.clientId,
    clientSecret: s.clientSecret,
    fixedZoomLinks: s.fixedZoomLinks,
  };
}

function toBackendZoomSettings(s: ZoomSettings): BackendZoomSettings {
  return {
    clientId: s.clientId,
    clientSecret: s.clientSecret,
    fixedZoomLinks: s.fixedZoomLinks,
  };
}

function toFrontendOACSession(s: BackendOACMeetingSession): OACMeetingSession {
  return {
    id: s.id,
    sessionDate: s.sessionDate,
    sessionTime: s.sessionTime,
    projectId: s.projectId,
    zoomLink: s.zoomLink,
    zoomMeetingId: s.zoomMeetingId,
    linkedCategoryId: s.linkedCategoryId,
    createdAt: new Date(Number(s.createdAt / BigInt(1_000_000))).toISOString(),
  };
}

function toFrontendAIAForm(f: BackendAIAFormEntry): AIAFormEntry {
  const fieldData: Record<string, string> = {};
  for (const [k, v] of f.fieldData) {
    fieldData[k] = v;
  }
  return {
    id: f.id,
    sessionId: f.sessionId,
    formType: f.formType as AIAFormEntry["formType"],
    submittedByRole: f.submittedByRole,
    fieldData,
    submittedAt: new Date(
      Number(f.submittedAt / BigInt(1_000_000)),
    ).toISOString(),
    lastModified: new Date(
      Number(f.lastModified / BigInt(1_000_000)),
    ).toISOString(),
  };
}

function toFrontendMeetingPackage(p: BackendMeetingPackage): MeetingPackage {
  return {
    link: p.link,
    date: p.date,
    time: p.time,
    participants: p.participants,
  };
}

function toBackendFieldData(
  fieldData: Record<string, string>,
): Array<[string, string]> {
  return Object.entries(fieldData);
}

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_ZOOM_SETTINGS: ZoomSettings = {
  clientId: "",
  clientSecret: "",
  fixedZoomLinks: [],
};

// ─── Zoom Settings hooks ────────────────────────────────────────────────────────

export function useZoomSettings() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<ZoomSettings>({
    queryKey: ["zoom", "settings"],
    queryFn: async () => {
      if (isOffline) {
        return readStore<ZoomSettings>(
          CACHE_KEYS.zoomSettings,
          DEFAULT_ZOOM_SETTINGS,
        );
      }
      if (!actor) return DEFAULT_ZOOM_SETTINGS;
      const backendSettings = await actor.getZoomSettings();
      if (!backendSettings) return DEFAULT_ZOOM_SETTINGS;
      const frontendSettings = toFrontendZoomSettings(backendSettings);
      writeStore(CACHE_KEYS.zoomSettings, frontendSettings);
      return frontendSettings;
    },
    enabled: isOffline || (!!actor && !isFetching),
    staleTime: 10_000,
  });
}

export function useSaveZoomSettings() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<boolean, Error, ZoomSettings>({
    mutationFn: async (settings) => {
      if (isOffline) throw new Error("Cannot save Zoom settings while offline");
      if (!actor) throw new Error("Actor not available");
      const backendSettings = toBackendZoomSettings(settings);
      const saved = await actor.saveZoomSettings(backendSettings);
      writeStore(CACHE_KEYS.zoomSettings, settings);
      return saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zoom", "settings"] });
    },
  });
}

export function useGenerateZoomMeeting() {
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<
    ZoomMeetingResult,
    Error,
    { sessionId: string; topic: string }
  >({
    mutationFn: async ({ sessionId, topic }) => {
      if (isOffline)
        throw new Error("Cannot generate Zoom meeting while offline");
      if (!actor) throw new Error("Actor not available");
      const result = await actor.generateZoomMeeting(sessionId, topic);
      if (result.__kind__ === "ok") {
        return {
          success: true,
          joinUrl: result.ok.joinUrl,
          meetingId: result.ok.meetingId,
        };
      }
      return { success: false, error: result.err };
    },
  });
}

export function useSetFixedZoomLink() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<boolean, Error, { roleId: string; zoomLink: string }>({
    mutationFn: async ({ roleId, zoomLink }) => {
      if (isOffline)
        throw new Error("Cannot set fixed Zoom link while offline");
      if (!actor) throw new Error("Actor not available");
      return actor.setFixedZoomLink(roleId, zoomLink);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zoom", "settings"] });
    },
  });
}

// ─── OAC Session hooks ──────────────────────────────────────────────────────────

export function useOACSessions() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<OACMeetingSession[]>({
    queryKey: ["oac", "sessions"],
    queryFn: async () => {
      if (isOffline) {
        return readStore<OACMeetingSession[]>(CACHE_KEYS.oacSessions, []);
      }
      if (!actor) return [];
      const backendSessions = await actor.getOACSessions();
      const frontendSessions = backendSessions.map(toFrontendOACSession);
      writeStore(CACHE_KEYS.oacSessions, frontendSessions);
      return frontendSessions;
    },
    enabled: isOffline || (!!actor && !isFetching),
    staleTime: 5_000,
    refetchInterval: isOffline ? false : 5000,
  });
}

export function useCreateOACSession() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<string, Error, { date: string; time: string }>({
    mutationFn: async ({ date, time }) => {
      if (isOffline) throw new Error("Cannot create OAC session while offline");
      if (!actor) throw new Error("Actor not available");
      return actor.createOACSession(date, time);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oac", "sessions"] });
    },
  });
}

export function useGetOACSession(id: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<OACMeetingSession | null>({
    queryKey: ["oac", "sessions", id],
    queryFn: async () => {
      if (isOffline) {
        const cached = readStore<OACMeetingSession[]>(
          CACHE_KEYS.oacSessions,
          [],
        );
        return cached.find((s) => s.id === id) ?? null;
      }
      if (!actor) return null;
      const backendSession = await actor.getOACSession(id);
      if (!backendSession) return null;
      return toFrontendOACSession(backendSession);
    },
    enabled: !!id && (isOffline || (!!actor && !isFetching)),
    staleTime: 5_000,
  });
}

// ─── AIA Form hooks ───────────────────────────────────────────────────────────

export function useSaveAIAForm() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<
    string,
    Error,
    {
      sessionId: string;
      formType: AIAFormEntry["formType"];
      fieldData: Record<string, string>;
      submittedByRole: string;
    }
  >({
    mutationFn: async ({ sessionId, formType, fieldData, submittedByRole }) => {
      if (isOffline) throw new Error("Cannot save AIA form while offline");
      if (!actor) throw new Error("Actor not available");
      const backendFormType = FormType[formType];
      return actor.saveAIAForm(
        sessionId,
        backendFormType,
        toBackendFieldData(fieldData),
        submittedByRole,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["oac", "forms", vars.sessionId] });
    },
  });
}

export function useGetAIAForms(sessionId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<AIAFormEntry[]>({
    queryKey: ["oac", "forms", sessionId],
    queryFn: async () => {
      if (isOffline) {
        const all = readStore<Record<string, AIAFormEntry[]>>(
          CACHE_KEYS.aiaForms,
          {},
        );
        return all[sessionId] ?? [];
      }
      if (!actor) return [];
      const backendForms = await actor.getAIAForms(sessionId);
      const frontendForms = backendForms.map(toFrontendAIAForm);
      const all = readStore<Record<string, AIAFormEntry[]>>(
        CACHE_KEYS.aiaForms,
        {},
      );
      all[sessionId] = frontendForms;
      writeStore(CACHE_KEYS.aiaForms, all);
      return frontendForms;
    },
    enabled: !!sessionId && (isOffline || (!!actor && !isFetching)),
    staleTime: 5_000,
  });
}

export function useUpdateAIAForm() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<
    boolean,
    Error,
    { formId: string; fieldData: Record<string, string>; sessionId: string }
  >({
    mutationFn: async ({ formId, fieldData }) => {
      if (isOffline) throw new Error("Cannot update AIA form while offline");
      if (!actor) throw new Error("Actor not available");
      return actor.updateAIAForm(formId, toBackendFieldData(fieldData));
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["oac", "forms", vars.sessionId] });
    },
  });
}

// ─── Meeting Package hook ─────────────────────────────────────────────────────

export function useMeetingPackage(sessionId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<MeetingPackage>({
    queryKey: ["oac", "package", sessionId],
    queryFn: async () => {
      if (isOffline) {
        return readStore<MeetingPackage>(CACHE_KEYS.meetingPackage, {
          link: "",
          date: "",
          time: "",
          participants: [],
        });
      }
      if (!actor) throw new Error("Actor not available");
      const pkg = await actor.getParticipantMeetingPackage(sessionId);
      const frontendPkg = toFrontendMeetingPackage(pkg);
      writeStore(CACHE_KEYS.meetingPackage, frontendPkg);
      return frontendPkg;
    },
    enabled: !!sessionId && (isOffline || (!!actor && !isFetching)),
    staleTime: 5_000,
  });
}
