import type { SubscriptionTier } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useEnrollTrial,
  useSubmitDocumentForReview,
} from "@/hooks/useSubscription";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CloudUpload,
  CreditCard,
  Lock,
  Shield,
  User,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

const PLAN_CONFIG: Record<
  string,
  {
    tier: SubscriptionTier;
    label: string;
    monthly: string;
    annual: string;
    months: string;
    chargeAmount: string;
  }
> = {
  "tier-1-year": {
    tier: "tier1year" as SubscriptionTier,
    label: "1-Year Plan",
    monthly: "$299",
    annual: "$3,588",
    months: "12 months",
    chargeAmount: "$299.00",
  },
  "tier-5-year": {
    tier: "tier5year" as SubscriptionTier,
    label: "5-Year Plan",
    monthly: "$199",
    annual: "$2,388/yr",
    months: "60 months",
    chargeAmount: "$199.00",
  },
  "tier-10-year": {
    tier: "tier10year" as SubscriptionTier,
    label: "10-Year Plan",
    monthly: "$99",
    annual: "$1,188/yr",
    months: "120 months",
    chargeAmount: "$99.00",
  },
};

type AccountType = "corporate" | "personal";
type WizardStep = 1 | 2 | 3 | 4;

const DOC_TYPES = [
  { key: "EIN", label: "EIN / Tax ID Document" },
  { key: "proof_of_address", label: "Proof of Address" },
  { key: "government_id", label: "Government-Issued ID" },
];

function StepProgressBar({ step }: { step: WizardStep }) {
  const labels = ["Account Type", "Identity & Info", "Documents", "Review"];
  return (
    <div
      className="step-indicator mb-8 flex items-center justify-center gap-0"
      data-ocid="trial.step_indicator"
    >
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <div
            className={`flex flex-col items-center gap-1 ${
              step === i + 1
                ? "step-active"
                : step > i + 1
                  ? "step-completed"
                  : "step-pending"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                step > i + 1
                  ? "border-green-500 bg-green-500/20 text-green-400"
                  : step === i + 1
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className="hidden text-xs font-medium text-muted-foreground sm:block">
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div
              className={`mb-5 h-0.5 w-10 sm:w-16 transition-colors ${
                step > i + 1 ? "bg-primary/50" : "bg-muted"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function UploadZone({
  docKey,
  label,
  uploaded,
  fileName,
  onUploaded,
}: {
  docKey: string;
  label: string;
  uploaded: boolean;
  fileName?: string;
  onUploaded: (key: string, fileName: string) => void;
}) {
  const submitDoc = useSubmitDocumentForReview();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageKey = `trial/${docKey}/${Date.now()}_${file.name}`;
      await submitDoc.mutateAsync({ documentType: docKey, storageKey });
      onUploaded(docKey, file.name);
      toast.success(`${label} uploaded`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  return (
    <button
      type="button"
      disabled={uploaded}
      className={`upload-zone flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
        uploaded
          ? "border-green-500/50 bg-green-500/5 cursor-default"
          : "cursor-pointer border-accent/40 hover:border-accent/70 hover:bg-accent/5"
      }`}
      onClick={() => !uploaded && fileRef.current?.click()}
      data-ocid={`trial.doc_upload.${docKey}`}
    >
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFile}
      />
      {uploading ? (
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      ) : uploaded ? (
        <CheckCircle2 className="h-8 w-8 text-green-400" />
      ) : (
        <CloudUpload className="h-8 w-8 text-accent/70" />
      )}
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        {uploaded ? (fileName ?? "Uploaded") : "Click to upload or drag & drop"}
      </p>
    </button>
  );
}

export default function TrialEnrollPage() {
  const { tier: tierSlug } = useParams({ strict: false }) as { tier: string };
  const navigate = useNavigate();
  const plan = PLAN_CONFIG[tierSlug] ?? PLAN_CONFIG["tier-1-year"];
  const enrollTrial = useEnrollTrial();

  const [step, setStep] = useState<WizardStep>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const [corpForm, setCorpForm] = useState({
    businessName: "",
    ein: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
  });
  const [personalForm, setPersonalForm] = useState({
    fullName: "",
    ssn: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardholderName: "",
  });

  const formatCardNumber = (val: string) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})/g, "$1 ")
      .trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const allDocsUploaded = DOC_TYPES.every((d) => uploadedDocs[d.key]);

  const handleDocUploaded = (key: string, fileName: string) =>
    setUploadedDocs((prev) => ({ ...prev, [key]: fileName }));

  const handleSubmit = async () => {
    try {
      const name =
        accountType === "corporate"
          ? corpForm.businessName
          : personalForm.fullName;
      const _email =
        accountType === "corporate"
          ? corpForm.email
          : `user_${Date.now()}@pending.local`;
      const stripeCustomerId = `cus_${name.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
      const stripePaymentMethodId = `pm_${cardForm.cardNumber.replace(/\s/g, "").slice(-4)}`;
      await enrollTrial.mutateAsync({
        tier: plan.tier,
        stripeCustomerId,
        stripePaymentMethodId,
      });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 2000);
    } catch {
      // error shown in render
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div
          className="flex flex-col items-center gap-4 text-center"
          data-ocid="trial.success_state"
        >
          <CheckCircle2 className="h-16 w-16 text-green-400" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            Trial Started!
          </h2>
          <p className="text-muted-foreground">
            Your documents are pending review. Redirecting…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div
        className="relative overflow-hidden border-b border-border py-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.02 265) 0%, oklch(0.12 0.01 250) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, oklch(0.68 0.18 190 / 0.35) 0%, transparent 60%), radial-gradient(ellipse at 75% 40%, oklch(0.72 0.16 60 / 0.25) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-medium tracking-wide text-amber-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            30-DAY FREE TRIAL
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            <span className="text-red-400">Project</span>{" "}
            <span className="text-white">Build</span>{" "}
            <span className="text-blue-400">Plus</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Start your {plan.label} trial today — no charge until Day 29
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Plan summary sidebar */}
          <div className="md:col-span-2">
            <Card className="sticky top-6 border-amber-500/30 bg-card">
              <CardHeader className="pb-3">
                <Badge className="mb-2 w-fit bg-amber-500/15 text-amber-300 hover:bg-amber-500/20">
                  Selected Plan
                </Badge>
                <CardTitle className="font-display text-xl text-foreground">
                  {plan.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.monthly}
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.annual} · {plan.months}
                </p>
                <Separator className="border-border" />
                <div
                  className="rounded-lg border border-primary/30 bg-primary/5 p-3"
                  data-ocid="trial.charge_notice"
                >
                  <p className="text-xs font-medium text-primary">
                    💳 No charge today
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    First charge of{" "}
                    <strong className="text-foreground">
                      {plan.chargeAmount}
                    </strong>{" "}
                    on Day 29 at 11:59 PM.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
                  <p className="flex items-start gap-1.5 text-xs text-amber-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      <strong>Full commitment:</strong> After the trial, your{" "}
                      {plan.label} is a full {plan.months} commitment.
                    </span>
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {[
                    "Schedule crashing & leveling",
                    "Cash S-curve & SOV",
                    "Earned Value Management",
                    "CSI MasterFormat codes",
                    "OAC meeting & AIA forms",
                    "Safety standards & compliance",
                    "All devices — responsive & offline",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Wizard */}
          <div className="md:col-span-3">
            <div
              className="verification-wizard rounded-xl border border-amber-500/30 bg-card p-6"
              data-ocid="trial.wizard"
            >
              <StepProgressBar step={step} />

              {/* Step 1 — Account type */}
              {step === 1 && (
                <div data-ocid="trial.step_1">
                  <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
                    Select Account Type
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountType("corporate");
                        setStep(2);
                      }}
                      className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-background p-6 text-center transition-all hover:border-amber-500/60 hover:bg-amber-500/5"
                      data-ocid="trial.account_type_corporate"
                    >
                      <Building2 className="h-10 w-10 text-amber-400" />
                      <div>
                        <p className="font-semibold text-foreground">
                          Corporate / Business
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Official corporation or business entity
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountType("personal");
                        setStep(2);
                      }}
                      className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-background p-6 text-center transition-all hover:border-primary/60 hover:bg-primary/5"
                      data-ocid="trial.account_type_personal"
                    >
                      <User className="h-10 w-10 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          Personal
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Individual account holder
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — Identity & info */}
              {step === 2 && (
                <div className="verification-step" data-ocid="trial.step_2">
                  <h2 className="mb-5 font-display text-xl font-semibold text-foreground">
                    {accountType === "corporate"
                      ? "Business Information"
                      : "Personal Information"}
                  </h2>
                  <div className="space-y-4">
                    {accountType === "corporate" ? (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="bizName">Business Name</Label>
                            <Input
                              id="bizName"
                              placeholder="Acme Construction Inc."
                              value={corpForm.businessName}
                              onChange={(e) =>
                                setCorpForm((p) => ({
                                  ...p,
                                  businessName: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.business_name_input"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="ein">EIN / Tax ID</Label>
                            <Input
                              id="ein"
                              placeholder="XX-XXXXXXX"
                              value={corpForm.ein}
                              onChange={(e) =>
                                setCorpForm((p) => ({
                                  ...p,
                                  ein: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.ein_input"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="bizPhone">Business Phone</Label>
                            <Input
                              id="bizPhone"
                              type="tel"
                              placeholder="(555) 000-0000"
                              value={corpForm.phone}
                              onChange={(e) =>
                                setCorpForm((p) => ({
                                  ...p,
                                  phone: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.business_phone_input"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="bizEmail">Business Email</Label>
                            <Input
                              id="bizEmail"
                              type="email"
                              placeholder="contact@company.com"
                              value={corpForm.email}
                              onChange={(e) =>
                                setCorpForm((p) => ({
                                  ...p,
                                  email: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.business_email_input"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="bizStreet">Business Address</Label>
                            <Input
                              id="bizStreet"
                              placeholder="Street address"
                              value={corpForm.street}
                              onChange={(e) =>
                                setCorpForm((p) => ({
                                  ...p,
                                  street: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.business_street_input"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="bizCity">City</Label>
                            <Input
                              id="bizCity"
                              placeholder="Los Angeles"
                              value={corpForm.city}
                              onChange={(e) =>
                                setCorpForm((p) => ({
                                  ...p,
                                  city: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="bizState">State</Label>
                              <Input
                                id="bizState"
                                placeholder="CA"
                                maxLength={2}
                                value={corpForm.state}
                                onChange={(e) =>
                                  setCorpForm((p) => ({
                                    ...p,
                                    state: e.target.value,
                                  }))
                                }
                                required
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="bizZip">ZIP</Label>
                              <Input
                                id="bizZip"
                                placeholder="90001"
                                maxLength={10}
                                value={corpForm.zip}
                                onChange={(e) =>
                                  setCorpForm((p) => ({
                                    ...p,
                                    zip: e.target.value,
                                  }))
                                }
                                required
                                className="bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              placeholder="Jane Smith"
                              value={personalForm.fullName}
                              onChange={(e) =>
                                setPersonalForm((p) => ({
                                  ...p,
                                  fullName: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.full_name_input"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="ssn">SSN (last 4 stored)</Label>
                            <Input
                              id="ssn"
                              type="password"
                              placeholder="•••-••-XXXX"
                              maxLength={11}
                              value={personalForm.ssn}
                              onChange={(e) =>
                                setPersonalForm((p) => ({
                                  ...p,
                                  ssn: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.ssn_input"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="persPhone">Phone</Label>
                            <Input
                              id="persPhone"
                              type="tel"
                              placeholder="(555) 000-0000"
                              value={personalForm.phone}
                              onChange={(e) =>
                                setPersonalForm((p) => ({
                                  ...p,
                                  phone: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                              data-ocid="trial.phone_input"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="persStreet">
                              Residential Address
                            </Label>
                            <Input
                              id="persStreet"
                              placeholder="Street address"
                              value={personalForm.street}
                              onChange={(e) =>
                                setPersonalForm((p) => ({
                                  ...p,
                                  street: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="persCity">City</Label>
                            <Input
                              id="persCity"
                              placeholder="San Francisco"
                              value={personalForm.city}
                              onChange={(e) =>
                                setPersonalForm((p) => ({
                                  ...p,
                                  city: e.target.value,
                                }))
                              }
                              required
                              className="bg-background"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="persState">State</Label>
                              <Input
                                id="persState"
                                placeholder="CA"
                                maxLength={2}
                                value={personalForm.state}
                                onChange={(e) =>
                                  setPersonalForm((p) => ({
                                    ...p,
                                    state: e.target.value,
                                  }))
                                }
                                required
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="persZip">ZIP</Label>
                              <Input
                                id="persZip"
                                placeholder="94102"
                                maxLength={10}
                                value={personalForm.zip}
                                onChange={(e) =>
                                  setPersonalForm((p) => ({
                                    ...p,
                                    zip: e.target.value,
                                  }))
                                }
                                required
                                className="bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Card fields */}
                    <div className="mt-2 rounded-lg border border-border bg-background/60 p-4">
                      <p className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" /> Card
                        Details
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label htmlFor="wiz-card">Card Number</Label>
                          <div className="relative">
                            <Input
                              id="wiz-card"
                              inputMode="numeric"
                              placeholder="•••• •••• •••• ••••"
                              value={cardForm.cardNumber}
                              onChange={(e) =>
                                setCardForm((p) => ({
                                  ...p,
                                  cardNumber: formatCardNumber(e.target.value),
                                }))
                              }
                              required
                              maxLength={19}
                              autoComplete="cc-number"
                              className="bg-background pr-10"
                              data-ocid="trial.card_number_input"
                            />
                            <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="wiz-exp">Expiry (MM/YY)</Label>
                          <Input
                            id="wiz-exp"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={cardForm.expiry}
                            onChange={(e) =>
                              setCardForm((p) => ({
                                ...p,
                                expiry: formatExpiry(e.target.value),
                              }))
                            }
                            required
                            maxLength={5}
                            autoComplete="cc-exp"
                            className="bg-background"
                            data-ocid="trial.expiry_input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="wiz-cvc">CVC</Label>
                          <div className="relative">
                            <Input
                              id="wiz-cvc"
                              inputMode="numeric"
                              placeholder="123"
                              value={cardForm.cvc}
                              onChange={(e) =>
                                setCardForm((p) => ({
                                  ...p,
                                  cvc: e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4),
                                }))
                              }
                              required
                              maxLength={4}
                              autoComplete="cc-csc"
                              className="bg-background pr-10"
                              data-ocid="trial.cvc_input"
                            />
                            <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label htmlFor="wiz-chname">Cardholder Name</Label>
                          <Input
                            id="wiz-chname"
                            placeholder="Jane Smith"
                            value={cardForm.cardholderName}
                            onChange={(e) =>
                              setCardForm((p) => ({
                                ...p,
                                cardholderName: e.target.value,
                              }))
                            }
                            required
                            autoComplete="cc-name"
                            className="bg-background"
                            data-ocid="trial.cardholder_name_input"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                        <Lock className="h-3.5 w-3.5 text-primary" />
                        <p className="text-xs text-primary">
                          Secured by Stripe — encrypted end-to-end
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                      data-ocid="trial.back_button.2"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-lg bg-gradient-to-r from-amber-500 to-primary px-6 py-2.5 text-sm font-semibold text-foreground shadow hover:opacity-90"
                      data-ocid="trial.next_button.2"
                    >
                      Next: Documents
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Document uploads */}
              {step === 3 && (
                <div className="verification-step" data-ocid="trial.step_3">
                  <h2 className="mb-2 font-display text-xl font-semibold text-foreground">
                    Verification Documents
                  </h2>
                  <p className="mb-5 text-sm text-muted-foreground">
                    Upload the following documents. They will be held for manual
                    admin review before your trial activates.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {DOC_TYPES.map((d) => (
                      <UploadZone
                        key={d.key}
                        docKey={d.key}
                        label={d.label}
                        uploaded={!!uploadedDocs[d.key]}
                        fileName={uploadedDocs[d.key]}
                        onUploaded={handleDocUploaded}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                      data-ocid="trial.back_button.3"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      disabled={!allDocsUploaded}
                      className="rounded-lg bg-gradient-to-r from-amber-500 to-primary px-6 py-2.5 text-sm font-semibold text-foreground shadow hover:opacity-90 disabled:opacity-40"
                      data-ocid="trial.next_button.3"
                    >
                      Review &amp; Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 — Review & confirm */}
              {step === 4 && (
                <div className="verification-step" data-ocid="trial.step_4">
                  <h2 className="mb-5 font-display text-xl font-semibold text-foreground">
                    Review &amp; Confirm
                  </h2>
                  <div className="space-y-3 rounded-lg border border-border bg-background/60 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Account type
                      </span>
                      <span className="font-medium text-foreground capitalize">
                        {accountType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {accountType === "corporate" ? "Business Name" : "Name"}
                      </span>
                      <span className="font-medium text-foreground">
                        {accountType === "corporate"
                          ? corpForm.businessName
                          : personalForm.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Card ending in
                      </span>
                      <span className="font-medium text-foreground">
                        ••••{" "}
                        {cardForm.cardNumber.replace(/\s/g, "").slice(-4) ||
                          "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium text-foreground">
                        {plan.label} — {plan.monthly}/month
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        First charge
                      </span>
                      <span className="font-medium text-foreground">
                        Day 29 at 11:59 PM
                      </span>
                    </div>
                  </div>

                  <div
                    className="admin-pending-badge mt-4 flex items-start gap-2 rounded-lg p-3"
                    data-ocid="trial.pending_badge"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm font-medium">
                      Documents submitted — pending admin review before trial
                      activates
                    </p>
                  </div>

                  {enrollTrial.isError && (
                    <div
                      className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                      data-ocid="trial.error_state"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {enrollTrial.error?.message ??
                        "Enrollment failed. Please try again."}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                      data-ocid="trial.back_button.4"
                    >
                      Back
                    </button>
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={enrollTrial.isPending || !allDocsUploaded}
                      className="bg-gradient-to-r from-amber-500 to-primary font-semibold text-foreground shadow-lg hover:opacity-90"
                      data-ocid="trial.submit_button"
                    >
                      {enrollTrial.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Starting Trial…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Start Free 30-Day Trial
                        </span>
                      )}
                    </Button>
                  </div>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    By starting your trial you agree to be charged{" "}
                    {plan.chargeAmount}/month beginning Day 29. You may cancel
                    during the 30-day trial. After the trial ends, your{" "}
                    {plan.label} is a{" "}
                    <strong className="text-foreground">
                      full {plan.months} commitment
                    </strong>{" "}
                    and cannot be cancelled.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
