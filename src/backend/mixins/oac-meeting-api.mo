import OACTypes "../types/oac-meeting";
import OACLib "../lib/oac-meeting";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Outcall "mo:caffeineai-http-outcalls/outcall";
import Nat8 "mo:core/Nat8";
import Char "mo:core/Char";
import ParticipantTypes "../types/participants";

mixin (
  sessions : Map.Map<Text, OACTypes.OACMeetingSession>,
  forms : Map.Map<Text, OACTypes.AIAFormEntry>,
  oacState : { var zoomSettings : ?OACTypes.ZoomSettings },
  participants : Map.Map<Text, ParticipantTypes.Participant>,
) {


  public type OACMeetingSession = OACTypes.OACMeetingSession;
  public type AIAFormEntry = OACTypes.AIAFormEntry;
  public type FormType = OACTypes.FormType;
  public type ZoomSettings = OACTypes.ZoomSettings;
  public type ZoomMeetingResult = OACTypes.ZoomMeetingResult;
  public type MeetingPackage = OACTypes.MeetingPackage;

  // ---------------------------------------------------------------------------
  // Session management
  // ---------------------------------------------------------------------------

  /// Create a new OAC session for the given date and time; returns the new session ID.
  public shared func createOACSession(date : Text, time : Text) : async Text {
    let (id, _) = OACLib.createSession(sessions, date, time);
    id;
  };

  /// List all OAC sessions sorted by date descending.
  public query func getOACSessions() : async [OACMeetingSession] {
    OACLib.listSessions(sessions);
  };

  /// Get a single OAC session by ID.
  public query func getOACSession(id : Text) : async ?OACMeetingSession {
    OACLib.getSession(sessions, id);
  };

  /// Attach a Zoom meeting link and meeting ID to an existing session.
  public shared func updateOACSessionZoomLink(
    sessionId : Text,
    zoomLink : Text,
    zoomMeetingId : Text,
  ) : async Bool {
    OACLib.updateSessionZoomLink(sessions, sessionId, zoomLink, zoomMeetingId);
  };

  // ---------------------------------------------------------------------------
  // AIA form management
  // ---------------------------------------------------------------------------

  /// Save a new AIA form entry for a session; returns the form entry ID.
  public shared func saveAIAForm(
    sessionId : Text,
    formType : FormType,
    fieldData : [(Text, Text)],
    submittedByRole : Text,
  ) : async Text {
    let (id, _) = OACLib.saveForm(forms, sessionId, formType, fieldData, submittedByRole);
    id;
  };

  /// Retrieve all AIA form entries for a session.
  public query func getAIAForms(sessionId : Text) : async [AIAFormEntry] {
    OACLib.getSessionForms(forms, sessionId);
  };

  /// Retrieve a single AIA form entry by ID.
  public query func getAIAForm(formId : Text) : async ?AIAFormEntry {
    OACLib.getForm(forms, formId);
  };

  /// Update the field data on an existing AIA form entry.
  public shared func updateAIAForm(
    formId : Text,
    fieldData : [(Text, Text)],
  ) : async Bool {
    OACLib.updateForm(forms, formId, fieldData);
  };

  // ---------------------------------------------------------------------------
  // Zoom settings
  // ---------------------------------------------------------------------------

  /// Persist Zoom API credentials and fixed role links.
  public shared func saveZoomSettings(settings : ZoomSettings) : async Bool {
    oacState.zoomSettings := ?settings;
    true;
  };

  /// Retrieve stored Zoom credentials (clientSecret masked as empty string).
  public query func getZoomSettings() : async ?ZoomSettings {
    switch (oacState.zoomSettings) {
      case null { null };
      case (?s) {
        ?{ s with clientSecret = "" };
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Zoom meeting generation via HTTP outcalls
  // ---------------------------------------------------------------------------

  /// Generate a new Zoom meeting via the Zoom API and associate the link with the session.
  public shared func generateZoomMeeting(
    sessionId : Text,
    topic : Text,
  ) : async ZoomMeetingResult {
    switch (oacState.zoomSettings) {
      case null { #err("Zoom credentials not configured") };
      case (?settings) {
        if (settings.clientId == "" or settings.clientSecret == "") {
          return #err("Zoom clientId and clientSecret must be set");
        };

        // Step 1: Obtain OAuth bearer token via account_credentials grant
        let credentials = settings.clientId # ":" # settings.clientSecret;
        let b64 = base64Encode(credentials.encodeUtf8());
        let tokenUrl = "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" # settings.clientId;

        let tokenHeaders : [Outcall.Header] = [
          { name = "Authorization"; value = "Basic " # b64 },
          { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
        ];

        let tokenBody = await Outcall.httpPostRequest(tokenUrl, tokenHeaders, "", zoomTransform);

        let accessToken = extractJsonField(tokenBody, "access_token");
        if (accessToken == "") {
          return #err("Failed to parse access_token: " # tokenBody);
        };

        // Step 2: Create meeting
        let meetingBodyText = "{\"topic\":\"" # topic # "\",\"type\":2,\"duration\":60}";
        let meetingHeaders : [Outcall.Header] = [
          { name = "Authorization"; value = "Bearer " # accessToken },
          { name = "Content-Type"; value = "application/json" },
        ];

        let meetingResp = await Outcall.httpPostRequest(
          "https://api.zoom.us/v2/meetings",
          meetingHeaders,
          meetingBodyText,
          zoomTransform,
        );

        let joinUrl = extractJsonField(meetingResp, "join_url");
        let meetingId = extractJsonField(meetingResp, "id");
        if (joinUrl == "") {
          return #err("Failed to parse join_url: " # meetingResp);
        };
        ignore OACLib.updateSessionZoomLink(sessions, sessionId, joinUrl, meetingId);
        #ok({ joinUrl; meetingId });
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Fixed Zoom links per role
  // ---------------------------------------------------------------------------

  /// Set or replace the fixed Zoom link for a specific role.
  public shared func setFixedZoomLink(roleId : Text, zoomLink : Text) : async Bool {
    let current = switch (oacState.zoomSettings) {
      case null {
        { clientId = ""; clientSecret = ""; fixedZoomLinks = [] };
      };
      case (?s) { s };
    };
    // Replace existing entry for roleId or append a new one
    let existing = List.fromArray(current.fixedZoomLinks);
    var found = false;
    existing.mapInPlace(
      func((rid, lnk)) {
        if (rid == roleId) {
          found := true;
          (rid, zoomLink);
        } else {
          (rid, lnk);
        };
      }
    );
    if (not found) {
      existing.add((roleId, zoomLink));
    };
    oacState.zoomSettings := ?{ current with fixedZoomLinks = existing.toArray() };
    true;
  };

  // ---------------------------------------------------------------------------
  // Meeting package (clipboard copy helper)
  // ---------------------------------------------------------------------------

  /// Build a shareable meeting package (link, date, time, participant list).
  public query func getParticipantMeetingPackage(sessionId : Text) : async MeetingPackage {
    OACLib.buildMeetingPackageFromParticipants(sessions, participants, sessionId);
  };

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /// Naive base64 encoder for ASCII credentials (A–Z a–z 0–9 + / =).
  private func base64Encode(data : Blob) : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let charArr = chars.toArray();
    let bytes = data.toArray();
    var result = "";
    let n = bytes.size();
    var i = 0;
    while (i < n) {
      let b0 : Nat = bytes[i].toNat();
      let b1 : Nat = if (i + 1 < n) { bytes[i + 1].toNat() } else { 0 };
      let b2 : Nat = if (i + 2 < n) { bytes[i + 2].toNat() } else { 0 };
      let idx0 = b0 / 4;
      let idx1 = (b0 % 4) * 16 + b1 / 16;
      let idx2 = (b1 % 16) * 4 + b2 / 64;
      let idx3 = b2 % 64;
      result #= Text.fromChar(charArr[idx0]);
      result #= Text.fromChar(charArr[idx1]);
      result #= if (i + 1 < n) { Text.fromChar(charArr[idx2]) } else { "=" };
      result #= if (i + 2 < n) { Text.fromChar(charArr[idx3]) } else { "=" };
      i += 3;
    };
    result;
  };

  /// Returns the character at position `pos` in `str` (assumes ASCII).
  private func charAt(str : Text, pos : Nat) : Char {
    var idx = 0;
    for (c in str.chars()) {
      if (idx == pos) { return c };
      idx += 1;
    };
    Char.fromNat32(63);
  };

  
  /// Transforms HTTP response for IC consensus (strips non-deterministic headers).
  public shared query func zoomTransform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    { input.response with headers = [] };
  };

/// Extracts the string value of a top-level JSON key from a compact JSON body.
  /// Handles both string values (quoted) and number/bool values (unquoted).
  private func extractJsonField(json : Text, field : Text) : Text {
    let needle = "\"" # field # "\"";
    let jsonArr = json.toArray();
    let needleArr = needle.toArray();
    let jLen = jsonArr.size();
    let nLen = needleArr.size();
    let charSpace : Char = Char.fromNat32(32);
    let charColon : Char = Char.fromNat32(58);
    let charQuote : Char = Char.fromNat32(34);
    let charComma : Char = Char.fromNat32(44);
    let charCloseBrace : Char = Char.fromNat32(125);
    var i = 0;
    while (i + nLen <= jLen) {
      var match = true;
      var k = 0;
      while (k < nLen) {
        if (jsonArr[i + k] != needleArr[k]) { match := false };
        k += 1;
      };
      if (match) {
        var j = i + nLen;
        while (j < jLen and (jsonArr[j] == charSpace or jsonArr[j] == charColon)) { j += 1 };
        if (j < jLen and jsonArr[j] == charQuote) {
          j += 1;
          var value = "";
          while (j < jLen and jsonArr[j] != charQuote) {
            value #= Text.fromChar(jsonArr[j]);
            j += 1;
          };
          return value;
        } else {
          var value = "";
          while (j < jLen and jsonArr[j] != charComma and jsonArr[j] != charCloseBrace and jsonArr[j] != charSpace) {
            value #= Text.fromChar(jsonArr[j]);
            j += 1;
          };
          return value;
        };
      };
      i += 1;
    };
    "";
  };

};
