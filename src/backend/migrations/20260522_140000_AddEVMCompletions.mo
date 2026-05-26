import List "mo:core/List";

module {
  // OldActor = NewActor of 20260522_130000_AddCostCodes.mo
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

  type CostCodeId = Nat;

  type CostCodeInternal = {
    id : CostCodeId;
    phaseId : Nat;
    var csiCode : Text;
    var csiDivision : Text;
    var projectNumber : Text;
    var area : Text;
    var operation : Text;
    var distribution : Text;
    var cost : Float;
  };

  type OldActor = {
    phases : List.List<PhaseInternal>;
    state : { var nextPhaseId : Nat };
    codes : List.List<CostCodeInternal>;
    codeState : { var nextCostCodeId : Nat };
  };

  // New: adds completions list for EVM per-cost-code percent complete tracking
  type CostCodeCompletionInternal = {
    phaseId : Nat;
    codeId : Nat;
    var percentComplete : Float;
  };

  type NewActor = {
    phases : List.List<PhaseInternal>;
    state : { var nextPhaseId : Nat };
    codes : List.List<CostCodeInternal>;
    codeState : { var nextCostCodeId : Nat };
    completions : List.List<CostCodeCompletionInternal>;
  };

  public func migration(old : OldActor) : NewActor {
    {
      phases = old.phases;
      state = old.state;
      codes = old.codes;
      codeState = old.codeState;
      completions = List.empty<CostCodeCompletionInternal>();
    };
  };
};
