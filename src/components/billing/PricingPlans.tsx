"use client";

import Link from "next/link";
import { useState } from "react";
import type { BillingInterval, PaidPlan } from "@/lib/billing/config";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    description: "Try one complete Qualisapio peer review.",
    monthly: 0,
    annual: 0,
    allowance: "1 lifetime review",
  },
  {
    id: "plus" as const,
    name: "Plus",
    description: "For authors and reviewers running peer review regularly.",
    monthly: 12,
    annual: 120,
    allowance: "5 reviews each month",
  },
  {
    id: "pro" as const,
    name: "Pro",
    description: "A larger allowance for active peer-review workflows.",
    monthly: 24,
    annual: 240,
    allowance: "12 reviews each month",
  },
];

export function PricingPlans() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState<PaidPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: PaidPlan) {
    setLoading(plan);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await response.json().catch(() => ({})) as { url?: string; error?: string; errorCode?: string };
      if (response.status === 401) {
        setError("Your session expired. Refresh the page or sign in again from Settings.");
        setLoading(null);
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.error ?? "Checkout is unavailable.");
      window.location.assign(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout is unavailable.");
      setLoading(null);
    }
  }

  return (
    <div className="min-w-0">
      <div
        className="pricing-interval-toggle mx-auto flex w-fit max-w-full rounded-full border border-[var(--line-strong)] bg-white p-1 shadow-sm"
        aria-label="Billing interval"
      >
        {(["monthly", "annual"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={interval === value}
            onClick={() => setInterval(value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition sm:px-5 ${
              interval === value
                ? "bg-[var(--ink)] text-white shadow-sm"
                : "text-[var(--slate)] hover:text-[var(--ink)]"
            }`}
          >
            {value === "annual" ? "Yearly · save 17%" : "Monthly"}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mx-auto mt-5 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
          {error}{" "}
          {error.includes("existing") && (
            <Link href="/settings" className="font-semibold underline">
              Manage billing
            </Link>
          )}
        </p>
      )}

      <div className="pricing-plans-grid mt-8 grid gap-5">
        {plans.map((plan) => {
          const featured = plan.id === "pro";
          const total = interval === "monthly" ? plan.monthly : plan.annual;
          const monthlyEquivalent = interval === "annual" ? Math.round(plan.annual / 12) : plan.monthly;

          return (
            <article
              key={plan.id}
              className={`pricing-plan-card flex min-h-[28rem] min-w-0 flex-col rounded-2xl border bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.07)] sm:min-h-[29rem] sm:p-7 ${
                featured ? "border-[var(--blue)] ring-1 ring-[var(--blue)]" : "border-[var(--line)]"
              }`}
            >
              {featured && (
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-[var(--blue)] px-3 py-1 text-xs font-bold text-white">
                    Most reviews
                  </span>
                </div>
              )}

              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
                  {plan.name}
                </h2>
                <p className="mt-2 min-h-10 text-sm leading-6 text-[var(--slate)] sm:min-h-12">
                  {plan.description}
                </p>
              </div>

              <div className="pricing-price mt-5 min-w-0 sm:mt-6">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <span className="pricing-price-amount font-semibold tracking-[-0.05em] text-[var(--ink)]">
                    £{monthlyEquivalent}
                  </span>
                  <span className="shrink-0 text-sm text-[var(--muted)]">/ month</span>
                </div>
                {interval === "annual" && plan.id !== "free" && (
                  <p className="mt-2 text-sm leading-5 text-[var(--muted)]">£{total} billed yearly</p>
                )}
                {plan.id === "free" && (
                  <p className="mt-2 text-sm leading-5 text-[var(--muted)]">No card required</p>
                )}
              </div>

              <div className="my-5 h-px bg-[var(--line)] sm:my-6" />

              <p className="font-semibold text-[var(--ink)]">{plan.allowance}</p>
              <ul className="mt-4 space-y-2.5 text-sm leading-5 text-[var(--slate)] sm:mt-5 sm:space-y-3">
                <li className="flex gap-2">
                  <span className="shrink-0 text-[var(--blue)]">✓</span>
                  <span>Complete six-agent review</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-[var(--blue)]">✓</span>
                  <span>Structured on-screen findings</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-[var(--blue)]">✓</span>
                  <span>Technical failures do not consume allowance</span>
                </li>
                {plan.id !== "free" && (
                  <li className="flex gap-2">
                    <span className="shrink-0 text-[var(--blue)]">✓</span>
                    <span>Manage or cancel through Stripe</span>
                  </li>
                )}
              </ul>

              <div className="mt-auto pt-6 sm:pt-8">
                {plan.id === "free" ? (
                  <Link
                    href="/review"
                    className="flex h-11 items-center justify-center rounded-xl border border-[var(--ink)] text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)] sm:h-12"
                  >
                    Start free review
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => checkout(plan.id)}
                    disabled={loading !== null}
                    className={`h-11 w-full rounded-xl text-sm font-semibold transition disabled:opacity-60 sm:h-12 ${
                      featured
                        ? "bg-[var(--ink)] text-white hover:bg-[var(--navy)]"
                        : "border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--paper)]"
                    }`}
                  >
                    {loading === plan.id ? "Opening secure checkout…" : `Choose ${plan.name}`}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
