module {
  public type BankAccount = {
    accountHolderName  : Text;
    accountNumberLast4 : Text;
    routingNumber      : Text;
    isVerified         : Bool;
    connectedToStripe  : Bool;
    nextPayoutDate     : ?Text;
  };

  public type PayoutRecord = {
    amount : Float;
    date   : Text;
    status : Text; // "succeeded" | "failed" | "pending"
  };
};
