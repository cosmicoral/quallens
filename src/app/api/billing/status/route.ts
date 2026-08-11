import { NextResponse } from "next/server";
import { getMissingBillingEnvKeys } from "@/lib/billing/config";

export const runtime = "nodejs";

/** Public health check for Stripe env configuration (no secrets exposed). */
export async function GET() {
  const missingKeys = getMissingBillingEnvKeys();
  return NextResponse.json({
    ok: missingKeys.length === 0,
    configured: missingKeys.length === 0,
    missingKeys,
  });
}
