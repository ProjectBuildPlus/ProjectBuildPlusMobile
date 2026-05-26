import Types "../types/earned-value";
import CashTypes "../types/cash-requirement";
import CostCodeTypes "../types/cost-codes";
import List "mo:core/List";

module {
  public type BaselineType = Types.BaselineType;
  public type CostCodeCompletion = Types.CostCodeCompletion;
  public type CostCodeCompletionInternal = Types.CostCodeCompletionInternal;
  public type EVMPoint = Types.EVMPoint;
  public type ProjectEVMSummary = Types.ProjectEVMSummary;

  /// Compute weighted average completion across cost codes for a phase.
  /// Weighted by cost; phases with no cost codes default to 0.0.
  func computePhaseCompletion(
    completions : List.List<CostCodeCompletionInternal>,
    phaseId : Nat,
    phaseCodes : List.List<CostCodeTypes.CostCodeInternal>
  ) : Float {
    var totalCost : Float = 0.0;
    var weightedSum : Float = 0.0;
    for (c in phaseCodes.values()) {
      let pct : Float = switch (getCostCodeCompletion(completions, phaseId, c.id)) {
        case (?p) { p };
        case null { 0.0 };
      };
      weightedSum += c.cost * pct;
      totalCost += c.cost;
    };
    if (totalCost == 0.0) { 0.0 } else { weightedSum / totalCost };
  };

  /// Store or update the percent complete for a specific cost code within a phase.
  public func updateCostCodeCompletion(
    completions : List.List<CostCodeCompletionInternal>,
    phaseId : Nat,
    codeId : Nat,
    percentComplete : Float
  ) : () {
    switch (completions.find(func(c : CostCodeCompletionInternal) : Bool {
      c.phaseId == phaseId and c.codeId == codeId
    })) {
      case (?existing) {
        existing.percentComplete := percentComplete;
      };
      case null {
        completions.add({
          phaseId;
          codeId;
          var percentComplete;
        });
      };
    };
  };

  /// Retrieve the current percent complete for a specific cost code within a phase.
  public func getCostCodeCompletion(
    completions : List.List<CostCodeCompletionInternal>,
    phaseId : Nat,
    codeId : Nat
  ) : ?Float {
    switch (completions.find(func(c : CostCodeCompletionInternal) : Bool {
      c.phaseId == phaseId and c.codeId == codeId
    })) {
      case (?c) { ?c.percentComplete };
      case null { null };
    };
  };

  /// Compute EVM points for each phase against the given baseline.
  public func getEarnedValueMetrics(
    completions : List.List<CostCodeCompletionInternal>,
    phases : List.List<CashTypes.PhaseInternal>,
    codes : List.List<CostCodeTypes.CostCodeInternal>,
    baselineType : BaselineType
  ) : [EVMPoint] {
    let results = List.empty<EVMPoint>();
    for (phase in phases.values()) {
      // Collect cost codes for this phase
      let phaseCodes = codes.filter(func(c : CostCodeTypes.CostCodeInternal) : Bool {
        c.phaseId == phase.id
      });
      // Compute AC = sum of all cost code costs for this phase
      var ac : Float = 0.0;
      for (c in phaseCodes.values()) {
        ac += c.cost;
      };
      // Compute weighted average completion across cost codes
      let phaseCompletion = computePhaseCompletion(completions, phase.id, phaseCodes);
      // Compute PV based on baseline
      let pv : Float = switch (baselineType) {
        case (#original) { phase.requiredCash };
        case (#crashed) { phase.requiredCash * phase.resourceMultiplier };
      };
      let ev : Float = pv * phaseCompletion / 100.0;
      let cv : Float = ev - ac;
      let sv : Float = ev - pv;
      let cpi : Float = if (ac == 0.0) { 1.0 } else { ev / ac };
      let spi : Float = if (pv == 0.0) { 1.0 } else { ev / pv };
      let pi : Float = cpi * spi;
      let customPI : ?Float = if (phase.resourceMultiplier == 0.0) { null } else {
        ?((ev / (if (ac == 0.0) { 1.0 } else { ac })) / phase.resourceMultiplier)
      };
      results.add({
        phaseId = phase.id;
        phaseName = phase.name;
        phaseOrder = phase.phaseOrder;
        plannedValue = pv;
        earnedValue = ev;
        actualCost = ac;
        costVariance = cv;
        scheduleVariance = sv;
        cpi;
        spi;
        productivityIndex = pi;
        customProductivityIndex = customPI;
        baselineType;
      });
    };
    results.toArray();
  };

  /// Compute aggregate EVM summary across all phases for the given baseline.
  public func getProjectEVMSummary(
    completions : List.List<CostCodeCompletionInternal>,
    phases : List.List<CashTypes.PhaseInternal>,
    codes : List.List<CostCodeTypes.CostCodeInternal>,
    baselineType : BaselineType
  ) : ProjectEVMSummary {
    let points = getEarnedValueMetrics(completions, phases, codes, baselineType);
    var totalPV : Float = 0.0;
    var totalEV : Float = 0.0;
    var totalAC : Float = 0.0;
    for (pt in points.values()) {
      totalPV += pt.plannedValue;
      totalEV += pt.earnedValue;
      totalAC += pt.actualCost;
    };
    let totalCV : Float = totalEV - totalAC;
    let totalSV : Float = totalEV - totalPV;
    let projectCPI : Float = if (totalAC == 0.0) { 1.0 } else { totalEV / totalAC };
    let projectSPI : Float = if (totalPV == 0.0) { 1.0 } else { totalEV / totalPV };
    let projectPI : Float = projectCPI * projectSPI;
    { totalPV; totalEV; totalAC; totalCV; totalSV; projectCPI; projectSPI; projectPI };
  };
};
