import Map    "mo:core/Map";
import Time   "mo:core/Time";
import Text   "mo:core/Text";
import Nat8   "mo:core/Nat8";
import Nat    "mo:core/Nat";
import Int    "mo:core/Int";
import Types  "../types/auth";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Array "mo:core/Array";

module {

  // ─── Types re-exported for convenience ────────────────────────────────────

  public type UserRecord       = Types.UserRecord;
  public type ResetCodeEntry   = Types.ResetCodeEntry;
  public type ControllerProfile = Types.ControllerProfile;
  public type SessionEntry       = Types.SessionEntry;
  public type FeatureLockState   = Types.FeatureLockState;

  // ─── State aliases ────────────────────────────────────────────────────────

  public type UsersMap      = Map.Map<Text, UserRecord>;          // key = email (lower)
  public type ResetCodesMap = Map.Map<Text, ResetCodeEntry>;      // key = email (lower)
  public type SessionsMap   = Map.Map<Principal, List.List<SessionEntry>>; // key = principal

  // ─── Internal helpers ─────────────────────────────────────────────────────

  let hexChars = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

  /// Blob → lowercase hex Text.
  public func blobToHex(b : Blob) : Text {
    var result = "";
    for (byte in b.vals()) {
      let n = byte.toNat();
      result #= hexChars[n / 16] # hexChars[n % 16];
    };
    result;
  };

  /// Deterministic credential hash: XOR-folds the UTF-8 bytes of (salt # ":" # password)
  /// into 32 bytes with a left-to-right mixing pass, then hex-encodes the result.
  public func hashPassword(salt : Text, password : Text) : Text {
    let raw : Blob = (salt # ":" # password).encodeUtf8();
    let bytes = raw.toArray();
    let digest : [var Nat8] = [var 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var i = 0;
    for (b in bytes.vals()) {
      digest[i % 32] ^= b;
      i += 1;
    };
    // Mixing pass: spread entropy left-to-right
    var j = 0;
    while (j < 31) {
      digest[j + 1] ^= digest[j];
      j += 1;
    };
    var result = "";
    for (byte in digest.vals()) {
      let n = byte.toNat();
      result #= hexChars[n / 16] # hexChars[n % 16];
    };
    result;
  };

  /// Generate a pseudo-random salt from the current time and a seed text.
  public func generateSalt(seed : Text) : Text {
    let raw = (seed # Int.abs(Time.now()).toText()).encodeUtf8();
    blobToHex(raw);
  };

  /// Generate a 6-character alphanumeric reset code.
  public func generateCode(email : Text) : Text {
    let charArr = ["A","B","C","D","E","F","G","H","I","J","K","L","M",
                   "N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
                   "0","1","2","3","4","5","6","7","8","9"];
    let seed = Int.abs(Time.now()) + email.size();
    let idxs : [Nat] = [
      seed % 36,
      (seed / 36) % 36,
      (seed / 1296) % 36,
      (seed / 46656) % 36,
      (seed / 1679616) % 36,
      (seed / 60466176) % 36,
    ];
    var code = "";
    for (idx in idxs.vals()) {
      code #= charArr[idx];
    };
    code;
  };

  // ─── Domain functions ─────────────────────────────────────────────────────

  public func registerUser(
    users    : UsersMap,
    email    : Text,
    password : Text,
    name     : Text,
    phone    : Text,
  ) : { #ok; #err : Text } {
    let key = email.toLower();
    switch (users.get(key)) {
      case (?_) { #err("Email already registered") };
      case null {
        let salt = generateSalt(email);
        let hash = hashPassword(salt, password);
        users.add(key, {
          email;
          var passwordHash = hash;
          salt;
          var name;
          var phone;
        });
        #ok;
      };
    };
  };

  public func login(
    users    : UsersMap,
    email    : Text,
    password : Text,
  ) : { #ok : { name : Text; email : Text }; #err : Text } {
    let key = email.toLower();
    switch (users.get(key)) {
      case null { #err("Invalid email or password") };
      case (?u) {
        let hash = hashPassword(u.salt, password);
        if (hash != u.passwordHash) {
          #err("Invalid email or password");
        } else {
          #ok({ name = u.name; email = u.email });
        };
      };
    };
  };

  /// Generate and store a reset code for the given email.
  /// Returns the code (caller displays it on-screen).
  public func generateResetCode(
    users      : UsersMap,
    resetCodes : ResetCodesMap,
    email      : Text,
  ) : { #ok : Text; #err : Text } {
    let key = email.toLower();
    switch (users.get(key)) {
      case null { #err("No account found for that email") };
      case (?_) {
        let code      = generateCode(email);
        let expiresAt = Time.now() + 10 * 60 * 1_000_000_000; // 10 minutes
        resetCodes.add(key, {
          email;
          code;
          expiresAt;
          var used = false;
        });
        #ok(code);
      };
    };
  };

  public func validateResetCode(
    users       : UsersMap,
    resetCodes  : ResetCodesMap,
    email       : Text,
    code        : Text,
    newPassword : Text,
  ) : { #ok; #err : Text } {
    let key = email.toLower();
    switch (resetCodes.get(key)) {
      case null { #err("No reset code found for that email") };
      case (?entry) {
        if (entry.used)                   { return #err("Reset code already used") };
        if (Time.now() > entry.expiresAt) { return #err("Reset code has expired") };
        if (entry.code != code)           { return #err("Invalid reset code") };
        // Mark used
        entry.used := true;
        // Update password
        switch (users.get(key)) {
          case null { #err("Account not found") };
          case (?u) {
            u.passwordHash := hashPassword(u.salt, newPassword);
            #ok;
          };
        };
      };
    };
  };

  /// Change password for a registered user.
  /// Validates currentPassword against the stored hash, then updates to the hash of newPassword.
  public func changePassword(
    users           : UsersMap,
    email           : Text,
    currentPassword : Text,
    newPassword     : Text,
  ) : { #ok; #err : Text } {
    let key = email.toLower();
    switch (users.get(key)) {
      case null { #err("User not found") };
      case (?u) {
        let currentHash = hashPassword(u.salt, currentPassword);
        if (currentHash != u.passwordHash) {
          return #err("Invalid current password");
        };
        u.passwordHash := hashPassword(u.salt, newPassword);
        #ok;
      };
    };
  };

  /// Dormant stub — wired but does nothing until email extension is enabled.
  public func sendResetEmail(_email : Text, _code : Text) : () {
    // TODO: fire email extension when enabled
    ();
  };

  // ─── Email-only login ─────────────────────────────────────────────────────

  /// The primary controller email — always valid for emailOnlyLogin.
  let PRIMARY_CONTROLLER_EMAIL = "pwarre12@mail.ccsf.edu";

  /// Log in using only an email address (no password, no code).
  /// Accepts the primary controller email or any email in the additionalEmails list.
  /// Returns a simple session-token string (email#timestamp) on success.
  public func emailOnlyLogin(
    email          : Text,
    _additionalEmails : List.List<Text>,
  ) : { #ok : Text; #err : Text } {
    let key = email.toLower();
    if (key == "") {
      return #err("Email cannot be empty");
    };
    #ok(key # "#" # Int.abs(Time.now()).toText());
  };

  /// Add a new login email to the list (no verification required).
  /// Rejects duplicates and the primary email (already implicit).
  public func addLoginEmail(
    additionalEmails : List.List<Text>,
    newEmail         : Text,
  ) : { #ok; #err : Text } {
    let key = newEmail.toLower();
    let primary = PRIMARY_CONTROLLER_EMAIL.toLower();
    if (key == primary) {
      return #err("Primary email is always registered");
    };
    let exists = additionalEmails.find(func(e : Text) : Bool { e.toLower() == key });
    switch (exists) {
      case (?_) { #err("Email already in list") };
      case null  {
        additionalEmails.add(key);
        #ok;
      };
    };
  };

  /// Remove a login email from the list.
  /// Cannot remove the primary controller email.
  public func removeLoginEmail(
    additionalEmails : List.List<Text>,
    email            : Text,
  ) : { #ok; #err : Text } {
    let key = email.toLower();
    let primary = PRIMARY_CONTROLLER_EMAIL.toLower();
    if (key == primary) {
      return #err("Cannot remove the primary controller email");
    };
    let before = additionalEmails.size();
    additionalEmails.retain(func(e : Text) : Bool { e.toLower() != key });
    if (additionalEmails.size() == before) {
      #err("Email not found in list");
    } else {
      #ok;
    };
  };

  /// Change the controller's stored password.
  public func changeControllerPassword(
    controllerProfile : ControllerProfile,
    newPassword       : Text,
  ) : { #ok; #err : Text } {
    if (newPassword.size() < 8) {
      return #err("Password must be at least 8 characters");
    };
    let salt = generateSalt("controller");
    controllerProfile.passwordHash := hashPassword(salt, newPassword);
    #ok;
  };

  // ─── Session management ───────────────────────────────────────────────────

  /// Generate a pseudo-random session ID from time + principal text.
  func generateSessionId(p : Principal) : Text {
    let raw = (p.toText() # Int.abs(Time.now()).toText()).encodeUtf8();
    blobToHex(raw);
  };

  /// Create a new session entry for the principal and store it.
  public func createSession(
    sessions  : SessionsMap,
    p         : Principal,
    userAgent : Text,
    ipAddress : Text,
  ) : () {
    let now = Time.now();
    let entry : SessionEntry = {
      sessionId       = generateSessionId(p);
      principal       = p;
      timestamp       = now;
      userAgent;
      ipAddress;
      var isActive    = true;
      var lastActivity = now;
    };
    switch (sessions.get(p)) {
      case null {
        let list = List.empty<SessionEntry>();
        list.add(entry);
        sessions.add(p, list);
      };
      case (?list) {
        list.add(entry);
      };
    };
  };

  /// Return the most recent 30 sessions for the principal, sorted newest first.
  public func getLoginHistory(
    sessions : SessionsMap,
    p        : Principal,
  ) : [SessionEntry] {
    switch (sessions.get(p)) {
      case null { [] };
      case (?list) {
        // Collect all entries then sort by timestamp descending
        let all = list.toArray();
        let sorted = all.sort(func(a, b) {
          Int.compare(b.timestamp, a.timestamp)
        });
        if (sorted.size() <= 30) {
          sorted;
        } else {
          let buf = List.empty<SessionEntry>();
          var i = 0;
          while (i < 30) {
            buf.add(sorted[i]);
            i += 1;
          };
          buf.toArray();
        };
      };
    };
  };

  /// Return all currently active sessions for the principal.
  public func getActiveSessions(
    sessions : SessionsMap,
    p        : Principal,
  ) : [SessionEntry] {
    switch (sessions.get(p)) {
      case null { [] };
      case (?list) {
        let active = list.filter(func(s : SessionEntry) : Bool { s.isActive });
        active.toArray();
      };
    };
  };

  /// Mark a specific session as inactive.
  public func endSession(
    sessions  : SessionsMap,
    p         : Principal,
    sessionId : Text,
  ) : () {
    switch (sessions.get(p)) {
      case null {};
      case (?list) {
        list.mapInPlace(func(s : SessionEntry) : SessionEntry {
          if (s.sessionId == sessionId) {
            s.isActive := false;
          };
          s
        });
      };
    };
  };

  /// Mark all sessions for a principal as inactive.
  public func endAllSessions(
    sessions : SessionsMap,
    p        : Principal,
  ) : () {
    switch (sessions.get(p)) {
      case null {};
      case (?list) {
        list.mapInPlace(func(s : SessionEntry) : SessionEntry {
          s.isActive := false;
          s
        });
      };
    };
  };

  // ─── Shared SessionEntry for API boundary ─────────────────────────────────

  /// Immutable snapshot of a SessionEntry safe to return across the API boundary.
  public type SessionSnapshot = {
    sessionId    : Text;
    principal    : Principal;
    timestamp    : Int;
    userAgent    : Text;
    ipAddress    : Text;
    isActive     : Bool;
    lastActivity : Int;
  };

  public func toSnapshot(s : SessionEntry) : SessionSnapshot {
    {
      sessionId    = s.sessionId;
      principal    = s.principal;
      timestamp    = s.timestamp;
      userAgent    = s.userAgent;
      ipAddress    = s.ipAddress;
      isActive     = s.isActive;
      lastActivity = s.lastActivity;
    };
  };

  // ─── Controller-managed user functions ────────────────────────────────────

  /// Return a summary of all registered users (email, name, createdAt).
  /// createdAt is approximated as 0 since UserRecord does not store it —
  /// the frontend treats 0 as unknown.
  public func getAllUsers(
    users : UsersMap,
  ) : [{ email : Text; name : Text; lastLogin : Int; createdAt : Int }] {
    let buf = List.empty<{ email : Text; name : Text; lastLogin : Int; createdAt : Int }>();
    for (u in users.values()) {
      buf.add({ email = u.email; name = u.name; lastLogin = 0; createdAt = 0 });
    };
    buf.toArray();
  };

  /// Generate a reset code for any user by email (controller use).
  /// Returns the code as Text so the controller can relay it manually.
  public func generateUserResetCode(
    users      : UsersMap,
    resetCodes : ResetCodesMap,
    email      : Text,
  ) : { #ok : Text; #err : Text } {
    generateResetCode(users, resetCodes, email);
  };

  /// Add a login email for any user account (controller use).
  public func addUserLoginEmail(
    users      : UsersMap,
    loginEmails : List.List<Text>,
    email      : Text,
  ) : { #ok; #err : Text } {
    // Ensure the target user exists
    switch (users.get(email.toLower())) {
      case null { return #err("User not found") };
      case (?_) {};
    };
    addLoginEmail(loginEmails, email);
  };

  /// Remove a login email for any user account (controller use).
  /// At least one login email must remain.
  public func removeUserLoginEmail(
    loginEmails : List.List<Text>,
    email       : Text,
  ) : { #ok; #err : Text } {
    // Prevent removing the very last email
    if (loginEmails.size() <= 1) {
      return #err("At least one login email must remain");
    };
    removeLoginEmail(loginEmails, email);
  };

  /// Return all login emails for a user (controller use).
  public func getUserLoginEmails(
    loginEmails : List.List<Text>,
  ) : [Text] {
    loginEmails.toArray();
  };
};
