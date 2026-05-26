import SettingsTypes "../types/settings";
import SettingsLib "../lib/settings";
import Outcall "mo:caffeineai-http-outcalls/outcall";

mixin (settingsStore : SettingsLib.SettingsState) {

  public type RSMeansSettings = SettingsTypes.RSMeansSettings;
  public type AppSettings = SettingsTypes.AppSettings;

  public shared func saveRSMeansSettings(settings : RSMeansSettings) : async RSMeansSettings {
    SettingsLib.saveRSMeansSettings(settingsStore, settings);
  };

  public query func getRSMeansSettings() : async RSMeansSettings {
    SettingsLib.getRSMeansSettings(settingsStore);
  };

  public shared query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    { input.response with headers = [] };
  };

  public shared func testRSMeansConnection() : async Text {
    let settings = SettingsLib.getRSMeansSettings(settingsStore);
    switch (settings.apiKey) {
      case null { "RSMeans API key not configured" };
      case (?key) {
        let url = SettingsLib.buildRSMeansTestUrl();
        let headers : [Outcall.Header] = [
          { name = "Authorization"; value = "Bearer " # key },
          { name = "Content-Type"; value = "application/json" },
        ];
        try {
          let response = await Outcall.httpGetRequest(url, headers, transform);
          "Connection successful: " # response.size().toText() # " bytes received";
        } catch (e) {
          "Connection failed: " # e.message();
        };
      };
    };
  };

  public shared func fetchRSMeansBenchmarks(csiDivision : Text) : async Text {
    let settings = SettingsLib.getRSMeansSettings(settingsStore);
    switch (settings.apiKey) {
      case null { "RSMeans API key not configured — please configure in Settings" };
      case (?key) {
        let url = SettingsLib.buildRSMeansBenchmarkUrl(csiDivision);
        let headers : [Outcall.Header] = [
          { name = "Authorization"; value = "Bearer " # key },
          { name = "Content-Type"; value = "application/json" },
        ];
        try {
          await Outcall.httpGetRequest(url, headers, transform);
        } catch (e) {
          "Fetch failed: " # e.message();
        };
      };
    };
  };

  public shared func setActiveFilter(categoryId : ?Text, subtopicId : ?Text) : async () {
    settingsStore.activeCategoryId := categoryId;
    settingsStore.activeSubtopicId := subtopicId;
  };

  public query func getActiveFilter() : async (?Text, ?Text) {
    (settingsStore.activeCategoryId, settingsStore.activeSubtopicId);
  };

  public shared func saveAppSettings(settings : AppSettings) : async AppSettings {
    SettingsLib.saveAppSettings(settingsStore, settings);
  };

  public query func getAppSettings() : async AppSettings {
    SettingsLib.getAppSettings(settingsStore);
  };

};
