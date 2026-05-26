import List "mo:core/List";

module {
  // OldActor = NewActor of 20260522_000000_InitCashRequirement.mo
  type PhaseId = Nat;
  type TimeOffset = Int;

  type OldPhaseInternal = {
    id : PhaseId;
    var name : Text;
    var phaseOrder : Nat;
    var startOffset : TimeOffset;
    var endOffset : TimeOffset;
    var requiredCash : Float;
    var scheduleOfValues : Float;
  };

  type OldActor = {
    phases : List.List<OldPhaseInternal>;
    state : { var nextPhaseId : Nat };
  };

  // NewActor adds crashFactor and resourceMultiplier to each phase
  type NewPhaseInternal = {
    id : PhaseId;
    var name : Text;
    var phaseOrder : Nat;
    var startOffset : TimeOffset;
    var endOffset : TimeOffset;
    var requiredCash : Float;
    var scheduleOfValues : Float;
    var crashFactor : Float;        // 0.0–2.0, default 1.0
    var resourceMultiplier : Float; // 0.5–3.0, default 1.0
  };

  type NewActor = {
    phases : List.List<NewPhaseInternal>;
    state : { var nextPhaseId : Nat };
  };

  public func migration(old : OldActor) : NewActor {
    let newPhases = old.phases.map<OldPhaseInternal, NewPhaseInternal>(func(p) {
      {
        id = p.id;
        var name = p.name;
        var phaseOrder = p.phaseOrder;
        var startOffset = p.startOffset;
        var endOffset = p.endOffset;
        var requiredCash = p.requiredCash;
        var scheduleOfValues = p.scheduleOfValues;
        var crashFactor = 1.0;
        var resourceMultiplier = 1.0;
      };
    });
    {
      phases = newPhases;
      state = old.state;
    };
  };
};
