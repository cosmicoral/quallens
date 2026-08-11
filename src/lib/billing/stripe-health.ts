import "server-only";
import type Stripe from "stripe";
import { REQUIRED_BILLING_ENV_KEYS, normalizeEnvValue } from "./config";
import { getStripe } from "./stripe";

export interface StripeHealthIssue {
  code: string;
  envKey?: string;
  message: string;
}

export interface StripeHealthReport {
  ok: boolean;
  mode: "live" | "test" | "unknown";
  issues: StripeHealthIssue[];
}

function stripeMode(secretKey: string): StripeHealthReport["mode"] {
  if (secretKey.startsWith("sk_live_")) return "live";
  if (secretKey.startsWith("sk_test_")) return "test";
  return "unknown";
}

function validateKeyFormats(environment: Record<string, string | undefined>): StripeHealthIssue[] {
  const issues: StripeHealthIssue[] = [];
  const secretKey = normalizeEnvValue(environment.STRIPE_SECRET_KEY);
  const publishableKey = normalizeEnvValue(environment.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  if (secretKey && !secretKey.startsWith("sk_")) {
    issues.push({
      code: "invalid_secret_key",
      envKey: "STRIPE_SECRET_KEY",
      message: "STRIPE_SECRET_KEY must start with sk_live_ or sk_test_, not pk_.",
    });
  }

  if (publishableKey && !publishableKey.startsWith("pk_")) {
    issues.push({
      code: "invalid_publishable_key",
      envKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_live_ or pk_test_.",
    });
  }

  if (secretKey && publishableKey) {
    const secretLive = secretKey.startsWith("sk_live_");
    const publishableLive = publishableKey.startsWith("pk_live_");
    if (secretLive !== publishableLive) {
      issues.push({
        code: "key_mode_mismatch",
        message: "STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must both be Live or both be Test.",
      });
    }
  }

  for (const envKey of REQUIRED_BILLING_ENV_KEYS) {
    if (envKey === "STRIPE_SECRET_KEY") continue;
    const priceId = normalizeEnvValue(environment[envKey]);
    if (priceId && !priceId.startsWith("price_")) {
      issues.push({
        code: "invalid_price_id",
        envKey,
        message: `${envKey} must be a Stripe price ID starting with price_.`,
      });
    }
  }

  return issues;
}

async function validatePrices(
  stripe: Stripe,
  mode: StripeHealthReport["mode"],
  environment: Record<string, string | undefined>,
): Promise<StripeHealthIssue[]> {
  const issues: StripeHealthIssue[] = [];

  for (const envKey of REQUIRED_BILLING_ENV_KEYS) {
    if (envKey === "STRIPE_SECRET_KEY") continue;
    const priceId = normalizeEnvValue(environment[envKey]);
    if (!priceId) continue;

    try {
      const price = await stripe.prices.retrieve(priceId);
      const expectLive = mode === "live";
      if (mode !== "unknown" && price.livemode !== expectLive) {
        issues.push({
          code: "price_mode_mismatch",
          envKey,
          message: `${envKey} is a ${price.livemode ? "Live" : "Test"} price but STRIPE_SECRET_KEY is ${mode.toUpperCase()} mode.`,
        });
      }
      if (!price.active) {
        issues.push({
          code: "price_inactive",
          envKey,
          message: `${envKey} points to an inactive Stripe price.`,
        });
      }
      if (price.type !== "recurring") {
        issues.push({
          code: "price_not_recurring",
          envKey,
          message: `${envKey} must be a recurring subscription price.`,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error && "type" in error && (error as { type?: string }).type === "StripeAuthenticationError"
          ? "Stripe rejected STRIPE_SECRET_KEY. Remove any surrounding quotes and confirm Live vs Test."
          : `Stripe could not load ${envKey}. Check the price ID and that it matches your API key mode.`;
      issues.push({ code: "price_lookup_failed", envKey, message });
    }
  }

  return issues;
}

export async function getStripeHealthReport(
  environment: Record<string, string | undefined> = process.env,
): Promise<StripeHealthReport> {
  const formatIssues = validateKeyFormats(environment);
  const secretKey = normalizeEnvValue(environment.STRIPE_SECRET_KEY);
  if (!secretKey || formatIssues.some((issue) => issue.code === "invalid_secret_key")) {
    return {
      ok: formatIssues.length === 0,
      mode: stripeMode(secretKey ?? ""),
      issues: formatIssues,
    };
  }

  const mode = stripeMode(secretKey);
  try {
    const stripe = getStripe();
    const priceIssues = await validatePrices(stripe, mode, environment);
    const issues = [...formatIssues, ...priceIssues];
    return { ok: issues.length === 0, mode, issues };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe health check failed.";
    return {
      ok: false,
      mode,
      issues: [
        ...formatIssues,
        {
          code: "stripe_unreachable",
          message,
        },
      ],
    };
  }
}
