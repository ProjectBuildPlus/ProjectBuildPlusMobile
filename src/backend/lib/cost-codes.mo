import List "mo:core/List";
import Types "../types/cost-codes";

module {
  public type CostCode = Types.CostCodeInternal;
  public type CostCodeInput = Types.CostCodeInput;

  // Convert internal mutable type to shared immutable API type
  public func toPublic(self : CostCode) : Types.CostCode {
    {
      id = self.id;
      phaseId = self.phaseId;
      csiCode = self.csiCode;
      csiDivision = self.csiDivision;
      projectNumber = self.projectNumber;
      area = self.area;
      operation = self.operation;
      distribution = self.distribution;
      cost = self.cost;
    };
  };

  // Create a new CostCode from input, assigning id and phaseId
  public func newCostCode(id : Types.CostCodeId, phaseId : Nat, input : CostCodeInput) : CostCode {
    {
      id;
      phaseId;
      var csiCode = input.csiCode;
      var csiDivision = input.csiDivision;
      var projectNumber = input.projectNumber;
      var area = input.area;
      var operation = input.operation;
      var distribution = input.distribution;
      var cost = input.cost;
    };
  };

  // Upsert: add new code with next id if not matching; replace if same id provided
  // Returns the created or updated CostCode
  public func upsertCostCode(
    codes : List.List<CostCode>,
    nextId : { var val : Nat },
    phaseId : Nat,
    input : CostCodeInput
  ) : Types.CostCode {
    // Always append a new code — each call creates a new entry with a unique id
    let id = nextId.val;
    nextId.val += 1;
    let code = newCostCode(id, phaseId, input);
    codes.add(code);
    toPublic(code);
  };

  // Remove a cost code by id; no-op if not found
  public func removeCostCode(codes : List.List<CostCode>, id : Types.CostCodeId) : () {
    codes.retain(func(c : CostCode) : Bool { c.id != id });
  };

  // Return all cost codes for a given phase as shared types
  public func getCodesForPhase(codes : List.List<CostCode>, phaseId : Nat) : [Types.CostCode] {
    codes.toArray()
      .filter(func(c : CostCode) : Bool { c.phaseId == phaseId })
      .map<CostCode, Types.CostCode>(func(c) { toPublic(c) });
  };

  // Compute total cost for a given phase
  public func totalCostForPhase(codes : List.List<CostCode>, phaseId : Nat) : Float {
    codes.toArray()
      .filter(func(c : CostCode) : Bool { c.phaseId == phaseId })
      .foldLeft(0.0, func(acc : Float, c : CostCode) : Float { acc + c.cost });
  };

  // Produce a per-csiCode cumulative breakdown across all phases (sorted by first appearance)
  public func buildBreakdown(codes : List.List<CostCode>) : [Types.CostCodeBreakdown] {
    // Group by (csiCode, csiDivision) and sum costs
    // Use a List to accumulate unique groups
    let groups = List.empty<{ csiCode : Text; csiDivision : Text; var total : Float }>();
    for (c in codes.values()) {
      let existing = groups.find(
        func(g : { csiCode : Text; csiDivision : Text; var total : Float }) : Bool {
          g.csiCode == c.csiCode and g.csiDivision == c.csiDivision
        }
      );
      switch (existing) {
        case (?g) { g.total += c.cost };
        case null {
          groups.add({ csiCode = c.csiCode; csiDivision = c.csiDivision; var total = c.cost });
        };
      };
    };
    groups.toArray().map<{ csiCode : Text; csiDivision : Text; var total : Float }, Types.CostCodeBreakdown>(
      func(g) {
        { csiCode = g.csiCode; csiDivision = g.csiDivision; cumulativeCost = g.total };
      }
    );
  };
};
