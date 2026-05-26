import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Types "../types/cost-codes";
import CRTypes "../types/cash-requirement";
import CashLib "../lib/cash-requirement";
import CostLib "../lib/cost-codes";
import Nat "mo:core/Nat";
import Order "mo:core/Order";

// Mixin: public API for cost-code management.
// Injected state:
//   codes     — global list of all CostCodeInternal records (all phases)
//   codeState — { var nextCostCodeId : Nat } mutable counter
//   phases    — phases list from cash-requirement domain (for getCumulativeWithBreakdown)
mixin (
  codes : List.List<CostLib.CostCode>,
  codeState : { var nextCostCodeId : Nat },
  phases : List.List<CashLib.Phase>
) {

  // Append a new cost code for a given phase.
  // Returns the persisted CostCode (with assigned id).
  public func upsertCostCode(
    phaseId : Nat,
    input : Types.CostCodeInput
  ) : async { #ok : Types.CostCode; #err : Text } {
    // Validate phaseId exists
    switch (phases.find(func(p : CashLib.Phase) : Bool { p.id == phaseId })) {
      case null { #err("Phase not found: " # phaseId.toText()) };
      case (?_) {
        let nextId = { var val = codeState.nextCostCodeId };
        let code = CostLib.upsertCostCode(codes, nextId, phaseId, input);
        codeState.nextCostCodeId := nextId.val;
        #ok(code);
      };
    };
  };

  // Delete a cost code by id within a phase.
  public func deleteCostCode(
    phaseId : Nat,
    codeId : Nat
  ) : async { #ok : (); #err : Text } {
    switch (phases.find(func(p : CashLib.Phase) : Bool { p.id == phaseId })) {
      case null { #err("Phase not found: " # phaseId.toText()) };
      case (?_) {
        CostLib.removeCostCode(codes, codeId);
        #ok(());
      };
    };
  };

  // Query all cost codes attached to a given phase.
  public query func getCostCodesForPhase(
    phaseId : Nat
  ) : async { #ok : [Types.CostCode]; #err : Text } {
    switch (phases.find(func(p : CashLib.Phase) : Bool { p.id == phaseId })) {
      case null { #err("Phase not found: " # phaseId.toText()) };
      case (?_) { #ok(CostLib.getCodesForPhase(codes, phaseId)) };
    };
  };

  // Query cumulative S-curve points enriched with per-CSI-code breakdowns.
  // Uses injected phases and codes to compute enriched CumulativePointWithCodes.
  public query func getCumulativeWithBreakdown() : async [CRTypes.CumulativePointWithCodes] {
    let points = CashLib.computeCumulativePoints(phases);
    points.map<CRTypes.CumulativePoint, CRTypes.CumulativePointWithCodes>(
      func(pt) {
        // Find the phase matching this point by phaseOrder to get its id
        let phaseOpt = phases.find(func(p : CashLib.Phase) : Bool { p.phaseOrder == pt.phaseOrder });
        let breakdown = switch (phaseOpt) {
          case (?p) {
            // Filter codes for this phase and build breakdown
            let phaseCodes = List.empty<CostLib.CostCode>();
            for (c in codes.values()) {
              if (c.phaseId == p.id) { phaseCodes.add(c) };
            };
            CostLib.buildBreakdown(phaseCodes);
          };
          case null { [] };
        };
        {
          phaseOrder = pt.phaseOrder;
          phaseName = pt.phaseName;
          endOffset = pt.endOffset;
          cumulativeCash = pt.cumulativeCash;
          cumulativeSOV = pt.cumulativeSOV;
          crashedCash = pt.crashedCash;
          breakdown;
        };
      }
    );
  };
};
