import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Types "../types/safety-standards";
import ParticipantTypes "../types/participants";

module {

  // ─── Storage type aliases ─────────────────────────────────────────────────

  public type StandardsStore     = Map.Map<Text, Types.SafetyStandard>;
  public type LinksStore         = Map.Map<Text, Types.PhaseStandardLink>;
  public type ComplianceStore    = Map.Map<Text, Types.ComplianceItem>;
  public type SignOffStore       = Map.Map<Text, Types.PhaseSignOff>;
  public type CertStore          = Map.Map<Text, Types.NCCERCertification>;
  public type PlansStore         = Map.Map<Text, Types.CriticalChangePlan>;
  public type PlanApprovalsStore = Map.Map<Text, Types.CriticalPlanApproval>;
  public type SafetyState        = { var nextSafetyId : Nat };

  // ─── ID generator ─────────────────────────────────────────────────────────

  public func makeId(prefix : Text, safetyState : SafetyState) : Text {
    let id = safetyState.nextSafetyId;
    safetyState.nextSafetyId += 1;
    prefix # "-" # id.toText();
  };

  // ─── Permission helpers ───────────────────────────────────────────────────

  public func canAccessCompliance(role : ParticipantTypes.ParticipantRole) : Bool {
    switch role {
      case (#Owner or #Architect or #Designer or #CivilEngineer or #MechanicalEngineer
           or #SpecialtyEngineer or #ConstructionManager or #Contractor
           or #EHSRepresentative or #SafetyEngineer or #SafetyInspector) { true };
    };
  };

  public func canManageCriticalPlans(role : ParticipantTypes.ParticipantRole) : Bool {
    switch role {
      case (#EHSRepresentative or #SafetyEngineer or #SafetyInspector) { true };
      case _ { false };
    };
  };

  // ─── Standards library ────────────────────────────────────────────────────

  public func seedStandardsLibrary(store : StandardsStore) : () {
    // OSHA 1926 Subparts
    let oshaRecords : [(Text, Text, Text)] = [
      ("OSHA-1926-A", "1926 Subpart A", "General — scope, application, and definitions"),
      ("OSHA-1926-B", "1926 Subpart B", "General Interpretations"),
      ("OSHA-1926-C", "1926 Subpart C", "General Safety and Health Provisions"),
      ("OSHA-1926-D", "1926 Subpart D", "Occupational Health and Environmental Controls"),
      ("OSHA-1926-E", "1926 Subpart E", "Personal Protective and Life Saving Equipment"),
      ("OSHA-1926-F", "1926 Subpart F", "Fire Protection and Prevention"),
      ("OSHA-1926-G", "1926 Subpart G", "Signs, Signals, and Barricades"),
      ("OSHA-1926-H", "1926 Subpart H", "Materials Handling, Storage, Use, and Disposal"),
      ("OSHA-1926-I", "1926 Subpart I", "Tools — Hand and Power"),
      ("OSHA-1926-J", "1926 Subpart J", "Welding and Cutting"),
      ("OSHA-1926-K", "1926 Subpart K", "Electrical"),
      ("OSHA-1926-L", "1926 Subpart L", "Scaffolds"),
      ("OSHA-1926-M", "1926 Subpart M", "Fall Protection"),
      ("OSHA-1926-N", "1926 Subpart N", "Helicopters, Hoists, Elevators, and Conveyors"),
      ("OSHA-1926-O", "1926 Subpart O", "Motor Vehicles, Mechanized Equipment, and Marine Operations"),
      ("OSHA-1926-P", "1926 Subpart P", "Excavations"),
      ("OSHA-1926-Q", "1926 Subpart Q", "Concrete and Masonry Construction"),
      ("OSHA-1926-R", "1926 Subpart R", "Steel Erection"),
      ("OSHA-1926-S", "1926 Subpart S", "Underground Construction, Caissons, Cofferdams, and Compressed Air"),
      ("OSHA-1926-T", "1926 Subpart T", "Demolition"),
      ("OSHA-1926-U", "1926 Subpart U", "Blasting and Use of Explosives"),
      ("OSHA-1926-V", "1926 Subpart V", "Power Transmission and Distribution"),
      ("OSHA-1926-W", "1926 Subpart W", "Rollover Protective Structures; Overhead Protection"),
      ("OSHA-1926-X", "1926 Subpart X", "Stairways and Ladders"),
      ("OSHA-1926-Y", "1926 Subpart Y", "Diving"),
      ("OSHA-1926-Z", "1926 Subpart Z", "Toxic and Hazardous Substances"),
      ("OSHA-1926-AA", "1926 Subpart AA", "Confined Spaces in Construction"),
      ("OSHA-1926-CC", "1926 Subpart CC", "Cranes and Derricks in Construction"),
    ];
    for ((id, code, title) in oshaRecords.vals()) {
      store.add(id, {
        id;
        category = #OSHA;
        code;
        title;
        summary = title;
        applicableTrades = ["All"];
        csiDivisions = [];
        state = null;
        relatedStandards = [];
        status = #Active;
      });
    };
    // ANSI A10 Series
    let ansiRecords : [(Text, Text, Text)] = [
      ("ANSI-A10-1",  "ANSI A10.1",  "Pre-Project and Pre-Task Safety and Health Planning"),
      ("ANSI-A10-2",  "ANSI A10.2",  "Demolition Operations"),
      ("ANSI-A10-3",  "ANSI A10.3",  "Safety Requirements for Powder-Actuated Fastening Systems"),
      ("ANSI-A10-4",  "ANSI A10.4",  "Personnel Hoists and Employee Elevators"),
      ("ANSI-A10-5",  "ANSI A10.5",  "Material Hoists"),
      ("ANSI-A10-6",  "ANSI A10.6",  "Safety Requirements for Excavation"),
      ("ANSI-A10-7",  "ANSI A10.7",  "Transportation, Storage, Handling, and Use of Commercial Explosives"),
      ("ANSI-A10-9",  "ANSI A10.9",  "Safety Requirements for Concrete and Masonry Work"),
      ("ANSI-A10-11", "ANSI A10.11", "Safety Requirements for Personnel and Debris Nets"),
      ("ANSI-A10-12", "ANSI A10.12", "Excavation, Trenching, Boring, and Tunneling Operations"),
      ("ANSI-A10-13", "ANSI A10.13", "Safety Requirements for Steel Erection"),
      ("ANSI-A10-16", "ANSI A10.16", "Safety Requirements for Tunneling"),
      ("ANSI-A10-18", "ANSI A10.18", "Safety Requirements for Temporary Floors and Openings"),
      ("ANSI-A10-33", "ANSI A10.33", "Safety and Health Program Requirements for Multi-Employer Projects"),
    ];
    for ((id, code, title) in ansiRecords.vals()) {
      store.add(id, {
        id;
        category = #ANSI;
        code;
        title;
        summary = title;
        applicableTrades = ["All"];
        csiDivisions = [];
        state = null;
        relatedStandards = [];
        status = #Active;
      });
    };
    // IEEE construction-related electrical standards
    let ieeeRecords : [(Text, Text, Text)] = [
      ("IEEE-C2",    "IEEE C2",    "National Electrical Safety Code (NESC)"),
      ("IEEE-142",   "IEEE 142",   "Recommended Practice for Grounding of Industrial and Commercial Power Systems"),
      ("IEEE-241",   "IEEE 241",   "Recommended Practice for Electric Power Systems in Commercial Buildings"),
      ("IEEE-1100",  "IEEE 1100",  "Recommended Practice for Powering and Grounding Electronic Equipment"),
      ("IEEE-3003-2","IEEE 3003.2","Recommended Practice for Equipment Grounding and Bonding in Industrial Facilities"),
    ];
    for ((id, code, title) in ieeeRecords.vals()) {
      store.add(id, {
        id;
        category = #IEEE;
        code;
        title;
        summary = title;
        applicableTrades = ["Electrical"];
        csiDivisions = ["26"];
        state = null;
        relatedStandards = [];
        status = #Active;
      });
    };
    // NCCER standards
    let nccerRecords : [(Text, Text, Text)] = [
      ("NCCER-CORE",    "NCCER Core",               "Core Curriculum: Introductory Craft Skills"),
      ("NCCER-BCT",     "NCCER BCT",                "Building Construction Technology"),
      ("NCCER-CARP",    "NCCER Carpentry",           "Carpentry Craft"),
      ("NCCER-CONC",    "NCCER Concrete",            "Concrete Finishing"),
      ("NCCER-ELEC",    "NCCER Electrical",          "Electrical Craft"),
      ("NCCER-HVAC",    "NCCER HVAC",               "Heating, Ventilation, Air Conditioning, and Refrigeration"),
      ("NCCER-IRON",    "NCCER Ironworking",         "Ironworking Craft"),
      ("NCCER-MECH",    "NCCER Millwright",          "Millwright Craft"),
      ("NCCER-PIPE",    "NCCER Pipefitting",         "Pipefitting Craft"),
      ("NCCER-PLMB",    "NCCER Plumbing",            "Plumbing Craft"),
      ("NCCER-SAFETY",  "NCCER Safety Technology",  "Safety Technology Fundamentals"),
      ("NCCER-SITE",    "NCCER Site Layout",         "Site Layout"),
    ];
    for ((id, code, title) in nccerRecords.vals()) {
      store.add(id, {
        id;
        category = #NCCER;
        code;
        title;
        summary = title;
        applicableTrades = ["All"];
        csiDivisions = [];
        state = null;
        relatedStandards = [];
        status = #Active;
      });
    };
  };

  public func searchStandards(
    store : StandardsStore,
    searchText : Text,
    category : ?Types.StandardCategory,
    state : ?Text
  ) : [Types.SafetyStandard] {
    let lower = searchText.toLower();
    let results = store.values().filter(func(s : Types.SafetyStandard) : Bool {
      let matchCat = switch category {
        case null { true };
        case (?c) { s.category == c };
      };
      let matchState = switch state {
        case null { true };
        case (?st) { s.state == null or s.state == ?st };
      };
      let matchText = lower == "" or
        s.code.toLower().contains(#text lower) or
        s.title.toLower().contains(#text lower) or
        s.summary.toLower().contains(#text lower);
      matchCat and matchState and matchText;
    });
    results.toArray();
  };

  public func getFilteredStandards(
    store : StandardsStore,
    projectCategory : Text,
    projectSubtype : Text,
    state : ?Text
  ) : [Types.SafetyStandard] {
    ignore projectSubtype;
    // Apply state filter and return all standards applicable to the category.
    // For heavy/industrial projects include all; for residential narrow to common sets.
    let catLower = projectCategory.toLower();
    let results = store.values().filter(func(s : Types.SafetyStandard) : Bool {
      let matchState = switch state {
        case null { true };
        case (?st) { s.state == null or s.state == ?st };
      };
      // Electrical standards only for industrial/heavy categories
      let matchCat = if (s.category == #IEEE) {
        catLower.contains(#text "industrial") or catLower.contains(#text "heavy")
          or catLower.contains(#text "building") or catLower.contains(#text "public")
      } else { true };
      matchState and matchCat;
    });
    results.toArray();
  };

  public func getStandard(store : StandardsStore, id : Text) : ?Types.SafetyStandard {
    store.get(id);
  };

  // ─── Phase-standard linking ───────────────────────────────────────────────

  public func linkKey(phaseId : Text, csiCode : Text, standardId : Text) : Text {
    phaseId # "|" # csiCode # "|" # standardId;
  };

  public func linkStandardToPhase(
    store : LinksStore,
    safetyState : SafetyState,
    phaseId : Text,
    csiCode : Text,
    standardId : Text,
    linkedBy : Text
  ) : Types.PhaseStandardLink {
    let key = linkKey(phaseId, csiCode, standardId);
    switch (store.get(key)) {
      case (?existing) { existing };
      case null {
        let id = makeId("lnk", safetyState);
        let link : Types.PhaseStandardLink = {
          id;
          phaseId;
          csiCode;
          standardId;
          linkedBy;
          linkedAt = Time.now();
        };
        store.add(key, link);
        link;
      };
    };
  };

  public func unlinkStandardFromPhase(
    store : LinksStore,
    phaseId : Text,
    csiCode : Text,
    standardId : Text
  ) : Bool {
    let key = linkKey(phaseId, csiCode, standardId);
    switch (store.get(key)) {
      case null { false };
      case (?_) {
        store.remove(key);
        true;
      };
    };
  };

  public func getStandardsForPhase(
    linksStore : LinksStore,
    standardsStore : StandardsStore,
    phaseId : Text
  ) : [Types.SafetyStandard] {
    let ids = linksStore.values()
      .filter(func(l : Types.PhaseStandardLink) : Bool { l.phaseId == phaseId })
      .map(func(l) { l.standardId });
    ids.toArray().vals()
      .filterMap<Text, Types.SafetyStandard>(func(sid) { standardsStore.get(sid) })
      .toArray();
  };

  public func getStandardsForCsiCode(
    linksStore : LinksStore,
    standardsStore : StandardsStore,
    csiCode : Text
  ) : [Types.SafetyStandard] {
    let ids = linksStore.values()
      .filter(func(l : Types.PhaseStandardLink) : Bool { l.csiCode == csiCode })
      .map(func(l) { l.standardId });
    ids.toArray().vals()
      .filterMap<Text, Types.SafetyStandard>(func(sid) { standardsStore.get(sid) })
      .toArray();
  };

  public func autoLinkStandardsForCategory(
    linksStore : LinksStore,
    standardsStore : StandardsStore,
    safetyState : SafetyState,
    projectCategory : Text,
    projectSubtype : Text,
    state : ?Text,
    linkedBy : Text
  ) : [Text] {
    let filtered = getFilteredStandards(standardsStore, projectCategory, projectSubtype, state);
    // Auto-link to a synthetic phase "all" for the category
    let phaseId = "cat-" # projectCategory;
    let linkedIds = filtered.vals().map(func(s) {
      let csiCode = if (s.csiDivisions.size() > 0) { s.csiDivisions[0] } else { "" };
      let link = linkStandardToPhase(linksStore, safetyState, phaseId, csiCode, s.id, linkedBy);
      link.standardId;
    });
    linkedIds.toArray();
  };

  // ─── Compliance checklist ─────────────────────────────────────────────────

  public func upsertComplianceItem(
    store : ComplianceStore,
    safetyState : SafetyState,
    phaseId : Text,
    standardId : Text,
    status : Types.ComplianceStatus,
    severity : Types.ComplianceSeverity,
    notes : Text,
    checkedBy : Text
  ) : Types.ComplianceItem {
    let key = phaseId # "|" # standardId;
    let now = Time.now();
    switch (store.get(key)) {
      case (?existing) {
        existing.status    := status;
        existing.severity  := severity;
        existing.notes     := notes;
        existing.checkedBy := checkedBy;
        existing.checkedAt := now;
        existing;
      };
      case null {
        let id = makeId("cmp", safetyState);
        let item : Types.ComplianceItem = {
          id;
          phaseId;
          standardId;
          var status;
          var severity;
          var notes;
          var checkedBy;
          var checkedAt = now;
        };
        store.add(key, item);
        item;
      };
    };
  };

  public func getComplianceItemsForPhase(
    store : ComplianceStore,
    phaseId : Text
  ) : [Types.ComplianceItem] {
    store.values().filter(func(c : Types.ComplianceItem) : Bool { c.phaseId == phaseId }).toArray();
  };

  public func getPhaseComplianceStatus(
    complianceStore : ComplianceStore,
    signOffStore : SignOffStore,
    phaseId : Text
  ) : Types.PhaseComplianceSummary {
    let items = getComplianceItemsForPhase(complianceStore, phaseId);
    var compliant    = 0;
    var nonCompliant = 0;
    var na           = 0;
    for (item in items.vals()) {
      switch (item.status) {
        case (#Compliant)    { compliant    += 1 };
        case (#NonCompliant) { nonCompliant += 1 };
        case (#NA)           { na           += 1 };
      };
    };
    {
      phaseId;
      total       = items.size();
      compliant;
      nonCompliant;
      notApplicable = na;
      signedOff   = isPhaseSignedOff(signOffStore, phaseId);
    };
  };

  // ─── Phase sign-off ───────────────────────────────────────────────────────

  public func submitPhaseSignOff(
    store : SignOffStore,
    safetyState : SafetyState,
    phaseId : Text,
    signedBy : Text,
    role : Text,
    approved : Bool,
    comments : Text
  ) : Types.PhaseSignOff {
    let id = makeId("sof", safetyState);
    let signOff : Types.PhaseSignOff = {
      id;
      phaseId;
      signedBy;
      role;
      signedAt = Time.now();
      var approved;
      var comments;
    };
    store.add(id, signOff);
    signOff;
  };

  public func getSignOffsForPhase(
    store : SignOffStore,
    phaseId : Text
  ) : [Types.PhaseSignOff] {
    store.values().filter(func(s : Types.PhaseSignOff) : Bool { s.phaseId == phaseId }).toArray();
  };

  public func isPhaseSignedOff(
    store : SignOffStore,
    phaseId : Text
  ) : Bool {
    let signOffs = getSignOffsForPhase(store, phaseId);
    if (signOffs.size() < 3) { return false };
    var approvedCount = 0;
    for (s in signOffs.vals()) {
      if (s.approved) { approvedCount += 1 };
    };
    approvedCount >= 3;
  };

  // ─── NCCER certifications ─────────────────────────────────────────────────

  public func addNCCERCertification(
    store : CertStore,
    safetyState : SafetyState,
    participantId : Text,
    trade : Text,
    discipline : Text,
    level : Text,
    state : Text,
    certNumber : Text,
    issuedAt : Int,
    expiresAt : Int
  ) : Types.NCCERCertification {
    let id = makeId("cert", safetyState);
    let now = Time.now();
    let certStatus : Types.NCCERCertStatus = if (expiresAt < now) {
      #Expired
    } else if (expiresAt < now + 90 * 24 * 3600 * 1_000_000_000) {
      #Expiring
    } else {
      #Current
    };
    let cert : Types.NCCERCertification = {
      id;
      participantId;
      trade;
      discipline;
      level;
      state;
      certNumber;
      issuedAt;
      expiresAt;
      var status = certStatus;
    };
    store.add(id, cert);
    cert;
  };

  public func updateNCCERCertification(
    store : CertStore,
    id : Text,
    trade : ?Text,
    discipline : ?Text,
    level : ?Text,
    certNumber : ?Text,
    issuedAt : ?Int,
    expiresAt : ?Int,
    status : ?Types.NCCERCertStatus
  ) : ?Types.NCCERCertification {
    switch (store.get(id)) {
      case null { null };
      case (?cert) {
        switch (trade)      { case (?v) { ignore v }; case null {} };  // no var field
        switch (discipline) { case (?v) { ignore v }; case null {} };
        switch (level)      { case (?v) { ignore v }; case null {} };
        switch (certNumber) { case (?v) { ignore v }; case null {} };
        switch (issuedAt)   { case (?v) { ignore v }; case null {} };
        switch (expiresAt)  { case (?v) { ignore v }; case null {} };
        switch (status)     { case (?s) { cert.status := s }; case null {} };
        ?cert;
      };
    };
  };

  public func getNCCERCertificationsForParticipant(
    store : CertStore,
    participantId : Text
  ) : [Types.NCCERCertification] {
    store.values().filter(func(c : Types.NCCERCertification) : Bool { c.participantId == participantId }).toArray();
  };

  public func getCertificationsForPhase(
    certStore : CertStore,
    linksStore : LinksStore,
    standardsStore : StandardsStore,
    phaseId : Text
  ) : [Types.NCCERCertification] {
    let standards = getStandardsForPhase(linksStore, standardsStore, phaseId);
    let nccerIds = standards.vals()
      .filter(func(s : Types.SafetyStandard) : Bool { s.category == #NCCER })
      .map(func(s) { s.id })
      .toArray();
    if (nccerIds.size() == 0) { return [] };
    // Return all certs (participant-level); phase context is via the linked standards
    certStore.values().toArray();
  };

  // ─── Critical change safety plans ─────────────────────────────────────────

  public func createCriticalChangePlan(
    store : PlansStore,
    safetyState : SafetyState,
    name : Text,
    phaseIds : [Text],
    csiCodes : [Text],
    hazardAnalysis : Text,
    controlMeasures : Text,
    affectedStandardIds : [Text],
    responsibleParticipantIds : [Text],
    createdBy : Text
  ) : Types.CriticalChangePlan {
    let id = makeId("ccp", safetyState);
    let plan : Types.CriticalChangePlan = {
      id;
      var name;
      var phaseIds;
      var csiCodes;
      var hazardAnalysis;
      var controlMeasures;
      var affectedStandardIds;
      var responsibleParticipantIds;
      var status = #Draft;
      createdBy;
      createdAt = Time.now();
    };
    store.add(id, plan);
    plan;
  };

  public func updateCriticalChangePlan(
    store : PlansStore,
    id : Text,
    name : ?Text,
    phaseIds : ?[Text],
    csiCodes : ?[Text],
    hazardAnalysis : ?Text,
    controlMeasures : ?Text,
    affectedStandardIds : ?[Text],
    responsibleParticipantIds : ?[Text]
  ) : ?Types.CriticalChangePlan {
    switch (store.get(id)) {
      case null { null };
      case (?plan) {
        switch (name)                      { case (?v) { plan.name                      := v }; case null {} };
        switch (phaseIds)                  { case (?v) { plan.phaseIds                  := v }; case null {} };
        switch (csiCodes)                  { case (?v) { plan.csiCodes                  := v }; case null {} };
        switch (hazardAnalysis)            { case (?v) { plan.hazardAnalysis            := v }; case null {} };
        switch (controlMeasures)           { case (?v) { plan.controlMeasures           := v }; case null {} };
        switch (affectedStandardIds)       { case (?v) { plan.affectedStandardIds       := v }; case null {} };
        switch (responsibleParticipantIds) { case (?v) { plan.responsibleParticipantIds := v }; case null {} };
        ?plan;
      };
    };
  };

  public func submitPlanForApproval(
    store : PlansStore,
    id : Text,
    submittedBy : Text
  ) : ?Types.CriticalChangePlan {
    ignore submittedBy;
    switch (store.get(id)) {
      case null { null };
      case (?plan) {
        plan.status := #PendingApproval;
        ?plan;
      };
    };
  };

  public func approveCriticalChangePlan(
    plansStore : PlansStore,
    approvalsStore : PlanApprovalsStore,
    safetyState : SafetyState,
    planId : Text,
    approvedBy : Text,
    role : Text,
    approved : Bool
  ) : Types.CriticalPlanApproval {
    let id = makeId("apr", safetyState);
    let approval : Types.CriticalPlanApproval = {
      id;
      planId;
      approvedBy;
      role;
      approvedAt = Time.now();
      approved;
    };
    approvalsStore.add(id, approval);
    // If all 3 approvals present and all approved, set plan status to #Approved
    if (isPlanFullyApproved(approvalsStore, planId)) {
      switch (plansStore.get(planId)) {
        case (?plan) { plan.status := #Approved };
        case null {};
      };
    };
    approval;
  };

  public func getCriticalChangePlansForPhase(
    store : PlansStore,
    phaseId : Text
  ) : [Types.CriticalChangePlan] {
    store.values().filter(func(p : Types.CriticalChangePlan) : Bool {
      p.phaseIds.vals().find(func(pid : Text) : Bool { pid == phaseId }) != null;
    }).toArray();
  };

  public func isPlanFullyApproved(
    approvalsStore : PlanApprovalsStore,
    planId : Text
  ) : Bool {
    let approvals = approvalsStore.values()
      .filter(func(a : Types.CriticalPlanApproval) : Bool { a.planId == planId and a.approved })
      .toArray();
    approvals.size() >= 3;
  };

  // ─── Public-facing shared-type converters ─────────────────────────────────

  public func standardToShared(s : Types.SafetyStandard) : Types.SafetyStandard {
    s;
  };

  public func complianceItemToShared(c : Types.ComplianceItem) : ComplianceItemShared {
    {
      id         = c.id;
      phaseId    = c.phaseId;
      standardId = c.standardId;
      status     = c.status;
      severity   = c.severity;
      notes      = c.notes;
      checkedBy  = c.checkedBy;
      checkedAt  = c.checkedAt;
    };
  };

  public type ComplianceItemShared = {
    id : Text;
    phaseId : Text;
    standardId : Text;
    status : Types.ComplianceStatus;
    severity : Types.ComplianceSeverity;
    notes : Text;
    checkedBy : Text;
    checkedAt : Int;
  };

  public func signOffToShared(s : Types.PhaseSignOff) : PhaseSignOffShared {
    {
      id       = s.id;
      phaseId  = s.phaseId;
      signedBy = s.signedBy;
      role     = s.role;
      signedAt = s.signedAt;
      approved = s.approved;
      comments = s.comments;
    };
  };

  public type PhaseSignOffShared = {
    id : Text;
    phaseId : Text;
    signedBy : Text;
    role : Text;
    signedAt : Int;
    approved : Bool;
    comments : Text;
  };

  public func certToShared(c : Types.NCCERCertification) : NCCERCertShared {
    {
      id            = c.id;
      participantId = c.participantId;
      trade         = c.trade;
      discipline    = c.discipline;
      level         = c.level;
      state         = c.state;
      certNumber    = c.certNumber;
      issuedAt      = c.issuedAt;
      expiresAt     = c.expiresAt;
      status        = c.status;
    };
  };

  public type NCCERCertShared = {
    id : Text;
    participantId : Text;
    trade : Text;
    discipline : Text;
    level : Text;
    state : Text;
    certNumber : Text;
    issuedAt : Int;
    expiresAt : Int;
    status : Types.NCCERCertStatus;
  };

  public func planToShared(p : Types.CriticalChangePlan) : CriticalChangePlanShared {
    {
      id                         = p.id;
      name                       = p.name;
      phaseIds                   = p.phaseIds;
      csiCodes                   = p.csiCodes;
      hazardAnalysis             = p.hazardAnalysis;
      controlMeasures            = p.controlMeasures;
      affectedStandardIds        = p.affectedStandardIds;
      responsibleParticipantIds  = p.responsibleParticipantIds;
      status                     = p.status;
      createdBy                  = p.createdBy;
      createdAt                  = p.createdAt;
    };
  };

  public type CriticalChangePlanShared = {
    id : Text;
    name : Text;
    phaseIds : [Text];
    csiCodes : [Text];
    hazardAnalysis : Text;
    controlMeasures : Text;
    affectedStandardIds : [Text];
    responsibleParticipantIds : [Text];
    status : Types.CriticalPlanStatus;
    createdBy : Text;
    createdAt : Int;
  };

};
