import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

/** Public check that Anthropic review credentials work (no secrets exposed). */
export async function GET(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim() ?? "";
  const provider = process.env.LLM_PROVIDER?.trim() || "anthropic";
  const model = process.env.LLM_MODEL?.trim() || "claude-opus-5";
  const configured = Boolean(apiKey) && provider === "anthropic";
  const wantPing = new URL(request.url).searchParams.get("ping") === "1";

  const base = {
    ok: configured,
    configured,
    provider,
    model,
    apiKeyPresent: Boolean(apiKey),
    apiKeyPrefix: apiKey ? `${apiKey.slice(0, 10)}…` : null,
  };

  if (!wantPing) {
    return NextResponse.json(base);
  }

  if (!configured) {
    return NextResponse.json({
      ...base,
      ping: { ok: false, error: "Anthropic is not configured." },
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const started = Date.now();
    const response = await client.messages.create({
      model,
      max_tokens: 32,
      messages: [{ role: "user", content: "Reply with exactly: ok" }],
    });
    const text =
      response.content.find((block) => block.type === "text")?.text?.trim() ?? "";
    return NextResponse.json({
      ...base,
      ok: true,
      ping: {
        ok: true,
        ms: Date.now() - started,
        stopReason: response.stop_reason,
        textPreview: text.slice(0, 40),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status?: number }).status)
        : undefined;
    return NextResponse.json({
      ...base,
      ok: false,
      ping: {
        ok: false,
        status: status ?? null,
        error: message.slice(0, 240),
      },
    });
  }
}
