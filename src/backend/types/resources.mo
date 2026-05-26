module {

  // Discriminates whether a resource is a labor or equipment resource
  public type ResourceType = {
    #labor;
    #equipment;
  };

  // Whether allocation is tracked per individual or per crew
  public type TrackingLevel = {
    #individual; // e.g. "Carpenter #1 — 40 hours"
    #crew;       // e.g. "Carpenter crew — 5 people × 40 hours"
  };

  // Controls how idle time is computed when a resource finishes a phase
  public type IdleTimeMode = {
    #releaseAtPhaseEnd;    // resource is freed at phase end; moves to next phase
    #holdThroughProject;  // resource is held until explicitly reassigned
  };

  // A single labor or equipment resource
  public type Resource = {
    id : Text;
    name : Text;                 // e.g. "Carpenter #1" or "Carpenter crew"
    resourceType : ResourceType;
    trackingLevel : TrackingLevel;
    crewSize : ?Nat;             // null for #individual; head count for #crew
    csiCode : ?Text;             // optional link to a CSI cost code id
    hourlyRate : Float;          // pulled from RSMeans or manual override
    hourlyRateSource : Text;     // "RSMeans" | "Manual" | "CostCode"
    idleTimeMode : IdleTimeMode;
  };

  // Mutable internal representation for stored resources
  public type ResourceInternal = {
    id : Text;
    var name : Text;
    var resourceType : ResourceType;
    var trackingLevel : TrackingLevel;
    var crewSize : ?Nat;
    var csiCode : ?Text;
    var hourlyRate : Float;
    var hourlyRateSource : Text;
    var idleTimeMode : IdleTimeMode;
  };

  // Allocation of a resource to a specific project phase
  public type PhaseAllocation = {
    id : Text;
    resourceId : Text;
    phaseId : Text;
    allocatedHours : Float;    // scheduled hours for this resource in this phase
    availableHours : Float;    // total available hours within the phase window
    actualHours : ?Float;      // actual hours used, if entered
    laborCostSource : Text;    // "rsm" | "manual" | "costcode"
    manualLaborCost : ?Float;
  };

  // Mutable internal representation for stored phase allocations
  public type PhaseAllocationInternal = {
    id : Text;
    resourceId : Text;
    phaseId : Text;
    var allocatedHours : Float;
    var availableHours : Float;
    var actualHours : ?Float;
    var laborCostSource : Text;
    var manualLaborCost : ?Float;
  };

  // A node in the critical path network — one per phase
  public type CriticalPathNode = {
    phaseId : Text;
    phaseName : Text;
    earlyStart : Float;   // earliest possible start (days from project start)
    earlyFinish : Float;  // earliest possible finish
    lateStart : Float;    // latest allowable start without delaying project
    lateFinish : Float;   // latest allowable finish
    totalSlack : Float;   // lateFinish - earlyFinish (0 = on critical path)
    isCritical : Bool;    // true when totalSlack == 0
  };

  // Computed roll-up view of a resource's usage across the whole project
  public type ResourceSummary = {
    resourceId : Text;
    resourceName : Text;
    trackingLevel : TrackingLevel;
    totalAllocatedHours : Float;
    totalAvailableHours : Float;
    totalIdleHours : Float;
    idleHoursOriginalBaseline : Float;  // idle vs. original (un-crashed) schedule
    idleHoursCrashedBaseline : Float;   // idle vs. crashed / leveled schedule
    totalLaborCost : Float;
  };

  // Singleton project-level idle time setting (keyed by "default")
  public type IdleTimeSetting = {
    projectId : Text;           // use "default" as the singleton key
    defaultIdleMode : IdleTimeMode;
  };

  // Mutable internal idle time setting
  public type IdleTimeSettingInternal = {
    projectId : Text;
    var defaultIdleMode : IdleTimeMode;
  };

  // Input type for creating or updating a resource
  public type ResourceInput = {
    name : Text;
    resourceType : ResourceType;
    trackingLevel : TrackingLevel;
    crewSize : ?Nat;
    csiCode : ?Text;
    hourlyRate : Float;
    hourlyRateSource : Text;
    idleTimeMode : ?IdleTimeMode; // absent = use project default
  };

  // Input type for creating or updating a phase allocation
  public type PhaseAllocationInput = {
    resourceId : Text;
    phaseId : Text;
    allocatedHours : Float;
    availableHours : Float;
    actualHours : ?Float;
    laborCostSource : Text;
    manualLaborCost : ?Float;
  };

};
