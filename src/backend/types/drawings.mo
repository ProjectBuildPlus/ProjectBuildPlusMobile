module {

  public type DrawingCategory = {
    #Photographs;
    #Blueprints;
    #ArchitectDrawings;
    #ConstructionDrawings;
    #CADFiles;
    #EngineeringDrawings;
  };

  public type DrawingFileType = {
    #JPG;
    #PNG;
    #PDF;
    #DWG;
    #DXF;
  };

  public type Drawing = {
    id          : Text;
    name        : Text;
    category    : DrawingCategory;
    fileType    : DrawingFileType;
    storageKey  : Text;
    uploadedBy  : Text;
    uploadedAt  : Int;
    description : Text;
  };

  public type ReviewRequest = {
    id          : Text;
    drawingId   : Text;
    requestedBy : Text;
    requestedAt : Int;
    status      : Text; // pending | reviewed | dismissed
    notes       : Text;
    oacFormId   : ?Text; // linked OAC Meeting addendum form ID
  };

  public type DrawingNotification = {
    id          : Text;
    drawingId   : Text;
    drawingName : Text;
    requestedBy : Text;
    requestedAt : Int;
    dismissed   : Bool;
  };

};
