module {

  // Subscription tiers with associated monthly prices:
  //   #tier1year  -> $299/month
  //   #tier5year  -> $199/month
  //   #tier10year ->  $99/month
  public type SubscriptionTier = {
    #tier1year;
    #tier5year;
    #tier10year;
  };

  public type SubscriptionStatus = {
    #trial;
    #active;
    #expired;
    #cancelled;
  };

  // Full subscription record stored per principal.
  // trialStartAt / chargeScheduledAt / subscriptionStartAt / subscriptionExpiresAt
  // are nanosecond timestamps (Int, compatible with Time.now()).
  // chargeScheduledAt = day 29 of the trial at 11:59 PM.
  public type UserSubscription = {
    userId                 : Principal;
    tier                   : SubscriptionTier;
    status                 : SubscriptionStatus;
    trialStartAt           : Int;
    chargeScheduledAt      : Int;
    subscriptionStartAt    : ?Int;
    subscriptionExpiresAt  : ?Int;
    stripeCustomerId       : ?Text;
    stripePaymentMethodId  : ?Text;
    stripeSubscriptionId   : ?Text;
    currentPlan            : SubscriptionTier;
    cancelledAt            : ?Int;
  };

  // Static trial-entry links — one per tier.
  // slug examples: "trial-1-year", "trial-5-year", "trial-10-year"
  public type TrialLink = {
    tier     : SubscriptionTier;
    slug     : Text;
    isActive : Bool;
  };

  // ─── Document verification ─────────────────────────────────────────────────

  // Required document types: "EIN", "proof_of_address", "government_id"
  public type VerificationDocument = {
    documentType              : Text;        // "EIN" | "proof_of_address" | "government_id"
    storageKey                : Text;        // object-storage key
    uploadedAt                : Int;
    stripeVerificationSessionId : ?Text;     // Stripe Identity session ID
    adminReviewStatus         : Text;        // "pending" | "approved" | "rejected"
    stripeVerificationStatus  : Text;        // "requires_input" | "processing" | "verified" | "canceled"
  };

  // ─── Payment method info (shared with frontend) ────────────────────────────

  public type PaymentMethodInfo = {
    paymentMethodId : Text;
    brand           : Text;   // e.g. "visa", "mastercard"
    last4           : Text;
    expMonth        : Nat;
    expYear         : Nat;
    isDefault       : Bool;
  };

  // ─── Stripe canister config (admin-settable) ───────────────────────────────

  public type StripeConfig = {
    var secretKey : ?Text;
  };

  // ─── Admin role assignment ─────────────────────────────────────────────────

  /// A delegated admin role.  The canister controller assigns and revokes these.
  public type AdminRole = {
    assignedPrincipal : Principal;
    assignedBy        : Principal;
    assignedAt        : Int;
  };

  // ─── Renewal history ──────────────────────────────────────────────────────

  /// One entry per subscription term or renewal charge event.
  public type RenewalHistoryEntry = {
    id            : Text;
    principal     : Principal;
    tier          : SubscriptionTier;
    startDate     : Int;
    endDate       : Int;
    monthlyCharge : Nat;
    totalPaid     : Nat;
    status        : { #Paid; #Cancelled; #Pending; #Failed };
    createdAt     : Int;
  };

  // ─── Reminder state ────────────────────────────────────────────────────────

  /// Tracks whether day-26 and day-28 in-app banner reminders have been
  /// dismissed by the user, and whether the corresponding email (when email
  /// becomes enabled) has been sent.
  public type ReminderState = {
    principal      : Principal;
    day26Dismissed : Bool;
    day28Dismissed : Bool;
    day26EmailSent : Bool;
    day28EmailSent : Bool;
  };

};

