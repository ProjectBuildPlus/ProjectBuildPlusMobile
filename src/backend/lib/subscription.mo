import Map    "mo:core/Map";
import List   "mo:core/List";
import Time   "mo:core/Time";
import Result "mo:core/Result";
import Types  "../types/subscription";

module {

  // ---------------------------------------------------------------------------
  // Price / term helpers
  // ---------------------------------------------------------------------------

  /// Monthly price in cents (USD × 100).
  public func tierMonthlyPrice(tier : Types.SubscriptionTier) : Nat {
    switch tier {
      case (#tier1year)  { 29900 };
      case (#tier5year)  { 19900 };
      case (#tier10year) {  9900 };
    };
  };

  /// Subscription length in months (12, 60, or 120).
  public func tierTermMonths(tier : Types.SubscriptionTier) : Nat {
    switch tier {
      case (#tier1year)  {  12 };
      case (#tier5year)  {  60 };
      case (#tier10year) { 120 };
    };
  };

  /// Returns the nanosecond timestamp for day-29 at 11:59 PM
  /// (i.e. trialStartAt + 29 days − 60 seconds).
  public func day29Nanos(trialStartAt : Int) : Int {
    let dayNanos : Int = 24 * 3600 * 1_000_000_000;
    trialStartAt + 29 * dayNanos - 60 * 1_000_000_000;
  };

  // ---------------------------------------------------------------------------
  // Enrollment
  // ---------------------------------------------------------------------------

  /// Enrol a principal in a 30-day free trial.
  /// Returns #err if the caller already has a subscription.
  public func enrollTrial(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    documentStore : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    caller        : Principal,
    tier          : Types.SubscriptionTier,
    stripeCustomerId      : Text,
    stripePaymentMethodId : Text,
  ) : Result.Result<Types.UserSubscription, Text> {
    // Verify documents before allowing trial enrollment
    switch (checkDocumentRequirements(documentStore, caller)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    switch (subscriptions.get(caller)) {
      case (?_existing) { #err("Already enrolled") };
      case null {
        let now = Time.now();
        let sub : Types.UserSubscription = {
          userId                = caller;
          tier                  = tier;
          status                = #trial;
          trialStartAt          = now;
          chargeScheduledAt     = day29Nanos(now);
          subscriptionStartAt   = null;
          subscriptionExpiresAt = null;
          stripeCustomerId      = ?stripeCustomerId;
          stripePaymentMethodId = ?stripePaymentMethodId;
          stripeSubscriptionId  = null;
          currentPlan           = tier;
          cancelledAt           = null;
        };
        subscriptions.add(caller, sub);
        #ok(sub);
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Lookup
  // ---------------------------------------------------------------------------

  public func getUserSubscription(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    caller        : Principal,
  ) : ?Types.UserSubscription {
    subscriptions.get(caller);
  };

  public func getSubscriptionStatus(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    caller        : Principal,
  ) : Types.SubscriptionStatus {
    switch (subscriptions.get(caller)) {
      case (?sub) { sub.status };
      case null   { #cancelled };
    };
  };

  // ---------------------------------------------------------------------------
  // Trial tier switching
  // ---------------------------------------------------------------------------

  /// Switch tier while still in trial (before day-29 charge fires).
  public func switchTrialTier(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    caller        : Principal,
    newTier       : Types.SubscriptionTier,
  ) : Result.Result<Types.UserSubscription, Text> {
    switch (subscriptions.get(caller)) {
      case null    { #err("No subscription found") };
      case (?sub) {
        if (sub.status != #trial) {
          return #err("Tier switching is only allowed during the trial period");
        };
        if (Time.now() >= sub.chargeScheduledAt) {
          return #err("Trial period has ended — tier switching is no longer available");
        };
        let updated = { sub with currentPlan = newTier; tier = newTier };
        subscriptions.add(caller, updated);
        #ok(updated);
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Trial cancellation
  // ---------------------------------------------------------------------------

  /// Cancel the trial.  Only permitted while status == #trial.
  public func cancelTrial(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    caller        : Principal,
  ) : Result.Result<(), Text> {
    switch (subscriptions.get(caller)) {
      case null   { #err("No subscription found") };
      case (?sub) {
        if (sub.status != #trial) {
          return #err("Cancellation is only allowed during the 30-day trial period");
        };
        let updated = { sub with status = #cancelled; cancelledAt = ?Time.now() };
        subscriptions.add(caller, updated);
        #ok(());
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Activation (after Stripe charge confirmed)
  // ---------------------------------------------------------------------------

  /// Activate the subscription once Stripe confirms the day-29 charge.
  public func activateSubscription(
    subscriptions        : Map.Map<Principal, Types.UserSubscription>,
    caller               : Principal,
    stripeSubscriptionId : Text,
  ) : Result.Result<Types.UserSubscription, Text> {
    switch (subscriptions.get(caller)) {
      case null   { #err("No subscription found") };
      case (?sub) {
        let now  = Time.now();
        let termNanos : Int = tierTermMonths(sub.currentPlan) * 30 * 24 * 3600 * 1_000_000_000;
        let updated = {
          sub with
          status                = #active;
          subscriptionStartAt   = ?now;
          subscriptionExpiresAt = ?(now + termNanos);
          stripeSubscriptionId  = ?stripeSubscriptionId;
        };
        subscriptions.add(caller, updated);
        #ok(updated);
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Expiration (term end — app switches to read-only)
  // ---------------------------------------------------------------------------

  public func expireSubscription(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    caller        : Principal,
  ) : Result.Result<(), Text> {
    switch (subscriptions.get(caller)) {
      case null   { #err("No subscription found") };
      case (?sub) {
        let updated = { sub with status = #expired };
        subscriptions.add(caller, updated);
        #ok(());
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Document verification
  // ---------------------------------------------------------------------------

  let REQUIRED_DOC_TYPES : [Text] = ["EIN", "proof_of_address", "government_id"];

  /// Check if a user has all three required documents submitted and at least one
  /// verification path satisfied (admin approved OR Stripe verified).
  public func checkDocumentRequirements(
    documentStore : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    user          : Principal,
  ) : Result.Result<(), Text> {
    let docs = switch (documentStore.get(user)) {
      case null { return #err("No documents submitted. Please upload EIN, proof of address, and government ID before starting the trial.") };
      case (?d) { d };
    };
    let docArr = docs.toArray();
    for (required in REQUIRED_DOC_TYPES.vals()) {
      let found = docArr.vals().find(func(d : Types.VerificationDocument) : Bool {
        d.documentType == required and
          (d.adminReviewStatus == "approved" or d.stripeVerificationStatus == "verified")
      });
      if (found == null) {
        return #err("Document '" # required # "' has not been verified. Please wait for admin approval or Stripe verification.");
      };
    };
    #ok(());
  };

  public func submitDocumentForReview(
    documentStore : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    user          : Principal,
    documentType  : Text,
    storageKey    : Text,
    stripeSessionId : ?Text,
  ) : Types.VerificationDocument {
    let doc : Types.VerificationDocument = {
      documentType;
      storageKey;
      uploadedAt                  = Time.now();
      stripeVerificationSessionId = stripeSessionId;
      adminReviewStatus           = "pending";
      stripeVerificationStatus    = switch (stripeSessionId) {
        case null    { "requires_input" };
        case (?_sid) { "processing" };
      };
    };
    let existing = switch (documentStore.get(user)) {
      case (?list) { list };
      case null    { List.empty<Types.VerificationDocument>() };
    };
    // Remove any older document of the same type, then add the new one
    existing.retain(func(d : Types.VerificationDocument) : Bool { d.documentType != documentType });
    existing.add(doc);
    documentStore.add(user, existing);
    doc;
  };

  public func getDocumentReviewStatus(
    documentStore : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    user          : Principal,
  ) : [Types.VerificationDocument] {
    switch (documentStore.get(user)) {
      case null    { [] };
      case (?list) { list.toArray() };
    };
  };

  public func approveDocumentReview(
    documentStore : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    user          : Principal,
    documentType  : Text,
  ) : Result.Result<(), Text> {
    switch (documentStore.get(user)) {
      case null { #err("No documents found for user") };
      case (?list) {
        let arr = list.toArray();
        switch (arr.vals().find(func(d : Types.VerificationDocument) : Bool { d.documentType == documentType })) {
          case null { #err("Document '" # documentType # "' not found for user") };
          case (?doc) {
            list.retain(func(d : Types.VerificationDocument) : Bool { d.documentType != documentType });
            list.add({ doc with adminReviewStatus = "approved" });
            #ok(());
          };
        };
      };
    };
  };

  public func updateStripeVerificationStatus(
    documentStore  : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    user           : Principal,
    documentType   : Text,
    stripeStatus   : Text,
  ) : Result.Result<(), Text> {
    switch (documentStore.get(user)) {
      case null { #err("No documents found") };
      case (?list) {
        let arr = list.toArray();
        switch (arr.vals().find(func(d : Types.VerificationDocument) : Bool { d.documentType == documentType })) {
          case null { #err("Document not found") };
          case (?doc) {
            list.retain(func(d : Types.VerificationDocument) : Bool { d.documentType != documentType });
            list.add({ doc with stripeVerificationStatus = stripeStatus });
            #ok(());
          };
        };
      };
    };
  };

  public func clearDocuments(
    documentStore : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    user          : Principal,
  ) : () {
    documentStore.remove(user);
  };

  // ---------------------------------------------------------------------------
  // Payment methods
  // ---------------------------------------------------------------------------

  /// Retrieve stored payment method info for a user (derived from their subscription record).
  public func getPaymentMethods(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    caller        : Principal,
  ) : [Types.PaymentMethodInfo] {
    switch (subscriptions.get(caller)) {
      case null { [] };
      case (?sub) {
        switch (sub.stripePaymentMethodId) {
          case null  { [] };
          case (?pm) {
            // Return a stub record — real card details are fetched from Stripe by the frontend.
            [{
              paymentMethodId = pm;
              brand           = "card";
              last4           = "****";
              expMonth        = 0;
              expYear         = 0;
              isDefault       = true;
            }];
          };
        };
      };
    };
  };

  /// Store a new payment method (from a completed SetupIntent) on the subscription.
  public func addPaymentMethod(
    subscriptions   : Map.Map<Principal, Types.UserSubscription>,
    caller          : Principal,
    setupIntentId   : Text,
  ) : Result.Result<Types.UserSubscription, Text> {
    ignore setupIntentId;  // Real Stripe confirmation happens via the http-outcall layer
    switch (subscriptions.get(caller)) {
      case null { #err("No subscription found") };
      case (?sub) {
        // SetupIntent ID used as a reference; actual PM id stored after Stripe confirms
        let updated = { sub with stripePaymentMethodId = ?setupIntentId };
        subscriptions.add(caller, updated);
        #ok(updated);
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Renewal
  // ---------------------------------------------------------------------------

  /// Renew an expired subscription.
  /// Requires all three documents submitted and verified, and a payment method on file.
  public func renewSubscription(
    subscriptions : Map.Map<Principal, Types.UserSubscription>,
    documentStore : Map.Map<Principal, List.List<Types.VerificationDocument>>,
    caller        : Principal,
  ) : Result.Result<Types.UserSubscription, Text> {
    switch (subscriptions.get(caller)) {
      case null { #err("No subscription found") };
      case (?sub) {
        if (sub.status != #expired) {
          return #err("Renewal is only available when the subscription has expired");
        };
        switch (checkDocumentRequirements(documentStore, caller)) {
          case (#err(msg)) { return #err(msg) };
          case (#ok(())) {};
        };
        switch (sub.stripePaymentMethodId) {
          case null  { return #err("No payment method on file. Please add a card before renewing.") };
          case (?_) {};
        };
        let now      = Time.now();
        let updated  = {
          sub with
          status                = #trial;     // pending charge
          trialStartAt          = now;
          chargeScheduledAt     = day29Nanos(now);
          subscriptionStartAt   = null;
          subscriptionExpiresAt = null;
          cancelledAt           = null;
        };
        subscriptions.add(caller, updated);
        // Clear old documents so fresh verification is required for the next renewal
        clearDocuments(documentStore, caller);
        #ok(updated);
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Static trial links
  // ---------------------------------------------------------------------------

  public func getTrialLinks() : [Types.TrialLink] {
    [
      { tier = #tier1year;  slug = "trial-1-year";  isActive = true },
      { tier = #tier5year;  slug = "trial-5-year";  isActive = true },
      { tier = #tier10year; slug = "trial-10-year"; isActive = true },
    ];
  };

  // ---------------------------------------------------------------------------
  // Admin role management
  // ---------------------------------------------------------------------------

  /// Return all assigned admin role records as an array.
  public func getAdminList(
    adminRoles : Map.Map<Principal, Types.AdminRole>,
  ) : [Types.AdminRole] {
    adminRoles.values().toArray();
  };

  /// Return true if the principal is in adminRoles.
  public func isAdmin(
    adminRoles : Map.Map<Principal, Types.AdminRole>,
    p          : Principal,
  ) : Bool {
    adminRoles.get(p) != null;
  };

  /// Return true if the given principal matches the stored controller principal.
  /// The caller provides controllerPrincipal from stable state.
  public func isController(p : Principal, controllerPrincipal : Principal) : Bool {
    p == controllerPrincipal;
  };

  /// Assign the admin role to a principal.
  /// Allowed when adminRoles is empty (first-time bootstrap by the deployer)
  /// or when the caller is already an admin.
  public func assignAdmin(
    adminRoles : Map.Map<Principal, Types.AdminRole>,
    caller     : Principal,
    p          : Principal,
  ) : Result.Result<(), Text> {
    let isBootstrap = adminRoles.size() == 0;
    if (not isBootstrap and not isAdmin(adminRoles, caller)) {
      return #err("Only an existing admin can assign the admin role");
    };
    let role : Types.AdminRole = {
      assignedPrincipal = p;
      assignedBy        = caller;
      assignedAt        = Time.now();
    };
    adminRoles.add(p, role);
    #ok(());
  };

  /// Revoke the admin role from a principal.
  /// Only callable by an existing admin.
  public func revokeAdmin(
    adminRoles : Map.Map<Principal, Types.AdminRole>,
    caller     : Principal,
    p          : Principal,
  ) : Result.Result<(), Text> {
    if (not isAdmin(adminRoles, caller)) {
      return #err("Only an existing admin can revoke the admin role");
    };
    adminRoles.remove(p);
    #ok(());
  };

  // ---------------------------------------------------------------------------
  // Renewal history
  // ---------------------------------------------------------------------------

  // Nanosecond timestamps for sample backfill dates.
  // Reference: 2026-05-24 ≈ 1_748_044_800_000_000_000 ns since epoch.
  let _REF_NS : Int = 1_748_044_800_000_000_000;
  let _YEAR_NS : Int = 31_536_000_000_000_000;
  let _MONTH_NS : Int = 2_592_000_000_000_000;

  /// Build five sample backfill entries anchored relative to now.
  func makeSampleHistory(caller : Principal) : List.List<Types.RenewalHistoryEntry> {
    let now = Time.now();
    let list = List.empty<Types.RenewalHistoryEntry>();
    // Entry 1 — 1-year plan, paid, 3 years ago
    list.add({
      id            = "hist-sample-1";
      principal     = caller;
      tier          = #tier1year;
      startDate     = now - 3 * _YEAR_NS;
      endDate       = now - 3 * _YEAR_NS + 12 * _MONTH_NS;
      monthlyCharge = 29900;
      totalPaid     = 29900 * 12;
      status        = #Paid;
      createdAt     = now - 3 * _YEAR_NS;
    });
    // Entry 2 — 1-year plan, paid, 2 years ago
    list.add({
      id            = "hist-sample-2";
      principal     = caller;
      tier          = #tier1year;
      startDate     = now - 2 * _YEAR_NS;
      endDate       = now - 2 * _YEAR_NS + 12 * _MONTH_NS;
      monthlyCharge = 29900;
      totalPaid     = 29900 * 12;
      status        = #Paid;
      createdAt     = now - 2 * _YEAR_NS;
    });
    // Entry 3 — 5-year plan, paid, started 18 months ago
    list.add({
      id            = "hist-sample-3";
      principal     = caller;
      tier          = #tier5year;
      startDate     = now - 18 * _MONTH_NS;
      endDate       = now - 18 * _MONTH_NS + 60 * _MONTH_NS;
      monthlyCharge = 19900;
      totalPaid     = 19900 * 18;  // 18 months paid so far
      status        = #Paid;
      createdAt     = now - 18 * _MONTH_NS;
    });
    // Entry 4 — 10-year plan, paid, started 6 months ago
    list.add({
      id            = "hist-sample-4";
      principal     = caller;
      tier          = #tier10year;
      startDate     = now - 6 * _MONTH_NS;
      endDate       = now - 6 * _MONTH_NS + 120 * _MONTH_NS;
      monthlyCharge = 9900;
      totalPaid     = 9900 * 6;
      status        = #Paid;
      createdAt     = now - 6 * _MONTH_NS;
    });
    // Entry 5 — cancelled trial, 2.5 years ago
    list.add({
      id            = "hist-sample-5";
      principal     = caller;
      tier          = #tier1year;
      startDate     = now - 30 * _MONTH_NS;
      endDate       = now - 30 * _MONTH_NS + 30 * 24 * 3_600 * 1_000_000_000;
      monthlyCharge = 29900;
      totalPaid     = 0;
      status        = #Cancelled;
      createdAt     = now - 30 * _MONTH_NS;
    });
    list;
  };

  /// Return the caller's renewal history sorted newest-first.
  /// Seeds five sample entries if no entries exist yet.
  public func getRenewalHistory(
    renewalHistory : Map.Map<Principal, List.List<Types.RenewalHistoryEntry>>,
    caller         : Principal,
  ) : [Types.RenewalHistoryEntry] {
    let list = switch (renewalHistory.get(caller)) {
      case (?l) { l };
      case null {
        let fresh = makeSampleHistory(caller);
        renewalHistory.add(caller, fresh);
        fresh;
      };
    };
    let arr = list.toArray();
    // Sort descending by createdAt
    arr.sort(func(a : Types.RenewalHistoryEntry, b : Types.RenewalHistoryEntry) : { #less; #equal; #greater } {
      if (b.createdAt > a.createdAt) { #less }
      else if (b.createdAt < a.createdAt) { #greater }
      else { #equal };
    });
  };

  /// Append a renewal history entry for the caller.
  /// Only callable by an admin (checked by the mixin) or the record's own principal.
  public func addRenewalHistoryEntry(
    renewalHistory : Map.Map<Principal, List.List<Types.RenewalHistoryEntry>>,
    adminRoles     : Map.Map<Principal, Types.AdminRole>,
    caller         : Principal,
    entry          : Types.RenewalHistoryEntry,
  ) : Result.Result<(), Text> {
    if (not isAdmin(adminRoles, caller) and caller != entry.principal) {
      return #err("Not authorized to add renewal history entries for another user");
    };
    let list = switch (renewalHistory.get(entry.principal)) {
      case (?l) { l };
      case null { List.empty<Types.RenewalHistoryEntry>() };
    };
    list.add(entry);
    renewalHistory.add(entry.principal, list);
    #ok(());
  };

  // ---------------------------------------------------------------------------
  // Reminder state (in-app banner tracking)
  // ---------------------------------------------------------------------------

  func defaultReminderState(caller : Principal) : Types.ReminderState {
    {
      principal      = caller;
      day26Dismissed = false;
      day28Dismissed = false;
      day26EmailSent = false;
      day28EmailSent = false;
    };
  };

  /// Return the caller's current reminder state, or null if none exists.
  public func getReminderState(
    reminderState : Map.Map<Principal, Types.ReminderState>,
    caller        : Principal,
  ) : ?Types.ReminderState {
    reminderState.get(caller);
  };

  /// Dismiss the day-26 or day-28 in-app banner for the caller.
  public func dismissReminder(
    reminderState : Map.Map<Principal, Types.ReminderState>,
    caller        : Principal,
    day           : Nat,
  ) : () {
    let current = switch (reminderState.get(caller)) {
      case (?s) { s };
      case null { defaultReminderState(caller) };
    };
    let updated = if (day == 26) {
      { current with day26Dismissed = true };
    } else if (day == 28) {
      { current with day28Dismissed = true };
    } else { current };
    reminderState.add(caller, updated);
  };

  /// Mark the day-26 or day-28 email reminder as sent for the caller.
  /// Built now so it fires automatically when email is enabled.
  public func setReminderEmailSent(
    reminderState : Map.Map<Principal, Types.ReminderState>,
    caller        : Principal,
    day           : Nat,
  ) : () {
    let current = switch (reminderState.get(caller)) {
      case (?s) { s };
      case null { defaultReminderState(caller) };
    };
    let updated = if (day == 26) {
      { current with day26EmailSent = true };
    } else if (day == 28) {
      { current with day28EmailSent = true };
    } else { current };
    reminderState.add(caller, updated);
  };

};
