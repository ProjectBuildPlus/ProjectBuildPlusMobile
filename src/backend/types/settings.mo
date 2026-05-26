module {

  public type RSMeansSettings = {
    apiKey : ?Text;
    apiEnabled : Bool;
    lastTestStatus : ?Text;
  };

  public type AccessControlMode = {
    #RoleGated;
    #ProjectManagerOnly;
  };

  public type AppSettings = {
    rsMeansSettings : RSMeansSettings;
    accessControlMode : AccessControlMode;
    projectManagerId : ?Text;
    activeCategoryId : ?Text;
    activeSubtopicId : ?Text;
  };

};
