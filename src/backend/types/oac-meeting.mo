module {

  public type FormType = {
    #G702;
    #G703;
    #G701;
    #MeetingMinutes;
    #Addendum;
  };

  public type ActionItem = {
    item : Text;
    owner : Text;
    dueDate : Text;
  };

  public type MeetingMinutesData = {
    attendees : [Text];
    agendaItems : [Text];
    decisions : [Text];
    actionItems : [ActionItem];
  };

  public type OACMeetingSession = {
    id : Text;
    projectId : Text;
    sessionDate : Text;
    sessionTime : Text;
    zoomLink : ?Text;
    zoomMeetingId : ?Text;
    createdAt : Int;
    linkedCategoryId : ?Text;
  };

  public type AIAFormEntry = {
    id : Text;
    sessionId : Text;
    formType : FormType;
    fieldData : [(Text, Text)];
    submittedByRole : Text;
    submittedAt : Int;
    lastModified : Int;
  };

  // (roleId, zoomLink) tuples
  public type ZoomSettings = {
    clientId : Text;
    clientSecret : Text;
    fixedZoomLinks : [(Text, Text)];
  };

  public type ZoomMeetingResult = {
    #ok : { joinUrl : Text; meetingId : Text };
    #err : Text;
  };

  public type MeetingPackage = {
    link : Text;
    date : Text;
    time : Text;
    participants : [Text];
  };

};
