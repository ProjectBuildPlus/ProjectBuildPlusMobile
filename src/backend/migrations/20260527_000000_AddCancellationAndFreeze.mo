import Map  "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // OldActor = NewActor of 20260526_000000_AddLoginEmails

  type PhaseId    = Nat;
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

  // Old subscription types (without #frozen / frozenAt / frozenReason)
  type OldSubscriptionStatus = { #trial; #active; #expired; #cancelled };

  type OldUserSubscription = {
    userId                : Principal;
    tier                  : { #tier1year; #tier5year; #tier10year };
    status                : OldSubscriptionStatus;
    trialStartAt          : Int;
    chargeScheduledAt     : Int;
    subscriptionStartAt   : ?Int;
    subscriptionExpiresAt : ?Int;
    stripeCustomerId      : ?Text;
    stripePaymentMethodId : ?Text;
    stripeSubscriptionId  : ?Text;
    currentPlan           : { #tier1year; #tier5year; #tier10year };
    cancelledAt           : ?Int;
  };

  // New subscription types (with #frozen / frozenAt / frozenReason)
  type NewSubscriptionStatus = { #trial; #active; #expired; #cancelled; #frozen };

  type SubscriptionTier = { #tier1year; #tier5year; #tier10year };

  type NewUserSubscription = {
    userId                : Principal;
    tier                  : SubscriptionTier;
    status                : NewSubscriptionStatus;
    trialStartAt          : Int;
    chargeScheduledAt     : Int;
    subscriptionStartAt   : ?Int;
    subscriptionExpiresAt : ?Int;
    stripeCustomerId      : ?Text;
    stripePaymentMethodId : ?Text;
    stripeSubscriptionId  : ?Text;
    currentPlan           : SubscriptionTier;
    cancelledAt           : ?Int;
    frozenAt              : ?Int;
    frozenReason          : ?Text;
  };

  type CancellationRequestStatus = { #pending; #approved; #denied };

  type CancellationRequest = {
    id                  : Text;
    email               : Text;
    subscriberPrincipal : Principal;
    requestedAt         : Int;
    reason              : Text;
    status              : CancellationRequestStatus;
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
    var name         : Text;
    var email        : Text;
    var phone        : Text;
    var passwordHash : Text;
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

  type DrawingCategory = {
    #Photographs;
    #Blueprints;
    #ArchitectDrawings;
    #ConstructionDrawings;
    #CADFiles;
    #EngineeringDrawings;
  };

  type DrawingFileType = { #JPG; #PNG; #PDF; #DWG; #DXF };

  type Drawing = {
    id          : Text;
    name        : Text;
    category    : DrawingCategory;
    fileType    : DrawingFileType;
    storageKey  : Text;
    uploadedBy  : Text;
    uploadedAt  : Int;
    description : Text;
  };

  type ReviewRequest = {
    id          : Text;
    drawingId   : Text;
    requestedBy : Text;
    requestedAt : Int;
    status      : Text;
    notes       : Text;
    oacFormId   : ?Text;
  };

  type DrawingNotification = {
    id          : Text;
    drawingId   : Text;
    drawingName : Text;
    requestedBy : Text;
    requestedAt : Int;
    dismissed   : Bool;
  };

  // OldActor = NewActor of 20260526_000000_AddLoginEmails
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
    subscriptions      : Map.Map<Principal, OldUserSubscription>;
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
    bankAccountStore   : { var bankAccount : ?BankAccount };
    payoutStore        : { var payoutRecords : List.List<PayoutRecord>; var nextPayoutDate : ?Text };
    drawingsStore          : Map.Map<Text, Drawing>;
    reviewRequestsStore    : Map.Map<Text, ReviewRequest>;
    drawingNotifications   : Map.Map<Text, DrawingNotification>;
    loginEmails            : List.List<Text>;
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
    // Updated: subscriptions now use NewUserSubscription
    subscriptions      : Map.Map<Principal, NewUserSubscription>;
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
    bankAccountStore   : { var bankAccount : ?BankAccount };
    payoutStore        : { var payoutRecords : List.List<PayoutRecord>; var nextPayoutDate : ?Text };
    drawingsStore          : Map.Map<Text, Drawing>;
    reviewRequestsStore    : Map.Map<Text, ReviewRequest>;
    drawingNotifications   : Map.Map<Text, DrawingNotification>;
    loginEmails            : List.List<Text>;
    // New field: cancellation requests map
    cancellationRequests   : Map.Map<Text, CancellationRequest>;
  };

  // Fixed reference timestamp: 2026-05-27 00:00:00 UTC in nanoseconds
  let REF_NS : Int = 1_748_304_000_000_000_000;
  let DAY_NS : Int = 86_400_000_000_000;

  // Migrate existing OldUserSubscription to NewUserSubscription (adds frozenAt/frozenReason)
  func migrateSubscription(old : OldUserSubscription) : NewUserSubscription {
    let newStatus : NewSubscriptionStatus = switch (old.status) {
      case (#trial)     { #trial };
      case (#active)    { #active };
      case (#expired)   { #expired };
      case (#cancelled) { #cancelled };
    };
    {
      userId                = old.userId;
      tier                  = old.tier;
      status                = newStatus;
      trialStartAt          = old.trialStartAt;
      chargeScheduledAt     = old.chargeScheduledAt;
      subscriptionStartAt   = old.subscriptionStartAt;
      subscriptionExpiresAt = old.subscriptionExpiresAt;
      stripeCustomerId      = old.stripeCustomerId;
      stripePaymentMethodId = old.stripePaymentMethodId;
      stripeSubscriptionId  = old.stripeSubscriptionId;
      currentPlan           = old.currentPlan;
      cancelledAt           = old.cancelledAt;
      frozenAt              = null;
      frozenReason          = null;
    };
  };

  // Seed sample cancellation requests for UI display
  func makeSampleCancellationRequests() : Map.Map<Text, CancellationRequest> {
    let m = Map.empty<Text, CancellationRequest>();
    let p1 = Principal.fromText("2vxsx-fae");
    m.add("cancel-sample-1", {
      id                  = "cancel-sample-1";
      email               = "alice.johnson@constructco.com";
      subscriberPrincipal = p1;
      requestedAt         = REF_NS - 5 * DAY_NS;
      reason              = "Project has been completed, no longer need the platform.";
      status              = #pending;
    });
    m.add("cancel-sample-2", {
      id                  = "cancel-sample-2";
      email               = "bob.martinez@buildright.net";
      subscriberPrincipal = p1;
      requestedAt         = REF_NS - 2 * DAY_NS;
      reason              = "Switching to a different project management tool.";
      status              = #pending;
    });
    m.add("cancel-sample-3", {
      id                  = "cancel-sample-3";
      email               = "sarah.chen@skylineprojects.org";
      subscriberPrincipal = p1;
      requestedAt         = REF_NS - 1 * DAY_NS;
      reason              = "Budget constraints, need to reduce software costs.";
      status              = #pending;
    });
    m;
  };

  // Seed 2 frozen subscription entries using anonymous principal as placeholder
  func seedFrozenSubscriptions(
    subs : Map.Map<Principal, NewUserSubscription>,
  ) : () {
    let p1 = Principal.fromText("2vxsx-fae");
    // Only seed if there are no subscriptions yet (fresh install)
    if (subs.size() == 0) {
      subs.add(p1, {
        userId                = p1;
        tier                  = #tier1year;
        status                = #frozen;
        trialStartAt          = REF_NS - 60 * DAY_NS;
        chargeScheduledAt     = REF_NS - 31 * DAY_NS;
        subscriptionStartAt   = ?(REF_NS - 30 * DAY_NS);
        subscriptionExpiresAt = ?(REF_NS + 335 * DAY_NS);
        stripeCustomerId      = ?"cus_sample_frozen1";
        stripePaymentMethodId = ?"pm_sample_frozen1";
        stripeSubscriptionId  = ?"sub_sample_frozen1";
        currentPlan           = #tier1year;
        cancelledAt           = null;
        frozenAt              = ?(REF_NS - 3 * DAY_NS);
        frozenReason          = ?"Payment dispute pending resolution.";
      });
    };
  };

  public func migration(old : OldActor) : NewActor {
    // Migrate subscriptions: add frozenAt/frozenReason fields
    let newSubs = Map.empty<Principal, NewUserSubscription>();
    for (sub in old.subscriptions.values()) {
      newSubs.add(sub.userId, migrateSubscription(sub));
    };
    // Seed frozen samples only on fresh install (no existing subscriptions)
    seedFrozenSubscriptions(newSubs);
    // Build cancellation requests map with 3 pending sample entries
    let cancellationRequests = makeSampleCancellationRequests();
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
      subscriptions      = newSubs;
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
      bankAccountStore   = old.bankAccountStore;
      payoutStore        = old.payoutStore;
      drawingsStore          = old.drawingsStore;
      reviewRequestsStore    = old.reviewRequestsStore;
      drawingNotifications   = old.drawingNotifications;
      loginEmails            = old.loginEmails;
      cancellationRequests   = cancellationRequests;
    };
  };
};
