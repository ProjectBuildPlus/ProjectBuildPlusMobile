import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import OACTypes "../types/oac-meeting";
import ParticipantTypes "../types/participants";

module {

  /// Generates a unique ID using a prefix and current nanosecond timestamp.
  public func generateId(prefix : Text) : Text {
    let ts = Time.now();
    prefix # "-" # ts.toText();
  };

  /// Creates a new OAC session. Returns (id, session).
  public func createSession(
    sessions : Map.Map<Text, OACTypes.OACMeetingSession>,
    date : Text,
    time : Text,
  ) : (Text, OACTypes.OACMeetingSession) {
    let id = generateId("oac");
    let session : OACTypes.OACMeetingSession = {
      id;
      projectId = "";
      sessionDate = date;
      sessionTime = time;
      zoomLink = null;
      zoomMeetingId = null;
      createdAt = Time.now();
      linkedCategoryId = null;
    };
    sessions.add(id, session);
    (id, session);
  };

  /// Returns all sessions sorted by sessionDate descending.
  public func listSessions(
    sessions : Map.Map<Text, OACTypes.OACMeetingSession>
  ) : [OACTypes.OACMeetingSession] {
    let all = List.fromIter<OACTypes.OACMeetingSession>(sessions.values());
    let sorted = all.sort(func(a, b) = Text.compare(b.sessionDate, a.sessionDate));
    sorted.toArray();
  };

  /// Returns a single session by ID.
  public func getSession(
    sessions : Map.Map<Text, OACTypes.OACMeetingSession>,
    id : Text,
  ) : ?OACTypes.OACMeetingSession {
    sessions.get(id);
  };

  /// Updates the zoom link and meetingId on a session. Returns true if found.
  public func updateSessionZoomLink(
    sessions : Map.Map<Text, OACTypes.OACMeetingSession>,
    id : Text,
    link : Text,
    meetingId : Text,
  ) : Bool {
    switch (sessions.get(id)) {
      case null { false };
      case (?existing) {
        sessions.add(id, { existing with zoomLink = ?link; zoomMeetingId = ?meetingId });
        true;
      };
    };
  };

  /// Saves a new AIA form entry. Returns (id, entry).
  public func saveForm(
    forms : Map.Map<Text, OACTypes.AIAFormEntry>,
    sessionId : Text,
    formType : OACTypes.FormType,
    fieldData : [(Text, Text)],
    role : Text,
  ) : (Text, OACTypes.AIAFormEntry) {
    let id = generateId("form");
    let now = Time.now();
    let entry : OACTypes.AIAFormEntry = {
      id;
      sessionId;
      formType;
      fieldData;
      submittedByRole = role;
      submittedAt = now;
      lastModified = now;
    };
    forms.add(id, entry);
    (id, entry);
  };

  /// Returns all forms belonging to a session.
  public func getSessionForms(
    forms : Map.Map<Text, OACTypes.AIAFormEntry>,
    sessionId : Text,
  ) : [OACTypes.AIAFormEntry] {
    let matched = List.empty<OACTypes.AIAFormEntry>();
    for ((_, entry) in forms.entries()) {
      if (entry.sessionId == sessionId) {
        matched.add(entry);
      };
    };
    matched.toArray();
  };

  /// Returns a single form by ID.
  public func getForm(
    forms : Map.Map<Text, OACTypes.AIAFormEntry>,
    formId : Text,
  ) : ?OACTypes.AIAFormEntry {
    forms.get(formId);
  };

  /// Updates the fieldData on an existing form. Returns true if found.
  public func updateForm(
    forms : Map.Map<Text, OACTypes.AIAFormEntry>,
    formId : Text,
    fieldData : [(Text, Text)],
  ) : Bool {
    switch (forms.get(formId)) {
      case null { false };
      case (?existing) {
        forms.add(formId, { existing with fieldData; lastModified = Time.now() });
        true;
      };
    };
  };

  /// Participant record shape (minimal, matching participants map entries).
  public type ParticipantInfo = {
    name : Text;
    email : Text;
  };

  /// Builds a clipboard-ready meeting package for a session.
  public func buildMeetingPackage(
    sessions : Map.Map<Text, OACTypes.OACMeetingSession>,
    participants : Map.Map<Text, ParticipantInfo>,
    sessionId : Text,
  ) : OACTypes.MeetingPackage {
    switch (sessions.get(sessionId)) {
      case null {
        {
          link = "";
          date = "";
          time = "";
          participants = [];
        };
      };
      case (?session) {
        let link = switch (session.zoomLink) {
          case (?l) { l };
          case null { "" };
        };
        let names = List.empty<Text>();
        for ((_, p) in participants.entries()) {
          let displayName = if (p.email == "") { p.name } else { p.name # " <" # p.email # ">" };
          names.add(displayName);
        };
        {
          link;
          date = session.sessionDate;
          time = session.sessionTime;
          participants = names.toArray();
        };
      };
    };
  };

  /// Builds a clipboard-ready meeting package using the full Participant type.
  public func buildMeetingPackageFromParticipants(
    sessions : Map.Map<Text, OACTypes.OACMeetingSession>,
    participants : Map.Map<Text, ParticipantTypes.Participant>,
    sessionId : Text,
  ) : OACTypes.MeetingPackage {
    switch (sessions.get(sessionId)) {
      case null {
        {
          link = "";
          date = "";
          time = "";
          participants = [];
        };
      };
      case (?session) {
        let link = switch (session.zoomLink) {
          case (?l) { l };
          case null { "" };
        };
        let names = List.empty<Text>();
        for ((_, p) in participants.entries()) {
          let displayName = if (p.email == "") { p.fullName } else { p.fullName # " <" # p.email # ">" };
          names.add(displayName);
        };
        {
          link;
          date = session.sessionDate;
          time = session.sessionTime;
          participants = names.toArray();
        };
      };
    };
  };
};
