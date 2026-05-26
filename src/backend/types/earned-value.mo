import Debug "mo:core/Debug";

module {
  // Baseline variant: original planned schedule or crashed schedule
  public type BaselineType = {
    #original;
    #crashed;
  };

  // Per-cost-code completion entry within a phase
  public type CostCodeCompletion = {
    phaseId : Nat;
    codeId : Nat;
    percentComplete : Float; // 0.0 – 100.0
  };

  // Mutable internal representation for storage
  public type CostCodeCompletionInternal = {
    phaseId : Nat;
    codeId : Nat;
    var percentComplete : Float;
  };

  // Earned Value Metrics for a single phase
  public type EVMPoint = {
    phaseId : Nat;
    phaseName : Text;
    phaseOrder : Nat;
    plannedValue : Float;
    earnedValue : Float;
    actualCost : Float;
    costVariance : Float;           // EV - AC
    scheduleVariance : Float;       // EV - PV
    cpi : Float;                    // EV / AC
    spi : Float;                    // EV / PV
    productivityIndex : Float;      // CPI x SPI (standard)
    customProductivityIndex : ?Float; // cost per resource unit per phase (optional)
    baselineType : BaselineType;
  };

  // Project-wide EVM summary
  public type ProjectEVMSummary = {
    totalPV : Float;
    totalEV : Float;
    totalAC : Float;
    totalCV : Float;   // totalEV - totalAC
    totalSV : Float;   // totalEV - totalPV
    projectCPI : Float; // totalEV / totalAC
    projectSPI : Float; // totalEV / totalPV
    projectPI : Float;  // projectCPI x projectSPI
  };
};
