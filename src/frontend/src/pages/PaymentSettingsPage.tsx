import type {
  PaymentMethodInfo,
  VerificationDocument,
} from "@/hooks/useSubscription";
import {
  useAddPaymentMethod,
  useGetDocumentReviewStatus,
  useGetPaymentMethods,
  useSubmitDocumentForReview,
} from "@/hooks/useSubscription";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Lock,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const DOC_TYPES: { key: string; label: string }[] = [
  { key: "EIN", label: "EIN / Tax ID Document" },
  { key: "proof_of_address", label: "Proof of Address" },
  { key: "government_id", label: "Government-Issued ID" },
];

function DocStatusBadge({ status }: { status: string }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-400">
        <CheckCircle2 className="h-3 w-3" /> Verified
      </span>
    );
  if (status === "pending")
    return (
      <span className="admin-pending-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
        <AlertCircle className="h-3 w-3" /> Pending Review
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
        <AlertCircle className="h-3 w-3" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      Not Uploaded
    </span>
  );
}

function DocRow({
  docType,
  documents,
}: {
  docType: { key: string; label: string };
  documents: VerificationDocument[];
}) {
  const submitDoc = useSubmitDocumentForReview();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const existing = documents.find((d) => d.documentType === docType.key);
  const status = existing?.status ?? "not_uploaded";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Use file name as storage key (object-storage would return a real key)
      const storageKey = `docs/${docType.key}/${Date.now()}_${file.name}`;
      await submitDoc.mutateAsync({ documentType: docType.key, storageKey });
      toast.success(`${docType.label} uploaded successfully`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
          <Upload className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{docType.label}</p>
          {existing?.submittedAt && (
            <p className="text-xs text-muted-foreground">
              Submitted{" "}
              {new Date(
                Number(existing.submittedAt) / 1_000_000,
              ).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DocStatusBadge status={status} />
        {status === "not_uploaded" || status === "rejected" ? (
          <>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
              data-ocid={`payment_settings.doc_upload.${docType.key}`}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
            >
              {uploading ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PaymentCard({ card }: { card: PaymentMethodInfo }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-amber-500/25 bg-card p-4">
      <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-secondary text-xs font-bold uppercase text-foreground">
        {card.brand}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          •••• •••• •••• {card.last4}
        </p>
        <p className="text-xs text-muted-foreground">
          Expires {card.expMonth.toString().padStart(2, "0")}/{card.expYear}
          {card.isDefault ? " · Default" : ""}
        </p>
      </div>
      {card.isDefault && (
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          Default
        </span>
      )}
    </div>
  );
}

export default function PaymentSettingsPage() {
  const paymentMethods = useGetPaymentMethods();
  const documents = useGetDocumentReviewStatus();
  const addPaymentMethod = useAddPaymentMethod();

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardholderName: "",
    setupIntentId: "",
  });

  const formatCard = (val: string) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})/g, "$1 ")
      .trim();

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return d;
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPaymentMethod.mutateAsync({
        setupIntentId: cardForm.setupIntentId,
      });
      toast.success("Payment method added successfully");
      setCardForm({
        cardNumber: "",
        expiry: "",
        cvc: "",
        cardholderName: "",
        setupIntentId: "",
      });
    } catch {
      toast.error("Failed to add payment method. Please try again.");
    }
  };

  const docs = documents.data ?? [];
  const cards = paymentMethods.data ?? [];

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
      data-ocid="payment_settings.page"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Payment &amp; Billing
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your payment method and verification documents
        </p>
      </div>

      {/* Payment Method on File */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Payment Method on File
          </h2>
        </div>
        <div className="space-y-3" data-ocid="payment_settings.cards_list">
          {paymentMethods.isLoading ? (
            <div
              className="h-16 animate-pulse rounded-lg bg-card"
              data-ocid="payment_settings.loading_state"
            />
          ) : cards.length === 0 ? (
            <div
              className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground"
              data-ocid="payment_settings.no_cards_state"
            >
              No payment method on file.
            </div>
          ) : (
            cards.map((card) => <PaymentCard key={card.id} card={card} />)
          )}
        </div>

        {/* Add Payment Method */}
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-card p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-foreground">
            Add Payment Method
          </h3>
          <form
            onSubmit={handleAddCard}
            className="space-y-4"
            data-ocid="payment_settings.add_card_form"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="ps-cardNumber"
                  className="mb-1.5 block text-sm text-foreground"
                >
                  Card Number
                </label>
                <div className="relative">
                  <input
                    id="ps-cardNumber"
                    inputMode="numeric"
                    placeholder="•••• •••• •••• ••••"
                    value={cardForm.cardNumber}
                    onChange={(e) =>
                      setCardForm((p) => ({
                        ...p,
                        cardNumber: formatCard(e.target.value),
                      }))
                    }
                    maxLength={19}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    data-ocid="payment_settings.card_number_input"
                  />
                  <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label
                  htmlFor="ps-expiry"
                  className="mb-1.5 block text-sm text-foreground"
                >
                  Expiry (MM/YY)
                </label>
                <input
                  id="ps-expiry"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={cardForm.expiry}
                  onChange={(e) =>
                    setCardForm((p) => ({
                      ...p,
                      expiry: formatExpiry(e.target.value),
                    }))
                  }
                  maxLength={5}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-ocid="payment_settings.expiry_input"
                />
              </div>
              <div>
                <label
                  htmlFor="ps-cvc"
                  className="mb-1.5 block text-sm text-foreground"
                >
                  CVC
                </label>
                <div className="relative">
                  <input
                    id="ps-cvc"
                    inputMode="numeric"
                    placeholder="123"
                    value={cardForm.cvc}
                    onChange={(e) =>
                      setCardForm((p) => ({
                        ...p,
                        cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    maxLength={4}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    data-ocid="payment_settings.cvc_input"
                  />
                  <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="ps-cardholder"
                  className="mb-1.5 block text-sm text-foreground"
                >
                  Cardholder Name
                </label>
                <input
                  id="ps-cardholder"
                  placeholder="Jane Smith"
                  value={cardForm.cardholderName}
                  onChange={(e) =>
                    setCardForm((p) => ({
                      ...p,
                      cardholderName: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-ocid="payment_settings.cardholder_input"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="ps-setup-intent"
                  className="mb-1.5 block text-sm text-foreground"
                >
                  Stripe Setup Intent ID
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    — provided by Stripe checkout
                  </span>
                </label>
                <input
                  id="ps-setup-intent"
                  placeholder="seti_xxxxxxxxxxxxxxxx"
                  value={cardForm.setupIntentId}
                  onChange={(e) =>
                    setCardForm((p) => ({
                      ...p,
                      setupIntentId: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-ocid="payment_settings.setup_intent_input"
                />
              </div>
            </div>

            {/* Stripe badge */}
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
              <Lock className="h-4 w-4 text-primary" />
              <p className="text-xs text-primary">
                Secured by Stripe — your card data is encrypted end-to-end
              </p>
            </div>

            {addPaymentMethod.isError && (
              <div
                className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="payment_settings.error_state"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {addPaymentMethod.error?.message ??
                  "Failed to add card. Please try again."}
              </div>
            )}

            <button
              type="submit"
              disabled={addPaymentMethod.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-primary py-2.5 text-sm font-semibold text-foreground shadow transition-all hover:opacity-90 disabled:opacity-50"
              data-ocid="payment_settings.add_card_button"
            >
              {addPaymentMethod.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving…
                </span>
              ) : (
                "Save Payment Method"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Verification Documents */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-accent" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Verification Documents
          </h2>
        </div>
        <div className="space-y-3" data-ocid="payment_settings.documents_list">
          {documents.isLoading ? (
            <div
              className="h-16 animate-pulse rounded-lg bg-card"
              data-ocid="payment_settings.docs_loading_state"
            />
          ) : (
            DOC_TYPES.map((dt) => (
              <DocRow key={dt.key} docType={dt} documents={docs} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
