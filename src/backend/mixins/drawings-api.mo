import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/drawings";
import OACTypes "../types/oac-meeting";
import OACLib "../lib/oac-meeting";

mixin (
  drawingsStore     : Map.Map<Text, Types.Drawing>,
  reviewStore       : Map.Map<Text, Types.ReviewRequest>,
  notificationStore : Map.Map<Text, Types.DrawingNotification>,
  oacSessions       : Map.Map<Text, OACTypes.OACMeetingSession>,
  oacForms          : Map.Map<Text, OACTypes.AIAFormEntry>
) {

  // -------------------------------------------------------------------------
  // Drawings
  // -------------------------------------------------------------------------

  public shared (msg) func addDrawing(
    name        : Text,
    category    : Types.DrawingCategory,
    fileType    : Types.DrawingFileType,
    storageKey  : Text,
    description : Text
  ) : async Types.Drawing {
    let id = name # "-" # debug_show(Time.now());
    let drawing : Types.Drawing = {
      id;
      name;
      category;
      fileType;
      storageKey;
      uploadedBy  = msg.caller.toText();
      uploadedAt  = Time.now();
      description;
    };
    drawingsStore.add(id, drawing);
    drawing;
  };

  public query func getDrawings() : async [Types.Drawing] {
    let all = List.empty<Types.Drawing>();
    for ((_, d) in drawingsStore.entries()) { all.add(d) };
    all.toArray();
  };

  public shared func deleteDrawing(id : Text) : async Bool {
    drawingsStore.remove(id);
    true;
  };

  // -------------------------------------------------------------------------
  // Review Requests
  // -------------------------------------------------------------------------

  public shared (msg) func createReviewRequest(
    drawingId   : Text,
    notes       : Text
  ) : async ?(Types.ReviewRequest, Types.DrawingNotification) {
    switch (drawingsStore.get(drawingId)) {
      case null { null };
      case (?drawing) {
        let now     = Time.now();
        let reqId   = drawingId # "-req-" # debug_show(now);
        let notifId = drawingId # "-notif-" # debug_show(now);
        let caller  = msg.caller.toText();

        // Find the most recent OAC session (sorted by createdAt desc) and create an addendum
        var latestSessionId : ?Text = null;
        var latestCreatedAt : Int   = 0;
        for ((_, s) in oacSessions.entries()) {
          if (s.createdAt >= latestCreatedAt) {
            latestCreatedAt := s.createdAt;
            latestSessionId := ?s.id;
          };
        };

        let oacFormId : ?Text = switch (latestSessionId) {
          case null { null };
          case (?sessionId) {
            let fields : [(Text, Text)] = [
              ("reviewRequestId", reqId),
              ("drawingId",       drawingId),
              ("drawingName",     drawing.name),
              ("requestedBy",     caller),
              ("requestedAt",     debug_show(now)),
              ("notes",           notes),
            ];
            let (formId, _) = OACLib.saveForm(oacForms, sessionId, #Addendum, fields, caller);
            ?formId;
          };
        };

        let request : Types.ReviewRequest = {
          id          = reqId;
          drawingId;
          requestedBy = caller;
          requestedAt = now;
          status      = "pending";
          notes;
          oacFormId;
        };
        let notification : Types.DrawingNotification = {
          id          = notifId;
          drawingId;
          drawingName = drawing.name;
          requestedBy = caller;
          requestedAt = now;
          dismissed   = false;
        };
        reviewStore.add(reqId, request);
        notificationStore.add(notifId, notification);
        ?(request, notification);
      };
    };
  };

  public query func getReviewRequests() : async [Types.ReviewRequest] {
    let all = List.empty<Types.ReviewRequest>();
    for ((_, r) in reviewStore.entries()) { all.add(r) };
    let arr = all.toArray();
    arr.sort<Types.ReviewRequest>(func(a, b) { Int.compare(b.requestedAt, a.requestedAt) });
  };

  public shared func updateReviewRequest(
    id     : Text,
    status : Text,
    notes  : Text
  ) : async ?Types.ReviewRequest {
    switch (reviewStore.get(id)) {
      case null { null };
      case (?req) {
        let updated = { req with status; notes };
        reviewStore.add(id, updated);
        ?updated;
      };
    };
  };

  public shared func deleteReviewRequest(id : Text) : async Bool {
    switch (reviewStore.get(id)) {
      case (?req) {
        switch (req.oacFormId) {
          case (?formId) { oacForms.remove(formId) };
          case null {};
        };
      };
      case null {};
    };
    reviewStore.remove(id);
    true;
  };

  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------

  public query func getDrawingNotifications() : async [Types.DrawingNotification] {
    let all = List.empty<Types.DrawingNotification>();
    for ((_, n) in notificationStore.entries()) { all.add(n) };
    all.toArray();
  };

  public shared func dismissDrawingNotification(id : Text) : async Bool {
    switch (notificationStore.get(id)) {
      case null { false };
      case (?notif) {
        notificationStore.add(id, { notif with dismissed = true });
        true;
      };
    };
  };

};
