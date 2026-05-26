import List "mo:core/List";
import Types "../types/earned-value";
import CashTypes "../types/cash-requirement";
import CostCodeTypes "../types/cost-codes";
import EVMLib "../lib/earned-value";

mixin (
  completions : List.List<EVMLib.CostCodeCompletionInternal>,
  phases : List.List<CashTypes.PhaseInternal>,
  codes : List.List<CostCodeTypes.CostCodeInternal>
) {
  /// Update the percent complete (0.0–100.0) for a specific cost code within a phase.
  public func updateCostCodeCompletion(
    phaseId : Nat,
    codeId : Nat,
    percentComplete : Float
  ) : async () {
    EVMLib.updateCostCodeCompletion(completions, phaseId, codeId, percentComplete);
  };

  /// Query the current percent complete for a specific cost code within a phase.
  public query func getCostCodeCompletion(
    phaseId : Nat,
    codeId : Nat
  ) : async ?Float {
    EVMLib.getCostCodeCompletion(completions, phaseId, codeId);
  };

  /// Query EVM metrics per phase against the chosen baseline (original or crashed).
  public query func getEarnedValueMetrics(
    baselineType : Types.BaselineType
  ) : async [Types.EVMPoint] {
    EVMLib.getEarnedValueMetrics(completions, phases, codes, baselineType);
  };

  /// Query the project-wide EVM summary against the chosen baseline.
  public query func getProjectEVMSummary(
    baselineType : Types.BaselineType
  ) : async Types.ProjectEVMSummary {
    EVMLib.getProjectEVMSummary(completions, phases, codes, baselineType);
  };
};
