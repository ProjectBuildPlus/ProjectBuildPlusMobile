import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ResourceInput {
    name: string;
    hourlyRate: number;
    idleTimeMode?: IdleTimeMode;
    hourlyRateSource: string;
    resourceType: ResourceType;
    csiCode?: string;
    crewSize?: bigint;
    trackingLevel: TrackingLevel;
}
export interface ProjectEVMSummary {
    totalAC: number;
    totalCV: number;
    totalEV: number;
    totalPV: number;
    totalSV: number;
    projectPI: number;
    projectCPI: number;
    projectSPI: number;
}
export type Result_2 = {
    __kind__: "ok";
    ok: CancellationRequest;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PhaseInput {
    crashFactor?: number;
    resourceMultiplier?: number;
    name: string;
    costCodes?: Array<CostCodeInput>;
    phaseOrder: bigint;
    scheduleOfValues: number;
    requiredCash: number;
    endOffset: TimeOffset;
    startOffset: TimeOffset;
}
export interface ZoomSettings {
    clientId: string;
    fixedZoomLinks: Array<[string, string]>;
    clientSecret: string;
}
export interface CumulativePoint {
    crashedCash: number;
    phaseOrder: bigint;
    cumulativeSOV: number;
    cumulativeCash: number;
    phaseName: string;
    endOffset: TimeOffset;
}
export interface CriticalPathNode {
    lateFinish: number;
    earlyFinish: number;
    isCritical: boolean;
    earlyStart: number;
    totalSlack: number;
    phaseName: string;
    phaseId: string;
    lateStart: number;
}
export interface CriticalChangePlanShared {
    id: string;
    status: CriticalPlanStatus;
    phaseIds: Array<string>;
    responsibleParticipantIds: Array<string>;
    name: string;
    createdAt: bigint;
    createdBy: string;
    affectedStandardIds: Array<string>;
    hazardAnalysis: string;
    controlMeasures: string;
    csiCodes: Array<string>;
}
export type ZoomMeetingResult = {
    __kind__: "ok";
    ok: {
        joinUrl: string;
        meetingId: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_5 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface ProjectCategory {
    id: string;
    name: string;
    subtopics: Array<ProjectSubtopic>;
}
export interface Phase {
    id: PhaseId;
    crashFactor: number;
    resourceMultiplier: number;
    name: string;
    costCodes: Array<CostCode>;
    phaseOrder: bigint;
    scheduleOfValues: number;
    requiredCash: number;
    endOffset: TimeOffset;
    startOffset: TimeOffset;
}
export interface PaymentMethodInfo {
    expYear: bigint;
    paymentMethodId: string;
    last4: string;
    expMonth: bigint;
    isDefault: boolean;
    brand: string;
}
export type Result_4 = {
    __kind__: "ok";
    ok: {
        name: string;
        email: string;
        phone: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export type TimeOffset = bigint;
export interface PhaseStandardLink {
    id: string;
    linkedAt: bigint;
    linkedBy: string;
    standardId: string;
    csiCode: string;
    phaseId: string;
}
export interface MeetingPackage {
    participants: Array<string>;
    date: string;
    link: string;
    time: string;
}
export interface CostCode {
    id: bigint;
    area: string;
    cost: number;
    projectNumber: string;
    operation: string;
    csiCode: string;
    distribution: string;
    csiDivision: string;
    phaseId: bigint;
}
export type ScenarioId = string;
export interface RenewalHistoryEntry {
    id: string;
    status: Variant_Failed_Paid_Cancelled_Pending;
    principal: Principal;
    monthlyCharge: bigint;
    endDate: bigint;
    createdAt: bigint;
    tier: SubscriptionTier;
    totalPaid: bigint;
    startDate: bigint;
}
export interface CumulativePointWithCodes {
    crashedCash: number;
    breakdown: Array<CostCodeBreakdown>;
    phaseOrder: bigint;
    cumulativeSOV: number;
    cumulativeCash: number;
    phaseName: string;
    endOffset: TimeOffset;
}
export interface AIAFormEntry {
    id: string;
    submittedByRole: string;
    submittedAt: bigint;
    formType: FormType;
    lastModified: bigint;
    sessionId: string;
    fieldData: Array<[string, string]>;
}
export interface Participant {
    id: string;
    status: ParticipantStatus;
    companyTrade: string;
    passcodeEmailSent: boolean;
    passcode?: string;
    createdAt: bigint;
    role: ParticipantRole;
    fullName: string;
    email: string;
    notes: string;
    companyName: string;
    mobilePhone: string;
    officePhone: string;
    companyAddress: string;
    residentialAddress: string;
}
export interface FeatureLockSnapshot {
    subscriptions: boolean;
    participants: boolean;
    documents: boolean;
    resources: boolean;
    scheduling: boolean;
    cost: boolean;
    compliance: boolean;
    oacMeetings: boolean;
}
export type Result_6 = {
    __kind__: "ok";
    ok: {
        name: string;
        email: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export type PhaseId = bigint;
export interface SessionSnapshot {
    principal: Principal;
    lastActivity: bigint;
    isActive: boolean;
    timestamp: bigint;
    sessionId: string;
    userAgent: string;
    ipAddress: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface RSMeansSettings {
    apiKey?: string;
    lastTestStatus?: string;
    apiEnabled: boolean;
}
export interface VerificationDocument {
    documentType: string;
    stripeVerificationSessionId?: string;
    storageKey: string;
    stripeVerificationStatus: string;
    adminReviewStatus: string;
    uploadedAt: bigint;
}
export interface ScenarioBenchmarkVariance {
    scenarioId: ScenarioId;
    divisionName: string;
    variance: number;
    actualCost: number;
    variancePct: number;
    divisionId: bigint;
    rsMeansCost: number;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface ParticipantAssignment {
    costCodeId: string;
    variance?: number;
    actualCost?: number;
    rsMeansCrewRate?: number;
    participantId: string;
    rsMeansMaterialRate?: number;
    rsMeansEquipmentRate?: number;
    rsMeansUnitCost?: number;
    rsMeansSource: RSMeansSource;
    rsMeansLaborRate?: number;
    phaseId: string;
}
export interface NCCERCertShared {
    id: string;
    status: NCCERCertStatus;
    trade: string;
    expiresAt: bigint;
    discipline: string;
    level: string;
    state: string;
    participantId: string;
    certNumber: string;
    issuedAt: bigint;
}
export interface ShareLink {
    id: string;
    token: string;
    createdAt: bigint;
    isActive: boolean;
    projectId: string;
}
export interface Resource {
    id: string;
    name: string;
    hourlyRate: number;
    idleTimeMode: IdleTimeMode;
    hourlyRateSource: string;
    resourceType: ResourceType;
    csiCode?: string;
    crewSize?: bigint;
    trackingLevel: TrackingLevel;
}
export interface CostCode__1 {
    id: CostCodeId;
    area: string;
    cost: number;
    projectNumber: string;
    operation: string;
    csiCode: string;
    distribution: string;
    csiDivision: string;
    phaseId: bigint;
}
export interface SafetyStandard {
    id: string;
    status: StandardStatus;
    title: string;
    code: string;
    csiDivisions: Array<string>;
    summary: string;
    state?: string;
    relatedStandards: Array<string>;
    category: StandardCategory;
    applicableTrades: Array<string>;
}
export interface CostCodeBreakdown {
    cumulativeCost: number;
    csiCode: string;
    csiDivision: string;
}
export interface TrialLink {
    slug: string;
    tier: SubscriptionTier;
    isActive: boolean;
}
export interface ScenarioEVMSummary {
    cv: number;
    sv: number;
    cpi: number;
    spi: number;
    scenarioId: ScenarioId;
    plannedValue: number;
    earnedValue: number;
    actualCost: number;
}
export interface ComplianceItemShared {
    id: string;
    status: ComplianceStatus;
    notes: string;
    standardId: string;
    checkedAt: bigint;
    checkedBy: string;
    severity: ComplianceSeverity;
    phaseId: string;
}
export type ApplyTemplateResult = {
    __kind__: "ok";
    ok: {
        phasesCreated: bigint;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface EVMPoint {
    cpi: number;
    spi: number;
    baselineType: BaselineType;
    phaseOrder: bigint;
    plannedValue: number;
    earnedValue: number;
    productivityIndex: number;
    actualCost: number;
    costVariance: number;
    customProductivityIndex?: number;
    phaseName: string;
    scheduleVariance: number;
    phaseId: bigint;
}
export interface PayoutRecord {
    status: string;
    date: string;
    amount: number;
}
export interface ReviewRequest {
    id: string;
    status: string;
    oacFormId?: string;
    notes: string;
    requestedAt: bigint;
    requestedBy: string;
    drawingId: string;
}
export interface ResourceSummary {
    resourceId: string;
    totalIdleHours: number;
    idleHoursCrashedBaseline: number;
    idleHoursOriginalBaseline: number;
    resourceName: string;
    totalLaborCost: number;
    totalAllocatedHours: number;
    trackingLevel: TrackingLevel;
    totalAvailableHours: number;
}
export interface CreateScenarioRequest {
    name: string;
    description: string;
    phaseOverrides: Array<PhaseOverride>;
    participantOverrides: Array<ParticipantOverride>;
}
export interface CostCodeInput {
    area: string;
    cost: number;
    projectNumber: string;
    operation: string;
    csiCode: string;
    distribution: string;
    csiDivision: string;
}
export interface CancellationRequest {
    id: string;
    status: CancellationRequestStatus;
    email: string;
    subscriberPrincipal: Principal;
    requestedAt: bigint;
    reason: string;
}
export interface PhaseOverride {
    crashFactor: number;
    resourceMultiplier: number;
    laborCostOverride?: number;
    phaseId: string;
}
export interface IdleTimeSetting {
    defaultIdleMode: IdleTimeMode;
    projectId: string;
}
export interface AppSettings {
    activeCategoryId?: string;
    projectManagerId?: string;
    rsMeansSettings: RSMeansSettings;
    activeSubtopicId?: string;
    accessControlMode: AccessControlMode;
}
export type Result_1 = {
    __kind__: "ok";
    ok: UserSubscription;
} | {
    __kind__: "err";
    err: string;
};
export interface Drawing {
    id: string;
    name: string;
    description: string;
    fileType: DrawingFileType;
    storageKey: string;
    category: DrawingCategory;
    uploadedAt: bigint;
    uploadedBy: string;
}
export interface ProjectSubtopic {
    id: string;
    defaultCostCodeDivisions: Array<bigint>;
    name: string;
    defaultPhases: Array<DefaultPhase>;
}
export interface AdminRole {
    assignedAt: bigint;
    assignedBy: Principal;
    assignedPrincipal: Principal;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface CriticalPlanApproval {
    id: string;
    planId: string;
    approvedAt: bigint;
    approvedBy: string;
    role: string;
    approved: boolean;
}
export interface PhaseSignOffShared {
    id: string;
    role: string;
    signedAt: bigint;
    signedBy: string;
    approved: boolean;
    comments: string;
    phaseId: string;
}
export interface PhaseAllocation {
    id: string;
    allocatedHours: number;
    resourceId: string;
    availableHours: number;
    manualLaborCost?: number;
    actualHours?: number;
    phaseId: string;
    laborCostSource: string;
}
export interface OACMeetingSession {
    id: string;
    zoomMeetingId?: string;
    sessionDate: string;
    linkedCategoryId?: string;
    sessionTime: string;
    createdAt: bigint;
    projectId: string;
    zoomLink?: string;
}
export interface BankAccount {
    nextPayoutDate?: string;
    routingNumber: string;
    accountHolderName: string;
    connectedToStripe: boolean;
    isVerified: boolean;
    accountNumberLast4: string;
}
export type CostCodeId = bigint;
export interface PhaseComplianceSummary {
    total: bigint;
    compliant: bigint;
    signedOff: boolean;
    nonCompliant: bigint;
    notApplicable: bigint;
    phaseId: string;
}
export interface ParticipantOverride {
    participantId: string;
    costCodeAssignments: Array<string>;
    phaseAssignments: Array<string>;
    newRole?: string;
}
export interface DefaultPhase {
    durationDays: bigint;
    order: bigint;
    name: string;
    csiDivisions: Array<bigint>;
}
export interface CPMPhaseInput {
    id: string;
    name: string;
    endOffset: number;
    dependencies: Array<string>;
    startOffset: number;
}
export type Result_3 = {
    __kind__: "ok";
    ok: Array<string>;
} | {
    __kind__: "err";
    err: string;
};
export interface PhaseAllocationInput {
    allocatedHours: number;
    resourceId: string;
    availableHours: number;
    manualLaborCost?: number;
    actualHours?: number;
    phaseId: string;
    laborCostSource: string;
}
export interface ReminderState {
    principal: Principal;
    day28EmailSent: boolean;
    day28Dismissed: boolean;
    day26EmailSent: boolean;
    day26Dismissed: boolean;
}
export interface Scenario {
    id: ScenarioId;
    name: string;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
    phaseOverrides: Array<PhaseOverride>;
    participantOverrides: Array<ParticipantOverride>;
}
export interface DrawingNotification {
    id: string;
    drawingName: string;
    dismissed: boolean;
    requestedAt: bigint;
    requestedBy: string;
    drawingId: string;
}
export interface UserSubscription {
    status: SubscriptionStatus;
    frozenReason?: string;
    trialStartAt: bigint;
    frozenAt?: bigint;
    stripeSubscriptionId?: string;
    userId: Principal;
    subscriptionStartAt?: bigint;
    tier: SubscriptionTier;
    cancelledAt?: bigint;
    currentPlan: SubscriptionTier;
    stripeCustomerId?: string;
    chargeScheduledAt: bigint;
    subscriptionExpiresAt?: bigint;
    stripePaymentMethodId?: string;
}
export interface ScenarioCashProjection {
    cumulativePoints: Array<[bigint, number]>;
    scenarioId: ScenarioId;
    scenarioName: string;
    totalCost: number;
}
export interface ScenarioSummary {
    id: ScenarioId;
    name: string;
    createdAt: bigint;
    description: string;
}
export enum AccessControlMode {
    RoleGated = "RoleGated",
    ProjectManagerOnly = "ProjectManagerOnly"
}
export enum BaselineType {
    crashed = "crashed",
    original = "original"
}
export enum CancellationRequestStatus {
    pending = "pending",
    denied = "denied",
    approved = "approved"
}
export enum ComplianceSeverity {
    None = "None",
    Critical = "Critical",
    Major = "Major",
    Minor = "Minor"
}
export enum ComplianceStatus {
    NA = "NA",
    NonCompliant = "NonCompliant",
    Compliant = "Compliant"
}
export enum CriticalPlanStatus {
    Approved = "Approved",
    Draft = "Draft",
    Rejected = "Rejected",
    PendingApproval = "PendingApproval"
}
export enum DrawingCategory {
    ArchitectDrawings = "ArchitectDrawings",
    ConstructionDrawings = "ConstructionDrawings",
    CADFiles = "CADFiles",
    Blueprints = "Blueprints",
    Photographs = "Photographs",
    EngineeringDrawings = "EngineeringDrawings"
}
export enum DrawingFileType {
    DWG = "DWG",
    DXF = "DXF",
    JPG = "JPG",
    PDF = "PDF",
    PNG = "PNG"
}
export enum FormType {
    MeetingMinutes = "MeetingMinutes",
    G701 = "G701",
    G702 = "G702",
    G703 = "G703",
    Addendum = "Addendum"
}
export enum IdleTimeMode {
    holdThroughProject = "holdThroughProject",
    releaseAtPhaseEnd = "releaseAtPhaseEnd"
}
export enum NCCERCertStatus {
    Expiring = "Expiring",
    Current = "Current",
    Expired = "Expired"
}
export enum ParticipantRole {
    EHSRepresentative = "EHSRepresentative",
    Designer = "Designer",
    MechanicalEngineer = "MechanicalEngineer",
    Architect = "Architect",
    SpecialtyEngineer = "SpecialtyEngineer",
    SafetyEngineer = "SafetyEngineer",
    SafetyInspector = "SafetyInspector",
    CivilEngineer = "CivilEngineer",
    ConstructionManager = "ConstructionManager",
    Owner = "Owner",
    Contractor = "Contractor"
}
export enum ParticipantStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending"
}
export enum RSMeansSource {
    None = "None",
    ManualEntry = "ManualEntry",
    LiveAPI = "LiveAPI"
}
export enum ResourceType {
    equipment = "equipment",
    labor = "labor"
}
export enum StandardCategory {
    IBC = "IBC",
    NCCER = "NCCER",
    ANSI = "ANSI",
    IEEE = "IEEE",
    OSHA = "OSHA"
}
export enum StandardStatus {
    Superseded = "Superseded",
    Active = "Active",
    Withdrawn = "Withdrawn"
}
export enum SubscriptionStatus {
    trial = "trial",
    active = "active",
    cancelled = "cancelled",
    expired = "expired",
    frozen = "frozen"
}
export enum SubscriptionTier {
    tier10year = "tier10year",
    tier1year = "tier1year",
    tier5year = "tier5year"
}
export enum TrackingLevel {
    crew = "crew",
    individual = "individual"
}
export enum Variant_Failed_Paid_Cancelled_Pending {
    Failed = "Failed",
    Paid = "Paid",
    Cancelled = "Cancelled",
    Pending = "Pending"
}
export interface backendInterface {
    activateSubscription(stripeSubscriptionId: string): Promise<Result_1>;
    addDrawing(name: string, category: DrawingCategory, fileType: DrawingFileType, storageKey: string, description: string): Promise<Drawing>;
    addLoginEmail(newEmail: string): Promise<Result>;
    addNCCERCertification(participantId: string, trade: string, discipline: string, level: string, state: string, certNumber: string, issuedAt: bigint, expiresAt: bigint): Promise<NCCERCertShared>;
    addPaymentMethod(setupIntentId: string): Promise<Result_1>;
    addRenewalHistoryEntry(entry: RenewalHistoryEntry): Promise<Result>;
    addUserLoginEmail(targetEmail: string, newEmail: string): Promise<Result>;
    applyProjectTemplate(categoryId: string, subtopicId: string): Promise<ApplyTemplateResult>;
    approveCancellationRequest(requestId: string): Promise<Result>;
    approveCriticalChangePlan(planId: string, approved: boolean): Promise<CriticalPlanApproval>;
    approveDocumentReview(user: Principal, documentType: string): Promise<Result>;
    approveParticipant(id: string): Promise<Participant | null>;
    assignAdmin(p: Principal): Promise<Result>;
    assignParticipantToPhaseCode(assignment: ParticipantAssignment): Promise<ParticipantAssignment>;
    autoLinkStandardsForCategory(projectCategory: string, projectSubtype: string, state: string | null): Promise<Array<string>>;
    canAccessCompliance(role: ParticipantRole): Promise<boolean>;
    canManageCriticalPlans(role: ParticipantRole): Promise<boolean>;
    cancelTrial(): Promise<Result>;
    changeControllerPassword(newPassword: string): Promise<Result>;
    changePassword(email: string, currentPassword: string, newPassword: string): Promise<Result>;
    /**
     * / One-time claim: the first caller who finds _controller == anonymous
     * / principal becomes the permanent controller.  Secure because the
     * / deployer is the only one who can call this before any user interaction.
     */
    claimController(): Promise<Result>;
    compareScenarios(ids: Array<string>): Promise<Array<ScenarioCashProjection>>;
    computeCriticalPath(phases: Array<CPMPhaseInput>): Promise<Array<CriticalPathNode>>;
    computeResourceSummaries(originalBaselineMultiplier: number, crashedBaselineMultiplier: number): Promise<Array<ResourceSummary>>;
    createCriticalChangePlan(name: string, phaseIds: Array<string>, csiCodes: Array<string>, hazardAnalysis: string, controlMeasures: string, affectedStandardIds: Array<string>, responsibleParticipantIds: Array<string>): Promise<CriticalChangePlanShared>;
    createOACSession(date: string, time: string): Promise<string>;
    createParticipant(participant: Participant): Promise<Participant>;
    createReviewRequest(drawingId: string, notes: string): Promise<[ReviewRequest, DrawingNotification] | null>;
    createScenario(req: CreateScenarioRequest): Promise<{
        __kind__: "ok";
        ok: Scenario;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deactivateShareLink(token: string): Promise<boolean>;
    deleteCostCode(phaseId: bigint, codeId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteDrawing(id: string): Promise<boolean>;
    deleteParticipant(id: string): Promise<boolean>;
    deletePhase(phaseId: bigint): Promise<boolean>;
    deletePhaseAllocation(id: string): Promise<boolean>;
    deleteResource(id: string): Promise<boolean>;
    deleteReviewRequest(id: string): Promise<boolean>;
    deleteScenario(id: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    denyCancellationRequest(requestId: string): Promise<Result>;
    directCancelSubscription(target: Principal): Promise<Result>;
    dismissDrawingNotification(id: string): Promise<boolean>;
    dismissReminder(day: bigint): Promise<void>;
    emailLogin(email: string, password: string, userAgent: string, ipAddress: string): Promise<Result_6>;
    emailOnlyLogin(email: string): Promise<Result_5>;
    endSession(sessionId: string): Promise<void>;
    enrollTrial(tier: SubscriptionTier, stripeCustomerId: string, stripePaymentMethodId: string): Promise<Result_1>;
    expireSubscription(): Promise<Result>;
    fetchRSMeansBenchmarks(csiDivision: string): Promise<string>;
    freezeSubscription(target: Principal, reason: string): Promise<Result>;
    generateResetCode(email: string): Promise<Result_5>;
    generateShareLink(projectId: string): Promise<ShareLink>;
    generateUserResetCode(email: string): Promise<Result_5>;
    generateZoomMeeting(sessionId: string, topic: string): Promise<ZoomMeetingResult>;
    getAIAForm(formId: string): Promise<AIAFormEntry | null>;
    getAIAForms(sessionId: string): Promise<Array<AIAFormEntry>>;
    getActiveFilter(): Promise<[string | null, string | null]>;
    getActiveSessions(): Promise<Array<SessionSnapshot>>;
    getAdminList(): Promise<Array<AdminRole>>;
    getAllCancellationRequests(): Promise<Array<CancellationRequest>>;
    getAllUsers(): Promise<Array<{
        name: string;
        createdAt: bigint;
        email: string;
        lastLogin: bigint;
    }>>;
    getAppSettings(): Promise<AppSettings>;
    getBankAccount(): Promise<BankAccount | null>;
    getCertificationsForPhase(phaseId: string): Promise<Array<NCCERCertShared>>;
    getComplianceItemsForPhase(phaseId: string): Promise<Array<ComplianceItemShared>>;
    getControllerProfile(): Promise<Result_4>;
    getCostCodeCompletion(phaseId: bigint, codeId: bigint): Promise<number | null>;
    getCostCodesForPhase(phaseId: bigint): Promise<{
        __kind__: "ok";
        ok: Array<CostCode__1>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getCriticalChangePlansForPhase(phaseId: string): Promise<Array<CriticalChangePlanShared>>;
    getCumulativeCashRequirement(): Promise<Array<CumulativePoint>>;
    getCumulativeCrashedRequirement(): Promise<Array<CumulativePoint>>;
    getCumulativeWithBreakdown(): Promise<Array<CumulativePointWithCodes>>;
    getDocumentReviewStatus(): Promise<Array<VerificationDocument>>;
    getDrawingNotifications(): Promise<Array<DrawingNotification>>;
    getDrawings(): Promise<Array<Drawing>>;
    getEarnedValueMetrics(baselineType: BaselineType): Promise<Array<EVMPoint>>;
    getFeatureLocks(): Promise<FeatureLockSnapshot>;
    getFilteredStandards(projectCategory: string, projectSubtype: string, state: string | null): Promise<Array<SafetyStandard>>;
    getIdleTimeSetting(): Promise<IdleTimeSetting | null>;
    getLoginEmails(): Promise<Result_3>;
    getLoginHistory(): Promise<Array<SessionSnapshot>>;
    getNCCERCertificationsForParticipant(participantId: string): Promise<Array<NCCERCertShared>>;
    getNextPayoutDate(): Promise<string | null>;
    getOACSession(id: string): Promise<OACMeetingSession | null>;
    getOACSessions(): Promise<Array<OACMeetingSession>>;
    getParticipant(id: string): Promise<Participant | null>;
    getParticipantAssignments(participantId: string): Promise<Array<ParticipantAssignment>>;
    getParticipantMeetingPackage(sessionId: string): Promise<MeetingPackage>;
    getParticipants(): Promise<Array<Participant>>;
    getPaymentMethods(): Promise<Array<PaymentMethodInfo>>;
    getPayoutRecords(): Promise<Array<PayoutRecord>>;
    getPhaseAllocations(): Promise<Array<PhaseAllocation>>;
    getPhaseAllocationsByPhase(phaseId: string): Promise<Array<PhaseAllocation>>;
    getPhaseAllocationsByResource(resourceId: string): Promise<Array<PhaseAllocation>>;
    getPhaseComplianceStatus(phaseId: string): Promise<PhaseComplianceSummary>;
    getPhases(): Promise<Array<Phase>>;
    getProjectCategories(): Promise<Array<ProjectCategory>>;
    getProjectEVMSummary(baselineType: BaselineType): Promise<ProjectEVMSummary>;
    getProjectShareLinks(projectId: string): Promise<Array<ShareLink>>;
    getProjectSubtopic(categoryId: string, subtopicId: string): Promise<ProjectSubtopic | null>;
    getRSMeansSettings(): Promise<RSMeansSettings>;
    getReminderState(): Promise<ReminderState | null>;
    getRenewalHistory(): Promise<Array<RenewalHistoryEntry>>;
    getResources(): Promise<Array<Resource>>;
    getResourcesByType(resourceType: ResourceType): Promise<Array<Resource>>;
    getReviewRequests(): Promise<Array<ReviewRequest>>;
    getScenario(id: string): Promise<Scenario | null>;
    getScenarioBenchmarkVariances(id: string): Promise<Array<ScenarioBenchmarkVariance>>;
    getScenarioCashProjection(id: string): Promise<ScenarioCashProjection | null>;
    getScenarioEVMSummary(id: string): Promise<ScenarioEVMSummary | null>;
    getShareLink(token: string): Promise<ShareLink | null>;
    getSignOffsForPhase(phaseId: string): Promise<Array<PhaseSignOffShared>>;
    getStandard(id: string): Promise<SafetyStandard | null>;
    getStandardsForCsiCode(csiCode: string): Promise<Array<SafetyStandard>>;
    getStandardsForPhase(phaseId: string): Promise<Array<SafetyStandard>>;
    getSubscriptionStatus(): Promise<SubscriptionStatus>;
    getTrialLinks(): Promise<Array<TrialLink>>;
    getUserCancellationRequests(email: string): Promise<Array<CancellationRequest>>;
    getUserLoginEmails(_targetEmail: string): Promise<Array<string>>;
    getUserSubscription(): Promise<UserSubscription | null>;
    getZoomSettings(): Promise<ZoomSettings | null>;
    isAdmin(p: Principal): Promise<boolean>;
    isController(p: Principal): Promise<boolean>;
    isPhaseSignedOff(phaseId: string): Promise<boolean>;
    isPlanFullyApproved(planId: string): Promise<boolean>;
    linkStandardToPhase(phaseId: string, csiCode: string, standardId: string): Promise<PhaseStandardLink>;
    listScenarios(): Promise<Array<ScenarioSummary>>;
    registerEmailUser(email: string, password: string, name: string, phone: string): Promise<Result>;
    rejectParticipant(id: string): Promise<Participant | null>;
    removeLoginEmail(email: string): Promise<Result>;
    removeParticipantAssignment(participantId: string, phaseId: string, costCodeId: string): Promise<boolean>;
    removeUserLoginEmail(email: string): Promise<Result>;
    renewSubscription(): Promise<Result_1>;
    resendPasscode(id: string): Promise<boolean>;
    revokeAdmin(p: Principal): Promise<Result>;
    saveAIAForm(sessionId: string, formType: FormType, fieldData: Array<[string, string]>, submittedByRole: string): Promise<string>;
    saveAppSettings(settings: AppSettings): Promise<AppSettings>;
    saveBankAccount(holderName: string, accountNumberLast4: string, routingNumber: string): Promise<void>;
    savePayoutRecords(records: Array<PayoutRecord>): Promise<void>;
    saveRSMeansSettings(settings: RSMeansSettings): Promise<RSMeansSettings>;
    saveZoomSettings(settings: ZoomSettings): Promise<boolean>;
    searchStandards(searchText: string, category: StandardCategory | null, state: string | null): Promise<Array<SafetyStandard>>;
    setActiveFilter(categoryId: string | null, subtopicId: string | null): Promise<void>;
    setFeatureLock(feature: string, locked: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setFixedZoomLink(roleId: string, zoomLink: string): Promise<boolean>;
    setIdleTimeSetting(mode: IdleTimeMode): Promise<IdleTimeSetting>;
    setNextPayoutDate(date: string): Promise<void>;
    setPhases(inputs: Array<PhaseInput>): Promise<void>;
    setReminderEmailSent(day: bigint): Promise<void>;
    setStripeSecretKey(secretKey: string): Promise<void>;
    submitCancellationRequest(email: string, reason: string): Promise<Result_2>;
    submitDocumentForReview(documentType: string, storageKey: string, stripeSessionId: string | null): Promise<VerificationDocument>;
    submitPhaseSignOff(phaseId: string, approved: boolean, comments: string): Promise<PhaseSignOffShared>;
    submitPlanForApproval(id: string): Promise<CriticalChangePlanShared | null>;
    switchTrialTier(newTier: SubscriptionTier): Promise<Result_1>;
    testRSMeansConnection(): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unfreezeSubscription(target: Principal): Promise<Result>;
    unlinkStandardFromPhase(phaseId: string, csiCode: string, standardId: string): Promise<boolean>;
    updateAIAForm(formId: string, fieldData: Array<[string, string]>): Promise<boolean>;
    updateControllerProfile(name: string, email: string, phone: string): Promise<Result>;
    updateCostCodeCompletion(phaseId: bigint, codeId: bigint, percentComplete: number): Promise<void>;
    updateCriticalChangePlan(id: string, name: string | null, phaseIds: Array<string> | null, csiCodes: Array<string> | null, hazardAnalysis: string | null, controlMeasures: string | null, affectedStandardIds: Array<string> | null, responsibleParticipantIds: Array<string> | null): Promise<CriticalChangePlanShared | null>;
    updateNCCERCertification(id: string, trade: string | null, discipline: string | null, level: string | null, certNumber: string | null, issuedAt: bigint | null, expiresAt: bigint | null, status: NCCERCertStatus | null): Promise<NCCERCertShared | null>;
    updateOACSessionZoomLink(sessionId: string, zoomLink: string, zoomMeetingId: string): Promise<boolean>;
    updateParticipant(updated: Participant): Promise<Participant | null>;
    updateRSMeansEntry(participantId: string, phaseId: string, costCodeId: string, updated: ParticipantAssignment): Promise<ParticipantAssignment | null>;
    updateReviewRequest(id: string, status: string, notes: string): Promise<ReviewRequest | null>;
    updateScenario(id: string, req: CreateScenarioRequest): Promise<{
        __kind__: "ok";
        ok: Scenario;
    } | {
        __kind__: "err";
        err: string;
    }>;
    upsertComplianceItem(phaseId: string, standardId: string, status: ComplianceStatus, severity: ComplianceSeverity, notes: string): Promise<ComplianceItemShared>;
    upsertCostCode(phaseId: bigint, input: CostCodeInput): Promise<{
        __kind__: "ok";
        ok: CostCode__1;
    } | {
        __kind__: "err";
        err: string;
    }>;
    upsertPhase(phaseId: bigint, input: PhaseInput): Promise<Phase>;
    upsertPhaseAllocation(input: PhaseAllocationInput): Promise<PhaseAllocation>;
    upsertResource(input: ResourceInput): Promise<Resource>;
    validateResetCode(email: string, code: string, newPassword: string): Promise<Result>;
    zoomTransform(input: TransformationInput): Promise<TransformationOutput>;
}
