import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { createPortalSession } from "@/lib/billing/checkout";
import { BillingError } from "@/lib/billing/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Authentication is required to manage billing.", errorCode: "unauthenticated" },
      { status: 401 },
    );
  }
  try {
    const result = await createPortalSession(session.user.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json(
        { ok: false, error: error.message, errorCode: error.code },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Billing management is temporarily unavailable.", errorCode: "billing_unavailable" },
      { status: 502 },
    );
  }
}
