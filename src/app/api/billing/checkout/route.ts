import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { checkoutSelectionSchema, getMissingBillingEnvKeys } from "@/lib/billing/config";
import { createCheckoutSession } from "@/lib/billing/checkout";
import { BillingError } from "@/lib/billing/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Authentication is required to choose a plan.", errorCode: "unauthenticated" },
      { status: 401 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be valid JSON.", errorCode: "invalid_plan" },
      { status: 400 },
    );
  }
  const parsed = checkoutSelectionSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Choose a supported QualiSapio plan and billing interval.", errorCode: "invalid_plan" },
      { status: 400 },
    );
  }

  try {
    const result = await createCheckoutSession(session.user, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof BillingError) {
      const status =
        error.code === "subscription_exists"
          ? 409
          : error.code === "billing_not_configured"
            ? 503
            : 400;
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          errorCode: error.code,
          ...(error.code === "billing_not_configured"
            ? { missingKeys: getMissingBillingEnvKeys() }
            : {}),
        },
        { status },
      );
    }

    console.error("[billing/checkout]", error);

    if (error instanceof Stripe.errors.StripeError) {
      const message =
        error.type === "StripeAuthenticationError"
          ? "Stripe API authentication failed. Check STRIPE_SECRET_KEY matches your price mode (Live vs Test)."
          : error.code === "resource_missing"
            ? error.param === "customer"
              ? "Your Stripe customer was created in Test mode and cannot be reused in Live mode. Try again after the server redeploys the latest fix."
              : "That subscription price was not found in Stripe. Check the four STRIPE_PRICE_* IDs on the server."
            : "Billing could not be started. Please try again.";
      return NextResponse.json(
        { ok: false, error: message, errorCode: "billing_unavailable" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Billing could not be started. Please try again.", errorCode: "billing_unavailable" },
      { status: 502 },
    );
  }
}
