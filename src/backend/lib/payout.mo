import PayoutTypes "../types/payout";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  public let CONTROLLER_EMAIL = "pwarre12@mail.ccsf.edu";
  public let MAX_PAYOUT_RECORDS = 5;

  /// Validates that a routing number is exactly 9 digits.
  public func isValidRoutingNumber(r : Text) : Bool {
    if (r.size() != 9) return false;
    for (c in r.chars()) {
      if (c < '0' or c > '9') return false;
    };
    true;
  };

  /// Returns at most the last MAX_PAYOUT_RECORDS entries from the supplied list.
  public func trimToLast5(records : List.List<PayoutTypes.PayoutRecord>) : List.List<PayoutTypes.PayoutRecord> {
    let all = records.toArray();
    let size = all.size();
    let start = if (size > MAX_PAYOUT_RECORDS) size - MAX_PAYOUT_RECORDS else 0;
    let trimmed = List.empty<PayoutTypes.PayoutRecord>();
    var i = start;
    while (i < size) {
      trimmed.add(all[i]);
      i += 1;
    };
    trimmed;
  };

  /// Asserts caller is the designated controller principal or traps.
  public func assertController(caller : Principal, controller : Principal) {
    if (caller != controller) {
      Runtime.trap("Unauthorized: controller only");
    };
  };
};
