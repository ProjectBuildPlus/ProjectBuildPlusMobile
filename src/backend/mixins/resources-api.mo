import Map "mo:core/Map";
import ResourceTypes "../types/resources";
import ResourceLib "../lib/resources";

mixin (
  resourceStore : ResourceLib.ResourceStore,
  allocationStore : ResourceLib.AllocationStore,
  idleTimeStore : ResourceLib.IdleTimeStore,
) {

  public type Resource = ResourceTypes.Resource;
  public type PhaseAllocation = ResourceTypes.PhaseAllocation;
  public type IdleTimeSetting = ResourceTypes.IdleTimeSetting;
  public type ResourceSummary = ResourceTypes.ResourceSummary;
  public type CriticalPathNode = ResourceTypes.CriticalPathNode;
  public type ResourceInput = ResourceTypes.ResourceInput;
  public type PhaseAllocationInput = ResourceTypes.PhaseAllocationInput;
  public type ResourceType = ResourceTypes.ResourceType;
  public type IdleTimeMode = ResourceTypes.IdleTimeMode;
  public type CPMPhaseInput = ResourceLib.CPMPhaseInput;

  // ── Resources ─────────────────────────────────────────────────────────────

  public query func getResources() : async [Resource] {
    ResourceLib.getResources(resourceStore);
  };

  public query func getResourcesByType(resourceType : ResourceType) : async [Resource] {
    ResourceLib.getResourcesByType(resourceStore, resourceType);
  };

  public shared func upsertResource(input : ResourceInput) : async Resource {
    ResourceLib.upsertResource(resourceStore, idleTimeStore, input);
  };

  public shared func deleteResource(id : Text) : async Bool {
    ResourceLib.deleteResource(resourceStore, id);
  };

  // ── Phase Allocations ─────────────────────────────────────────────────────

  public query func getPhaseAllocations() : async [PhaseAllocation] {
    ResourceLib.getPhaseAllocations(allocationStore);
  };

  public query func getPhaseAllocationsByPhase(phaseId : Text) : async [PhaseAllocation] {
    ResourceLib.getPhaseAllocationsByPhase(allocationStore, phaseId);
  };

  public query func getPhaseAllocationsByResource(resourceId : Text) : async [PhaseAllocation] {
    ResourceLib.getPhaseAllocationsByResource(allocationStore, resourceId);
  };

  public shared func upsertPhaseAllocation(input : PhaseAllocationInput) : async PhaseAllocation {
    ResourceLib.upsertPhaseAllocation(allocationStore, input);
  };

  public shared func deletePhaseAllocation(id : Text) : async Bool {
    ResourceLib.deletePhaseAllocation(allocationStore, id);
  };

  // ── Idle Time Setting ─────────────────────────────────────────────────────

  public query func getIdleTimeSetting() : async ?IdleTimeSetting {
    ResourceLib.getIdleTimeSetting(idleTimeStore);
  };

  public shared func setIdleTimeSetting(mode : IdleTimeMode) : async IdleTimeSetting {
    ResourceLib.setIdleTimeSetting(idleTimeStore, mode);
  };

  // ── Critical Path ─────────────────────────────────────────────────────────

  public query func computeCriticalPath(
    phases : [CPMPhaseInput]
  ) : async [CriticalPathNode] {
    ResourceLib.computeCriticalPath(phases);
  };

  // ── Resource Summaries ────────────────────────────────────────────────────

  public query func computeResourceSummaries(
    originalBaselineMultiplier : Float,
    crashedBaselineMultiplier : Float,
  ) : async [ResourceSummary] {
    ResourceLib.computeResourceSummaries(
      resourceStore,
      allocationStore,
      originalBaselineMultiplier,
      crashedBaselineMultiplier,
    );
  };

};
