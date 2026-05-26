import Map "mo:core/Map";
import List "mo:core/List";

module {
  // OldActor = NewActor of 20260523_120000_AddShareLinksAndFilter.mo

  type PhaseId = Nat;
  type TimeOffset = Int;

  type PhaseInternal = {
    id : PhaseId;
    var name : Text;
    var phaseOrder : Nat;
    var startOffset : TimeOffset;
    var endOffset : TimeOffset;
    var requiredCash : Float;
    var scheduleOfValues : Float;
    var crashFactor : Float;
    var resourceMultiplier : Float;
  };

  type CostCodeId = Nat;

  type CostCodeInternal = {
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

  type CostCodeCompletionInternal = {
    phaseId : Nat;
    codeId : Nat;
    var percentComplete : Float;
  };

  type ParticipantRole = {
    #Architect;
    #Designer;
    #CivilEngineer;
    #MechanicalEngineer;
    #SpecialtyEngineer;
    #Owner;
    #ConstructionManager;
    #Contractor;
  };

  type ParticipantStatus = {
    #Pending;
    #Approved;
    #Rejected;
  };

  type Participant = {
    id : Text;
    role : ParticipantRole;
    fullName : Text;
    residentialAddress : Text;
    officePhone : Text;
    mobilePhone : Text;
    companyName : Text;
    companyAddress : Text;
    companyTrade : Text;
    email : Text;
    notes : Text;
    status : ParticipantStatus;
    passcode : ?Text;
    passcodeEmailSent : Bool;
    createdAt : Int;
  };

  type RSMeansSource = {
    #LiveAPI;
    #ManualEntry;
    #None;
  };

  type ParticipantAssignment = {
    participantId : Text;
    phaseId : Text;
    costCodeId : Text;
    rsMeansSource : RSMeansSource;
    rsMeansUnitCost : ?Float;
    rsMeansCrewRate : ?Float;
    rsMeansLaborRate : ?Float;
    rsMeansMaterialRate : ?Float;
    rsMeansEquipmentRate : ?Float;
    actualCost : ?Float;
    variance : ?Float;
  };

  type RSMeansSettings = {
    apiKey : ?Text;
    apiEnabled : Bool;
    lastTestStatus : ?Text;
  };

  type AccessControlMode = {
    #RoleGated;
    #ProjectManagerOnly;
  };

  type SettingsState = {
    var rsMeansSettings : RSMeansSettings;
    var accessControlMode : AccessControlMode;
    var projectManagerId : ?Text;
    var activeCategoryId : ?Text;
    var activeSubtopicId : ?Text;
  };

  type ScenarioId = Text;

  type ParticipantOverride = {
    participantId : Text;
    newRole : ?Text;
    phaseAssignments : [Text];
    costCodeAssignments : [Text];
  };

  type PhaseOverride = {
    phaseId : Text;
    crashFactor : Float;
    resourceMultiplier : Float;
    laborCostOverride : ?Float;
  };

  type Scenario = {
    id : ScenarioId;
    name : Text;
    description : Text;
    participantOverrides : [ParticipantOverride];
    phaseOverrides : [PhaseOverride];
    createdAt : Int;
    updatedAt : Int;
  };

  type ShareLink = {
    id : Text;
    token : Text;
    projectId : Text;
    createdAt : Int;
    isActive : Bool;
  };

  // OAC Meeting types (new)
  type ZoomSettings = {
    clientId : Text;
    clientSecret : Text;
    fixedZoomLinks : [(Text, Text)];
  };

  type OACMeetingSession = {
    id : Text;
    projectId : Text;
    sessionDate : Text;
    sessionTime : Text;
    zoomLink : ?Text;
    zoomMeetingId : ?Text;
    createdAt : Int;
    linkedCategoryId : ?Text;
  };

  type AIAFormEntry = {
    id : Text;
    sessionId : Text;
    formType : {
      #G702;
      #G703;
      #G701;
      #MeetingMinutes;
      #Addendum;
    };
    fieldData : [(Text, Text)];
    submittedByRole : Text;
    submittedAt : Int;
    lastModified : Int;
  };

  type OldActor = {
    phases : List.List<PhaseInternal>;
    state : { var nextPhaseId : Nat };
    codes : List.List<CostCodeInternal>;
    codeState : { var nextCostCodeId : Nat };
    completions : List.List<CostCodeCompletionInternal>;
    participants : Map.Map<Text, Participant>;
    assignments : Map.Map<Text, ParticipantAssignment>;
    settingsState : SettingsState;
    scenariosMap : Map.Map<ScenarioId, Scenario>;
    shareLinks : Map.Map<Text, ShareLink>;
  };

  type NewActor = {
    phases : List.List<PhaseInternal>;
    state : { var nextPhaseId : Nat };
    codes : List.List<CostCodeInternal>;
    codeState : { var nextCostCodeId : Nat };
    completions : List.List<CostCodeCompletionInternal>;
    participants : Map.Map<Text, Participant>;
    assignments : Map.Map<Text, ParticipantAssignment>;
    settingsState : SettingsState;
    scenariosMap : Map.Map<ScenarioId, Scenario>;
    shareLinks : Map.Map<Text, ShareLink>;
    sessions : Map.Map<Text, OACMeetingSession>;
    forms : Map.Map<Text, AIAFormEntry>;
    oacState : { var zoomSettings : ?ZoomSettings };
  };

  public func migration(old : OldActor) : NewActor {
    {
      phases = old.phases;
      state = old.state;
      codes = old.codes;
      codeState = old.codeState;
      completions = old.completions;
      participants = old.participants;
      assignments = old.assignments;
      settingsState = old.settingsState;
      scenariosMap = old.scenariosMap;
      shareLinks = old.shareLinks;
      sessions = Map.empty<Text, OACMeetingSession>();
      forms = Map.empty<Text, AIAFormEntry>();
      oacState = { var zoomSettings = null };
    };
  };
};
