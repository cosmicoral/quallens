import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

vi.mock("server-only", () => ({}));

import { createCheckoutSession, createPortalSession, type CheckoutDependencies } from "./checkout";
import type { BillingRecord } from "./repository";

const billingRecord: BillingRecord = {
  userId: "user-1",
  plan: "free",
  billingInterval: null,
  subscriptionStatus: "free",
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  hasHadPaidPlan: false,
  stripeCustomerId: "cus_test",
  stripeSubscriptionId: null,
  stripePriceId: null,
  lastPaymentFailedAt: null,
};

function dependencies(overrides: Partial<CheckoutDependencies> = {}): CheckoutDependencies {
  return {
    stripe: {
      customers: { create: vi.fn() },
      subscriptions: { list: vi.fn().mockResolvedValue({ data: [] }) },
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    } as unknown as CheckoutDependencies["stripe"],
    getBillingRecord: vi.fn().mockResolvedValue(billingRecord),
    setStripeCustomerId: vi.fn(),
    appUrl: "https://qualisapio.test",
    environment: {
      STRIPE_SECRET_KEY: "sk_test_example",
      STRIPE_PRICE_PLUS_MONTHLY: "price_plus_monthly",
      STRIPE_PRICE_PLUS_ANNUAL: "price_plus_annual",
      STRIPE_PRICE_PRO_MONTHLY: "price_pro_monthly",
      STRIPE_PRICE_PRO_ANNUAL: "price_pro_annual",
    },
    ...overrides,
  };
}

describe("Stripe Checkout", () => {
  it("creates a subscription session for an approved plan", async () => {
    const deps = dependencies();
    await expect(
      createCheckoutSession(
        { id: "user-1", name: "Jane Scholar", email: "jane@example.edu" },
        { plan: "plus", interval: "monthly" },
        deps,
      ),
    ).resolves.toEqual({ url: "https://checkout.stripe.test/session" });

    expect(deps.stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus_test",
        client_reference_id: "user-1",
        line_items: [{ price: "price_plus_monthly", quantity: 1 }],
      }),
    );
  });

  it("blocks creation when Stripe already has an active subscription", async () => {
    const deps = dependencies({
      stripe: {
        customers: { create: vi.fn() },
        subscriptions: { list: vi.fn().mockResolvedValue({ data: [{ status: "active" }] }) },
        checkout: { sessions: { create: vi.fn() } },
      } as unknown as CheckoutDependencies["stripe"],
    });
    await expect(
      createCheckoutSession(
        { id: "user-1", name: "Jane", email: "jane@example.edu" },
        { plan: "pro", interval: "annual" },
        deps,
      ),
    ).rejects.toMatchObject({ code: "subscription_exists" });
  });
});

describe("Stripe Customer Portal", () => {
  it("creates a portal session for an authenticated customer's Stripe ID", async () => {
    const create = vi.fn().mockResolvedValue({ url: "https://billing.stripe.test/portal" });
    await expect(
      createPortalSession("user-1", {
        stripe: { billingPortal: { sessions: { create } } } as unknown as Pick<Stripe, "billingPortal">,
        getBillingRecord: vi.fn().mockResolvedValue(billingRecord),
        appUrl: "https://qualisapio.test",
      }),
    ).resolves.toEqual({ url: "https://billing.stripe.test/portal" });
    expect(create).toHaveBeenCalledWith({
      customer: "cus_test",
      return_url: "https://qualisapio.test/settings?billing=returned",
    });
  });

  it("rejects portal access without a Stripe customer", async () => {
    await expect(
      createPortalSession("user-1", {
        stripe: { billingPortal: { sessions: { create: vi.fn() } } } as unknown as Pick<Stripe, "billingPortal">,
        getBillingRecord: vi.fn().mockResolvedValue({ ...billingRecord, stripeCustomerId: null }),
        appUrl: "https://qualisapio.test",
      }),
    ).rejects.toMatchObject({ code: "stripe_customer_missing" });
  });
});
