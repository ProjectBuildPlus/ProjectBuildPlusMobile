import Debug "mo:core/Debug";

module {

  public type StandardCategory = {
    #OSHA;
    #ANSI;
    #IEEE;
    #NCCER;
    #IBC;
  };

  public type StandardStatus = {
    #Active;
    #Superseded;
    #Withdrawn;
  };

  /// Core safety standard record
  public type SafetyStandard = {
    id : Text;
    category : StandardCategory;
    code : Text;
    title : Text;
    summary : Text;
    applicableTrades : [Text];
    csiDivisions : [Text];
    state : ?Text;           // null = federal/all-states; set for IBC/NCCER state-specific
    relatedStandards : [Text]; // IDs of related SafetyStandard records
    status : StandardStatus;
  };

  // ─── Phase-standard linking ────────────────────────────────────────────────

  public type PhaseStandardLink = {
    id : Text;
    phaseId : Text;
    csiCode : Text;
    standardId : Text;
    linkedBy : Text;   // participant ID or "system" for auto-link
    linkedAt : Int;
  };

  // ─── Compliance checklist ──────────────────────────────────────────────────

  public type ComplianceStatus = {
    #Compliant;
    #NonCompliant;
    #NA;
  };

  public type ComplianceSeverity = {
    #Critical;
    #Major;
    #Minor;
    #None;
  };

  public type ComplianceItem = {
    id : Text;
    phaseId : Text;
    standardId : Text;
    var status : ComplianceStatus;
    var severity : ComplianceSeverity;
    var notes : Text;
    var checkedBy : Text;  // participant ID
    var checkedAt : Int;
  };

  // ─── Phase sign-off ────────────────────────────────────────────────────────

  public type PhaseSignOff = {
    id : Text;
    phaseId : Text;
    signedBy : Text;   // participant ID
    role : Text;       // role label at sign-off time
    signedAt : Int;
    var approved : Bool;
    var comments : Text;
  };

  // ─── NCCER certifications ──────────────────────────────────────────────────

  public type NCCERCertStatus = {
    #Current;
    #Expiring;
    #Expired;
  };

  public type NCCERCertification = {
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

  // ─── Critical change safety plans ─────────────────────────────────────────

  public type CriticalPlanStatus = {
    #Draft;
    #PendingApproval;
    #Approved;
    #Rejected;
  };

  public type CriticalChangePlan = {
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

  public type CriticalPlanApproval = {
    id : Text;
    planId : Text;
    approvedBy : Text;  // participant ID
    role : Text;        // role label at approval time
    approvedAt : Int;
    approved : Bool;
  };

  // ─── Aggregates used across lib / mixin ───────────────────────────────────

  public type PhaseComplianceSummary = {
    phaseId : Text;
    total : Nat;
    compliant : Nat;
    nonCompliant : Nat;
    notApplicable : Nat;
    signedOff : Bool;
  };

};
