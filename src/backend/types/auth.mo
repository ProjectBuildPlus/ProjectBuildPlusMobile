module {

  /// A registered email+password user record.
  public type UserRecord = {
    email : Text;
    var passwordHash : Text;  // hex-encoded SHA-256(salt # password)
    salt  : Text;             // random hex salt, fixed at registration
    var name  : Text;
    var phone : Text;
  };

  /// A one-time reset code tied to an email, with a 10-minute expiry.
  public type ResetCodeEntry = {
    email     : Text;
    code      : Text;
    expiresAt : Int;   // nanosecond timestamp
    var used  : Bool;
  };

  /// Controller profile stored in stable state.
  public type ControllerProfile = {
    var name  : Text;
    var email : Text;
    var phone : Text;
  };

  /// One recorded login session entry.
  public type SessionEntry = {
    sessionId    : Text;
    principal    : Principal;
    timestamp    : Int;    // nanoseconds — when session was created
    userAgent    : Text;
    ipAddress    : Text;
    var isActive : Bool;
    var lastActivity : Int;
  };

  /// Per-feature lock flags. true = unlocked (accessible), false = locked (grayed out/disabled).
  public type FeatureLockState = {
    var scheduling   : Bool;
    var cost         : Bool;
    var resources    : Bool;
    var compliance   : Bool;
    var participants : Bool;
    var documents    : Bool;
    var oacMeetings  : Bool;
    var subscriptions : Bool;
  };

  /// Immutable snapshot of FeatureLockState safe to return across the API boundary.
  public type FeatureLockSnapshot = {
    scheduling   : Bool;
    cost         : Bool;
    resources    : Bool;
    compliance   : Bool;
    participants : Bool;
    documents    : Bool;
    oacMeetings  : Bool;
    subscriptions : Bool;
  };
};
