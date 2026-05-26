import Map "mo:core/Map";
import List "mo:core/List";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/resources";
import Array "mo:core/Array";

module {

  public type Resource = Types.Resource;
  public type ResourceInternal = Types.ResourceInternal;
  public type PhaseAllocation = Types.PhaseAllocation;
  public type PhaseAllocationInternal = Types.PhaseAllocationInternal;
  public type IdleTimeSetting = Types.IdleTimeSetting;
  public type IdleTimeSettingInternal = Types.IdleTimeSettingInternal;
  public type ResourceSummary = Types.ResourceSummary;
  public type CriticalPathNode = Types.CriticalPathNode;
  public type ResourceInput = Types.ResourceInput;
  public type PhaseAllocationInput = Types.PhaseAllocationInput;
  public type ResourceType = Types.ResourceType;
  public type IdleTimeMode = Types.IdleTimeMode;

  // Store type aliases
  public type ResourceStore = Map.Map<Text, ResourceInternal>;
  public type AllocationStore = Map.Map<Text, PhaseAllocationInternal>;
  public type IdleTimeStore = Map.Map<Text, IdleTimeSettingInternal>;

  // Singleton key for idle time setting
  let IDLE_KEY = "default";

  // ── ID generation ─────────────────────────────────────────────────────────

  func makeId(prefix : Text) : Text {
    prefix # "-" # Time.now().toText();
  };

  // ── Conversion helpers ────────────────────────────────────────────────────

  public func resourceToPublic(r : ResourceInternal) : Resource {
    {
      id = r.id;
      name = r.name;
      resourceType = r.resourceType;
      trackingLevel = r.trackingLevel;
      crewSize = r.crewSize;
      csiCode = r.csiCode;
      hourlyRate = r.hourlyRate;
      hourlyRateSource = r.hourlyRateSource;
      idleTimeMode = r.idleTimeMode;
    };
  };

  public func allocationToPublic(a : PhaseAllocationInternal) : PhaseAllocation {
    {
      id = a.id;
      resourceId = a.resourceId;
      phaseId = a.phaseId;
      allocatedHours = a.allocatedHours;
      availableHours = a.availableHours;
      actualHours = a.actualHours;
      laborCostSource = a.laborCostSource;
      manualLaborCost = a.manualLaborCost;
    };
  };

  public func idleSettingToPublic(s : IdleTimeSettingInternal) : IdleTimeSetting {
    {
      projectId = s.projectId;
      defaultIdleMode = s.defaultIdleMode;
    };
  };

  // ── Resources ─────────────────────────────────────────────────────────────

  public func getResources(store : ResourceStore) : [Resource] {
    let buf = List.empty<Resource>();
    for ((_, r) in store.entries()) {
      buf.add(resourceToPublic(r));
    };
    buf.toArray();
  };

  public func getResourcesByType(store : ResourceStore, resourceType : ResourceType) : [Resource] {
    let buf = List.empty<Resource>();
    for ((_, r) in store.entries()) {
      if (r.resourceType == resourceType) {
        buf.add(resourceToPublic(r));
      };
    };
    buf.toArray();
  };

  public func upsertResource(
    store : ResourceStore,
    idleStore : IdleTimeStore,
    input : ResourceInput,
  ) : Resource {
    // Determine effective idle mode: use input's or fall back to project default
    let effectiveIdleMode : Types.IdleTimeMode = switch (input.idleTimeMode) {
      case (?m) { m };
      case null {
        switch (idleStore.get(IDLE_KEY)) {
          case (?s) { s.defaultIdleMode };
          case null { #releaseAtPhaseEnd };
        };
      };
    };
    // Check for existing resource with matching name+type to upsert
    var foundId : ?Text = null;
    for ((id, r) in store.entries()) {
      if (r.name == input.name and r.resourceType == input.resourceType) {
        foundId := ?id;
      };
    };
    switch (foundId) {
      case (?id) {
        switch (store.get(id)) {
          case (?r) {
            r.name := input.name;
            r.resourceType := input.resourceType;
            r.trackingLevel := input.trackingLevel;
            r.crewSize := input.crewSize;
            r.csiCode := input.csiCode;
            r.hourlyRate := input.hourlyRate;
            r.hourlyRateSource := input.hourlyRateSource;
            r.idleTimeMode := effectiveIdleMode;
            resourceToPublic(r);
          };
          case null {
            // Shouldn't happen, but create fresh
            createResourceEntry(store, input, effectiveIdleMode);
          };
        };
      };
      case null {
        createResourceEntry(store, input, effectiveIdleMode);
      };
    };
  };

  func createResourceEntry(
    store : ResourceStore,
    input : ResourceInput,
    idleMode : Types.IdleTimeMode,
  ) : Resource {
    let id = makeId("RES");
    let r : ResourceInternal = {
      id;
      var name = input.name;
      var resourceType = input.resourceType;
      var trackingLevel = input.trackingLevel;
      var crewSize = input.crewSize;
      var csiCode = input.csiCode;
      var hourlyRate = input.hourlyRate;
      var hourlyRateSource = input.hourlyRateSource;
      var idleTimeMode = idleMode;
    };
    store.add(id, r);
    resourceToPublic(r);
  };

  public func upsertResourceById(
    store : ResourceStore,
    idleStore : IdleTimeStore,
    id : Text,
    input : ResourceInput,
  ) : Resource {
    let effectiveIdleMode : Types.IdleTimeMode = switch (input.idleTimeMode) {
      case (?m) { m };
      case null {
        switch (idleStore.get(IDLE_KEY)) {
          case (?s) { s.defaultIdleMode };
          case null { #releaseAtPhaseEnd };
        };
      };
    };
    switch (store.get(id)) {
      case (?r) {
        r.name := input.name;
        r.resourceType := input.resourceType;
        r.trackingLevel := input.trackingLevel;
        r.crewSize := input.crewSize;
        r.csiCode := input.csiCode;
        r.hourlyRate := input.hourlyRate;
        r.hourlyRateSource := input.hourlyRateSource;
        r.idleTimeMode := effectiveIdleMode;
        resourceToPublic(r);
      };
      case null {
        let r : ResourceInternal = {
          id;
          var name = input.name;
          var resourceType = input.resourceType;
          var trackingLevel = input.trackingLevel;
          var crewSize = input.crewSize;
          var csiCode = input.csiCode;
          var hourlyRate = input.hourlyRate;
          var hourlyRateSource = input.hourlyRateSource;
          var idleTimeMode = effectiveIdleMode;
        };
        store.add(id, r);
        resourceToPublic(r);
      };
    };
  };

  public func deleteResource(store : ResourceStore, id : Text) : Bool {
    switch (store.get(id)) {
      case null { false };
      case _ {
        store.remove(id);
        true;
      };
    };
  };

  // ── Phase Allocations ─────────────────────────────────────────────────────

  public func getPhaseAllocations(store : AllocationStore) : [PhaseAllocation] {
    let buf = List.empty<PhaseAllocation>();
    for ((_, a) in store.entries()) {
      buf.add(allocationToPublic(a));
    };
    buf.toArray();
  };

  public func getPhaseAllocationsByPhase(store : AllocationStore, phaseId : Text) : [PhaseAllocation] {
    let buf = List.empty<PhaseAllocation>();
    for ((_, a) in store.entries()) {
      if (a.phaseId == phaseId) {
        buf.add(allocationToPublic(a));
      };
    };
    buf.toArray();
  };

  public func getPhaseAllocationsByResource(store : AllocationStore, resourceId : Text) : [PhaseAllocation] {
    let buf = List.empty<PhaseAllocation>();
    for ((_, a) in store.entries()) {
      if (a.resourceId == resourceId) {
        buf.add(allocationToPublic(a));
      };
    };
    buf.toArray();
  };

  // Allocation key: resourceId # "|" # phaseId
  func allocationKey(resourceId : Text, phaseId : Text) : Text {
    resourceId # "|" # phaseId;
  };

  public func upsertPhaseAllocation(
    store : AllocationStore,
    input : PhaseAllocationInput,
  ) : PhaseAllocation {
    let key = allocationKey(input.resourceId, input.phaseId);
    switch (store.get(key)) {
      case (?a) {
        a.allocatedHours := input.allocatedHours;
        a.availableHours := input.availableHours;
        a.actualHours := input.actualHours;
        a.laborCostSource := input.laborCostSource;
        a.manualLaborCost := input.manualLaborCost;
        allocationToPublic(a);
      };
      case null {
        let id = makeId("ALLOC");
        let a : PhaseAllocationInternal = {
          id;
          resourceId = input.resourceId;
          phaseId = input.phaseId;
          var allocatedHours = input.allocatedHours;
          var availableHours = input.availableHours;
          var actualHours = input.actualHours;
          var laborCostSource = input.laborCostSource;
          var manualLaborCost = input.manualLaborCost;
        };
        store.add(key, a);
        allocationToPublic(a);
      };
    };
  };

  public func deletePhaseAllocation(store : AllocationStore, id : Text) : Bool {
    // Support deletion by either composite key or internal id
    var found = false;
    var keyToRemove : ?Text = null;
    for ((key, a) in store.entries()) {
      if (a.id == id or key == id) {
        keyToRemove := ?key;
        found := true;
      };
    };
    switch (keyToRemove) {
      case (?k) { store.remove(k) };
      case null {};
    };
    found;
  };

  // ── Idle Time Setting ─────────────────────────────────────────────────────

  public func getIdleTimeSetting(store : IdleTimeStore) : ?IdleTimeSetting {
    switch (store.get(IDLE_KEY)) {
      case (?s) { ?idleSettingToPublic(s) };
      case null { null };
    };
  };

  public func setIdleTimeSetting(store : IdleTimeStore, mode : IdleTimeMode) : IdleTimeSetting {
    switch (store.get(IDLE_KEY)) {
      case (?s) {
        s.defaultIdleMode := mode;
        idleSettingToPublic(s);
      };
      case null {
        let s : IdleTimeSettingInternal = {
          projectId = IDLE_KEY;
          var defaultIdleMode = mode;
        };
        store.add(IDLE_KEY, s);
        idleSettingToPublic(s);
      };
    };
  };

  // ── Critical Path (CPM) ───────────────────────────────────────────────────
  //
  // Input phases carry their own startOffset/endOffset as duration anchors.
  // Dependencies are expressed as [phaseId] lists (predecessors).
  // Forward pass: earlyStart = max(earlyFinish of all predecessors), or phase.startOffset for roots.
  // Backward pass: lateFinish = min(lateStart of all successors), or project end for sinks.
  // Slack = lateFinish - earlyFinish.  Critical = slack == 0.

  public type CPMPhaseInput = {
    id : Text;
    name : Text;
    startOffset : Float;
    endOffset : Float;
    dependencies : [Text];
  };

  public func computeCriticalPath(phases : [CPMPhaseInput]) : [CriticalPathNode] {
    let n = phases.size();
    if (n == 0) { return [] };

    // Build index: phaseId -> array index
    let idxMap = Map.empty<Text, Nat>();
    var i = 0;
    while (i < n) {
      idxMap.add(phases[i].id, i);
      i += 1;
    };

    // Duration per phase
    let durations = Array.tabulate(n, func (k) {
      let p = phases[k];
      let d = p.endOffset - p.startOffset;
      if (d < 0.0) 0.0 else d;
    });

    // Forward pass: earlyStart[i], earlyFinish[i]
    let earlyStart  = Array.repeat(0.0, n).toVarArray();
    let earlyFinish = Array.repeat(0.0, n).toVarArray();

    // Process in provided order (assume topological; if cycles exist we use provided order)
    i := 0;
    while (i < n) {
      let p = phases[i];
      var es : Float = p.startOffset;  // root default = own startOffset
      for (depId in p.dependencies.values()) {
        switch (idxMap.get(depId)) {
          case (?di) {
            if (earlyFinish[di] > es) { es := earlyFinish[di] };
          };
          case null {};
        };
      };
      earlyStart[i]  := es;
      earlyFinish[i] := es + durations[i];
      i += 1;
    };

    // Project end = max earlyFinish
    var projectEnd : Float = 0.0;
    i := 0;
    while (i < n) {
      if (earlyFinish[i] > projectEnd) { projectEnd := earlyFinish[i] };
      i += 1;
    };

    // Backward pass: lateFinish[i], lateStart[i]
    let lateFinish = Array.repeat(projectEnd, n).toVarArray();
    let lateStart  = Array.repeat(projectEnd, n).toVarArray();

    // Process in reverse order
    var j : Int = n - 1;
    while (j >= 0) {
      let k = j.toNat();
      lateStart[k] := lateFinish[k] - durations[k];
      // propagate to predecessors
      for (depId in phases[k].dependencies.values()) {
        switch (idxMap.get(depId)) {
          case (?di) {
            if (lateStart[k] < lateFinish[di]) {
              lateFinish[di] := lateStart[k];
            };
          };
          case null {};
        };
      };
      j -= 1;
    };
    // Recompute lateStart after propagation
    i := 0;
    while (i < n) {
      lateStart[i] := lateFinish[i] - durations[i];
      i += 1;
    };

    // Build result
    Array.tabulate<CriticalPathNode>(n, func (k) {
      let slack = lateFinish[k] - earlyFinish[k];
      let absSlack = if (slack < 0.0) (-slack) else slack;
      {
        phaseId     = phases[k].id;
        phaseName   = phases[k].name;
        earlyStart  = earlyStart[k];
        earlyFinish = earlyFinish[k];
        lateStart   = lateStart[k];
        lateFinish  = lateFinish[k];
        totalSlack  = slack;
        isCritical  = absSlack < 0.001;  // float equality tolerance
      };
    });
  };

  // ── Resource Summary ──────────────────────────────────────────────────────
  //
  // For each resource:
  //   allocatedHours = sum of all PhaseAllocation.allocatedHours
  //   availableHours = sum of all PhaseAllocation.availableHours
  //   idleHours      = availableHours - allocatedHours
  //   idleHoursOriginalBaseline = availableHours - (allocatedHours * originalBaselineMultiplier)
  //   idleHoursCrashedBaseline  = availableHours - (allocatedHours * crashedBaselineMultiplier)
  //   totalLaborCost:
  //     - if any allocation's laborCostSource == "manual" and manualLaborCost is set, sum those;
  //       otherwise allocatedHours * hourlyRate * crewSize (if crew)

  public func computeResourceSummaries(
    resourceStore : ResourceStore,
    allocationStore : AllocationStore,
    originalBaselineMultiplier : Float,
    crashedBaselineMultiplier : Float,
  ) : [ResourceSummary] {
    let buf = List.empty<ResourceSummary>();
    for ((_, r) in resourceStore.entries()) {
      var totalAllocated : Float = 0.0;
      var totalAvailable : Float = 0.0;
      var totalLaborCost : Float = 0.0;
      for ((_, a) in allocationStore.entries()) {
        if (a.resourceId == r.id) {
          totalAllocated += a.allocatedHours;
          totalAvailable += a.availableHours;
          let cost = switch (a.laborCostSource, a.manualLaborCost) {
            case ("manual", ?mc) { mc };
            case _ {
              let base = a.allocatedHours * r.hourlyRate;
              switch (r.trackingLevel, r.crewSize) {
                case (#crew, ?cs) { base * cs.toFloat() };
                case _ { base };
              };
            };
          };
          totalLaborCost += cost;
        };
      };
      let idleHours = totalAvailable - totalAllocated;
      let idleOriginal = totalAvailable - (totalAllocated * originalBaselineMultiplier);
      let idleCrashed  = totalAvailable - (totalAllocated * crashedBaselineMultiplier);
      buf.add({
        resourceId = r.id;
        resourceName = r.name;
        trackingLevel = r.trackingLevel;
        totalAllocatedHours = totalAllocated;
        totalAvailableHours = totalAvailable;
        totalIdleHours = idleHours;
        idleHoursOriginalBaseline = idleOriginal;
        idleHoursCrashedBaseline  = idleCrashed;
        totalLaborCost = totalLaborCost;
      });
    };
    buf.toArray();
  };

};
