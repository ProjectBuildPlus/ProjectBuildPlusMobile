import {
  useGetPaymentMethods,
  useGetUserSubscription,
  useRenewSubscription,
  useSubmitDocumentForReview,
} from "@/hooks/useSubscription";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileCheck,
  RefreshCw,
  Upload,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

const PLAN_MONTHLY: Record<string, string> = {
  tier1year: "$299.00",
  tier5year: "$199.00",
  tier10year: "$99.00",
};

const PLAN_LABEL: Record<string, string> = {
  tier1year: "1-Year Plan",
  tier5year: "5-Year Plan",
  tier10year: "10-Year Plan",
};

const DOC_TYPES = [
  { key: "EIN", label: "EIN / Tax ID Document" },
  { key: "proof_of_address", label: "Proof of Address" },
  { key: "government_id", label: "Government-Issued ID" },
];

type UploadedDocs = Record<string, boolean>;

function UploadZone({
  docKey,
  label,
  uploaded,
  onUploaded,
}: {
  docKey: string;
  label: string;
  uploaded: boolean;
  onUploaded: (key: string) => void;
}) {
  const submitDoc = useSubmitDocumentForReview();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageKey = `renewal/${docKey}/${Date.now()}_${file.name}`;
      await submitDoc.mutateAsync({ documentType: docKey, storageKey });
      onUploaded(docKey);
      toast.success(`${label} uploaded`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      className={`upload-zone flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
        uploaded
          ? "border-green-500/50 bg-green-500/5"
          : "border-accent/40 hover:border-accent/70"
      }`}
      data-ocid={`renewal.doc_upload.${docKey}`}
    >
      {uploaded ? (
        <CheckCircle2 className="h-8 w-8 text-green-400" />
      ) : uploading ? (
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      ) : (
        <Upload className="h-8 w-8 text-accent/70" />
      )}
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        {uploaded
          ? "Uploaded — pending review"
          : "Click to upload or drag & drop"}
      </p>
      {!uploaded && (
        <>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-1 rounded-md border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Select File"}
          </button>
        </>
      )}
    </div>
  );
}

type StepId = 1 | 2 | 3;

function StepIndicator({
  current,
  _total,
}: { current: StepId; _total?: number }) {
  const steps = [
    { id: 1, label: "Documents" },
    { id: 2, label: "Payment" },
    { id: 3, label: "Confirm" },
  ];
  return (
    <div className="step-indicator mb-8 flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div
            className={`flex flex-col items-center gap-1 ${
              current === s.id
                ? "step-active"
                : current > s.id
                  ? "step-completed"
                  : "step-pending"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                current > s.id
                  ? "border-green-500 bg-green-500/20 text-green-400"
                  : current === s.id
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {current > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mb-5 h-0.5 w-16 transition-colors ${
                current > s.id + 1 || (current > s.id)
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function RenewalPage() {
  const navigate = useNavigate();
  const subscription = useGetUserSubscription();
  const paymentMethods = useGetPaymentMethods();
  const renewSubscription = useRenewSubscription();

  const [step, setStep] = useState<StepId>(1);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocs>({});

  const sub = subscription.data;
  const tierSlug = (sub?.tier as string | undefined) ?? "tier1year";
  const monthly = PLAN_MONTHLY[tierSlug] ?? "$299.00";
  const planLabel = PLAN_LABEL[tierSlug] ?? "1-Year Plan";

  const cards = paymentMethods.data ?? [];
  const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];

  const allDocsUploaded = DOC_TYPES.every((d) => uploadedDocs[d.key]);

  const handleDocUploaded = (key: string) =>
    setUploadedDocs((prev) => ({ ...prev, [key]: true }));

  const handleRenew = async () => {
    try {
      await renewSubscription.mutateAsync();
      toast.success("Subscription renewed successfully!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Renewal failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="border-b border-border px-6 py-10 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.02 265) 0%, oklch(0.12 0.01 250) 100%)",
        }}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-medium tracking-wide text-amber-300">
          <RefreshCw className="h-3 w-3" />
          SUBSCRIPTION RENEWAL
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground">
          Renew Your Subscription
        </h1>
        <p className="mt-2 text-muted-foreground">
          {planLabel} — {monthly}/month
        </p>
      </div>

      <div
        className="mx-auto max-w-2xl px-4 py-10 sm:px-6"
        data-ocid="renewal.page"
      >
        <StepIndicator current={step} />

        {/* Step 1: Documents */}
        {step === 1 && (
          <div className="verification-wizard rounded-xl border border-amber-500/30 bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Fresh Verification Documents
              </h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Upload fresh copies of your verification documents. These will be
              reviewed by our team before renewal activates.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {DOC_TYPES.map((d) => (
                <UploadZone
                  key={d.key}
                  docKey={d.key}
                  label={d.label}
                  uploaded={!!uploadedDocs[d.key]}
                  onUploaded={handleDocUploaded}
                />
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!allDocsUploaded}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-primary px-6 py-2.5 text-sm font-semibold text-foreground shadow transition-all hover:opacity-90 disabled:opacity-40"
                data-ocid="renewal.next_button.1"
              >
                Next: Confirm Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="renewal-card rounded-xl border border-amber-500/30 bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Confirm Payment Method
              </h2>
            </div>
            {defaultCard ? (
              <div
                className="rounded-lg border border-border bg-card/60 p-4"
                data-ocid="renewal.payment_card"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-secondary text-xs font-bold uppercase text-foreground">
                    {defaultCard.brand}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      •••• •••• •••• {defaultCard.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {defaultCard.expMonth.toString().padStart(2, "0")}
                      /{defaultCard.expYear}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  This card will be charged{" "}
                  <strong className="text-foreground">{monthly}</strong> upon
                  renewal.
                </p>
              </div>
            ) : (
              <div
                className="rounded-lg border border-border bg-card p-4 text-center"
                data-ocid="renewal.no_card_state"
              >
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-400" />
                <p className="text-sm text-muted-foreground mb-3">
                  No payment method on file.
                </p>
                <a
                  href="/payment-settings"
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <CreditCard className="h-4 w-4" />
                  Add Payment Method
                </a>
              </div>
            )}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                data-ocid="renewal.back_button.2"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!defaultCard}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-primary px-6 py-2.5 text-sm font-semibold text-foreground shadow transition-all hover:opacity-90 disabled:opacity-40"
                data-ocid="renewal.next_button.2"
              >
                Next: Confirm Renewal
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div
            className="renewal-card rounded-xl border border-amber-500/30 bg-card p-6"
            data-ocid="renewal.confirm_step"
          >
            <div className="mb-5 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Confirm Renewal
              </h2>
            </div>
            <div className="space-y-3 rounded-lg border border-border bg-background/60 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground">{planLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly amount</span>
                <span className="font-medium text-foreground">
                  {monthly}/month
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-foreground">
                  {defaultCard ? `•••• ${defaultCard.last4}` : "Card on file"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium text-green-400">
                  Submitted for review
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Payment will be charged using your card on file immediately upon
              renewal confirmation. Your fresh identity documents will be
              reviewed by our team.
            </p>
            {renewSubscription.isError && (
              <div
                className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="renewal.error_state"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {renewSubscription.error?.message ??
                  "Renewal failed. Please try again."}
              </div>
            )}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                data-ocid="renewal.back_button.3"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRenew}
                disabled={
                  renewSubscription.isPending ||
                  !allDocsUploaded ||
                  !defaultCard
                }
                className="rounded-lg bg-gradient-to-r from-amber-500 to-primary px-8 py-2.5 text-sm font-semibold text-foreground shadow transition-all hover:opacity-90 disabled:opacity-40"
                data-ocid="renewal.submit_button"
              >
                {renewSubscription.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Renewing…
                  </span>
                ) : (
                  "Confirm Renewal"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
