import ParticipantTypes "../types/participants";
import ParticipantLib "../lib/participants";
import EmailClient "mo:caffeineai-email/emailClient";

mixin (
  participantStore : ParticipantLib.ParticipantStore,
  assignmentStore : ParticipantLib.AssignmentStore,
) {

  public type Participant = ParticipantTypes.Participant;
  public type ParticipantAssignment = ParticipantTypes.ParticipantAssignment;

  public shared func createParticipant(participant : Participant) : async Participant {
    ParticipantLib.createParticipant(participantStore, participant);
  };

  public shared func updateParticipant(updated : Participant) : async ?Participant {
    ParticipantLib.updateParticipant(participantStore, updated);
  };

  public shared func deleteParticipant(id : Text) : async Bool {
    ParticipantLib.deleteParticipant(participantStore, id);
  };

  public query func getParticipants() : async [Participant] {
    ParticipantLib.getParticipants(participantStore);
  };

  public query func getParticipant(id : Text) : async ?Participant {
    ParticipantLib.getParticipant(participantStore, id);
  };

  public shared func approveParticipant(id : Text) : async ?Participant {
    switch (ParticipantLib.approveParticipant(participantStore, id)) {
      case null { null };
      case (?p) {
        let content = ParticipantLib.passcodeEmailContent(p);
        ignore await EmailClient.sendServiceEmail(
          "noreply",
          [p.email],
          content.subject,
          content.body,
        );
        ParticipantLib.markPasscodeEmailSent(participantStore, id);
      };
    };
  };

  public shared func rejectParticipant(id : Text) : async ?Participant {
    ParticipantLib.rejectParticipant(participantStore, id);
  };

  public shared func resendPasscode(id : Text) : async Bool {
    switch (ParticipantLib.getParticipant(participantStore, id)) {
      case null { false };
      case (?p) {
        let content = ParticipantLib.passcodeEmailContent(p);
        ignore await EmailClient.sendServiceEmail(
          "noreply",
          [p.email],
          content.subject,
          content.body,
        );
        ignore ParticipantLib.markPasscodeEmailSent(participantStore, id);
        true;
      };
    };
  };

  public shared func assignParticipantToPhaseCode(assignment : ParticipantAssignment) : async ParticipantAssignment {
    ParticipantLib.assignParticipantToPhaseCode(assignmentStore, assignment);
  };

  public shared func removeParticipantAssignment(
    participantId : Text,
    phaseId : Text,
    costCodeId : Text,
  ) : async Bool {
    ParticipantLib.removeParticipantAssignment(assignmentStore, participantId, phaseId, costCodeId);
  };

  public query func getParticipantAssignments(participantId : Text) : async [ParticipantAssignment] {
    ParticipantLib.getParticipantAssignments(assignmentStore, participantId);
  };

  public shared func updateRSMeansEntry(
    participantId : Text,
    phaseId : Text,
    costCodeId : Text,
    updated : ParticipantAssignment,
  ) : async ?ParticipantAssignment {
    ParticipantLib.updateRSMeansEntry(assignmentStore, participantId, phaseId, costCodeId, updated);
  };

};
