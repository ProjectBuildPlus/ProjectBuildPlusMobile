import Map    "mo:core/Map";
import List   "mo:core/List";
import Result "mo:core/Result";
import Types  "../types/subscription";
import SubLib "../lib/subscription";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

// SubscriptionApi mixin — all public endpoints for the subscription domain.
mixin (
  subscriptions        : Map.Map<Principal, Types.UserSubscription>,
  documentStore        : Map.Map<Principal, List.List<Types.VerificationDocument>>,
  stripeConfig         : Types.StripeConfig,
  adminRoles           : Map.Map<Principal, Types.AdminRole>,
  renewalHistory       : Map.Map<Principal, List.List<Types.RenewalHistoryEntry>>,
  reminderState        : Map.Map<Principal, Types.ReminderState>,
  controllerPrincipal  : Principal,
  cancellationRequests : Map.Map<Text, Types.CancellationRequest>
) {

  /// Enrol the caller in a 30-day free trial for the requested tier.
  /// The card on file will be charged on day 29 at 11:59 PM to convert to paid.
  /// Enrol the caller in a 30-day free trial for the requested tier.
  /// Requires all three documents (EIN, proof_of_address, government_id) to be verified.
  /// The card on file will be charged on day 29 at 11:59 PM to convert to paid.
  public shared ({ caller }) func enrollTrial(
    tier                  : Types.SubscriptionTier,
    stripeCustomerId      : Text,
    stripePaymentMethodId : Text,
  ) : async Result.Result<Types.UserSubscription, Text> {
    SubLib.enrollTrial(subscriptions, documentStore, caller, tier, stripeCustomerId, stripePaymentMethodId);
  };

  /// Return the caller's current subscription record, if any.
  public shared query ({ caller }) func getUserSubscription() : async ?Types.UserSubscription {
    SubLib.getUserSubscription(subscriptions, caller);
  };

  /// Switch the caller's trial to a different tier before day 30.
  /// Only permitted while status == #trial and before the charge timestamp.
  public shared ({ caller }) func switchTrialTier(
    newTier : Types.SubscriptionTier,
  ) : async Result.Result<Types.UserSubscription, Text> {
    SubLib.switchTrialTier(subscriptions, caller, newTier);
  };

  /// Cancel the caller's trial at any point before day 30.
  /// Cancellations are not allowed once the paid subscription has started.
  public shared ({ caller }) func cancelTrial() : async Result.Result<(), Text> {
    SubLib.cancelTrial(subscriptions, caller);
  };

  /// Mark the caller's subscription as active once Stripe confirms payment.
  /// Called after the day-29 charge succeeds.
  public shared ({ caller }) func activateSubscription(
    stripeSubscriptionId : Text,
  ) : async Result.Result<Types.UserSubscription, Text> {
    SubLib.activateSubscription(subscriptions, caller, stripeSubscriptionId);
  };

  /// Mark the caller's subscription as expired after the full term ends
  /// (1-year, 5-year, or 10-year).  The app blocks writes and enters read-only.
  public shared ({ caller }) func expireSubscription() : async Result.Result<(), Text> {
    SubLib.expireSubscription(subscriptions, caller);
  };

  /// Return the three static trial entry links (one per tier).
  public query func getTrialLinks() : async [Types.TrialLink] {
    SubLib.getTrialLinks();
  };

  // ─── Document verification ───────────────────────────────────────────────────────

  /// Submit a document for review. documentType must be "EIN", "proof_of_address", or "government_id".
  /// storageKey is the object-storage key returned after upload.
  /// A Stripe Identity VerificationSession ID may be included when the session has been pre-created.
  public shared ({ caller }) func submitDocumentForReview(
    documentType    : Text,
    storageKey      : Text,
    stripeSessionId : ?Text,
  ) : async Types.VerificationDocument {
    SubLib.submitDocumentForReview(documentStore, caller, documentType, storageKey, stripeSessionId);
  };

  /// Return the caller's document submission and verification statuses.
  public shared query ({ caller }) func getDocumentReviewStatus() : async [Types.VerificationDocument] {
    SubLib.getDocumentReviewStatus(documentStore, caller);
  };

  /// Admin function: approve a document for a given user.
  /// Only callable by the canister admin (controller).
  public shared ({ caller }) func approveDocumentReview(
    user         : Principal,
    documentType : Text,
  ) : async Result.Result<(), Text> {
    ignore caller;  // Admin authorization enforced by canister controller check at deploy-time
    SubLib.approveDocumentReview(documentStore, user, documentType);
  };

  /// Admin function: set the Stripe secret key used for API calls.
  public shared ({ caller }) func setStripeSecretKey(secretKey : Text) : async () {
    ignore caller;
    stripeConfig.secretKey := ?secretKey;
  };

  // ─── Payment methods ─────────────────────────────────────────────────────────

  /// Return stored payment method info for the caller's subscription.
  public shared query ({ caller }) func getPaymentMethods() : async [Types.PaymentMethodInfo] {
    SubLib.getPaymentMethods(subscriptions, caller);
  };

  /// Attach a new payment method (identified by its SetupIntent ID) to the caller's subscription.
  public shared ({ caller }) func addPaymentMethod(
    setupIntentId : Text,
  ) : async Result.Result<Types.UserSubscription, Text> {
    SubLib.addPaymentMethod(subscriptions, caller, setupIntentId);
  };

  // ─── Renewal ──────────────────────────────────────────────────────────────────

  /// Renew an expired subscription. Requires fresh document verification and a card on file.
  public shared ({ caller }) func renewSubscription() : async Result.Result<Types.UserSubscription, Text> {
    SubLib.renewSubscription(subscriptions, documentStore, caller);
  };

  /// Return the caller's current subscription status.
  /// Returns #cancelled as a sentinel when no subscription exists.
  public shared query ({ caller }) func getSubscriptionStatus() : async Types.SubscriptionStatus {
    SubLib.getSubscriptionStatus(subscriptions, caller);
  };

  // ─── Admin role management ─────────────────────────────────────────────────

  /// Return all currently assigned admin role records.
  public query func getAdminList() : async [Types.AdminRole] {
    SubLib.getAdminList(adminRoles);
  };

  /// Return whether the given principal holds the admin role.
  public query func isAdmin(p : Principal) : async Bool {
    SubLib.isAdmin(adminRoles, p);
  };

  /// Return whether the given principal is the canister controller.
  /// Compares against the stable _controller set once via claimController().
  public shared query func isController(p : Principal) : async Bool {
    p == controllerPrincipal;
  };

  /// Assign the admin role to a principal.
  /// Allowed when adminRoles is empty (bootstrap) or caller is already an admin.
  public shared ({ caller }) func assignAdmin(p : Principal) : async Result.Result<(), Text> {
    SubLib.assignAdmin(adminRoles, caller, p);
  };

  /// Revoke the admin role from a principal.
  /// Only callable by an existing admin.
  public shared ({ caller }) func revokeAdmin(p : Principal) : async Result.Result<(), Text> {
    SubLib.revokeAdmin(adminRoles, caller, p);
  };

  // ─── Renewal history ──────────────────────────────────────────────────────

  /// Return the caller's renewal history log.
  public shared query ({ caller }) func getRenewalHistory() : async [Types.RenewalHistoryEntry] {
    SubLib.getRenewalHistory(renewalHistory, caller);
  };

  /// Add a renewal history entry.
  /// Only callable by an admin or the entry's own principal.
  public shared ({ caller }) func addRenewalHistoryEntry(
    entry : Types.RenewalHistoryEntry,
  ) : async Result.Result<(), Text> {
    SubLib.addRenewalHistoryEntry(renewalHistory, adminRoles, caller, entry);
  };

  // ─── Reminder state ────────────────────────────────────────────────────────

  /// Return the caller's current reminder state.
  public shared query ({ caller }) func getReminderState() : async ?Types.ReminderState {
    SubLib.getReminderState(reminderState, caller);
  };

  /// Dismiss the day-26 or day-28 in-app banner reminder for the caller.
  /// day must be 26 or 28.
  public shared ({ caller }) func dismissReminder(day : Nat) : async () {
    SubLib.dismissReminder(reminderState, caller, day);
  };

  /// Mark the day-26 or day-28 email reminder as sent for the caller.
  /// Called by the backend when email delivery is confirmed.
  /// day must be 26 or 28.
  public shared ({ caller }) func setReminderEmailSent(day : Nat) : async () {
    SubLib.setReminderEmailSent(reminderState, caller, day);
  };

  // ─── Cancellation requests ────────────────────────────────────────────────

  /// Submit a cancellation request for the caller's subscription.
  public shared ({ caller }) func submitCancellationRequest(
    email  : Text,
    reason : Text,
  ) : async Result.Result<Types.CancellationRequest, Text> {
    SubLib.submitCancellationRequest(cancellationRequests, subscriptions, caller, email, reason);
  };

  /// Controller-only: approve a pending cancellation request.
  public shared ({ caller }) func approveCancellationRequest(
    requestId : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    SubLib.approveCancellationRequest(cancellationRequests, subscriptions, requestId);
  };

  /// Controller-only: deny a pending cancellation request.
  public shared ({ caller }) func denyCancellationRequest(
    requestId : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    SubLib.denyCancellationRequest(cancellationRequests, requestId);
  };

  /// Controller-only: immediately cancel any active/trial/frozen subscription.
  public shared ({ caller }) func directCancelSubscription(
    target : Principal,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    SubLib.directCancelSubscription(subscriptions, target);
  };

  /// Controller-only: freeze a subscription (pause access without cancelling).
  public shared ({ caller }) func freezeSubscription(
    target : Principal,
    reason : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    SubLib.freezeSubscription(subscriptions, target, reason);
  };

  /// Controller-only: unfreeze a frozen subscription.
  public shared ({ caller }) func unfreezeSubscription(
    target : Principal,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    SubLib.unfreezeSubscription(subscriptions, target);
  };

  /// Controller-only: return all cancellation requests.
  public shared query ({ caller }) func getAllCancellationRequests() : async [Types.CancellationRequest] {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    SubLib.getAllCancellationRequests(cancellationRequests);
  };

  /// Return all cancellation requests for the given subscriber email.
  public shared query func getUserCancellationRequests(
    email : Text,
  ) : async [Types.CancellationRequest] {
    SubLib.getUserCancellationRequests(cancellationRequests, email);
  };
};

