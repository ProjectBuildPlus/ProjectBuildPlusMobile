import Map  "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // OldActor = NewActor of 20260524_120000_AddSessionsAndFeatureLocks

  type PhaseId = Nat;
  type TimeOffset = Int;

  type PhaseInternal = {
    id : PhaseId;
    var name : Text;
    var phaseOrder : Nat;
    var startOffset : TimeOffset;
    var endOffset : TimeOffset;
    var requiredCash : Float;
    var scheduleOfValues : Float;
    var crashFactor : Float;
    var resourceMultiplier : Float;
  };

  type CostCodeInternal = {
    id : Nat;
    phaseId : Nat;
    var csiCode : Text;
    var csiDivision : Text;
    var projectNumber : Text;
    var area : Text;
    var operation : Text;
    var distribution : Text;
    var cost : Float;
  };

  type CostCodeCompletionInternal = {
    phaseId : Nat;
    codeId : Nat;
    var percentComplete : Float;
  };

  type ParticipantRole = {
    #Architect;
    #Designer;
    #CivilEngineer;
    #MechanicalEngineer;
    #SpecialtyEngineer;
    #Owner;
    #ConstructionManager;
    #Contractor;
    #EHSRepresentative;
    #SafetyEngineer;
    #SafetyInspector;
  };

  type ParticipantStatus = { #Pending; #Approved; #Rejected };

  type Participant = {
    id : Text;
    role : ParticipantRole;
    fullName : Text;
    residentialAddress : Text;
    officePhone : Text;
    mobilePhone : Text;
    companyName : Text;
    companyAddress : Text;
    companyTrade : Text;
    email : Text;
    notes : Text;
    status : ParticipantStatus;
    passcode : ?Text;
    passcodeEmailSent : Bool;
    createdAt : Int;
  };

  type RSMeansSource = { #LiveAPI; #ManualEntry; #None };

  type ParticipantAssignment = {
    participantId : Text;
    phaseId : Text;
    costCodeId : Text;
    rsMeansSource : RSMeansSource;
    rsMeansUnitCost : ?Float;
    rsMeansCrewRate : ?Float;
    rsMeansLaborRate : ?Float;
    rsMeansMaterialRate : ?Float;
    rsMeansEquipmentRate : ?Float;
    actualCost : ?Float;
    variance : ?Float;
  };

  type RSMeansSettings = {
    apiKey : ?Text;
    apiEnabled : Bool;
    lastTestStatus : ?Text;
  };

  type AccessControlMode = { #RoleGated; #ProjectManagerOnly };

  type SettingsState = {
    var rsMeansSettings : RSMeansSettings;
    var accessControlMode : AccessControlMode;
    var projectManagerId : ?Text;
    var activeCategoryId : ?Text;
    var activeSubtopicId : ?Text;
  };

  type ScenarioId = Text;

  type ParticipantOverride = {
    participantId : Text;
    newRole : ?Text;
    phaseAssignments : [Text];
    costCodeAssignments : [Text];
  };

  type PhaseOverride = {
    phaseId : Text;
    crashFactor : Float;
    resourceMultiplier : Float;
    laborCostOverride : ?Float;
  };

  type Scenario = {
    id : ScenarioId;
    name : Text;
    description : Text;
    participantOverrides : [ParticipantOverride];
    phaseOverrides : [PhaseOverride];
    createdAt : Int;
    updatedAt : Int;
  };

  type ShareLink = {
    id : Text;
    token : Text;
    projectId : Text;
    createdAt : Int;
    isActive : Bool;
  };

  type ZoomSettings = {
    clientId : Text;
    clientSecret : Text;
    fixedZoomLinks : [(Text, Text)];
  };

  type OACMeetingSession = {
    id : Text;
    projectId : Text;
    sessionDate : Text;
    sessionTime : Text;
    zoomLink : ?Text;
    zoomMeetingId : ?Text;
    createdAt : Int;
    linkedCategoryId : ?Text;
  };

  type AIAFormEntry = {
    id : Text;
    sessionId : Text;
    formType : { #G702; #G703; #G701; #MeetingMinutes; #Addendum };
    fieldData : [(Text, Text)];
    submittedByRole : Text;
    submittedAt : Int;
    lastModified : Int;
  };

  type ResourceType  = { #labor; #equipment };
  type TrackingLevel = { #individual; #crew };
  type IdleTimeMode  = { #releaseAtPhaseEnd; #holdThroughProject };

  type ResourceInternal = {
    id : Text;
    var name : Text;
    var resourceType : ResourceType;
    var trackingLevel : TrackingLevel;
    var crewSize : ?Nat;
    var csiCode : ?Text;
    var hourlyRate : Float;
    var hourlyRateSource : Text;
    var idleTimeMode : IdleTimeMode;
  };

  type PhaseAllocationInternal = {
    id : Text;
    resourceId : Text;
    phaseId : Text;
    var allocatedHours : Float;
    var availableHours : Float;
    var actualHours : ?Float;
    var laborCostSource : Text;
    var manualLaborCost : ?Float;
  };

  type IdleTimeSettingInternal = {
    projectId : Text;
    var defaultIdleMode : IdleTimeMode;
  };

  type StandardCategory = { #OSHA; #ANSI; #IEEE; #NCCER; #IBC };
  type StandardStatus   = { #Active; #Superseded; #Withdrawn };

  type SafetyStandard = {
    id : Text;
    category : StandardCategory;
    code : Text;
    title : Text;
    summary : Text;
    applicableTrades : [Text];
    csiDivisions : [Text];
    state : ?Text;
    relatedStandards : [Text];
    status : StandardStatus;
  };

  type PhaseStandardLink = {
    id : Text;
    phaseId : Text;
    csiCode : Text;
    standardId : Text;
    linkedBy : Text;
    linkedAt : Int;
  };

  type ComplianceStatus   = { #Compliant; #NonCompliant; #NA };
  type ComplianceSeverity = { #Critical; #Major; #Minor; #None };

  type ComplianceItem = {
    id : Text;
    phaseId : Text;
    standardId : Text;
    var status : ComplianceStatus;
    var severity : ComplianceSeverity;
    var notes : Text;
    var checkedBy : Text;
    var checkedAt : Int;
  };

  type PhaseSignOff = {
    id : Text;
    phaseId : Text;
    signedBy : Text;
    role : Text;
    signedAt : Int;
    var approved : Bool;
    var comments : Text;
  };

  type NCCERCertStatus = { #Current; #Expiring; #Expired };

  type NCCERCertification = {
    id : Text;
    participantId : Text;
    trade : Text;
    discipline : Text;
    level : Text;
    state : Text;
    certNumber : Text;
    issuedAt : Int;
    expiresAt : Int;
    var status : NCCERCertStatus;
  };

  type CriticalPlanStatus = { #Draft; #PendingApproval; #Approved; #Rejected };

  type CriticalChangePlan = {
    id : Text;
    var name : Text;
    var phaseIds : [Text];
    var csiCodes : [Text];
    var hazardAnalysis : Text;
    var controlMeasures : Text;
    var affectedStandardIds : [Text];
    var responsibleParticipantIds : [Text];
    var status : CriticalPlanStatus;
    createdBy : Text;
    createdAt : Int;
  };

  type CriticalPlanApproval = {
    id : Text;
    planId : Text;
    approvedBy : Text;
    role : Text;
    approvedAt : Int;
    approved : Bool;
  };

  type SubscriptionTier   = { #tier1year; #tier5year; #tier10year };
  type SubscriptionStatus = { #trial; #active; #expired; #cancelled };

  type UserSubscription = {
    userId                : Principal;
    tier                  : SubscriptionTier;
    status                : SubscriptionStatus;
    trialStartAt          : Int;
    chargeScheduledAt     : Int;
    subscriptionStartAt   : ?Int;
    subscriptionExpiresAt : ?Int;
    stripeCustomerId      : ?Text;
    stripePaymentMethodId : ?Text;
    stripeSubscriptionId  : ?Text;
    currentPlan           : SubscriptionTier;
    cancelledAt           : ?Int;
  };

  type VerificationDocument = {
    documentType                : Text;
    storageKey                  : Text;
    uploadedAt                  : Int;
    stripeVerificationSessionId : ?Text;
    adminReviewStatus           : Text;
    stripeVerificationStatus    : Text;
  };

  type AdminRole = {
    assignedPrincipal : Principal;
    assignedBy        : Principal;
    assignedAt        : Int;
  };

  type RenewalHistoryEntry = {
    id            : Text;
    principal     : Principal;
    tier          : SubscriptionTier;
    startDate     : Int;
    endDate       : Int;
    monthlyCharge : Nat;
    totalPaid     : Nat;
    status        : { #Paid; #Cancelled; #Pending; #Failed };
    createdAt     : Int;
  };

  type ReminderState = {
    principal        : Principal;
    day26Dismissed   : Bool;
    day28Dismissed   : Bool;
    day26EmailSent   : Bool;
    day28EmailSent   : Bool;
  };

  type UserRecord = {
    email            : Text;
    var passwordHash : Text;
    salt             : Text;
    var name         : Text;
    var phone        : Text;
  };

  type ResetCodeEntry = {
    email     : Text;
    code      : Text;
    expiresAt : Int;
    var used  : Bool;
  };

  type ControllerProfile = {
    var name  : Text;
    var email : Text;
    var phone : Text;
  };

  type SessionEntry = {
    sessionId        : Text;
    principal        : Principal;
    timestamp        : Int;
    userAgent        : Text;
    ipAddress        : Text;
    var isActive     : Bool;
    var lastActivity : Int;
  };

  type FeatureLockState = {
    var scheduling    : Bool;
    var cost          : Bool;
    var resources     : Bool;
    var compliance    : Bool;
    var participants  : Bool;
    var documents     : Bool;
    var oacMeetings   : Bool;
    var subscriptions : Bool;
  };

  // OldActor = NewActor of 20260524_120000_AddSessionsAndFeatureLocks
  type OldActor = {
    phases             : List.List<PhaseInternal>;
    state              : { var nextPhaseId : Nat };
    codes              : List.List<CostCodeInternal>;
    codeState          : { var nextCostCodeId : Nat };
    completions        : List.List<CostCodeCompletionInternal>;
    participants       : Map.Map<Text, Participant>;
    assignments        : Map.Map<Text, ParticipantAssignment>;
    settingsState      : SettingsState;
    scenariosMap       : Map.Map<ScenarioId, Scenario>;
    shareLinks         : Map.Map<Text, ShareLink>;
    sessions           : Map.Map<Text, OACMeetingSession>;
    forms              : Map.Map<Text, AIAFormEntry>;
    oacState           : { var zoomSettings : ?ZoomSettings };
    resourceStore      : Map.Map<Text, ResourceInternal>;
    allocationStore    : Map.Map<Text, PhaseAllocationInternal>;
    idleTimeStore      : Map.Map<Text, IdleTimeSettingInternal>;
    standardsStore     : Map.Map<Text, SafetyStandard>;
    linksStore         : Map.Map<Text, PhaseStandardLink>;
    complianceStore    : Map.Map<Text, ComplianceItem>;
    signOffStore       : Map.Map<Text, PhaseSignOff>;
    certStore          : Map.Map<Text, NCCERCertification>;
    plansStore         : Map.Map<Text, CriticalChangePlan>;
    planApprovalsStore : Map.Map<Text, CriticalPlanApproval>;
    safetyState        : { var nextSafetyId : Nat };
    subscriptions      : Map.Map<Principal, UserSubscription>;
    documentStore      : Map.Map<Principal, List.List<VerificationDocument>>;
    stripeConfig       : { var secretKey : ?Text };
    adminRoles         : Map.Map<Principal, AdminRole>;
    renewalHistory     : Map.Map<Principal, List.List<RenewalHistoryEntry>>;
    reminderState      : Map.Map<Principal, ReminderState>;
    _controller        : Principal;
    users              : Map.Map<Text, UserRecord>;
    resetCodes         : Map.Map<Text, ResetCodeEntry>;
    controllerProfile  : ControllerProfile;
    loginSessions      : Map.Map<Principal, List.List<SessionEntry>>;
    featureLocks       : FeatureLockState;
  };

  // New payout types (inlined)
  type BankAccount = {
    accountHolderName  : Text;
    accountNumberLast4 : Text;
    routingNumber      : Text;
    isVerified         : Bool;
    connectedToStripe  : Bool;
    nextPayoutDate     : ?Text;
  };

  type PayoutRecord = {
    amount : Float;
    date   : Text;
    status : Text;
  };

  type NewActor = {
    phases             : List.List<PhaseInternal>;
    state              : { var nextPhaseId : Nat };
    codes              : List.List<CostCodeInternal>;
    codeState          : { var nextCostCodeId : Nat };
    completions        : List.List<CostCodeCompletionInternal>;
    participants       : Map.Map<Text, Participant>;
    assignments        : Map.Map<Text, ParticipantAssignment>;
    settingsState      : SettingsState;
    scenariosMap       : Map.Map<ScenarioId, Scenario>;
    shareLinks         : Map.Map<Text, ShareLink>;
    sessions           : Map.Map<Text, OACMeetingSession>;
    forms              : Map.Map<Text, AIAFormEntry>;
    oacState           : { var zoomSettings : ?ZoomSettings };
    resourceStore      : Map.Map<Text, ResourceInternal>;
    allocationStore    : Map.Map<Text, PhaseAllocationInternal>;
    idleTimeStore      : Map.Map<Text, IdleTimeSettingInternal>;
    standardsStore     : Map.Map<Text, SafetyStandard>;
    linksStore         : Map.Map<Text, PhaseStandardLink>;
    complianceStore    : Map.Map<Text, ComplianceItem>;
    signOffStore       : Map.Map<Text, PhaseSignOff>;
    certStore          : Map.Map<Text, NCCERCertification>;
    plansStore         : Map.Map<Text, CriticalChangePlan>;
    planApprovalsStore : Map.Map<Text, CriticalPlanApproval>;
    safetyState        : { var nextSafetyId : Nat };
    subscriptions      : Map.Map<Principal, UserSubscription>;
    documentStore      : Map.Map<Principal, List.List<VerificationDocument>>;
    stripeConfig       : { var secretKey : ?Text };
    adminRoles         : Map.Map<Principal, AdminRole>;
    renewalHistory     : Map.Map<Principal, List.List<RenewalHistoryEntry>>;
    reminderState      : Map.Map<Principal, ReminderState>;
    _controller        : Principal;
    users              : Map.Map<Text, UserRecord>;
    resetCodes         : Map.Map<Text, ResetCodeEntry>;
    controllerProfile  : ControllerProfile;
    loginSessions      : Map.Map<Principal, List.List<SessionEntry>>;
    featureLocks       : FeatureLockState;
    // New fields
    bankAccountStore   : { var bankAccount : ?BankAccount };
    payoutStore        : { var payoutRecords : List.List<PayoutRecord>; var nextPayoutDate : ?Text };
  };

  public func migration(old : OldActor) : NewActor {
    {
      phases             = old.phases;
      state              = old.state;
      codes              = old.codes;
      codeState          = old.codeState;
      completions        = old.completions;
      participants       = old.participants;
      assignments        = old.assignments;
      settingsState      = old.settingsState;
      scenariosMap       = old.scenariosMap;
      shareLinks         = old.shareLinks;
      sessions           = old.sessions;
      forms              = old.forms;
      oacState           = old.oacState;
      resourceStore      = old.resourceStore;
      allocationStore    = old.allocationStore;
      idleTimeStore      = old.idleTimeStore;
      standardsStore     = old.standardsStore;
      linksStore         = old.linksStore;
      complianceStore    = old.complianceStore;
      signOffStore       = old.signOffStore;
      certStore          = old.certStore;
      plansStore         = old.plansStore;
      planApprovalsStore = old.planApprovalsStore;
      safetyState        = old.safetyState;
      subscriptions      = old.subscriptions;
      documentStore      = old.documentStore;
      stripeConfig       = old.stripeConfig;
      adminRoles         = old.adminRoles;
      renewalHistory     = old.renewalHistory;
      reminderState      = old.reminderState;
      _controller        = old._controller;
      users              = old.users;
      resetCodes         = old.resetCodes;
      controllerProfile  = old.controllerProfile;
      loginSessions      = old.loginSessions;
      featureLocks       = old.featureLocks;
      // Initialize new payout fields
      bankAccountStore   = { var bankAccount = null };
      payoutStore        = { var payoutRecords = List.empty<PayoutRecord>(); var nextPayoutDate = null };
    };
  };
};
