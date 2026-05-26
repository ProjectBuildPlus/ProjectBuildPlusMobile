/**
 * useParticipants.ts
 * React Query hooks for the Participants & Directory module.
 *
 * All hooks call the live backend actor via useActor(createActor).
 * LocalStorage is used only for offline caching and supplementary fields
 * not stored in the backend actor.
 */
import { createActor } from "@/backend";
import type {
  AppSettings as BackendAppSettings,
  Participant as BackendParticipant,
  ParticipantAssignment as BackendParticipantAssignment,
  RSMeansSettings as BackendRSMeansSettings,
} from "@/backend";
import {
  AccessControlMode,
  ParticipantRole as BackendParticipantRole,
  ParticipantStatus as BackendParticipantStatus,
  RSMeansSource as BackendRSMeansSource,
} from "@/backend";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ParticipantRole =
  | "Owner"
  | "Architect"
  | "Designer"
  | "CivilEngineer"
  | "MechanicalEngineer"
  | "SpecialtyEngineer"
  | "ConstructionManager"
  | "Contractor";

export type ParticipantStatus = "pending" | "approved" | "rejected" | "active";

export interface ParticipantAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ParticipantContact {
  officePhone: string;
  mobilePhone: string;
  fax: string;
  email: string;
}

export interface ParticipantCompany {
  name: string;
  address: ParticipantAddress;
  trade: string;
  licenseNumber: string;
  website: string;
}

export interface Participant {
  id: string;
  role: ParticipantRole;
  firstName: string;
  lastName: string;
  residentialAddress: ParticipantAddress;
  contact: ParticipantContact;
  company: ParticipantCompany;
  status: ParticipantStatus;
  passcode?: string;
  passcodeDeliveredAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantInput {
  role: ParticipantRole;
  firstName: string;
  lastName: string;
  residentialAddress: ParticipantAddress;
  contact: ParticipantContact;
  company: ParticipantCompany;
  notes: string;
}

export interface ParticipantAssignment {
  id: string;
  participantId: string;
  phaseId?: string;
  costCodeId?: string;
  csiDivision?: string;
  scope: string;
  createdAt: string;
}

export interface AssignmentInput {
  participantId: string;
  phaseId?: string;
  costCodeId?: string;
  csiDivision?: string;
  scope: string;
}

export interface RSMeansEntry {
  id: string;
  participantId: string;
  csiDivision: string;
  csiCode: string;
  description: string;
  unit: string;
  unitCost: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  totalCost: number;
  crewCode: string;
  source: "live_api" | "manual";
  fetchedAt?: string;
  notes: string;
}

export interface RSMeansEntryInput {
  participantId: string;
  csiDivision: string;
  csiCode: string;
  description: string;
  unit: string;
  unitCost: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  totalCost: number;
  crewCode: string;
  source: "live_api" | "manual";
  notes: string;
}

export interface RSMeansSettings {
  apiKey: string;
  mode: "live_api" | "manual";
  baseUrl: string;
  locationFactor: number;
  enabled: boolean;
}

export interface RSMeansConnectionResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface RSMeansBenchmark {
  csiDivision: string;
  csiCode: string;
  description: string;
  unit: string;
  nationalAvgTotal: number;
  crewCode: string;
  source: "live_api" | "manual";
}

function getSampleBenchmarks(csiDivision?: string): RSMeansBenchmark[] {
  const division = csiDivision ?? "03";
  return [
    {
      csiDivision: division,
      csiCode: `${division}-1000`,
      description: "Concrete Formwork",
      unit: "SF",
      nationalAvgTotal: 4.25,
      crewCode: "C1",
      source: "manual",
    },
    {
      csiDivision: division,
      csiCode: `${division}-2000`,
      description: "Reinforcing Steel",
      unit: "LB",
      nationalAvgTotal: 1.15,
      crewCode: "R1",
      source: "manual",
    },
    {
      csiDivision: division,
      csiCode: `${division}-3000`,
      description: "Cast-in-Place Concrete",
      unit: "CY",
      nationalAvgTotal: 185.0,
      crewCode: "C2",
      source: "manual",
    },
  ];
}

export interface AppSettings {
  projectName: string;
  ownerName: string;
  ownerEmail: string;
  timezone: string;
  currencyCode: string;
  passcodeDelivery: "email" | "screen";
  requireApproval: boolean;
  allowPublicView: boolean;
  rsmeansMode: "live_api" | "manual";
}

// ─── Local storage helpers (cache & supplements) ──────────────────────────────

const CACHE_KEYS = {
  participants: "pbp_cache_participants",
  assignments: "pbp_cache_assignments",
  rsmeansEntries: "pbp_cache_rsmeans_entries",
  rsmeansSettings: "pbp_cache_rsmeans_settings",
  appSettings: "pbp_cache_app_settings",
  participantExtra: "pbp_participant_extra",
  assignmentMeta: "pbp_assignment_meta",
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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Helper functions ───────────────────────────────────────────────────────

function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

function joinFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function serializeAddress(addr: ParticipantAddress): string {
  return [addr.street, addr.city, addr.state, addr.zip, addr.country]
    .filter(Boolean)
    .join(", ");
}

function parseAddressString(s: string): ParticipantAddress {
  const parts = s.split(",").map((p) => p.trim());
  return {
    street: parts[0] ?? "",
    city: parts[1] ?? "",
    state: parts[2] ?? "",
    zip: parts[3] ?? "",
    country: parts[4] ?? "",
  };
}

// ─── Type mapping helpers ───────────────────────────────────────────────────────

function toBackendRole(role: ParticipantRole): BackendParticipantRole {
  switch (role) {
    case "Owner":
      return BackendParticipantRole.Owner;
    case "Architect":
      return BackendParticipantRole.Architect;
    case "Designer":
      return BackendParticipantRole.Designer;
    case "CivilEngineer":
      return BackendParticipantRole.CivilEngineer;
    case "MechanicalEngineer":
      return BackendParticipantRole.MechanicalEngineer;
    case "SpecialtyEngineer":
      return BackendParticipantRole.SpecialtyEngineer;
    case "ConstructionManager":
      return BackendParticipantRole.ConstructionManager;
    case "Contractor":
      return BackendParticipantRole.Contractor;
    default:
      return BackendParticipantRole.Contractor;
  }
}

function toFrontendRole(role: BackendParticipantRole): ParticipantRole {
  switch (role) {
    case BackendParticipantRole.Owner:
      return "Owner";
    case BackendParticipantRole.Architect:
      return "Architect";
    case BackendParticipantRole.Designer:
      return "Designer";
    case BackendParticipantRole.CivilEngineer:
      return "CivilEngineer";
    case BackendParticipantRole.MechanicalEngineer:
      return "MechanicalEngineer";
    case BackendParticipantRole.SpecialtyEngineer:
      return "SpecialtyEngineer";
    case BackendParticipantRole.ConstructionManager:
      return "ConstructionManager";
    case BackendParticipantRole.Contractor:
      return "Contractor";
    default:
      return "Contractor";
  }
}

function toFrontendStatus(status: BackendParticipantStatus): ParticipantStatus {
  switch (status) {
    case BackendParticipantStatus.Pending:
      return "pending";
    case BackendParticipantStatus.Approved:
      return "approved";
    case BackendParticipantStatus.Rejected:
      return "rejected";
    default:
      return "pending";
  }
}

function toFrontendParticipant(p: BackendParticipant): Participant {
  const { firstName, lastName } = splitFullName(p.fullName);
  const extra = readParticipantExtra(p.id);
  return {
    id: p.id,
    role: toFrontendRole(p.role),
    firstName,
    lastName,
    residentialAddress: parseAddressString(p.residentialAddress),
    contact: {
      officePhone: p.officePhone,
      mobilePhone: p.mobilePhone,
      fax: extra.fax ?? "",
      email: p.email,
    },
    company: {
      name: p.companyName,
      address: parseAddressString(p.companyAddress),
      trade: p.companyTrade,
      licenseNumber: extra.licenseNumber ?? "",
      website: extra.website ?? "",
    },
    status: toFrontendStatus(p.status),
    passcode: p.passcode,
    passcodeDeliveredAt: extra.passcodeDeliveredAt,
    approvedBy: extra.approvedBy,
    approvedAt: extra.approvedAt,
    notes: p.notes,
    createdAt: new Date(Number(p.createdAt / BigInt(1_000_000))).toISOString(),
    updatedAt: extra.updatedAt ?? new Date().toISOString(),
  };
}

// ─── Supplement helpers ───────────────────────────────────────────────────────

interface ParticipantExtra {
  approvedBy?: string;
  approvedAt?: string;
  passcodeDeliveredAt?: string;
  fax?: string;
  licenseNumber?: string;
  website?: string;
  updatedAt?: string;
}

function readParticipantExtra(id: string): ParticipantExtra {
  const all = readStore<Record<string, ParticipantExtra>>(
    CACHE_KEYS.participantExtra,
    {},
  );
  return all[id] ?? {};
}

function writeParticipantExtra(id: string, extra: ParticipantExtra): void {
  const all = readStore<Record<string, ParticipantExtra>>(
    CACHE_KEYS.participantExtra,
    {},
  );
  all[id] = { ...all[id], ...extra };
  writeStore(CACHE_KEYS.participantExtra, all);
}

interface AssignmentMeta {
  id: string;
  participantId: string;
  phaseId: string;
  costCodeId: string;
  csiDivision?: string;
  scope: string;
  createdAt: string;
}

function readAssignmentMeta(): AssignmentMeta[] {
  return readStore<AssignmentMeta[]>(CACHE_KEYS.assignmentMeta, []);
}

function writeAssignmentMeta(meta: AssignmentMeta[]): void {
  writeStore(CACHE_KEYS.assignmentMeta, meta);
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

function cacheParticipants(participants: Participant[]): void {
  const existing = readStore<Record<string, Participant>>(
    CACHE_KEYS.participants,
    {},
  );
  for (const p of participants) {
    existing[p.id] = p;
  }
  writeStore(CACHE_KEYS.participants, existing);
}

function getCachedParticipants(): Participant[] {
  return Object.values(
    readStore<Record<string, Participant>>(CACHE_KEYS.participants, {}),
  );
}

function cacheAssignments(assignments: ParticipantAssignment[]): void {
  const existing = readStore<Record<string, ParticipantAssignment>>(
    CACHE_KEYS.assignments,
    {},
  );
  for (const a of assignments) {
    existing[a.id] = a;
  }
  writeStore(CACHE_KEYS.assignments, existing);
}

function getCachedAssignments(): ParticipantAssignment[] {
  return Object.values(
    readStore<Record<string, ParticipantAssignment>>(
      CACHE_KEYS.assignments,
      {},
    ),
  );
}

function cacheRSMeansEntry(entry: RSMeansEntry): void {
  const existing = readStore<Record<string, RSMeansEntry>>(
    CACHE_KEYS.rsmeansEntries,
    {},
  );
  existing[entry.id] = entry;
  writeStore(CACHE_KEYS.rsmeansEntries, existing);
}

// ─── RSMeans & AppSettings mapping ────────────────────────────────────────────

function toBackendRSMeansSettings(s: RSMeansSettings): BackendRSMeansSettings {
  return {
    apiKey: s.apiKey || undefined,
    apiEnabled: s.enabled && s.mode === "live_api",
  };
}

function toFrontendRSMeansSettings(s: BackendRSMeansSettings): RSMeansSettings {
  const extra = readStore<Partial<RSMeansSettings>>(
    `${CACHE_KEYS.rsmeansSettings}_extra`,
    {},
  );
  return {
    apiKey: s.apiKey ?? "",
    mode: extra.mode ?? (s.apiEnabled ? "live_api" : "manual"),
    baseUrl: extra.baseUrl ?? "https://api.rsmeans.com/v1",
    locationFactor: extra.locationFactor ?? 1.0,
    enabled: s.apiEnabled,
  };
}

function toBackendAppSettings(s: AppSettings): BackendAppSettings {
  return {
    accessControlMode: s.requireApproval
      ? AccessControlMode.RoleGated
      : AccessControlMode.ProjectManagerOnly,
    rsMeansSettings: toBackendRSMeansSettings({
      apiKey: "",
      mode: s.rsmeansMode,
      baseUrl: "",
      locationFactor: 1,
      enabled: s.rsmeansMode === "live_api",
    }),
  };
}

function toFrontendAppSettings(s: BackendAppSettings): AppSettings {
  const extra = readStore<Partial<AppSettings>>(
    `${CACHE_KEYS.appSettings}_extra`,
    {},
  );
  return {
    projectName: extra.projectName ?? "Project Build Plus",
    ownerName: extra.ownerName ?? "",
    ownerEmail: extra.ownerEmail ?? "",
    timezone: extra.timezone ?? "America/Los_Angeles",
    currencyCode: extra.currencyCode ?? "USD",
    passcodeDelivery: extra.passcodeDelivery ?? "email",
    requireApproval: s.accessControlMode === AccessControlMode.RoleGated,
    allowPublicView: extra.allowPublicView ?? true,
    rsmeansMode: s.rsMeansSettings.apiEnabled ? "live_api" : "manual",
  };
}

// ─── Default settings ─────────────────────────────────────────────────────────

const DEFAULT_RSMEANS_SETTINGS: RSMeansSettings = {
  apiKey: "",
  mode: "manual",
  baseUrl: "https://api.rsmeans.com/v1",
  locationFactor: 1.0,
  enabled: false,
};

const DEFAULT_APP_SETTINGS: AppSettings = {
  projectName: "Project Build Plus",
  ownerName: "",
  ownerEmail: "",
  timezone: "America/Los_Angeles",
  currencyCode: "USD",
  passcodeDelivery: "email",
  requireApproval: true,
  allowPublicView: true,
  rsmeansMode: "manual",
};

// ─── Participant hooks ────────────────────────────────────────────────────────

export function useParticipantsList() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn: async () => {
      if (isOffline) return getCachedParticipants();
      if (!actor) return [];
      const backendParticipants = await actor.getParticipants();
      const frontendParticipants = backendParticipants.map(
        toFrontendParticipant,
      );
      cacheParticipants(frontendParticipants);
      return frontendParticipants;
    },
    enabled: isOffline || (!!actor && !isFetching),
    refetchInterval: isOffline ? false : 5000,
    staleTime: 5_000,
  });
}

export function useParticipant(id: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<Participant | null>({
    queryKey: ["participants", id],
    queryFn: async () => {
      if (isOffline) {
        const cached = getCachedParticipants();
        return cached.find((p) => p.id === id) ?? null;
      }
      if (!actor) return null;
      const backendParticipant = await actor.getParticipant(id);
      if (!backendParticipant) return null;
      const frontendParticipant = toFrontendParticipant(backendParticipant);
      cacheParticipants([frontendParticipant]);
      return frontendParticipant;
    },
    enabled: !!id && (isOffline || (!!actor && !isFetching)),
    staleTime: 5_000,
  });
}

export function useCreateParticipant() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<Participant, Error, ParticipantInput>({
    mutationFn: async (input) => {
      if (isOffline) throw new Error("Cannot create participant while offline");
      if (!actor) throw new Error("Actor not available");
      const id = generateId();
      const backendParticipant: BackendParticipant = {
        id,
        status: BackendParticipantStatus.Pending,
        companyTrade: input.company.trade,
        passcodeEmailSent: false,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        role: toBackendRole(input.role),
        fullName: joinFullName(input.firstName, input.lastName),
        email: input.contact.email,
        notes: input.notes,
        companyName: input.company.name,
        mobilePhone: input.contact.mobilePhone,
        officePhone: input.contact.officePhone,
        companyAddress: serializeAddress(input.company.address),
        residentialAddress: serializeAddress(input.residentialAddress),
      };
      const created = await actor.createParticipant(backendParticipant);
      const frontendParticipant = toFrontendParticipant(created);
      writeParticipantExtra(frontendParticipant.id, {
        fax: input.contact.fax,
        licenseNumber: input.company.licenseNumber,
        website: input.company.website,
      });
      cacheParticipants([frontendParticipant]);
      return frontendParticipant;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}

export function useUpdateParticipant() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<
    Participant,
    Error,
    { id: string; input: Partial<ParticipantInput> }
  >({
    mutationFn: async ({ id, input }) => {
      if (isOffline) throw new Error("Cannot update participant while offline");
      if (!actor) throw new Error("Actor not available");
      const existing = await actor.getParticipant(id);
      if (!existing) throw new Error("Participant not found");
      const updated: BackendParticipant = {
        ...existing,
        role: input.role ? toBackendRole(input.role) : existing.role,
        fullName:
          input.firstName || input.lastName
            ? joinFullName(
                input.firstName ?? splitFullName(existing.fullName).firstName,
                input.lastName ?? splitFullName(existing.fullName).lastName,
              )
            : existing.fullName,
        email: input.contact?.email ?? existing.email,
        notes: input.notes ?? existing.notes,
        companyName: input.company?.name ?? existing.companyName,
        mobilePhone: input.contact?.mobilePhone ?? existing.mobilePhone,
        officePhone: input.contact?.officePhone ?? existing.officePhone,
        companyTrade: input.company?.trade ?? existing.companyTrade,
        companyAddress: input.company?.address
          ? serializeAddress(input.company.address)
          : existing.companyAddress,
        residentialAddress: input.residentialAddress
          ? serializeAddress(input.residentialAddress)
          : existing.residentialAddress,
      };
      const result = await actor.updateParticipant(updated);
      if (!result) throw new Error("Update failed");
      const frontendParticipant = toFrontendParticipant(result);
      if (
        input.contact?.fax ||
        input.company?.licenseNumber ||
        input.company?.website
      ) {
        writeParticipantExtra(id, {
          fax: input.contact?.fax,
          licenseNumber: input.company?.licenseNumber,
          website: input.company?.website,
          updatedAt: new Date().toISOString(),
        });
      }
      cacheParticipants([frontendParticipant]);
      return frontendParticipant;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["participants"] });
      qc.invalidateQueries({ queryKey: ["participants", vars.id] });
    },
  });
}

export function useDeleteParticipant() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (isOffline) throw new Error("Cannot delete participant while offline");
      if (!actor) throw new Error("Actor not available");
      await actor.deleteParticipant(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["participants"] });
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useApproveParticipant() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<Participant, Error, { id: string; approvedBy: string }>({
    mutationFn: async ({ id, approvedBy }) => {
      if (isOffline)
        throw new Error("Cannot approve participant while offline");
      if (!actor) throw new Error("Actor not available");
      const result = await actor.approveParticipant(id);
      if (!result) throw new Error("Approval failed");
      const passcode = generatePasscode();
      const now = new Date().toISOString();
      writeParticipantExtra(id, {
        approvedBy,
        approvedAt: now,
        passcodeDeliveredAt: now,
        updatedAt: now,
      });
      const frontendParticipant = toFrontendParticipant(result);
      frontendParticipant.passcode = passcode;
      frontendParticipant.approvedBy = approvedBy;
      frontendParticipant.approvedAt = now;
      frontendParticipant.passcodeDeliveredAt = now;
      cacheParticipants([frontendParticipant]);
      return frontendParticipant;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["participants"] });
      qc.invalidateQueries({ queryKey: ["participants", vars.id] });
    },
  });
}

export function useRejectParticipant() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<Participant, Error, { id: string; reason?: string }>({
    mutationFn: async ({ id }) => {
      if (isOffline) throw new Error("Cannot reject participant while offline");
      if (!actor) throw new Error("Actor not available");
      const result = await actor.rejectParticipant(id);
      if (!result) throw new Error("Rejection failed");
      const frontendParticipant = toFrontendParticipant(result);
      cacheParticipants([frontendParticipant]);
      return frontendParticipant;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["participants"] });
      qc.invalidateQueries({ queryKey: ["participants", vars.id] });
    },
  });
}

export function useResendPasscode() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<Participant, Error, string>({
    mutationFn: async (id) => {
      if (isOffline) throw new Error("Cannot resend passcode while offline");
      if (!actor) throw new Error("Actor not available");
      const success = await actor.resendPasscode(id);
      if (!success) throw new Error("Resend failed");
      const participant = await actor.getParticipant(id);
      if (!participant) throw new Error("Participant not found");
      const passcode = generatePasscode();
      const now = new Date().toISOString();
      writeParticipantExtra(id, {
        passcodeDeliveredAt: now,
        updatedAt: now,
      });
      const frontendParticipant = toFrontendParticipant(participant);
      frontendParticipant.passcode = passcode;
      frontendParticipant.passcodeDeliveredAt = now;
      cacheParticipants([frontendParticipant]);
      return frontendParticipant;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["participants"] });
      qc.invalidateQueries({ queryKey: ["participants", id] });
    },
  });
}

// ─── Assignment hooks ─────────────────────────────────────────────────────────

export function useParticipantAssignments(participantId?: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<ParticipantAssignment[]>({
    queryKey: ["assignments", participantId],
    queryFn: async () => {
      if (isOffline) {
        const all = getCachedAssignments();
        return participantId
          ? all.filter((a) => a.participantId === participantId)
          : all;
      }
      if (!actor) return [];
      const backendAssignments = participantId
        ? await actor.getParticipantAssignments(participantId)
        : [];
      const meta = readAssignmentMeta();
      const frontendAssignments: ParticipantAssignment[] =
        backendAssignments.map((ba) => {
          const m = meta.find(
            (x) =>
              x.participantId === ba.participantId &&
              x.phaseId === ba.phaseId &&
              x.costCodeId === ba.costCodeId,
          );
          return {
            id: m?.id ?? generateId(),
            participantId: ba.participantId,
            phaseId: ba.phaseId || undefined,
            costCodeId: ba.costCodeId || undefined,
            csiDivision: ba.costCodeId ? undefined : ba.phaseId,
            scope: m?.scope ?? "",
            createdAt: m?.createdAt ?? new Date().toISOString(),
          };
        });
      cacheAssignments(frontendAssignments);
      return frontendAssignments;
    },
    enabled: isOffline || (!!actor && !isFetching),
    staleTime: 5_000,
  });
}

export function useAssignParticipant() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<ParticipantAssignment, Error, AssignmentInput>({
    mutationFn: async (input) => {
      if (isOffline) throw new Error("Cannot assign while offline");
      if (!actor) throw new Error("Actor not available");
      const backendAssignment: BackendParticipantAssignment = {
        participantId: input.participantId,
        phaseId: input.phaseId ?? "",
        costCodeId: input.costCodeId ?? "",
        rsMeansSource: BackendRSMeansSource.None,
      };
      const created =
        await actor.assignParticipantToPhaseCode(backendAssignment);
      const id = generateId();
      const frontendAssignment: ParticipantAssignment = {
        id,
        participantId: created.participantId,
        phaseId: created.phaseId || undefined,
        costCodeId: created.costCodeId || undefined,
        csiDivision: input.csiDivision,
        scope: input.scope,
        createdAt: new Date().toISOString(),
      };
      const meta = readAssignmentMeta();
      meta.push({
        id,
        participantId: created.participantId,
        phaseId: created.phaseId ?? "",
        costCodeId: created.costCodeId ?? "",
        csiDivision: input.csiDivision,
        scope: input.scope,
        createdAt: frontendAssignment.createdAt,
      });
      writeAssignmentMeta(meta);
      cacheAssignments([frontendAssignment]);
      return frontendAssignment;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({
        queryKey: ["assignments", vars.participantId],
      });
    },
  });
}

export function useRemoveAssignment() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<void, Error, string>({
    mutationFn: async (assignmentId) => {
      if (isOffline) throw new Error("Cannot remove assignment while offline");
      if (!actor) throw new Error("Actor not available");
      const meta = readAssignmentMeta();
      const m = meta.find((x) => x.id === assignmentId);
      if (!m) throw new Error("Assignment not found");
      await actor.removeParticipantAssignment(
        m.participantId,
        m.phaseId,
        m.costCodeId,
      );
      writeAssignmentMeta(meta.filter((x) => x.id !== assignmentId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

// ─── RSMeans hooks ────────────────────────────────────────────────────────────

export function useUpdateRSMeansEntry() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<RSMeansEntry, Error, RSMeansEntryInput & { id?: string }>({
    mutationFn: async (input) => {
      if (isOffline)
        throw new Error("Cannot update RSMeans entry while offline");
      if (!actor) throw new Error("Actor not available");
      const id = input.id ?? generateId();
      const backendAssignment: BackendParticipantAssignment = {
        participantId: input.participantId,
        phaseId: "",
        costCodeId: "",
        rsMeansUnitCost: input.unitCost,
        rsMeansLaborRate: input.laborCost,
        rsMeansMaterialRate: input.materialCost,
        rsMeansEquipmentRate: input.equipmentCost,
        rsMeansCrewRate: 0,
        rsMeansSource:
          input.source === "live_api"
            ? BackendRSMeansSource.LiveAPI
            : BackendRSMeansSource.ManualEntry,
        actualCost: input.totalCost,
        variance: 0,
      };
      const result = await actor.updateRSMeansEntry(
        input.participantId,
        "",
        "",
        backendAssignment,
      );
      if (!result) throw new Error("Update failed");
      const entry: RSMeansEntry = {
        ...input,
        id,
        fetchedAt: new Date().toISOString(),
      };
      cacheRSMeansEntry(entry);
      return entry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsmeans"] });
    },
  });
}

export function useRSMeansSettings() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<RSMeansSettings>({
    queryKey: ["rsmeans", "settings"],
    queryFn: async () => {
      if (isOffline) {
        return readStore<RSMeansSettings>(
          CACHE_KEYS.rsmeansSettings,
          DEFAULT_RSMEANS_SETTINGS,
        );
      }
      if (!actor) return DEFAULT_RSMEANS_SETTINGS;
      const backendSettings = await actor.getRSMeansSettings();
      const frontendSettings = toFrontendRSMeansSettings(backendSettings);
      writeStore(CACHE_KEYS.rsmeansSettings, frontendSettings);
      return frontendSettings;
    },
    enabled: isOffline || (!!actor && !isFetching),
    staleTime: 10_000,
  });
}

export function useSaveRSMeansSettings() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<RSMeansSettings, Error, RSMeansSettings>({
    mutationFn: async (settings) => {
      if (isOffline) throw new Error("Cannot save settings while offline");
      if (!actor) throw new Error("Actor not available");
      const backendSettings = toBackendRSMeansSettings(settings);
      const saved = await actor.saveRSMeansSettings(backendSettings);
      const frontendSettings = toFrontendRSMeansSettings(saved);
      writeStore(CACHE_KEYS.rsmeansSettings, frontendSettings);
      writeStore(`${CACHE_KEYS.rsmeansSettings}_extra`, {
        mode: settings.mode,
        baseUrl: settings.baseUrl,
        locationFactor: settings.locationFactor,
      });
      return frontendSettings;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsmeans", "settings"] });
    },
  });
}

export function useTestRSMeansConnection() {
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<RSMeansConnectionResult, Error, RSMeansSettings>({
    mutationFn: async (settings) => {
      if (isOffline) {
        return {
          success: false,
          message: "Cannot test connection while offline",
        };
      }
      if (!settings.apiKey || settings.apiKey.trim() === "") {
        return { success: false, message: "API key is required" };
      }
      if (settings.mode !== "live_api") {
        return {
          success: false,
          message: "Switch to Live API mode to test the connection",
        };
      }
      if (!actor) throw new Error("Actor not available");
      const start = Date.now();
      const result = await actor.testRSMeansConnection();
      const success = result.toLowerCase().includes("success");
      return {
        success,
        message: result,
        latencyMs: Date.now() - start,
      };
    },
  });
}

export function useFetchRSMeansBenchmarks(csiDivision?: string) {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  const settings = useRSMeansSettings();
  return useQuery<RSMeansBenchmark[]>({
    queryKey: ["rsmeans", "benchmarks", csiDivision],
    queryFn: async () => {
      if (isOffline || !actor) {
        return getSampleBenchmarks(csiDivision);
      }
      try {
        const raw = await actor.fetchRSMeansBenchmarks(csiDivision ?? "");
        const parsed = JSON.parse(raw) as RSMeansBenchmark[];
        return parsed;
      } catch {
        return getSampleBenchmarks(csiDivision);
      }
    },
    enabled: !!settings.data && (isOffline || (!!actor && !isFetching)),
    staleTime: 60_000,
  });
}

// ─── App settings hooks ───────────────────────────────────────────────────────

export function useAppSettings() {
  const { actor, isFetching } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useQuery<AppSettings>({
    queryKey: ["appSettings"],
    queryFn: async () => {
      if (isOffline) {
        return readStore<AppSettings>(
          CACHE_KEYS.appSettings,
          DEFAULT_APP_SETTINGS,
        );
      }
      if (!actor) return DEFAULT_APP_SETTINGS;
      const backendSettings = await actor.getAppSettings();
      const frontendSettings = toFrontendAppSettings(backendSettings);
      writeStore(CACHE_KEYS.appSettings, frontendSettings);
      return frontendSettings;
    },
    enabled: isOffline || (!!actor && !isFetching),
    staleTime: 10_000,
  });
}

export function useSaveAppSettings() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { isOffline } = useOfflineSync();
  return useMutation<AppSettings, Error, AppSettings>({
    mutationFn: async (settings) => {
      if (isOffline) throw new Error("Cannot save settings while offline");
      if (!actor) throw new Error("Actor not available");
      const backendSettings = toBackendAppSettings(settings);
      const saved = await actor.saveAppSettings(backendSettings);
      const frontendSettings = toFrontendAppSettings(saved);
      writeStore(CACHE_KEYS.appSettings, frontendSettings);
      writeStore(`${CACHE_KEYS.appSettings}_extra`, {
        projectName: settings.projectName,
        ownerName: settings.ownerName,
        ownerEmail: settings.ownerEmail,
        timezone: settings.timezone,
        currencyCode: settings.currencyCode,
        passcodeDelivery: settings.passcodeDelivery,
        allowPublicView: settings.allowPublicView,
      });
      return frontendSettings;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appSettings"] });
    },
  });
}
