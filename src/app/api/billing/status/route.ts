import { NextResponse } from "next/server";
import { getMissingBillingEnvKeys } from "@/lib/billing/config";
import { getStripeHealthReport } from "@/lib/billing/stripe-health";

export const runtime = "nodejs";

/** Public health check for Stripe env configuration (no secrets exposed). */
export async function GET() {
  const missingKeys = getMissingBillingEnvKeys();
  const configured = missingKeys.length === 0;
  const stripe = configured ? await getStripeHealthReport() : null;

  return NextResponse.json({
    ok: configured && (stripe?.ok ?? false),
    configured,
    missingKeys,
    stripe,
  });
}
