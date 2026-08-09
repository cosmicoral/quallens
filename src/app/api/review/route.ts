import { NextResponse } from "next/server";
import { runReviewPipeline } from "@/lib/agents/pipeline";
import type { LLMErrorCode } from "@/lib/llm";
import type { ManuscriptInput, ReviewResponse } from "@/lib/types";

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
 * Reader, Evidence, Research Design, and Theory run against a real LLM;
 * Overclaim and Final return mock data. Agent failures surface as typed errors
 * (errorCode) — never invented data.
 */
export async function POST(request: Request) {
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

  const pipelineResult = await runReviewPipeline(manuscript);
  if (!pipelineResult.ok) {
    const { agentId, error } = pipelineResult.error;
    return NextResponse.json<ReviewResponse>(
      {
        ok: false,
        error: `${agentId} failed: ${error.message}`,
        errorCode: error.code,
      },
      { status: ERROR_STATUS[error.code] ?? 502 },
    );
  }

  return NextResponse.json<ReviewResponse>({ ok: true, result: pipelineResult.result });
}
