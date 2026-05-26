import Types "../types/settings";

module {

  public type RSMeansSettings = Types.RSMeansSettings;
  public type AppSettings = Types.AppSettings;

  // Mutable settings state record (passed by reference from actor)
  public type SettingsState = {
    var rsMeansSettings : RSMeansSettings;
    var accessControlMode : Types.AccessControlMode;
    var projectManagerId : ?Text;
    var activeCategoryId : ?Text;
    var activeSubtopicId : ?Text;
  };

  public func saveRSMeansSettings(
    state : SettingsState,
    settings : RSMeansSettings,
  ) : RSMeansSettings {
    state.rsMeansSettings := settings;
    settings;
  };

  public func getRSMeansSettings(
    state : SettingsState,
  ) : RSMeansSettings {
    state.rsMeansSettings;
  };

  public func buildRSMeansTestUrl() : Text {
    "https://api.gordian.com/v2/costdata/divisions?format=json";
  };

  public func buildRSMeansBenchmarkUrl(csiDivision : Text) : Text {
    "https://api.gordian.com/v2/costdata/lineitems?division=" # csiDivision # "&format=json";
  };

  public func saveAppSettings(
    state : SettingsState,
    settings : AppSettings,
  ) : AppSettings {
    state.rsMeansSettings := settings.rsMeansSettings;
    state.accessControlMode := settings.accessControlMode;
    state.projectManagerId := settings.projectManagerId;
    state.activeCategoryId := settings.activeCategoryId;
    state.activeSubtopicId := settings.activeSubtopicId;
    settings;
  };

  public func getAppSettings(
    state : SettingsState,
  ) : AppSettings {
    {
      rsMeansSettings = state.rsMeansSettings;
      accessControlMode = state.accessControlMode;
      projectManagerId = state.projectManagerId;
      activeCategoryId = state.activeCategoryId;
      activeSubtopicId = state.activeSubtopicId;
    };
  };

};
