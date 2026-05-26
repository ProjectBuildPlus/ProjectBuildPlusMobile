module {
  public type DefaultPhase = {
    name : Text;
    durationDays : Nat;
    order : Nat;
    csiDivisions : [Nat];
  };

  public type ProjectSubtopic = {
    id : Text;
    name : Text;
    defaultPhases : [DefaultPhase];
    defaultCostCodeDivisions : [Nat];
  };

  public type ProjectCategory = {
    id : Text;
    name : Text;
    subtopics : [ProjectSubtopic];
  };

  public type ProjectTemplate = {
    categoryId : Text;
    subtopicId : Text;
  };

  public type ApplyTemplateResult = {
    #ok : { phasesCreated : Nat };
    #err : Text;
  };
};
