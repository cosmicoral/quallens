import { z } from "zod";
import { resolveAppOrigin } from "@/lib/app-url";
import { BillingError } from "./errors";

export const PLAN_CONFIG = {
  free: {
    name: "Free",
    totalLimit: 1,
    monthlyLimit: null,
    monthlyPricePence: 0,
    annualPricePence: 0,
  },
  plus: {
    name: "Plus",
    totalLimit: null,
    monthlyLimit: 5,
    monthlyPricePence: 1200,
    annualPricePence: 9900,
  },
  pro: {
    name: "Pro",
    totalLimit: null,
    monthlyLimit: 12,
    monthlyPricePence: 2400,
    annualPricePence: 21000,
  },
} as const;

export type Plan = keyof typeof PLAN_CONFIG;
export type PaidPlan = Exclude<Plan, "free">;
export type BillingInterval = "monthly" | "annual";

export const checkoutSelectionSchema = z
  .object({
    plan: z.enum(["plus", "pro"]),
    interval: z.enum(["monthly", "annual"]),
  })
  .strict();

export type CheckoutSelection = z.infer<typeof checkoutSelectionSchema>;

const PRICE_ENV_KEYS = {
  plus: {
    monthly: "STRIPE_PRICE_PLUS_MONTHLY",
    annual: "STRIPE_PRICE_PLUS_ANNUAL",
  },
  pro: {
    monthly: "STRIPE_PRICE_PRO_MONTHLY",
    annual: "STRIPE_PRICE_PRO_ANNUAL",
  },
} as const;

type BillingEnvironment = Record<string, string | undefined>;

export const REQUIRED_BILLING_ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_PLUS_MONTHLY",
  "STRIPE_PRICE_PLUS_ANNUAL",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_PRO_ANNUAL",
] as const;

export function getMissingBillingEnvKeys(
  environment: BillingEnvironment = process.env,
): string[] {
  return REQUIRED_BILLING_ENV_KEYS.filter((key) => !environment[key]?.trim());
}

export function getApprovedPriceId(
  selection: CheckoutSelection,
  environment: BillingEnvironment = process.env,
): string {
  const key = PRICE_ENV_KEYS[selection.plan][selection.interval];
  const priceId = environment[key]?.trim();
  if (!priceId) {
    throw new BillingError(
      "billing_not_configured",
      `${key} is required for Stripe Checkout.`,
    );
  }
  return priceId;
}

export function getPlanForPriceId(
  priceId: string,
  environment: BillingEnvironment = process.env,
): CheckoutSelection | null {
  for (const plan of ["plus", "pro"] as const) {
    for (const interval of ["monthly", "annual"] as const) {
      const key = PRICE_ENV_KEYS[plan][interval];
      if (environment[key]?.trim() === priceId) return { plan, interval };
    }
  }
  return null;
}

export function getAppUrl(environment: BillingEnvironment = process.env): string {
  const configured = resolveAppOrigin(environment);
  const url = new URL(configured);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("App origin must use HTTPS outside localhost.");
  }
  return url.origin;
}
