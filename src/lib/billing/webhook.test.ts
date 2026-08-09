import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

vi.mock("server-only", () => ({}));

import {
  processStripeEvent,
  verifyStripeEvent,
  type StripeSubscriptionUpdate,
  type WebhookDependencies,
  type WebhookStore,
} from "./webhook";

const environment = {
  STRIPE_PRICE_PLUS_MONTHLY: "price_plus_monthly",
  STRIPE_PRICE_PLUS_ANNUAL: "price_plus_annual",
  STRIPE_PRICE_PRO_MONTHLY: "price_pro_monthly",
  STRIPE_PRICE_PRO_ANNUAL: "price_pro_annual",
};

function stripeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_1",
    object: "subscription",
    customer: "cus_1",
    status: "active",
    cancel_at_period_end: false,
    metadata: { qualLensUserId: "user-1" },
    items: {
      object: "list",
      data: [{
        id: "si_1",
        object: "subscription_item",
        price: { id: "price_plus_monthly" },
        current_period_start: 1785542400,
        current_period_end: 1788220800,
      } as Stripe.SubscriptionItem],
      has_more: false,
      url: "/v1/subscription_items",
    },
    ...overrides,
  } as Stripe.Subscription;
}

class MemoryStore implements WebhookStore {
  events = new Set<string>();
  updates: StripeSubscriptionUpdate[] = [];

  async hasProcessedEvent(eventId: string) {
    return this.events.has(eventId);
  }

  async findUserIdByCustomer() {
    return "user-1";
  }

  async applyEventOnce(eventId: string, _eventType: string, update: StripeSubscriptionUpdate | null) {
    if (this.events.has(eventId)) return false;
    this.events.add(eventId);
    if (update) this.updates.push(update);
    return true;
  }
}

function event(type: string, object: object, id = `evt_${type}`): Stripe.Event {
  return { id, type, data: { object } } as Stripe.Event;
}

function dependencies(store = new MemoryStore()): WebhookDependencies & { store: MemoryStore } {
  return {
    stripe: { subscriptions: { retrieve: vi.fn() } } as unknown as Pick<Stripe, "subscriptions">,
    store,
    environment,
    now: () => new Date("2026-08-09T12:00:00.000Z"),
  };
}

describe("Stripe webhook processing", () => {
  it.each([
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ])("maps %s into local subscription state", async (type) => {
    const deps = dependencies();
    const subscription = stripeSubscription({ status: type.endsWith("deleted") ? "canceled" : "active" });
    await processStripeEvent(event(type, subscription), deps);
    expect(deps.store.updates[0]).toMatchObject({
      userId: "user-1",
      plan: "plus",
      billingInterval: "monthly",
      stripeSubscriptionId: "sub_1",
      subscriptionStatus: type.endsWith("deleted") ? "canceled" : "active",
    });
  });

  it("updates payment state for paid and failed invoices", async () => {
    const deps = dependencies();
    vi.mocked(deps.stripe.subscriptions.retrieve).mockResolvedValue(
      stripeSubscription() as Stripe.Response<Stripe.Subscription>,
    );
    const invoice = {
      parent: { subscription_details: { subscription: "sub_1" } },
    } as Stripe.Invoice;

    await processStripeEvent(event("invoice.payment_failed", invoice, "evt_failed"), deps);
    await processStripeEvent(event("invoice.paid", invoice, "evt_paid"), deps);

    expect(deps.store.updates[0]).toMatchObject({
      subscriptionStatus: "past_due",
      paymentFailedAt: new Date("2026-08-09T12:00:00.000Z"),
    });
    expect(deps.store.updates[1]?.paymentFailedAt).toBeNull();
  });

  it("is idempotent when Stripe delivers an event twice", async () => {
    const deps = dependencies();
    const stripeEvent = event("customer.subscription.updated", stripeSubscription(), "evt_duplicate");
    expect(await processStripeEvent(stripeEvent, deps)).toEqual({ duplicate: false });
    expect(await processStripeEvent(stripeEvent, deps)).toEqual({ duplicate: true });
    expect(deps.store.updates).toHaveLength(1);
  });

  it("rejects an invalid webhook signature", () => {
    const stripe = {
      webhooks: { constructEvent: vi.fn(() => { throw new Error("bad signature"); }) },
    } as unknown as Pick<Stripe, "webhooks">;
    expect(() => verifyStripeEvent("{}", "invalid", stripe, "whsec_test")).toThrow(
      "Invalid Stripe webhook signature.",
    );
  });
});
