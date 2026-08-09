import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { getUsageView } from "@/lib/billing/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Authentication is required.", errorCode: "unauthenticated" },
      { status: 401 },
    );
  }
  const usage = await getUsageView(session.user.id);
  return NextResponse.json({ ok: true, usage });
}
