import "server-only";
import Stripe from "stripe";
import { normalizeEnvValue } from "./config";

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  const secretKey = normalizeEnvValue(process.env.STRIPE_SECRET_KEY);
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required for billing.");
  stripe ??= new Stripe(secretKey, { appInfo: { name: "QualiSapio", version: "0.1.0" } });
  return stripe;
}

export function getStripeWebhookSecret(): string {
  const secret = normalizeEnvValue(process.env.STRIPE_WEBHOOK_SECRET);
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is required for webhook verification.");
  return secret;
}
