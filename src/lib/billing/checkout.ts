import "server-only";
import Stripe from "stripe";
import { isInternalOrcidEmail } from "@/lib/auth/identity";
import {
  getAppUrl,
  getApprovedPriceId,
  getMissingBillingEnvKeys,
  type CheckoutSelection,
} from "./config";
import { hasPaidAccess } from "./entitlement";
import { BillingError } from "./errors";
import {
  getBillingRecord,
  replaceStripeCustomerId,
  setStripeCustomerId,
  type BillingRecord,
} from "./repository";
import { getStripe } from "./stripe";

interface CheckoutUser {
  id: string;
  name: string;
  email: string;
}

export interface CheckoutDependencies {
  stripe: Pick<Stripe, "customers" | "subscriptions" | "checkout">;
  getBillingRecord: (userId: string) => Promise<BillingRecord>;
  setStripeCustomerId: (userId: string, customerId: string) => Promise<void>;
  replaceStripeCustomerId: (userId: string, customerId: string) => Promise<void>;
  appUrl: string;
  environment: Record<string, string | undefined>;
}

function defaultDependencies(): CheckoutDependencies {
  return {
    stripe: getStripe(),
    getBillingRecord,
    setStripeCustomerId,
    replaceStripeCustomerId,
    appUrl: getAppUrl(),
    environment: process.env,
  };
}

const DUPLICATE_BLOCKING_STATUSES = new Set([
  "active",
  "past_due",
  "trialing",
  "incomplete",
  "unpaid",
  "paused",
]);

function isStripeResourceMissing(error: unknown): boolean {
  return (
    error instanceof Stripe.errors.StripeError && error.code === "resource_missing"
  );
}

async function createStripeCustomer(
  user: CheckoutUser,
  dependencies: CheckoutDependencies,
  options: { replaceExisting: boolean },
) {
  const customer = await dependencies.stripe.customers.create(
    {
      name: user.name,
      ...(isInternalOrcidEmail(user.email) ? {} : { email: user.email }),
      metadata: { qualLensUserId: user.id },
    },
    {
      idempotencyKey: options.replaceExisting
        ? `quallens-customer-replace-${user.id}`
        : `quallens-customer-${user.id}`,
    },
  );
  if (options.replaceExisting) {
    await dependencies.replaceStripeCustomerId(user.id, customer.id);
  } else {
    await dependencies.setStripeCustomerId(user.id, customer.id);
  }
  return customer.id;
}

async function getOrCreateCustomer(
  user: CheckoutUser,
  record: BillingRecord,
  dependencies: CheckoutDependencies,
) {
  if (record.stripeCustomerId) {
    try {
      await dependencies.stripe.customers.retrieve(record.stripeCustomerId);
      return record.stripeCustomerId;
    } catch (error) {
      if (!isStripeResourceMissing(error)) throw error;
      return createStripeCustomer(user, dependencies, { replaceExisting: true });
    }
  }

  return createStripeCustomer(user, dependencies, { replaceExisting: false });
}

async function listCustomerSubscriptions(
  customerId: string,
  dependencies: CheckoutDependencies,
) {
  return dependencies.stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });
}

export async function createCheckoutSession(
  user: CheckoutUser,
  selection: CheckoutSelection,
  dependencies: CheckoutDependencies = defaultDependencies(),
) {
  const missingKeys = getMissingBillingEnvKeys(dependencies.environment);
  if (missingKeys.length > 0) {
    throw new BillingError(
      "billing_not_configured",
      `Billing is not configured. Missing: ${missingKeys.join(", ")}`,
    );
  }

  const record = await dependencies.getBillingRecord(user.id);
  if (hasPaidAccess(record)) {
    throw new BillingError(
      "subscription_exists",
      "Manage your existing subscription before choosing another plan.",
    );
  }

  let customerId = await getOrCreateCustomer(user, record, dependencies);
  let subscriptions;
  try {
    subscriptions = await listCustomerSubscriptions(customerId, dependencies);
  } catch (error) {
    if (!isStripeResourceMissing(error)) throw error;
    customerId = await createStripeCustomer(user, dependencies, { replaceExisting: true });
    subscriptions = await listCustomerSubscriptions(customerId, dependencies);
  }
  if (subscriptions.data.some((item) => DUPLICATE_BLOCKING_STATUSES.has(item.status))) {
    throw new BillingError(
      "subscription_exists",
      "This Stripe customer already has a subscription that must be managed first.",
    );
  }

  const priceId = getApprovedPriceId(selection, dependencies.environment);
  const session = await dependencies.stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${dependencies.appUrl}/dashboard?checkout=success`,
    cancel_url: `${dependencies.appUrl}/pricing?checkout=cancelled`,
    metadata: {
      qualLensUserId: user.id,
      plan: selection.plan,
      interval: selection.interval,
    },
    subscription_data: {
      metadata: {
        qualLensUserId: user.id,
        plan: selection.plan,
        interval: selection.interval,
      },
    },
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  return { url: session.url };
}

export interface PortalDependencies {
  stripe: Pick<Stripe, "billingPortal">;
  getBillingRecord: (userId: string) => Promise<BillingRecord>;
  appUrl: string;
}

export async function createPortalSession(
  userId: string,
  dependencies: PortalDependencies = {
    stripe: getStripe(),
    getBillingRecord,
    appUrl: getAppUrl(),
  },
) {
  const record = await dependencies.getBillingRecord(userId);
  if (!record.stripeCustomerId) {
    throw new BillingError("stripe_customer_missing", "No Stripe billing account exists yet.");
  }
  const session = await dependencies.stripe.billingPortal.sessions.create({
    customer: record.stripeCustomerId,
    return_url: `${dependencies.appUrl}/settings?billing=returned`,
  });
  return { url: session.url };
}
