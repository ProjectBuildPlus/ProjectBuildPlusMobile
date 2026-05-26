import Debug "mo:core/Debug";

module {
  // CSI MasterFormat cost code identifier
  public type CostCodeId = Nat;

  // Shared immutable type for API boundary
  public type CostCode = {
    id : CostCodeId;
    phaseId : Nat; // links to Phase.id
    csiCode : Text;        // e.g. "03 30 00"
    csiDivision : Text;    // e.g. "Division 03 – Concrete"
    projectNumber : Text;
    area : Text;
    operation : Text;
    distribution : Text;
    cost : Float;
  };

  // Mutable internal representation
  public type CostCodeInternal = {
    id : CostCodeId;
    phaseId : Nat;
    var csiCode : Text;
    var csiDivision : Text;
    var projectNumber : Text;
    var area : Text;
    var operation : Text;
    var distribution : Text;
    var cost : Float;
  };

  // Input type — id and phaseId assigned by backend
  public type CostCodeInput = {
    csiCode : Text;
    csiDivision : Text;
    projectNumber : Text;
    area : Text;
    operation : Text;
    distribution : Text;
    cost : Float;
  };

  // Extends CumulativePoint with a per-cost-code breakdown
  public type CostCodeBreakdown = {
    csiCode : Text;
    csiDivision : Text;
    cumulativeCost : Float;
  };
};
