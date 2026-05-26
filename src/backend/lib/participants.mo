import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Types "../types/participants";

module {

  public type Participant = Types.Participant;
  public type ParticipantAssignment = Types.ParticipantAssignment;
  public type ParticipantRole = Types.ParticipantRole;

  // Stable stores
  public type ParticipantStore = Map.Map<Text, Participant>;
  public type AssignmentStore = Map.Map<Text, ParticipantAssignment>;

  // Assignment key: participantId # "|" # phaseId # "|" # costCodeId
  func assignmentKey(participantId : Text, phaseId : Text, costCodeId : Text) : Text {
    participantId # "|" # phaseId # "|" # costCodeId;
  };

  func rolePrefix(role : ParticipantRole) : Text {
    switch role {
      case (#Architect) { "ARCH" };
      case (#Designer) { "DES" };
      case (#CivilEngineer) { "CIVE" };
      case (#MechanicalEngineer) { "MECE" };
      case (#SpecialtyEngineer) { "SPCE" };
      case (#Owner) { "OWN" };
      case (#ConstructionManager) { "CM" };
      case (#Contractor) { "CONT" };
      case (#EHSRepresentative) { "EHS" };
      case (#SafetyEngineer) { "SAFE" };
      case (#SafetyInspector) { "SINS" };
    };
  };

  // Simple 8-char alphanumeric passcode derived from timestamp + id hash
  func generatePasscode(seed : Text) : Text {
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let charsLen = 32;
    var result = "";
    var hash = 0;
    for (c in seed.chars()) {
      hash := (hash * 31 + Text.fromChar(c).size()) % 1_000_000_007;
    };
    var i = 0;
    while (i < 8) {
      let idx = (hash + i * 7919) % charsLen;
      let arr = chars.chars();
      var j = 0;
      var ch = 'A';
      for (c in arr) {
        if (j == idx) { ch := c };
        j += 1;
      };
      result := result # Text.fromChar(ch);
      i += 1;
    };
    result;
  };

  public func createParticipant(
    participants : ParticipantStore,
    participant : Participant,
  ) : Participant {
    let ts = Time.now();
    let id = rolePrefix(participant.role) # "-" # ts.toText();
    let passcode = generatePasscode(id # participant.email);
    let p : Participant = {
      participant with
      id;
      status = #Pending;
      passcode = ?passcode;
      passcodeEmailSent = false;
      createdAt = ts;
    };
    participants.add(id, p);
    p;
  };

  public func updateParticipant(
    participants : ParticipantStore,
    updated : Participant,
  ) : ?Participant {
    switch (participants.get(updated.id)) {
      case null { null };
      case (?existing) {
        let p : Participant = {
          updated with
          status = existing.status;
          passcode = existing.passcode;
          passcodeEmailSent = existing.passcodeEmailSent;
          createdAt = existing.createdAt;
        };
        participants.add(updated.id, p);
        ?p;
      };
    };
  };

  public func deleteParticipant(
    participants : ParticipantStore,
    id : Text,
  ) : Bool {
    if (participants.get(id) == null) {
      false;
    } else {
      participants.remove(id);
      true;
    };
  };

  public func getParticipants(
    participants : ParticipantStore,
  ) : [Participant] {
    let buf = List.empty<Participant>();
    for ((_, p) in participants.entries()) {
      buf.add(p);
    };
    buf.toArray();
  };

  public func getParticipant(
    participants : ParticipantStore,
    id : Text,
  ) : ?Participant {
    participants.get(id);
  };

  // Approves participant, sets status #Approved, returns updated participant
  public func approveParticipant(
    participants : ParticipantStore,
    id : Text,
  ) : ?Participant {
    switch (participants.get(id)) {
      case null { null };
      case (?p) {
        let approved : Participant = { p with status = #Approved };
        participants.add(id, approved);
        ?approved;
      };
    };
  };

  // Build passcode email content for a participant (used by mixin for async send)
  public func passcodeEmailContent(p : Participant) : { subject : Text; body : Text } {
    let code = switch (p.passcode) {
      case null { "N/A" };
      case (?c) { c };
    };
    {
      subject = "Your Project Build Plus Access Passcode";
      body = "<h2>Welcome to Project Build Plus</h2>" #
        "<p>Hello " # p.fullName # ",</p>" #
        "<p>Your access has been approved. Use the following passcode to log in:</p>" #
        "<h3 style=\"letter-spacing:4px;\">" # code # "</h3>" #
        "<p>Keep this passcode confidential.</p>";
    };
  };

  // Marks passcodeEmailSent = true (call after async email send in mixin)
  public func markPasscodeEmailSent(
    participants : ParticipantStore,
    id : Text,
  ) : ?Participant {
    switch (participants.get(id)) {
      case null { null };
      case (?p) {
        let updated : Participant = { p with passcodeEmailSent = true };
        participants.add(id, updated);
        ?updated;
      };
    };
  };

  public func rejectParticipant(
    participants : ParticipantStore,
    id : Text,
  ) : ?Participant {
    switch (participants.get(id)) {
      case null { null };
      case (?p) {
        let updated : Participant = { p with status = #Rejected };
        participants.add(id, updated);
        ?updated;
      };
    };
  };

  public func assignParticipantToPhaseCode(
    assignments : AssignmentStore,
    assignment : ParticipantAssignment,
  ) : ParticipantAssignment {
    let key = assignmentKey(assignment.participantId, assignment.phaseId, assignment.costCodeId);
    assignments.add(key, assignment);
    assignment;
  };

  public func removeParticipantAssignment(
    assignments : AssignmentStore,
    participantId : Text,
    phaseId : Text,
    costCodeId : Text,
  ) : Bool {
    let key = assignmentKey(participantId, phaseId, costCodeId);
    if (assignments.get(key) == null) {
      false;
    } else {
      assignments.remove(key);
      true;
    };
  };

  public func getParticipantAssignments(
    assignments : AssignmentStore,
    participantId : Text,
  ) : [ParticipantAssignment] {
    let buf = List.empty<ParticipantAssignment>();
    for ((_, a) in assignments.entries()) {
      if (a.participantId == participantId) {
        buf.add(a);
      };
    };
    buf.toArray();
  };

  public func updateRSMeansEntry(
    assignments : AssignmentStore,
    participantId : Text,
    phaseId : Text,
    costCodeId : Text,
    updated : ParticipantAssignment,
  ) : ?ParticipantAssignment {
    let key = assignmentKey(participantId, phaseId, costCodeId);
    switch (assignments.get(key)) {
      case null { null };
      case (?existing) {
        let variance : ?Float = switch (updated.actualCost, updated.rsMeansUnitCost) {
          case (?actual, ?unitCost) { ?(actual - unitCost) };
          case _ { existing.variance };
        };
        let a : ParticipantAssignment = { updated with variance };
        assignments.add(key, a);
        ?a;
      };
    };
  };

};
