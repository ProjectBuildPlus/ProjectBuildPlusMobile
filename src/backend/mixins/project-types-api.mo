import ProjectTypes "../types/project-types";
import CashTypes "../types/cash-requirement";
import ProjectLib "../lib/project-types";
import List "mo:core/List";
import CashLib "../lib/cash-requirement";

mixin (
  phases : List.List<CashLib.Phase>,
  state  : { var nextPhaseId : CashTypes.PhaseId },
) {

  /// Returns all 16 project categories with subtopics
  public query func getProjectCategories() : async [ProjectTypes.ProjectCategory] {
    ProjectLib.getCategories();
  };

  /// Returns a single subtopic by category id and subtopic id
  public query func getProjectSubtopic(
    categoryId : Text,
    subtopicId : Text,
  ) : async ?ProjectTypes.ProjectSubtopic {
    ProjectLib.getSubtopic(categoryId, subtopicId);
  };

  /// Applies a project template: clears existing phases and creates default phases
  /// for the chosen category/subtopic in canister state.
  public func applyProjectTemplate(
    categoryId : Text,
    subtopicId : Text,
  ) : async ProjectTypes.ApplyTemplateResult {
    switch (ProjectLib.getSubtopic(categoryId, subtopicId)) {
      case null {
        #err("Subtopic not found: " # categoryId # "/" # subtopicId);
      };
      case (?subtopic) {
        // Clear existing phases
        phases.retain(func(_p : CashLib.Phase) : Bool { false });
        state.nextPhaseId := 1;

        // Create one phase per DefaultPhase
        var count : Nat = 0;
        for (dp in subtopic.defaultPhases.values()) {
          let id = state.nextPhaseId;
          state.nextPhaseId += 1;
          let durationNs : CashTypes.TimeOffset = dp.durationDays * 86_400_000_000_000;
          let startOffset : CashTypes.TimeOffset = 0;
          let input : CashTypes.PhaseInput = {
            name             = dp.name;
            phaseOrder       = dp.order;
            startOffset      = startOffset;
            endOffset        = durationNs;
            requiredCash     = 0.0;
            scheduleOfValues = 0.0;
            crashFactor      = null;
            resourceMultiplier = null;
            costCodes        = null;
          };
          phases.add(CashLib.newPhase(id, input));
          count += 1;
        };
        #ok({ phasesCreated = count });
      };
    };
  };
};
