import List "mo:core/List";
import Map "mo:core/Map";
import Types "types/cash-requirement";
import CostCodeTypes "types/cost-codes";
import CashLib "lib/cash-requirement";
import CashApi "mixins/cash-requirement-api";
import CostCodesApi "mixins/cost-codes-api";
import EVMTypes "types/earned-value";
import EVMApi "mixins/earned-value-api";
import ParticipantTypes "types/participants";
import ParticipantsApi "mixins/participants-api";
import SettingsLib "lib/settings";
import SettingsApi "mixins/settings-api";
import ScenarioTypes "types/scenarios";
import ScenarioLib "lib/scenarios";
import ScenariosApi "mixins/scenarios-api";
import ProjectTypesApi "mixins/project-types-api";
import ShareLinkTypes "types/share-link";
import ShareLinkApi "mixins/share-link-api";
import OACTypes "types/oac-meeting";
import OACMeetingApi "mixins/oac-meeting-api";
import ResourceLib "lib/resources";
import ResourcesApi "mixins/resources-api";
import SafetyLib "lib/safety-standards";
import SafetyStandardsApi "mixins/safety-standards-api";
import SubscriptionTypes "types/subscription";
import SubscriptionApi "mixins/subscription-api";
import Result "mo:core/Result";
import Principal "mo:core/Principal";
import AuthTypes "types/auth";
import AuthApi "mixins/auth-api";
import FeatureLockApi "mixins/feature-lock-api";
import PayoutTypes "types/payout";
import PayoutApi "mixins/payout-api";
import DrawingTypes "types/drawings";
import DrawingsAPI "mixins/drawings-api";

actor MainActor {
  let phases : List.List<CashLib.Phase>;
  let state : { var nextPhaseId : Types.PhaseId };
  let codes : List.List<CostCodeTypes.CostCodeInternal>;
  let codeState : { var nextCostCodeId : Nat };
  let completions : List.List<EVMTypes.CostCodeCompletionInternal>;
  let participants : Map.Map<Text, ParticipantTypes.Participant>;
  let assignments : Map.Map<Text, ParticipantTypes.ParticipantAssignment>;
  let settingsState : SettingsLib.SettingsState;
  let scenariosMap : Map.Map<ScenarioTypes.ScenarioId, ScenarioLib.Scenario>;

  let shareLinks : Map.Map<Text, ShareLinkTypes.ShareLink>;
  let sessions : Map.Map<Text, OACTypes.OACMeetingSession>;
  let forms : Map.Map<Text, OACTypes.AIAFormEntry>;
  let oacState : { var zoomSettings : ?OACTypes.ZoomSettings };
  let resourceStore : ResourceLib.ResourceStore;
  let allocationStore : ResourceLib.AllocationStore;
  let idleTimeStore : ResourceLib.IdleTimeStore;
  let standardsStore : SafetyLib.StandardsStore;
  let linksStore : SafetyLib.LinksStore;
  let complianceStore : SafetyLib.ComplianceStore;
  let signOffStore : SafetyLib.SignOffStore;
  let certStore : SafetyLib.CertStore;
  let plansStore : SafetyLib.PlansStore;
  let planApprovalsStore : SafetyLib.PlanApprovalsStore;
  let safetyState : SafetyLib.SafetyState;
  let subscriptions  : Map.Map<Principal, SubscriptionTypes.UserSubscription>;
  let documentStore  : Map.Map<Principal, List.List<SubscriptionTypes.VerificationDocument>>;
  let stripeConfig   : SubscriptionTypes.StripeConfig;
  let adminRoles     : Map.Map<Principal, SubscriptionTypes.AdminRole>;
  let renewalHistory : Map.Map<Principal, List.List<SubscriptionTypes.RenewalHistoryEntry>>;
  let reminderState  : Map.Map<Principal, SubscriptionTypes.ReminderState>;
  var _controller    : Principal;
  let users             : Map.Map<Text, AuthTypes.UserRecord>;
  let resetCodes        : Map.Map<Text, AuthTypes.ResetCodeEntry>;
  let controllerProfile : AuthTypes.ControllerProfile;
  let loginSessions     : Map.Map<Principal, List.List<AuthTypes.SessionEntry>>;
  let featureLocks      : AuthTypes.FeatureLockState;
  let bankAccountStore  : { var bankAccount : ?PayoutTypes.BankAccount };
  let payoutStore       : { var payoutRecords : List.List<PayoutTypes.PayoutRecord>; var nextPayoutDate : ?Text };
  let drawingsStore          : Map.Map<Text, DrawingTypes.Drawing>;
  let reviewRequestsStore    : Map.Map<Text, DrawingTypes.ReviewRequest>;
  let drawingNotifications   : Map.Map<Text, DrawingTypes.DrawingNotification>;

  include CashApi(phases, state);
  include CostCodesApi(codes, codeState, phases);
  include EVMApi(completions, phases, codes);
  include ParticipantsApi(participants, assignments);
  include SettingsApi(settingsState);
  include ProjectTypesApi(phases, state);
  include ScenariosApi(scenariosMap, phases, codes);
  include ShareLinkApi(shareLinks);
  include OACMeetingApi(sessions, forms, oacState, participants);
  include ResourcesApi(resourceStore, allocationStore, idleTimeStore);
  include SafetyStandardsApi(standardsStore, linksStore, complianceStore, signOffStore, certStore, plansStore, planApprovalsStore, safetyState);
  include SubscriptionApi(subscriptions, documentStore, stripeConfig, adminRoles, renewalHistory, reminderState, _controller);
  include AuthApi(users, resetCodes, controllerProfile, _controller, loginSessions);
  include FeatureLockApi(featureLocks, _controller);

  include PayoutApi(bankAccountStore, payoutStore, _controller);
  include DrawingsAPI(drawingsStore, reviewRequestsStore, drawingNotifications, sessions, forms);
  /// One-time claim: the first caller who finds _controller == anonymous
  /// principal becomes the permanent controller.  Secure because the
  /// deployer is the only one who can call this before any user interaction.
  public shared (msg) func claimController() : async Result.Result<(), Text> {
    if (_controller != Principal.fromText("2vxsx-fae")) {
      return #err("Controller already set");
    };
    _controller := msg.caller;
    #ok(());
  };
};
