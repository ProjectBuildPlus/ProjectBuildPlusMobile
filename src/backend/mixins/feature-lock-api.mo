import Principal "mo:core/Principal";
import AuthTypes "../types/auth";

/// FeatureLockApi mixin — controller-only feature lock management.
/// Each feature flag: true = unlocked (visible/enabled), false = locked (grayed out/disabled).
mixin (
  featureLocks        : AuthTypes.FeatureLockState,
  controllerPrincipal : Principal,
) {

  /// Return the current lock state for all features.
  /// Available to all authenticated users so the UI can gray out locked modules.
  public query func getFeatureLocks() : async AuthTypes.FeatureLockSnapshot {
    {
      scheduling    = featureLocks.scheduling;
      cost          = featureLocks.cost;
      resources     = featureLocks.resources;
      compliance    = featureLocks.compliance;
      participants  = featureLocks.participants;
      documents     = featureLocks.documents;
      oacMeetings   = featureLocks.oacMeetings;
      subscriptions = featureLocks.subscriptions;
    };
  };

  /// Set the lock state for a named feature.
  /// Only callable by the canister controller.
  /// feature names: scheduling | cost | resources | compliance | participants | documents | oacMeetings | subscriptions
  /// locked: true = feature is locked (disabled), false = feature is unlocked (enabled)
  public shared ({ caller }) func setFeatureLock(
    feature : Text,
    locked  : Bool,
  ) : async { #ok; #err : Text } {
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may change feature locks");
    };
    switch (feature) {
      case "scheduling"    { featureLocks.scheduling    := not locked };
      case "cost"          { featureLocks.cost          := not locked };
      case "resources"     { featureLocks.resources     := not locked };
      case "compliance"    { featureLocks.compliance    := not locked };
      case "participants"  { featureLocks.participants  := not locked };
      case "documents"     { featureLocks.documents     := not locked };
      case "oacMeetings"   { featureLocks.oacMeetings   := not locked };
      case "subscriptions" { featureLocks.subscriptions := not locked };
      case _               { return #err("Unknown feature: " # feature) };
    };
    #ok;
  };

};
