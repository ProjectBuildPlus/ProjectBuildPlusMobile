module {
  // Phase data model for cash requirement curve
  public type PhaseId = Nat;
  public type TimeOffset = Int; // nanoseconds from project start

  // Forward-reference to cost-codes domain types
  public type CostCode = {
    id : Nat;
    phaseId : Nat;
    csiCode : Text;
    csiDivision : Text;
    projectNumber : Text;
    area : Text;
    operation : Text;
    distribution : Text;
    cost : Float;
  };

  public type CostCodeInput = {
    csiCode : Text;
    csiDivision : Text;
    projectNumber : Text;
    area : Text;
    operation : Text;
    distribution : Text;
    cost : Float;
  };

  // Immutable shared type for API boundary
  public type Phase = {
    id : PhaseId;
    name : Text;
    phaseOrder : Nat;
    startOffset : TimeOffset;
    endOffset : TimeOffset;
    requiredCash : Float;
    scheduleOfValues : Float;
    // Crashing and leveling factors
    crashFactor : Float;        // 0.0–2.0, default 1.0; higher = shorter duration
    resourceMultiplier : Float; // 0.5–3.0, default 1.0; higher = higher cost
    costCodes : [CostCode];     // CSI MasterFormat cost codes for this phase
  };

  // Mutable internal type
  public type PhaseInternal = {
    id : PhaseId;
    var name : Text;
    var phaseOrder : Nat;
    var startOffset : TimeOffset;
    var endOffset : TimeOffset;
    var requiredCash : Float;
    var scheduleOfValues : Float;
    // Crashing and leveling factors
    var crashFactor : Float;        // 0.0–2.0, default 1.0
    var resourceMultiplier : Float; // 0.5–3.0, default 1.0
    // costCodes are stored in the global codes list; resolved at query time
  };

  // Cumulative data point for S-curve rendering
  public type CumulativePoint = {
    phaseOrder : Nat;
    phaseName : Text;
    endOffset : TimeOffset;
    cumulativeCash : Float;
    cumulativeSOV : Float;
    crashedCash : Float; // adjusted cash after resourceMultiplier applied
  };

  // S-curve point extended with per-CSI-code cumulative breakdown
  public type CostCodeBreakdown = {
    csiCode : Text;
    csiDivision : Text;
    cumulativeCost : Float;
  };

  public type CumulativePointWithCodes = {
    phaseOrder : Nat;
    phaseName : Text;
    endOffset : TimeOffset;
    cumulativeCash : Float;
    cumulativeSOV : Float;
    crashedCash : Float;
    breakdown : [CostCodeBreakdown];
  };

  // Input type for setting phase data
  public type PhaseInput = {
    name : Text;
    phaseOrder : Nat;
    startOffset : TimeOffset;
    endOffset : TimeOffset;
    requiredCash : Float;
    scheduleOfValues : Float;
    // Optional crashing/leveling overrides; absent = default 1.0
    crashFactor : ?Float;
    resourceMultiplier : ?Float;
    // Optional cost codes to attach when creating/updating a phase
    costCodes : ?[CostCodeInput];
  };
};
