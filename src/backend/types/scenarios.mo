module {
  public type ScenarioId = Text;

  // Override for a single participant within a scenario
  public type ParticipantOverride = {
    participantId : Text;
    newRole : ?Text;
    phaseAssignments : [Text];
    costCodeAssignments : [Text];
  };

  // Override for a single phase within a scenario
  public type PhaseOverride = {
    phaseId : Text;
    crashFactor : Float;
    resourceMultiplier : Float;
    laborCostOverride : ?Float;
  };

  // Full scenario record (internal storage — all fields immutable at rest)
  public type Scenario = {
    id : ScenarioId;
    name : Text;
    description : Text;
    participantOverrides : [ParticipantOverride];
    phaseOverrides : [PhaseOverride];
    createdAt : Int;
    updatedAt : Int;
  };

  // Lightweight summary for list views
  public type ScenarioSummary = {
    id : ScenarioId;
    name : Text;
    description : Text;
    createdAt : Int;
  };

  // Input type for create/update
  public type CreateScenarioRequest = {
    name : Text;
    description : Text;
    participantOverrides : [ParticipantOverride];
    phaseOverrides : [PhaseOverride];
  };

  // Cash projection result for a single scenario
  public type ScenarioCashProjection = {
    scenarioId : ScenarioId;
    scenarioName : Text;
    cumulativePoints : [(Nat, Float)]; // (phaseOrder, cumulativeCash)
    totalCost : Float;
  };

  // EVM summary for a single scenario
  public type ScenarioEVMSummary = {
    scenarioId : ScenarioId;
    plannedValue : Float;
    earnedValue : Float;
    actualCost : Float;
    cpi : Float;
    spi : Float;
    cv : Float;
    sv : Float;
  };

  // RSMeans benchmark variance per CSI division for a scenario
  public type ScenarioBenchmarkVariance = {
    scenarioId : ScenarioId;
    divisionId : Nat;
    divisionName : Text;
    rsMeansCost : Float;
    actualCost : Float;
    variance : Float;
    variancePct : Float;
  };
};
