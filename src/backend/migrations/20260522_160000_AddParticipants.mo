import List "mo:core/List";
import Map "mo:core/Map";

module {
  // OldActor = NewActor of 20260522_140000_AddEVMCompletions.mo
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

  type OldActor = {
    phases : List.List<PhaseInternal>;
    state : { var nextPhaseId : Nat };
    codes : List.List<CostCodeInternal>;
    codeState : { var nextCostCodeId : Nat };
    completions : List.List<CostCodeCompletionInternal>;
  };

  // Participant types (inlined — no project imports allowed)
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
  };

  public func migration(old : OldActor) : NewActor {
    {
      phases = old.phases;
      state = old.state;
      codes = old.codes;
      codeState = old.codeState;
      completions = old.completions;
      participants = Map.empty<Text, Participant>();
      assignments = Map.empty<Text, ParticipantAssignment>();
      settingsState = {
        var rsMeansSettings = {
          apiKey = null;
          apiEnabled = false;
          lastTestStatus = null;
        };
        var accessControlMode = #RoleGated;
        var projectManagerId = null;
      };
    };
  };
};
