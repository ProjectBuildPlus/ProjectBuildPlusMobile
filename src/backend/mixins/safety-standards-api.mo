import Debug "mo:core/Debug";
import Map "mo:core/Map";
import SafetyLib "../lib/safety-standards";
import SafetyTypes "../types/safety-standards";
import ParticipantTypes "../types/participants";

mixin (
  standardsStore : SafetyLib.StandardsStore,
  linksStore : SafetyLib.LinksStore,
  complianceStore : SafetyLib.ComplianceStore,
  signOffStore : SafetyLib.SignOffStore,
  certStore : SafetyLib.CertStore,
  plansStore : SafetyLib.PlansStore,
  planApprovalsStore : SafetyLib.PlanApprovalsStore,
  safetyState : SafetyLib.SafetyState
) {

  // ─── Standards reference library ─────────────────────────────────────────

  public query func searchStandards(
    searchText : Text,
    category : ?SafetyTypes.StandardCategory,
    state : ?Text
  ) : async [SafetyTypes.SafetyStandard] {
    SafetyLib.searchStandards(standardsStore, searchText, category, state);
  };

  public query func getFilteredStandards(
    projectCategory : Text,
    projectSubtype : Text,
    state : ?Text
  ) : async [SafetyTypes.SafetyStandard] {
    SafetyLib.getFilteredStandards(standardsStore, projectCategory, projectSubtype, state);
  };

  public query func getStandard(id : Text) : async ?SafetyTypes.SafetyStandard {
    SafetyLib.getStandard(standardsStore, id);
  };

  // ─── Phase-standard linking ───────────────────────────────────────────────

  public shared ({ caller }) func linkStandardToPhase(
    phaseId : Text,
    csiCode : Text,
    standardId : Text
  ) : async SafetyTypes.PhaseStandardLink {
    SafetyLib.linkStandardToPhase(linksStore, safetyState, phaseId, csiCode, standardId, caller.toText());
  };

  public shared ({ caller }) func unlinkStandardFromPhase(
    phaseId : Text,
    csiCode : Text,
    standardId : Text
  ) : async Bool {
    ignore caller;
    SafetyLib.unlinkStandardFromPhase(linksStore, phaseId, csiCode, standardId);
  };

  public query func getStandardsForPhase(phaseId : Text) : async [SafetyTypes.SafetyStandard] {
    SafetyLib.getStandardsForPhase(linksStore, standardsStore, phaseId);
  };

  public query func getStandardsForCsiCode(csiCode : Text) : async [SafetyTypes.SafetyStandard] {
    SafetyLib.getStandardsForCsiCode(linksStore, standardsStore, csiCode);
  };

  public shared ({ caller }) func autoLinkStandardsForCategory(
    projectCategory : Text,
    projectSubtype : Text,
    state : ?Text
  ) : async [Text] {
    SafetyLib.autoLinkStandardsForCategory(linksStore, standardsStore, safetyState, projectCategory, projectSubtype, state, caller.toText());
  };

  // ─── Compliance checklist ─────────────────────────────────────────────────

  public shared ({ caller }) func upsertComplianceItem(
    phaseId : Text,
    standardId : Text,
    status : SafetyTypes.ComplianceStatus,
    severity : SafetyTypes.ComplianceSeverity,
    notes : Text
  ) : async SafetyLib.ComplianceItemShared {
    let item = SafetyLib.upsertComplianceItem(
      complianceStore, safetyState,
      phaseId, standardId, status, severity, notes, caller.toText()
    );
    SafetyLib.complianceItemToShared(item);
  };

  public query func getComplianceItemsForPhase(phaseId : Text) : async [SafetyLib.ComplianceItemShared] {
    let items = SafetyLib.getComplianceItemsForPhase(complianceStore, phaseId);
    items.vals().map<SafetyTypes.ComplianceItem, SafetyLib.ComplianceItemShared>(func(c) { SafetyLib.complianceItemToShared(c) }).toArray();
  };

  public query func getPhaseComplianceStatus(phaseId : Text) : async SafetyTypes.PhaseComplianceSummary {
    SafetyLib.getPhaseComplianceStatus(complianceStore, signOffStore, phaseId);
  };

  // ─── Phase sign-off ───────────────────────────────────────────────────────

  public shared ({ caller }) func submitPhaseSignOff(
    phaseId : Text,
    approved : Bool,
    comments : Text
  ) : async SafetyLib.PhaseSignOffShared {
    let signOff = SafetyLib.submitPhaseSignOff(
      signOffStore, safetyState,
      phaseId, caller.toText(), "participant", approved, comments
    );
    SafetyLib.signOffToShared(signOff);
  };

  public query func getSignOffsForPhase(phaseId : Text) : async [SafetyLib.PhaseSignOffShared] {
    let items = SafetyLib.getSignOffsForPhase(signOffStore, phaseId);
    items.vals().map<SafetyTypes.PhaseSignOff, SafetyLib.PhaseSignOffShared>(func(s) { SafetyLib.signOffToShared(s) }).toArray();
  };

  public query func isPhaseSignedOff(phaseId : Text) : async Bool {
    SafetyLib.isPhaseSignedOff(signOffStore, phaseId);
  };

  // ─── NCCER certifications ─────────────────────────────────────────────────

  public shared ({ caller }) func addNCCERCertification(
    participantId : Text,
    trade : Text,
    discipline : Text,
    level : Text,
    state : Text,
    certNumber : Text,
    issuedAt : Int,
    expiresAt : Int
  ) : async SafetyLib.NCCERCertShared {
    ignore caller;
    let cert = SafetyLib.addNCCERCertification(
      certStore, safetyState,
      participantId, trade, discipline, level, state, certNumber, issuedAt, expiresAt
    );
    SafetyLib.certToShared(cert);
  };

  public shared ({ caller }) func updateNCCERCertification(
    id : Text,
    trade : ?Text,
    discipline : ?Text,
    level : ?Text,
    certNumber : ?Text,
    issuedAt : ?Int,
    expiresAt : ?Int,
    status : ?SafetyTypes.NCCERCertStatus
  ) : async ?SafetyLib.NCCERCertShared {
    ignore caller;
    let result = SafetyLib.updateNCCERCertification(
      certStore, id, trade, discipline, level, certNumber, issuedAt, expiresAt, status
    );
    switch (result) {
      case null { null };
      case (?cert) { ?SafetyLib.certToShared(cert) };
    };
  };

  public query func getNCCERCertificationsForParticipant(
    participantId : Text
  ) : async [SafetyLib.NCCERCertShared] {
    let items = SafetyLib.getNCCERCertificationsForParticipant(certStore, participantId);
    items.vals().map<SafetyTypes.NCCERCertification, SafetyLib.NCCERCertShared>(func(c) { SafetyLib.certToShared(c) }).toArray();
  };

  public query func getCertificationsForPhase(phaseId : Text) : async [SafetyLib.NCCERCertShared] {
    let items = SafetyLib.getCertificationsForPhase(certStore, linksStore, standardsStore, phaseId);
    items.vals().map<SafetyTypes.NCCERCertification, SafetyLib.NCCERCertShared>(func(c) { SafetyLib.certToShared(c) }).toArray();
  };

  // ─── Critical change safety plans ─────────────────────────────────────────

  public shared ({ caller }) func createCriticalChangePlan(
    name : Text,
    phaseIds : [Text],
    csiCodes : [Text],
    hazardAnalysis : Text,
    controlMeasures : Text,
    affectedStandardIds : [Text],
    responsibleParticipantIds : [Text]
  ) : async SafetyLib.CriticalChangePlanShared {
    let plan = SafetyLib.createCriticalChangePlan(
      plansStore, safetyState,
      name, phaseIds, csiCodes, hazardAnalysis, controlMeasures,
      affectedStandardIds, responsibleParticipantIds, caller.toText()
    );
    SafetyLib.planToShared(plan);
  };

  public shared ({ caller }) func updateCriticalChangePlan(
    id : Text,
    name : ?Text,
    phaseIds : ?[Text],
    csiCodes : ?[Text],
    hazardAnalysis : ?Text,
    controlMeasures : ?Text,
    affectedStandardIds : ?[Text],
    responsibleParticipantIds : ?[Text]
  ) : async ?SafetyLib.CriticalChangePlanShared {
    ignore caller;
    let result = SafetyLib.updateCriticalChangePlan(
      plansStore, id, name, phaseIds, csiCodes,
      hazardAnalysis, controlMeasures, affectedStandardIds, responsibleParticipantIds
    );
    switch (result) {
      case null { null };
      case (?plan) { ?SafetyLib.planToShared(plan) };
    };
  };

  public shared ({ caller }) func submitPlanForApproval(
    id : Text
  ) : async ?SafetyLib.CriticalChangePlanShared {
    let result = SafetyLib.submitPlanForApproval(plansStore, id, caller.toText());
    switch (result) {
      case null { null };
      case (?plan) { ?SafetyLib.planToShared(plan) };
    };
  };

  public shared ({ caller }) func approveCriticalChangePlan(
    planId : Text,
    approved : Bool
  ) : async SafetyTypes.CriticalPlanApproval {
    SafetyLib.approveCriticalChangePlan(
      plansStore, planApprovalsStore, safetyState,
      planId, caller.toText(), "participant", approved
    );
  };

  public query func getCriticalChangePlansForPhase(
    phaseId : Text
  ) : async [SafetyLib.CriticalChangePlanShared] {
    let items = SafetyLib.getCriticalChangePlansForPhase(plansStore, phaseId);
    items.vals().map<SafetyTypes.CriticalChangePlan, SafetyLib.CriticalChangePlanShared>(func(p) { SafetyLib.planToShared(p) }).toArray();
  };

  public query func isPlanFullyApproved(planId : Text) : async Bool {
    SafetyLib.isPlanFullyApproved(planApprovalsStore, planId);
  };

  // ─── Permission helpers (query surface for frontend) ─────────────────────

  public query func canAccessCompliance(
    role : ParticipantTypes.ParticipantRole
  ) : async Bool {
    SafetyLib.canAccessCompliance(role);
  };

  public query func canManageCriticalPlans(
    role : ParticipantTypes.ParticipantRole
  ) : async Bool {
    SafetyLib.canManageCriticalPlans(role);
  };

};
