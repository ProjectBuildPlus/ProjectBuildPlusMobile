import List "mo:core/List";

module {
  // Inline old actor state shape (empty — first migration)
  type OldActor = {};

  // Internal mutable phase type — inlined for migration self-containment
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
  };

  type NewActor = {
    phases : List.List<PhaseInternal>;
    state : { var nextPhaseId : Nat };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      phases = List.empty<PhaseInternal>();
      state = { var nextPhaseId = 1 };
    };
  };
};
