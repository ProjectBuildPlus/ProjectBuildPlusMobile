import Map "mo:core/Map";
import ShareLinkTypes "../types/share-link";
import ShareLinkLib "../lib/share-links";

mixin (shareLinks : Map.Map<Text, ShareLinkTypes.ShareLink>) {

  public type ShareLink = ShareLinkTypes.ShareLink;

  public shared func generateShareLink(projectId : Text) : async ShareLink {
    ShareLinkLib.createShareLink(shareLinks, projectId);
  };

  public shared func deactivateShareLink(token : Text) : async Bool {
    ShareLinkLib.deactivate(shareLinks, token);
  };

  public query func getShareLink(token : Text) : async ?ShareLink {
    ShareLinkLib.getByToken(shareLinks, token);
  };

  public query func getProjectShareLinks(projectId : Text) : async [ShareLink] {
    ShareLinkLib.getByProject(shareLinks, projectId);
  };

};
