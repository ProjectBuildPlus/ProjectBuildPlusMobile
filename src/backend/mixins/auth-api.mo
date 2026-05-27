import Map     "mo:core/Map";
import Result  "mo:core/Result";
import Types   "../types/auth";
import AuthLib "../lib/auth";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

/// AuthApi mixin — email+password login, registration, password reset,
/// controller profile management, session tracking, and email-only login.
mixin (
  users               : Map.Map<Text, Types.UserRecord>,
  resetCodes          : Map.Map<Text, Types.ResetCodeEntry>,
  controllerProfile   : Types.ControllerProfile,
  controllerPrincipal : Principal,
  loginSessions       : Map.Map<Principal, List.List<Types.SessionEntry>>,
  loginEmails         : List.List<Text>,
) {

  /// Register a new email+password account.
  /// Only the canister controller may register the first account; subsequent
  /// registrations are blocked to prevent open sign-up.
  public shared ({ caller }) func registerEmailUser(
    email    : Text,
    password : Text,
    name     : Text,
    phone    : Text,
  ) : async Result.Result<(), Text> {
    // Only the controller may register users.
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may register users");
    };
    AuthLib.registerUser(users, email, password, name, phone);
  };

  /// Validate email + password credentials.
  /// Returns the user's name and email on success.
  /// Creates a session entry for the caller on success.
  public shared ({ caller }) func emailLogin(
    email     : Text,
    password  : Text,
    userAgent : Text,
    ipAddress : Text,
  ) : async Result.Result<{ name : Text; email : Text }, Text> {
    let result = AuthLib.login(users, email, password);
    switch (result) {
      case (#ok(_)) {
        AuthLib.createSession(loginSessions, caller, userAgent, ipAddress);
      };
      case (#err(_)) {};
    };
    result;
  };

  /// Generate an in-app 6-character reset code for the given email.
  /// The code is returned in the response body for on-screen display.
  /// Also calls the dormant sendResetEmail stub (no-op until email is enabled).
  public shared func generateResetCode(
    email : Text,
  ) : async Result.Result<Text, Text> {
    let result = AuthLib.generateResetCode(users, resetCodes, email);
    switch (result) {
      case (#ok(code)) {
        AuthLib.sendResetEmail(email, code); // dormant stub
        #ok(code);
      };
      case (#err(e)) { #err(e) };
    };
  };

  /// Validate a reset code and set a new password if it is valid.
  public shared func validateResetCode(
    email       : Text,
    code        : Text,
    newPassword : Text,
  ) : async Result.Result<(), Text> {
    AuthLib.validateResetCode(users, resetCodes, email, code, newPassword);
  };

  /// Change the password for an existing email+password account.
  /// Requires the current password for verification.
  public shared func changePassword(
    email           : Text,
    currentPassword : Text,
    newPassword     : Text,
  ) : async Result.Result<(), Text> {
    AuthLib.changePassword(users, email, currentPassword, newPassword);
  };

  /// Update the controller's stored profile (name, email, phone).
  /// Only callable by the canister controller.
  public shared ({ caller }) func updateControllerProfile(
    name  : Text,
    email : Text,
    phone : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may update the controller profile");
    };
    controllerProfile.name  := name;
    controllerProfile.email := email;
    controllerProfile.phone := phone;
    #ok(());
  };

  /// Return the controller's stored profile.
  /// Only callable by the canister controller.
  public shared query ({ caller }) func getControllerProfile()
    : async Result.Result<{ name : Text; email : Text; phone : Text }, Text>
  {
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may view the controller profile");
    };
    #ok({
      name  = controllerProfile.name;
      email = controllerProfile.email;
      phone = controllerProfile.phone;
    });
  };

  /// Return the most recent 30 login sessions for the caller (login history).
  public shared query ({ caller }) func getLoginHistory() : async [AuthLib.SessionSnapshot] {
    let entries = AuthLib.getLoginHistory(loginSessions, caller);
    let buf = List.empty<AuthLib.SessionSnapshot>();
    for (e in entries.vals()) {
      buf.add(AuthLib.toSnapshot(e));
    };
    buf.toArray();
  };

  /// Return currently active sessions for the caller.
  public shared query ({ caller }) func getActiveSessions() : async [AuthLib.SessionSnapshot] {
    let entries = AuthLib.getActiveSessions(loginSessions, caller);
    let buf = List.empty<AuthLib.SessionSnapshot>();
    for (e in entries.vals()) {
      buf.add(AuthLib.toSnapshot(e));
    };
    buf.toArray();
  };

  /// End (invalidate) a specific session for the caller.
  public shared ({ caller }) func endSession(sessionId : Text) : async () {
    AuthLib.endSession(loginSessions, caller, sessionId);
  };

  // ─── Email-only login ─────────────────────────────────────────────────────

  /// Log in with an email address only — no password or verification code required.
  /// Works for the primary controller email and any additional registered login emails.
  public shared func emailOnlyLogin(
    email : Text,
  ) : async Result.Result<Text, Text> {
    AuthLib.emailOnlyLogin(email, loginEmails);
  };

  /// Add an extra login email (controller-only). Effective immediately.
  public shared ({ caller }) func addLoginEmail(
    newEmail : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may add login emails");
    };
    AuthLib.addLoginEmail(loginEmails, newEmail);
  };

  /// Remove a login email (controller-only). Cannot remove the primary email.
  public shared ({ caller }) func removeLoginEmail(
    email : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may remove login emails");
    };
    AuthLib.removeLoginEmail(loginEmails, email);
  };

  /// Return all registered login emails (primary + additional), controller-only.
  public shared query ({ caller }) func getLoginEmails() : async Result.Result<[Text], Text> {
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may view login emails");
    };
    let all = List.empty<Text>();
    all.add("pwarre12@mail.ccsf.edu");
    for (e in loginEmails.values()) {
      all.add(e);
    };
    #ok(all.toArray());
  };

  /// Change the controller's password (controller-only).
  public shared ({ caller }) func changeControllerPassword(
    newPassword : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      return #err("Only the app controller may change the controller password");
    };
    AuthLib.changeControllerPassword(controllerProfile, newPassword);
  };

  // ─── Controller-managed user operations ──────────────────────────────

  /// Controller-only: return all registered users (email, name, lastLogin, createdAt).
  public shared query ({ caller }) func getAllUsers()
    : async [{ email : Text; name : Text; lastLogin : Int; createdAt : Int }]
  {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    AuthLib.getAllUsers(users);
  };

  /// Controller-only: generate a reset code for any registered user by email.
  /// Returns the code as Text for the controller to relay manually.
  public shared ({ caller }) func generateUserResetCode(
    email : Text,
  ) : async Result.Result<Text, Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    AuthLib.generateUserResetCode(users, resetCodes, email);
  };

  /// Controller-only: add a login email for any user account.
  public shared ({ caller }) func addUserLoginEmail(
    targetEmail : Text,
    newEmail    : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    AuthLib.addUserLoginEmail(users, loginEmails, newEmail);
  };

  /// Controller-only: remove a login email. Min 1 email must remain.
  public shared ({ caller }) func removeUserLoginEmail(
    email : Text,
  ) : async Result.Result<(), Text> {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    AuthLib.removeUserLoginEmail(loginEmails, email);
  };

  /// Controller-only: return all login emails for the login email list.
  public shared query ({ caller }) func getUserLoginEmails(
    _targetEmail : Text,
  ) : async [Text] {
    if (caller != controllerPrincipal) {
      Runtime.trap("Unauthorized: controller only");
    };
    AuthLib.getUserLoginEmails(loginEmails);
  };
};
