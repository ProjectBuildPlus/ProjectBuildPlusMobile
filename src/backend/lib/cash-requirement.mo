import List "mo:core/List";
import Types "../types/cash-requirement";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Float "mo:core/Float";
import CCTypes "../types/cost-codes";

module {
  public type Phase = Types.PhaseInternal;
  public type CostCodeInternal = CCTypes.CostCodeInternal;
  public type PhaseInput = Types.PhaseInput;

  // Create a new phase from input
  // Create a new phase from input; defaults crashFactor=1.0, resourceMultiplier=1.0 if not provided
  public func newPhase(id : Types.PhaseId, input : PhaseInput) : Phase {
    {
      id;
      var name = input.name;
      var phaseOrder = input.phaseOrder;
      var startOffset = input.startOffset;
      var endOffset = input.endOffset;
      var requiredCash = input.requiredCash;
      var scheduleOfValues = input.scheduleOfValues;
      var crashFactor = switch (input.crashFactor) {
        case (?f) { if (f < 0.1) 0.1 else f };
        case null { 1.0 };
      };
      var resourceMultiplier = switch (input.resourceMultiplier) {
        case (?m) { m };
        case null { 1.0 };
      };
    };
  };

  // Convert internal mutable phase to shared immutable API type
  // Convert internal mutable phase to shared immutable API type
  public func toPublic(self : Phase) : Types.Phase {
    {
      id = self.id;
      name = self.name;
      phaseOrder = self.phaseOrder;
      startOffset = self.startOffset;
      endOffset = self.endOffset;
      requiredCash = self.requiredCash;
      scheduleOfValues = self.scheduleOfValues;
      crashFactor = self.crashFactor;
      resourceMultiplier = self.resourceMultiplier;
      costCodes = [];
    };
  };

  // Convert internal phase to shared type, populating costCodes from the codes store
  public func toPublicWithCodes(self : Phase, codes : List.List<CostCodeInternal>) : Types.Phase {
    let phaseCodes = codes.toArray()
      .filter(func(c : CostCodeInternal) : Bool { c.phaseId == self.id })
      .map(func(c) {
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
      });
    {
      id = self.id;
      name = self.name;
      phaseOrder = self.phaseOrder;
      startOffset = self.startOffset;
      endOffset = self.endOffset;
      requiredCash = self.requiredCash;
      scheduleOfValues = self.scheduleOfValues;
      crashFactor = self.crashFactor;
      resourceMultiplier = self.resourceMultiplier;
      costCodes = phaseCodes;
    };
  };

  // Get all phases sorted by phaseOrder
  public func getSortedPhases(phases : List.List<Phase>) : [Types.Phase] {
    let arr = phases.toArray().map(func(p) { toPublic(p) });
    arr.sort(func(a : Types.Phase, b : Types.Phase) : Order.Order {
      Nat.compare(a.phaseOrder, b.phaseOrder)
    });
  };

  // Get all phases sorted by phaseOrder, enriched with cost codes from the store
  public func getSortedPhasesWithCodes(phases : List.List<Phase>, codes : List.List<CostCodeInternal>) : [Types.Phase] {
    let arr = phases.toArray().map(func(p) { toPublicWithCodes(p, codes) });
    arr.sort(func(a : Types.Phase, b : Types.Phase) : Order.Order {
      Nat.compare(a.phaseOrder, b.phaseOrder)
    });
  };

  // Compute cumulative cash requirement points ordered by phaseOrder
  // Compute cumulative cash requirement points ordered by phaseOrder.
  // Applies crashFactor to time offsets and resourceMultiplier to requiredCash.
  public func computeCumulativePoints(phases : List.List<Phase>) : [Types.CumulativePoint] {
    computeCumulativePointsWithCodes(phases, List.empty<CostCodeInternal>());
  };

  // Compute cumulative points with cost code totals overriding requiredCash when present.
  public func computeCumulativePointsWithCodes(
    phases : List.List<Phase>,
    codes : List.List<CostCodeInternal>
  ) : [Types.CumulativePoint] {
    let sorted = phases.toArray().map(toPublic);
    let sorted2 = sorted.sort(func(a : Types.Phase, b : Types.Phase) : Order.Order {
      Nat.compare(a.phaseOrder, b.phaseOrder)
    });
    var cumCash : Float = 0.0;
    var cumSOV : Float = 0.0;
    var cumCrashed : Float = 0.0;
    sorted2.map<Types.Phase, Types.CumulativePoint>(
      func(p) {
        // Use cost code total when codes exist for this phase, else fall back to requiredCash
        let codeTotal = codes.toArray()
          .filter(func(c : CostCodeInternal) : Bool { c.phaseId == p.id })
          .foldLeft(0.0, func(acc : Float, c : CostCodeInternal) : Float { acc + c.cost });
        let effectiveCash = if (codeTotal > 0.0) codeTotal else p.requiredCash;
        cumCash += effectiveCash;
        cumSOV += p.scheduleOfValues;
        let effectiveCrashed = effectiveCash * p.resourceMultiplier;
        cumCrashed += effectiveCrashed;
        let clampedCrash = if (p.crashFactor < 0.1) 0.1 else p.crashFactor;
        let baseDuration : Int = p.endOffset - p.startOffset;
        let effectiveDuration : Int = if (clampedCrash == 1.0) baseDuration
          else (baseDuration.toFloat() / clampedCrash).toInt();
        let crashedEndOffset : Types.TimeOffset = p.startOffset + effectiveDuration;
        {
          phaseOrder = p.phaseOrder;
          phaseName = p.name;
          endOffset = crashedEndOffset;
          cumulativeCash = cumCash;
          cumulativeSOV = cumSOV;
          crashedCash = cumCrashed;
        };
      }
    );
  };

  // Upsert a phase: update existing by id or add new
  public func upsertPhase(phases : List.List<Phase>, id : Types.PhaseId, input : PhaseInput) : () {
    let existing = phases.find(func(p : Phase) : Bool { p.id == id });
    switch (existing) {
      case (?p) {
        p.name := input.name;
        p.phaseOrder := input.phaseOrder;
        p.startOffset := input.startOffset;
        p.endOffset := input.endOffset;
        p.requiredCash := input.requiredCash;
        p.scheduleOfValues := input.scheduleOfValues;
        p.crashFactor := switch (input.crashFactor) {
          case (?f) { if (f < 0.1) 0.1 else f };
          case null { p.crashFactor };
        };
        p.resourceMultiplier := switch (input.resourceMultiplier) {
          case (?m) { m };
          case null { p.resourceMultiplier };
        };
      };
      case null {
        phases.add(newPhase(id, input));
      };
    };
  };

  // Remove a phase by id
  public func removePhase(phases : List.List<Phase>, id : Types.PhaseId) : () {
    phases.retain(func(p : Phase) : Bool { p.id != id });
  };
};
