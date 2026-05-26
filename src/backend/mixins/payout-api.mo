import PayoutTypes "../types/payout";
import PayoutLib "../lib/payout";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

mixin (
  bankAccountStore : { var bankAccount : ?PayoutTypes.BankAccount },
  payoutStore      : { var payoutRecords : List.List<PayoutTypes.PayoutRecord>; var nextPayoutDate : ?Text },
  _controller      : Principal
) {

  /// Save or update the bank account — controller only.
  /// Validates routing number must be exactly 9 digits.
  public shared ({ caller }) func saveBankAccount(
    holderName         : Text,
    accountNumberLast4 : Text,
    routingNumber      : Text
  ) : async () {
    PayoutLib.assertController(caller, _controller);
    if (not PayoutLib.isValidRoutingNumber(routingNumber)) {
      Runtime.trap("Invalid routing number: must be exactly 9 digits");
    };
    bankAccountStore.bankAccount := ?{
      accountHolderName  = holderName;
      accountNumberLast4 = accountNumberLast4;
      routingNumber      = routingNumber;
      isVerified         = false;
      connectedToStripe  = false;
      nextPayoutDate     = payoutStore.nextPayoutDate;
    };
  };

  /// Retrieve the stored bank account — controller only.
  public shared query ({ caller }) func getBankAccount() : async ?PayoutTypes.BankAccount {
    PayoutLib.assertController(caller, _controller);
    bankAccountStore.bankAccount;
  };

  /// Store up to the last 5 payout records — controller only.
  public shared ({ caller }) func savePayoutRecords(records : [PayoutTypes.PayoutRecord]) : async () {
    PayoutLib.assertController(caller, _controller);
    let incoming = List.empty<PayoutTypes.PayoutRecord>();
    for (r in records.vals()) { incoming.add(r) };
    payoutStore.payoutRecords := PayoutLib.trimToLast5(incoming);
  };

  /// Retrieve the stored payout records — controller only.
  public shared query ({ caller }) func getPayoutRecords() : async [PayoutTypes.PayoutRecord] {
    PayoutLib.assertController(caller, _controller);
    payoutStore.payoutRecords.toArray();
  };

  /// Set the next payout date — controller only.
  public shared ({ caller }) func setNextPayoutDate(date : Text) : async () {
    PayoutLib.assertController(caller, _controller);
    payoutStore.nextPayoutDate := ?date;
    // Mirror into bankAccount if present
    switch (bankAccountStore.bankAccount) {
      case (?ba) {
        bankAccountStore.bankAccount := ?{ ba with nextPayoutDate = ?date };
      };
      case null {};
    };
  };

  /// Retrieve the next payout date — controller only.
  public shared query ({ caller }) func getNextPayoutDate() : async ?Text {
    PayoutLib.assertController(caller, _controller);
    payoutStore.nextPayoutDate;
  };
};
