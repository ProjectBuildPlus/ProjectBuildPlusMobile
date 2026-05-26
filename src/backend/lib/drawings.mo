import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Types "../types/drawings";
import OACTypes "../types/oac-meeting";

module {

  public type Drawing             = Types.Drawing;
  public type DrawingCategory     = Types.DrawingCategory;
  public type DrawingFileType     = Types.DrawingFileType;
  public type ReviewRequest       = Types.ReviewRequest;
  public type DrawingNotification = Types.DrawingNotification;

  // ---------------------------------------------------------------------------
  // Drawing CRUD
  // ---------------------------------------------------------------------------

  public func addDrawing(
    store   : Map.Map<Text, Drawing>,
    drawing : Drawing
  ) : Drawing {
    store.add(drawing.id, drawing);
    drawing;
  };

  public func getDrawings(store : Map.Map<Text, Drawing>) : [Drawing] {
    let all = List.empty<Drawing>();
    for ((_, d) in store.entries()) { all.add(d) };
    List.toArray(all);
  };

  public func getDrawingById(
    store : Map.Map<Text, Drawing>,
    id    : Text
  ) : ?Drawing {
    store.get(id);
  };

  public func deleteDrawing(
    store : Map.Map<Text, Drawing>,
    id    : Text
  ) : Bool {
    store.remove(id);
    true;
  };

  // ---------------------------------------------------------------------------
  // Review Requests
  // ---------------------------------------------------------------------------

  public func createReviewRequest(
    store    : Map.Map<Text, ReviewRequest>,
    request  : ReviewRequest
  ) : ReviewRequest {
    store.add(request.id, request);
    request;
  };

  public func getReviewRequests(store : Map.Map<Text, ReviewRequest>) : [ReviewRequest] {
    let all = List.empty<ReviewRequest>();
    for ((_, r) in store.entries()) { all.add(r) };
    let arr = List.toArray(all);
    Array.sort<ReviewRequest>(arr, func(a, b) { Int.compare(b.requestedAt, a.requestedAt) });
  };

  public func getReviewRequestsByDrawing(
    store     : Map.Map<Text, ReviewRequest>,
    drawingId : Text
  ) : [ReviewRequest] {
    let all = List.empty<ReviewRequest>();
    for ((_, r) in store.entries()) {
      if (r.drawingId == drawingId) { all.add(r) };
    };
    List.toArray(all);
  };

  public func updateReviewRequest(
    store  : Map.Map<Text, ReviewRequest>,
    id     : Text,
    status : Text,
    notes  : Text
  ) : ?ReviewRequest {
    switch (store.get(id)) {
      case null { null };
      case (?req) {
        let updated = { req with status; notes };
        store.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteReviewRequest(
    store     : Map.Map<Text, ReviewRequest>,
    formsStore : Map.Map<Text, OACTypes.AIAFormEntry>,
    id        : Text
  ) : Bool {
    switch (store.get(id)) {
      case (?req) {
        switch (req.oacFormId) {
          case (?formId) { formsStore.remove(formId) };
          case null {};
        };
      };
      case null {};
    };
    store.remove(id);
    true;
  };

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------

  public func createDrawingNotification(
    store        : Map.Map<Text, DrawingNotification>,
    notification : DrawingNotification
  ) : DrawingNotification {
    store.add(notification.id, notification);
    notification;
  };

  public func getDrawingNotifications(
    store : Map.Map<Text, DrawingNotification>
  ) : [DrawingNotification] {
    let all = List.empty<DrawingNotification>();
    for ((_, n) in store.entries()) { all.add(n) };
    List.toArray(all);
  };

  public func dismissNotification(
    store : Map.Map<Text, DrawingNotification>,
    id    : Text
  ) : Bool {
    switch (store.get(id)) {
      case null { false };
      case (?notif) {
        store.add(id, { notif with dismissed = true });
        true;
      };
    };
  };

};
