import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * The former public diagnostic exposed provider metadata and could trigger a
 * billable Anthropic request. Keep the old URL dark so bookmarked probes do
 * not reveal configuration or spend API credits.
 */
export async function GET() {
  return new NextResponse(null, {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}
