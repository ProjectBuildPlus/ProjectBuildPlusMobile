import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import ShareLinkTypes "../types/share-link";

module {

  public type ShareLink = ShareLinkTypes.ShareLink;

  // Token chars: A-Z, a-z, 0-9 (62 chars)
  let CHARS : [Nat32] = [
    65,  66,  67,  68,  69,  70,  71,  72,  73,  74,  75,  76,  77,
    78,  79,  80,  81,  82,  83,  84,  85,  86,  87,  88,  89,  90,
    97,  98,  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
    110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
    48,  49,  50,  51,  52,  53,  54,  55,  56,  57,
  ];

  // Generate a 32-char pseudo-random alphanumeric token from Time.now() and projectId
  public func generateToken(projectId : Text) : Text {
    let t = Time.now();
    var seed : Nat = Int.abs(t);
    // Mix projectId characters into the seed
    for (c in projectId.chars()) {
      seed := seed * 31 + c.toNat32().toNat();
    };
    var token = "";
    let len = 32;
    var i = 0;
    while (i < len) {
      seed := (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296;
      let idx = seed % 62;
      let charCode = CHARS[idx];
      token #= Char.fromNat32(charCode).toText();
      i += 1;
    };
    token;
  };

  public func createShareLink(
    links : Map.Map<Text, ShareLink>,
    projectId : Text,
  ) : ShareLink {
    let token = generateToken(projectId);
    let link : ShareLink = {
      id = token;
      token;
      projectId;
      createdAt = Time.now();
      isActive = true;
    };
    links.add(token, link);
    link;
  };

  public func deactivate(
    links : Map.Map<Text, ShareLink>,
    token : Text,
  ) : Bool {
    switch (links.get(token)) {
      case null { false };
      case (?link) {
        links.add(token, { link with isActive = false });
        true;
      };
    };
  };

  public func getByToken(
    links : Map.Map<Text, ShareLink>,
    token : Text,
  ) : ?ShareLink {
    links.get(token);
  };

  public func getByProject(
    links : Map.Map<Text, ShareLink>,
    projectId : Text,
  ) : [ShareLink] {
    let acc = List.empty<ShareLink>();
    for ((_, link) in links.entries()) {
      if (link.projectId == projectId) {
        acc.add(link);
      };
    };
    acc.toArray();
  };

};
