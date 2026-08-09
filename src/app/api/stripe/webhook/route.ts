import { NextResponse } from "next/server";
import {
  defaultWebhookDependencies,
  processStripeEvent,
  verifyStripeEvent,
  WebhookSignatureError,
} from "@/lib/billing/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Stripe signature is required." }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = verifyStripeEvent(payload, signature);
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      return NextResponse.json({ ok: false, error: "Invalid Stripe signature." }, { status: 400 });
    }
    throw error;
  }

  await processStripeEvent(event, defaultWebhookDependencies());
  return NextResponse.json({ received: true });
}
