import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/scenarios";
import CashTypes "../types/cash-requirement";
import CostCodeTypes "../types/cost-codes";
import ScenariosLib "../lib/scenarios";

mixin (
  scenarios : Map.Map<Types.ScenarioId, ScenariosLib.Scenario>,
  phases : List.List<{ id : Nat; var name : Text; var phaseOrder : Nat; var startOffset : Int; var endOffset : Int; var requiredCash : Float; var scheduleOfValues : Float; var crashFactor : Float; var resourceMultiplier : Float }>,
  codes : List.List<{ id : Nat; phaseId : Nat; var csiCode : Text; var csiDivision : Text; var projectNumber : Text; var area : Text; var operation : Text; var distribution : Text; var cost : Float }>
) {

  // ── Helper: convert internal PhaseInternal → shared Phase ─────────────────
  func phaseToPublic(
    p : { id : Nat; var name : Text; var phaseOrder : Nat; var startOffset : Int; var endOffset : Int; var requiredCash : Float; var scheduleOfValues : Float; var crashFactor : Float; var resourceMultiplier : Float }
  ) : CashTypes.Phase {
    {
      id = p.id;
      name = p.name;
      phaseOrder = p.phaseOrder;
      startOffset = p.startOffset;
      endOffset = p.endOffset;
      requiredCash = p.requiredCash;
      scheduleOfValues = p.scheduleOfValues;
      crashFactor = p.crashFactor;
      resourceMultiplier = p.resourceMultiplier;
      costCodes = [];
    };
  };

  func codeToPublic(
    c : { id : Nat; phaseId : Nat; var csiCode : Text; var csiDivision : Text; var projectNumber : Text; var area : Text; var operation : Text; var distribution : Text; var cost : Float }
  ) : CostCodeTypes.CostCode {
    {
      id = c.id;
      phaseId = c.phaseId;
      csiCode = c.csiCode;
      csiDivision = c.csiDivision;
      projectNumber = c.projectNumber;
      area = c.area;
      operation = c.operation;
      distribution = c.distribution;
      cost = c.cost;
    };
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  public func createScenario(
    req : Types.CreateScenarioRequest
  ) : async { #ok : Types.Scenario; #err : Text } {
    ScenariosLib.createScenario(scenarios, req);
  };

  public func updateScenario(
    id : Text,
    req : Types.CreateScenarioRequest
  ) : async { #ok : Types.Scenario; #err : Text } {
    ScenariosLib.updateScenario(scenarios, id, req);
  };

  public func deleteScenario(id : Text) : async { #ok : (); #err : Text } {
    ScenariosLib.deleteScenario(scenarios, id);
  };

  public query func getScenario(id : Text) : async ?Types.Scenario {
    ScenariosLib.getScenario(scenarios, id);
  };

  public query func listScenarios() : async [Types.ScenarioSummary] {
    ScenariosLib.listScenarios(scenarios);
  };

  // ── Projections ───────────────────────────────────────────────────────────

  public query func getScenarioCashProjection(id : Text) : async ?Types.ScenarioCashProjection {
    switch (ScenariosLib.getScenario(scenarios, id)) {
      case null { null };
      case (?sc) {
        let basePhases = phases.toArray().map(phaseToPublic);
        ?ScenariosLib.computeScenarioCashProjection(sc, basePhases);
      };
    };
  };

  public query func getScenarioEVMSummary(id : Text) : async ?Types.ScenarioEVMSummary {
    switch (ScenariosLib.getScenario(scenarios, id)) {
      case null { null };
      case (?sc) {
        let basePhases = phases.toArray().map(phaseToPublic);
        let baseCodes = codes.toArray().map(codeToPublic);
        ?ScenariosLib.computeScenarioEVM(sc, basePhases, baseCodes);
      };
    };
  };

  public query func getScenarioBenchmarkVariances(id : Text) : async [Types.ScenarioBenchmarkVariance] {
    switch (ScenariosLib.getScenario(scenarios, id)) {
      case null { [] };
      case (?sc) {
        // No live RSMeans entries accessible here; return empty — frontend populates via settings
        ScenariosLib.computeScenarioBenchmarkVariances(sc, []);
      };
    };
  };

  public query func compareScenarios(ids : [Text]) : async [Types.ScenarioCashProjection] {
    let basePhases = phases.toArray().map(phaseToPublic);
    let buf = List.empty<Types.ScenarioCashProjection>();
    for (id in ids.values()) {
      switch (ScenariosLib.getScenario(scenarios, id)) {
        case null {};
        case (?sc) {
          buf.add(ScenariosLib.computeScenarioCashProjection(sc, basePhases));
        };
      };
    };
    buf.toArray();
  };
};
