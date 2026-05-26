import { LoginModal } from "@/components/LoginModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClaimController, useIsController } from "@/hooks/useSubscription";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const PLANS = [
  {
    id: "tier-1-year",
    label: "1-Year Plan",
    badge: "Professional",
    monthly: "$299",
    annual: "$3,588 / year",
    cta: "Start 30-Day Trial",
    href: "/trial/tier-1-year" as const,
    highlight: false,
    features: [
      "12-month commitment",
      "Full platform access",
      "Priority support",
    ],
  },
  {
    id: "tier-5-year",
    label: "5-Year Plan",
    badge: "Best Value",
    monthly: "$199",
    annual: "$2,388 / year",
    cta: "Start 30-Day Trial",
    href: "/trial/tier-5-year" as const,
    highlight: true,
    features: [
      "60-month commitment",
      "Full platform access",
      "Priority support",
    ],
  },
  {
    id: "tier-10-year",
    label: "10-Year Plan",
    badge: "Enterprise",
    monthly: "$99",
    annual: "$1,188 / year",
    cta: "Start 30-Day Trial",
    href: "/trial/tier-10-year" as const,
    highlight: false,
    features: [
      "120-month commitment",
      "Full platform access",
      "Priority support",
    ],
  },
];

export function SplashScreen() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  useIsController(principal);
  const { mutate: claimController } = useClaimController();

  // Silent auto-claim: the first authenticated user to load becomes the
  // permanent controller. Fire-and-forget — no UI feedback needed.
  useEffect(() => {
    if (principal) {
      claimController();
    }
  }, [principal, claimController]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleLoginSuccess() {
    setShowLoginModal(false);
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="w-screen overflow-x-hidden">
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <div className="relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden">
        {/* Full-screen crane photograph with vivid filters */}
        <img
          src="/assets/generated/crane-california-coast.dim_1920x1080.jpg"
          alt="Tower crane over the California coastline"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(1.1) contrast(1.15) saturate(1.5)" }}
        />

        {/* Warm-to-cool gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10, 20, 60, 0.82) 0%, rgba(10, 20, 60, 0.25) 35%, rgba(255, 160, 40, 0.18) 60%, rgba(255, 140, 20, 0.35) 100%)",
          }}
        />
        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, transparent 40%, rgba(8, 16, 48, 0.55) 100%)",
            mixBlendMode: "multiply",
          }}
        />

        {/* Content overlay */}
        <div
          className={`relative z-10 flex flex-col items-center text-center transition-all duration-1000 ease-out px-4 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-4 py-1.5 text-xs font-medium tracking-wide text-sky-400 backdrop-blur-sm">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            CONSTRUCTION INTELLIGENCE
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight drop-shadow-lg sm:text-6xl md:text-7xl">
            <span className="text-red-500">Project</span>{" "}
            <span className="text-white">Build</span>{" "}
            <span className="text-blue-400">Plus</span>
          </h1>

          <p className="mt-4 max-w-md text-base text-white drop-shadow-md sm:text-lg">
            Construction Project Management &amp; Design Intelligence
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <div className="flex flex-col items-center gap-2">
              <Button
                size="lg"
                className="border-0 bg-gradient-to-r from-amber-400 to-teal-400 text-slate-900 shadow-[0_0_30px_rgba(255,180,0,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_45px_rgba(255,180,0,0.7)]"
                onClick={() => setShowLoginModal(true)}
                data-ocid="splash.enter_project_button"
              >
                Enter Project
              </Button>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white backdrop-blur-sm hover:border-white/70 hover:bg-white/10"
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-ocid="splash.view_pricing_button"
            >
              View Pricing
            </Button>
          </div>
        </div>

        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={handleLoginSuccess}
          />
        )}

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
          <div className="h-8 w-5 rounded-full border-2 border-white/50 p-1">
            <div className="mx-auto h-2 w-1 rounded-full bg-white/70" />
          </div>
        </div>
      </div>

      {/* ── Pricing Section ─────────────────────────────────────────── */}
      <section
        id="pricing"
        className="w-full px-4 py-20 sm:px-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.10 0.015 265) 0%, oklch(0.13 0.01 260) 100%)",
        }}
        data-ocid="pricing.section"
      >
        <div className="mx-auto max-w-5xl">
          {/* Section heading */}
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1 text-xs font-medium tracking-wide text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              SUBSCRIPTION PLANS
            </div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/60">
              All plans include a{" "}
              <strong className="text-white">30-day free trial</strong>. No
              charge until Day 29. After the trial, subscriptions are full-term
              commitments.
            </p>
          </div>

          {/* Pricing cards */}
          <div
            className="grid gap-6 sm:grid-cols-3"
            data-ocid="pricing.cards_list"
          >
            {PLANS.map((plan, i) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col overflow-hidden border transition-all hover:-translate-y-1 ${
                  plan.highlight
                    ? "border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.18)]"
                    : "border-border/60 hover:border-amber-400/30"
                }`}
                style={{
                  background: plan.highlight
                    ? "linear-gradient(145deg, oklch(0.17 0.02 260) 0%, oklch(0.14 0.015 260) 100%)"
                    : "oklch(0.15 0.012 260)",
                }}
                data-ocid={`pricing.card.${i + 1}`}
              >
                {plan.highlight && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                )}

                <CardHeader className="pb-2 pt-6">
                  <Badge
                    className={`mb-2 w-fit text-xs ${
                      plan.highlight
                        ? "bg-amber-400/15 text-amber-300 hover:bg-amber-400/20"
                        : "bg-teal-400/10 text-teal-300 hover:bg-teal-400/15"
                    }`}
                  >
                    {plan.badge}
                  </Badge>
                  <CardTitle className="font-display text-lg text-white">
                    {plan.label}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4">
                  {/* Price */}
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="font-display text-4xl font-bold text-white">
                        {plan.monthly}
                      </span>
                      <span className="mb-1 text-sm text-white/50">/month</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/50">
                      {plan.annual}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="flex-1 space-y-1.5">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2 text-xs text-white/70"
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${
                            plan.highlight ? "text-amber-400" : "text-teal-400"
                          }`}
                        />
                        {feat}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-xs text-white/70">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 ${
                          plan.highlight ? "text-amber-400" : "text-teal-400"
                        }`}
                      />
                      Cancel anytime within trial
                    </li>
                  </ul>

                  {/* Trial notice */}
                  <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-white/60">
                    Card charged{" "}
                    <strong className="text-white">{plan.monthly}</strong> on
                    Day 29 at 11:59 PM
                  </p>

                  {/* CTA */}
                  <Button
                    size="default"
                    className={`mt-auto w-full font-semibold transition-all hover:scale-[1.02] ${
                      plan.highlight
                        ? "bg-gradient-to-r from-amber-400 to-teal-500 text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                        : "bg-teal-600 text-white hover:bg-teal-500"
                    }`}
                    onClick={() =>
                      navigate({
                        to: "/trial/$tier",
                        params: { tier: plan.id },
                      })
                    }
                    data-ocid={`pricing.cta_button.${i + 1}`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fine print */}
          <p className="mt-8 text-center text-xs text-white/40">
            All subscriptions are full-term commitments after the 30-day trial
            period ends. You may switch to a different tier at any time before
            Day 30. Cancellations are only permitted during the trial period.
          </p>
        </div>
      </section>
    </div>
  );
}
