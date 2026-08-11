import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Public check that Anthropic review credentials are present (no secrets exposed). */
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim() ?? "";
  const provider = process.env.LLM_PROVIDER?.trim() || "anthropic";
  const model = process.env.LLM_MODEL?.trim() || "claude-opus-5";
  const configured = Boolean(apiKey) && provider === "anthropic";

  return NextResponse.json({
    ok: configured,
    configured,
    provider,
    model,
    apiKeyPresent: Boolean(apiKey),
    apiKeyPrefix: apiKey ? `${apiKey.slice(0, 10)}…` : null,
  });
}
