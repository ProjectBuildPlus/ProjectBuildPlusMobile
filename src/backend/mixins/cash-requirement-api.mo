import List "mo:core/List";
import Types "../types/cash-requirement";
import CashLib "../lib/cash-requirement";
import Runtime "mo:core/Runtime";

mixin (phases : List.List<CashLib.Phase>, state : { var nextPhaseId : Types.PhaseId }) {

  /// Set (upsert) all cash requirement phases — replaces existing data for each phaseOrder
  public func setPhases(inputs : [Types.PhaseInput]) : async () {
    // Clear existing phases, then add all new ones
    phases.retain(func(_p : CashLib.Phase) : Bool { false });
    state.nextPhaseId := 1;
    for (input in inputs.values()) {
      let id = state.nextPhaseId;
      state.nextPhaseId += 1;
      phases.add(CashLib.newPhase(id, input));
    };
  };

  /// Upsert a single phase by id (0 = new)
  public func upsertPhase(phaseId : Nat, input : Types.PhaseInput) : async Types.Phase {
    if (phaseId == 0) {
      // New phase
      let id = state.nextPhaseId;
      state.nextPhaseId += 1;
      let p = CashLib.newPhase(id, input);
      phases.add(p);
      p.toPublic();
    } else {
      CashLib.upsertPhase(phases, phaseId, input);
      switch (phases.find(func(p : CashLib.Phase) : Bool { p.id == phaseId })) {
        case (?p) { p.toPublic() };
        case null { Runtime.trap("Phase not found after upsert") };
      };
    };
  };

  /// Remove a phase by id
  public func deletePhase(phaseId : Nat) : async Bool {
    var found = false;
    switch (phases.find(func(p : CashLib.Phase) : Bool { p.id == phaseId })) {
      case (?_) { found := true; CashLib.removePhase(phases, phaseId) };
      case null {};
    };
    found;
  };

  /// Retrieve all phases sorted by phaseOrder
  public query func getPhases() : async [Types.Phase] {
    CashLib.getSortedPhases(phases);
  };

  /// Retrieve cumulative cash requirement data points for S-curve rendering
  public query func getCumulativeCashRequirement() : async [Types.CumulativePoint] {
    CashLib.computeCumulativePoints(phases);
  };

  /// Retrieve cumulative S-curve points with crashing/leveling applied
  public query func getCumulativeCrashedRequirement() : async [Types.CumulativePoint] {
    // Return points where cumulativeCash reflects crashed/leveled values (resourceMultiplier applied)
    // We reuse computeCumulativePoints which places crashed cumulative in crashedCash,
    // then remap so cumulativeCash = crashedCash for this view
    let points = CashLib.computeCumulativePoints(phases);
    points.map<Types.CumulativePoint, Types.CumulativePoint>(
      func(pt) {
        { pt with cumulativeCash = pt.crashedCash };
      }
    );
  };
};
