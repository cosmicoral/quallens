"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BillingInterval, PaidPlan } from "@/lib/billing/config";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    description: "Try one complete Qualisapio review.",
    monthly: 0,
    annual: 0,
    allowance: "1 lifetime review",
  },
  {
    id: "plus" as const,
    name: "Plus",
    description: "For individual researchers reviewing regularly.",
    monthly: 12,
    annual: 120,
    allowance: "5 reviews each month",
  },
  {
    id: "pro" as const,
    name: "Pro",
    description: "A larger allowance for active research workflows.",
    monthly: 24,
    annual: 240,
    allowance: "12 reviews each month",
  },
];

export function PricingPlans() {
  const router = useRouter();
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
        router.push(`/auth/login?callbackURL=${encodeURIComponent("/pricing")}`);
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
    <div>
      <div className="mx-auto flex w-fit rounded-full border border-[var(--line-strong)] bg-white p-1 shadow-sm" aria-label="Billing interval">
        {(["monthly", "annual"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={interval === value}
            onClick={() => setInterval(value)}
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${interval === value ? "bg-[var(--ink)] text-white shadow-sm" : "text-[var(--slate)] hover:text-[var(--ink)]"}`}
          >
            {value === "annual" ? "Yearly · save 17%" : "Monthly"}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mx-auto mt-5 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
          {error} {error.includes("existing") && <Link href="/settings" className="font-semibold underline">Manage billing</Link>}
        </p>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const featured = plan.id === "pro";
          const total = interval === "monthly" ? plan.monthly : plan.annual;
          const monthlyEquivalent = interval === "annual" ? Math.round(plan.annual / 12) : plan.monthly;
          return (
            <article
              key={plan.id}
              className={`relative flex min-h-[31rem] flex-col rounded-2xl border bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.07)] sm:p-7 ${featured ? "border-[var(--blue)] ring-1 ring-[var(--blue)]" : "border-[var(--line)]"}`}
            >
              {featured && <span className="absolute inset-x-6 top-0 -translate-y-1/2 rounded-full bg-[var(--blue)] px-3 py-1 text-center text-xs font-bold text-white">Most reviews</span>}
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{plan.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--slate)]">{plan.description}</p>
              <div className="mt-6">
                <span className="text-5xl font-semibold tracking-[-0.06em] text-[var(--ink)]">£{monthlyEquivalent}</span>
                <span className="ml-1 text-sm text-[var(--muted)]">/month</span>
                {interval === "annual" && plan.id !== "free" && <p className="mt-2 text-sm text-[var(--muted)]">£{total} billed yearly</p>}
                {plan.id === "free" && <p className="mt-2 text-sm text-[var(--muted)]">No card required</p>}
              </div>
              <div className="my-6 h-px bg-[var(--line)]" />
              <p className="font-semibold text-[var(--ink)]">{plan.allowance}</p>
              <ul className="mt-5 space-y-3 text-sm leading-5 text-[var(--slate)]">
                <li className="flex gap-2"><span className="text-[var(--blue)]">✓</span>Complete six-agent review</li>
                <li className="flex gap-2"><span className="text-[var(--blue)]">✓</span>Structured on-screen findings</li>
                <li className="flex gap-2"><span className="text-[var(--blue)]">✓</span>Technical failures do not consume allowance</li>
                {plan.id !== "free" && <li className="flex gap-2"><span className="text-[var(--blue)]">✓</span>Manage or cancel through Stripe</li>}
              </ul>
              <div className="mt-auto pt-8">
                {plan.id === "free" ? (
                  <Link href="/review" className="flex h-12 items-center justify-center rounded-xl border border-[var(--ink)] text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)]">
                    Start free review
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => checkout(plan.id)}
                    disabled={loading !== null}
                    className={`h-12 w-full rounded-xl text-sm font-semibold transition disabled:opacity-60 ${featured ? "bg-[var(--ink)] text-white hover:bg-[var(--navy)]" : "border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--paper)]"}`}
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
