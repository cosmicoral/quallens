import { NextResponse } from "next/server";
import { runReviewPipeline } from "@/lib/agents/pipeline";
import type { LLMErrorCode } from "@/lib/llm";
import type { ManuscriptInput, ReviewResponse } from "@/lib/types";
import { getAuth } from "@/lib/auth/server";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { BillingError } from "@/lib/billing/errors";
import {
  markReviewRunCompleted,
  markReviewRunFailed,
  markReviewRunRunning,
  reserveReviewRun,
} from "@/lib/billing/repository";

export const runtime = "nodejs";

/** Map agent failure codes to HTTP statuses. */
const ERROR_STATUS: Record<LLMErrorCode, number> = {
  missing_api_key: 500,
  provider_error: 502,
  invalid_output: 502,
  refusal: 422,
};

/**
 * POST /api/review
 *
 * Accepts a ManuscriptInput and returns a ReviewResult. The Manuscript
 * Reader, all four specialist auditors, and Final Reviewer run against a real
 * LLM. Agent failures surface as typed errors (errorCode) — never invented data.
 */
export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json<ReviewResponse>(
      { ok: false, error: "Authentication is required to review a manuscript." },
      { status: 401 },
    );
  }
  await getOrCreateResearcherProfile(session.user);

  let body: Partial<ManuscriptInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ReviewResponse>(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json<ReviewResponse>(
      { ok: false, error: "Both 'title' and 'body' are required." },
      { status: 400 },
    );
  }

  const manuscript: ManuscriptInput = {
    title: body.title.trim(),
    abstract: body.abstract,
    body: body.body,
    methodology: body.methodology,
    discipline: body.discipline,
    authorNotes: body.authorNotes,
  };

  let reservation;
  try {
    reservation = await reserveReviewRun(session.user.id, manuscript.title);
  } catch (error) {
    if (error instanceof BillingError) {
      const status = error.code === "active_review" ? 409 : 402;
      return NextResponse.json<ReviewResponse>(
        { ok: false, error: error.message, errorCode: error.code },
        { status },
      );
    }
    throw error;
  }

  let pipelineResult;
  try {
    await markReviewRunRunning(reservation.id);
    pipelineResult = await runReviewPipeline(manuscript);
  } catch {
    try {
      await markReviewRunFailed(reservation.id, "unexpected_pipeline_error");
    } catch {
      // A stale-reservation sweep releases this run if the database is temporarily unavailable.
    }
    return NextResponse.json<ReviewResponse>(
      {
        ok: false,
        error: "The review pipeline failed unexpectedly. Please try again.",
        errorCode: "provider_error",
      },
      { status: 502 },
    );
  }
  if (!pipelineResult.ok) {
    const { agentId, error } = pipelineResult.error;
    await markReviewRunFailed(reservation.id, error.code);
    return NextResponse.json<ReviewResponse>(
      {
        ok: false,
        error: `${agentId} failed: ${error.message}`,
        errorCode: error.code,
      },
      { status: ERROR_STATUS[error.code] ?? 502 },
    );
  }

  await markReviewRunCompleted(reservation.id);
  return NextResponse.json<ReviewResponse>({ ok: true, result: pipelineResult.result });
}
