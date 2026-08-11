import "server-only";
import type Stripe from "stripe";
import type { PoolClient } from "pg";
import { getDatabase } from "@/lib/auth/db";
import { getPlanForPriceId, type BillingInterval, type Plan } from "./config";
import { getStripe, getStripeWebhookSecret } from "./stripe";

export interface StripeSubscriptionUpdate {
  userId: string;
  plan: Plan;
  billingInterval: BillingInterval | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string | null;
  subscriptionStatus: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  markPaidHistory: boolean;
  paymentFailedAt: Date | null;
}

export interface WebhookStore {
  hasProcessedEvent(eventId: string): Promise<boolean>;
  findUserIdByCustomer(customerId: string): Promise<string | null>;
  applyEventOnce(
    eventId: string,
    eventType: string,
    update: StripeSubscriptionUpdate | null,
  ): Promise<boolean>;
}

export interface WebhookDependencies {
  stripe: Pick<Stripe, "subscriptions">;
  store: WebhookStore;
  environment: Record<string, string | undefined>;
  now: () => Date;
}

function idOf(value: string | { id: string } | null): string | null {
  return typeof value === "string" ? value : value?.id ?? null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  return idOf(invoice.parent?.subscription_details?.subscription ?? null);
}

function normalizeSubscription(
  subscription: Stripe.Subscription,
  userId: string,
  environment: Record<string, string | undefined>,
  paymentFailedAt: Date | null,
): StripeSubscriptionUpdate {
  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? null;
  const selection = priceId ? getPlanForPriceId(priceId, environment) : null;
  const knownPaidStatus = ["active", "past_due", "canceled"].includes(subscription.status);

  return {
    userId,
    plan: selection?.plan ?? "free",
    billingInterval: selection?.interval ?? null,
    stripeCustomerId: idOf(subscription.customer) ?? "",
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    subscriptionStatus: selection ? subscription.status : "unsupported_price",
    currentPeriodStart: item ? new Date(item.current_period_start * 1000) : null,
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    markPaidHistory: Boolean(selection && knownPaidStatus),
    paymentFailedAt,
  };
}

async function retrieveSubscriptionForEvent(
  event: Stripe.Event,
  stripe: Pick<Stripe, "subscriptions">,
): Promise<{ subscription: Stripe.Subscription | null; userHint: string | null; failed: boolean }> {
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    return {
      subscription,
      userHint: subscription.metadata.qualLensUserId ?? null,
      failed: false,
    };
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = idOf(session.subscription);
    return {
      subscription: subscriptionId
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : null,
      userHint: session.client_reference_id ?? session.metadata?.qualLensUserId ?? null,
      failed: false,
    };
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoiceSubscriptionId(invoice);
    return {
      subscription: subscriptionId
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : null,
      userHint: null,
      failed: event.type === "invoice.payment_failed",
    };
  }

  return { subscription: null, userHint: null, failed: false };
}

export async function processStripeEvent(
  event: Stripe.Event,
  dependencies: WebhookDependencies,
): Promise<{ duplicate: boolean }> {
  if (await dependencies.store.hasProcessedEvent(event.id)) return { duplicate: true };

  const resolved = await retrieveSubscriptionForEvent(event, dependencies.stripe);
  if (!resolved.subscription) {
    const inserted = await dependencies.store.applyEventOnce(event.id, event.type, null);
    return { duplicate: !inserted };
  }

  const customerId = idOf(resolved.subscription.customer);
  if (!customerId) throw new Error("Stripe subscription did not include a customer ID.");
  const userId = resolved.userHint
    ?? resolved.subscription.metadata.qualLensUserId
    ?? await dependencies.store.findUserIdByCustomer(customerId);
  if (!userId) throw new Error("Stripe subscription could not be reconciled to a QualiSapio user.");

  const update = normalizeSubscription(
    resolved.subscription,
    userId,
    dependencies.environment,
    resolved.failed ? dependencies.now() : null,
  );
  if (resolved.failed && update.subscriptionStatus === "active") {
    update.subscriptionStatus = "past_due";
  }
  const inserted = await dependencies.store.applyEventOnce(event.id, event.type, update);
  return { duplicate: !inserted };
}

export class WebhookSignatureError extends Error {}

export function verifyStripeEvent(
  payload: string,
  signature: string,
  stripe: Pick<Stripe, "webhooks"> = getStripe(),
  secret = getStripeWebhookSecret(),
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    throw new WebhookSignatureError("Invalid Stripe webhook signature.");
  }
}

class PostgresWebhookStore implements WebhookStore {
  async hasProcessedEvent(eventId: string) {
    const result = await getDatabase().query(
      `SELECT 1 FROM "stripe_webhook_event" WHERE "event_id" = $1`,
      [eventId],
    );
    return Boolean(result.rowCount);
  }

  async findUserIdByCustomer(customerId: string) {
    const result = await getDatabase().query<{ user_id: string }>(
      `SELECT "user_id" FROM "subscription" WHERE "stripe_customer_id" = $1`,
      [customerId],
    );
    return result.rows[0]?.user_id ?? null;
  }

  async applyEventOnce(
    eventId: string,
    eventType: string,
    update: StripeSubscriptionUpdate | null,
  ) {
    const client = await getDatabase().connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO "stripe_webhook_event" ("event_id", "event_type")
         VALUES ($1, $2) ON CONFLICT ("event_id") DO NOTHING RETURNING "event_id"`,
        [eventId, eventType],
      );
      if (!inserted.rowCount) {
        await client.query("ROLLBACK");
        return false;
      }
      if (update) await this.applySubscriptionUpdate(client, update);
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async applySubscriptionUpdate(client: PoolClient, update: StripeSubscriptionUpdate) {
    const owner = await client.query<{ user_id: string }>(
      `SELECT "user_id" FROM "subscription"
       WHERE "stripe_customer_id" = $1 OR "stripe_subscription_id" = $2
       FOR UPDATE`,
      [update.stripeCustomerId, update.stripeSubscriptionId],
    );
    if (owner.rows.some((row) => row.user_id !== update.userId)) {
      throw new Error("Stripe customer or subscription is already owned by another user.");
    }

    await client.query(
      `INSERT INTO "subscription" (
         "user_id", "plan", "billing_interval", "stripe_customer_id",
         "stripe_subscription_id", "stripe_price_id", "subscription_status",
         "current_period_start", "current_period_end", "cancel_at_period_end",
         "has_had_paid_plan", "last_payment_failed_at"
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT ("user_id") DO UPDATE SET
         "plan" = EXCLUDED."plan",
         "billing_interval" = EXCLUDED."billing_interval",
         "stripe_customer_id" = EXCLUDED."stripe_customer_id",
         "stripe_subscription_id" = EXCLUDED."stripe_subscription_id",
         "stripe_price_id" = EXCLUDED."stripe_price_id",
         "subscription_status" = EXCLUDED."subscription_status",
         "current_period_start" = EXCLUDED."current_period_start",
         "current_period_end" = EXCLUDED."current_period_end",
         "cancel_at_period_end" = EXCLUDED."cancel_at_period_end",
         "has_had_paid_plan" = "subscription"."has_had_paid_plan" OR EXCLUDED."has_had_paid_plan",
         "last_payment_failed_at" = EXCLUDED."last_payment_failed_at",
         "updated_at" = CURRENT_TIMESTAMP`,
      [
        update.userId,
        update.plan,
        update.billingInterval,
        update.stripeCustomerId,
        update.stripeSubscriptionId,
        update.stripePriceId,
        update.subscriptionStatus,
        update.currentPeriodStart,
        update.currentPeriodEnd,
        update.cancelAtPeriodEnd,
        update.markPaidHistory,
        update.paymentFailedAt,
      ],
    );
  }
}

export function defaultWebhookDependencies(): WebhookDependencies {
  return {
    stripe: getStripe(),
    store: new PostgresWebhookStore(),
    environment: process.env,
    now: () => new Date(),
  };
}
