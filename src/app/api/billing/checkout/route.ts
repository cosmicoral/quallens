import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { checkoutSelectionSchema } from "@/lib/billing/config";
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
      { ok: false, error: "Choose a supported Qualisapio plan and billing interval.", errorCode: "invalid_plan" },
      { status: 400 },
    );
  }

  try {
    const result = await createCheckoutSession(session.user, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json(
        { ok: false, error: error.message, errorCode: error.code },
        { status: error.code === "subscription_exists" ? 409 : 400 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Billing could not be started. Please try again.", errorCode: "billing_unavailable" },
      { status: 502 },
    );
  }
}
