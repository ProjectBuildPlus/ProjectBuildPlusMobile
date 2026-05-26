import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/scenarios";
import CashTypes "../types/cash-requirement";
import CostCodeTypes "../types/cost-codes";
import Float "mo:core/Float";

module {
  public type Scenario = Types.Scenario;
  public type ScenarioSummary = Types.ScenarioSummary;
  public type CreateScenarioRequest = Types.CreateScenarioRequest;
  public type ScenarioCashProjection = Types.ScenarioCashProjection;
  public type ScenarioEVMSummary = Types.ScenarioEVMSummary;
  public type ScenarioBenchmarkVariance = Types.ScenarioBenchmarkVariance;
  public type PhaseOverride = Types.PhaseOverride;

  // RSMeans entry (light inline type — cross-domain reference)
  public type RSMeansEntry = {
    divisionId : Nat;
    divisionName : Text;
    unitCost : Float;
    participantId : ?Text;
  };

  public type ScenarioStore = Map.Map<Types.ScenarioId, Scenario>;

  // ── CRUD ──────────────────────────────────────────────────────────────────

  public func createScenario(
    store : ScenarioStore,
    req : CreateScenarioRequest,
  ) : { #ok : Scenario; #err : Text } {
    let ts = Time.now();
    let id = "SCN-" # ts.toText();
    let scenario : Scenario = {
      id;
      name = req.name;
      description = req.description;
      participantOverrides = req.participantOverrides;
      phaseOverrides = req.phaseOverrides;
      createdAt = ts;
      updatedAt = ts;
    };
    store.add(id, scenario);
    #ok(scenario);
  };

  public func updateScenario(
    store : ScenarioStore,
    id : Types.ScenarioId,
    req : CreateScenarioRequest,
  ) : { #ok : Scenario; #err : Text } {
    switch (store.get(id)) {
      case null { #err("Scenario not found: " # id) };
      case (?existing) {
        let updated : Scenario = {
          existing with
          name = req.name;
          description = req.description;
          participantOverrides = req.participantOverrides;
          phaseOverrides = req.phaseOverrides;
          updatedAt = Time.now();
        };
        store.add(id, updated);
        #ok(updated);
      };
    };
  };

  public func deleteScenario(
    store : ScenarioStore,
    id : Types.ScenarioId,
  ) : { #ok : (); #err : Text } {
    switch (store.get(id)) {
      case null { #err("Scenario not found: " # id) };
      case (?_) {
        store.remove(id);
        #ok(());
      };
    };
  };

  public func getScenario(
    store : ScenarioStore,
    id : Types.ScenarioId,
  ) : ?Scenario {
    store.get(id);
  };

  public func listScenarios(store : ScenarioStore) : [ScenarioSummary] {
    let buf = List.empty<ScenarioSummary>();
    for ((_, s) in store.entries()) {
      buf.add({ id = s.id; name = s.name; description = s.description; createdAt = s.createdAt });
    };
    buf.toArray();
  };

  // ── Cash Projection ───────────────────────────────────────────────────────

  // Apply phaseOverrides to a base Phase, returning an effective (shared) Phase.
  func applyPhaseOverride(
    phase : CashTypes.Phase,
    overrides : [PhaseOverride],
  ) : CashTypes.Phase {
    let phaseIdText = phase.id.toText();
    let override = overrides.find(func(o : PhaseOverride) : Bool { o.phaseId == phaseIdText });
    switch (override) {
      case null { phase };
      case (?o) {
        let effectiveCash = switch (o.laborCostOverride) {
          case (?lc) { lc };
          case null { phase.requiredCash };
        };
        {
          phase with
          crashFactor = o.crashFactor;
          resourceMultiplier = o.resourceMultiplier;
          requiredCash = effectiveCash;
        };
      };
    };
  };

  public func computeScenarioCashProjection(
    scenario : Scenario,
    basePhases : [CashTypes.Phase],
  ) : ScenarioCashProjection {
    let effective = basePhases.map(func(p) { applyPhaseOverride(p, scenario.phaseOverrides) });
    let sorted = effective.sort(func(a : CashTypes.Phase, b : CashTypes.Phase) : { #less; #equal; #greater } {
      if (a.phaseOrder < b.phaseOrder) { #less }
      else if (a.phaseOrder > b.phaseOrder) { #greater }
      else { #equal }
    });
    var cum : Float = 0.0;
    var total : Float = 0.0;
    let points = List.empty<(Nat, Float)>();
    for (p in sorted.values()) {
      let cost = p.requiredCash * p.resourceMultiplier;
      cum += cost;
      total += cost;
      points.add((p.phaseOrder, cum));
    };
    {
      scenarioId = scenario.id;
      scenarioName = scenario.name;
      cumulativePoints = points.toArray();
      totalCost = total;
    };
  };

  // ── EVM Summary ───────────────────────────────────────────────────────────

  public func computeScenarioEVM(
    scenario : Scenario,
    basePhases : [CashTypes.Phase],
    costCodes : [CostCodeTypes.CostCode],
  ) : ScenarioEVMSummary {
    var totalPV : Float = 0.0;
    var totalEV : Float = 0.0;
    var totalAC : Float = 0.0;

    for (phase in basePhases.values()) {
      let eff = applyPhaseOverride(phase, scenario.phaseOverrides);
      let pv = eff.requiredCash * eff.resourceMultiplier;
      let ac = costCodes
        .filter(func(c : CostCodeTypes.CostCode) : Bool { c.phaseId == phase.id })
        .foldLeft(0.0, func(acc : Float, c : CostCodeTypes.CostCode) : Float { acc + c.cost });
      let ev = if (ac > 0.0) { Float.min(pv, ac) } else { 0.0 };
      totalPV += pv;
      totalEV += ev;
      totalAC += ac;
    };

    let cv = totalEV - totalAC;
    let sv = totalEV - totalPV;
    let cpi = if (totalAC == 0.0) { 1.0 } else { totalEV / totalAC };
    let spi = if (totalPV == 0.0) { 1.0 } else { totalEV / totalPV };
    { scenarioId = scenario.id; plannedValue = totalPV; earnedValue = totalEV; actualCost = totalAC; cpi; spi; cv; sv };
  };

  // ── Benchmark Variances ───────────────────────────────────────────────────

  public func computeScenarioBenchmarkVariances(
    scenario : Scenario,
    rsMeansEntries : [RSMeansEntry],
  ) : [ScenarioBenchmarkVariance] {
    let activeParticipants = List.empty<Text>();
    for (po in scenario.participantOverrides.values()) {
      activeParticipants.add(po.participantId);
    };
    let activeArr = activeParticipants.toArray();

    let active = rsMeansEntries.filter(func(e : RSMeansEntry) : Bool {
      switch (e.participantId) {
        case null { true };
        case (?pid) { activeArr.find(func(p : Text) : Bool { p == pid }) != null };
      };
    });

    active.map<RSMeansEntry, ScenarioBenchmarkVariance>(func(e : RSMeansEntry) : ScenarioBenchmarkVariance {
      let actual = e.unitCost;
      let variance = actual - e.unitCost;
      let variancePct = if (e.unitCost == 0.0) { 0.0 } else { variance / e.unitCost * 100.0 };
      {
        scenarioId = scenario.id;
        divisionId = e.divisionId;
        divisionName = e.divisionName;
        rsMeansCost = e.unitCost;
        actualCost = actual;
        variance;
        variancePct;
      };
    });
  };
};
