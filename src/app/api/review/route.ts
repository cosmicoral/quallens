import { randomUUID } from "node:crypto";
import { after, NextResponse } from "next/server";
import type { ManuscriptInput, Methodology, ReviewResponse } from "@/lib/types";
import { getAuth } from "@/lib/auth/server";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { BillingError } from "@/lib/billing/errors";
import { markReviewRunFailed, reserveReviewRun } from "@/lib/billing/repository";
import { startReviewJob } from "@/lib/review/worker";

export const runtime = "nodejs";
export const maxDuration = 1800;

const MAX_MANUSCRIPT_CHARS = 300_000;
const METHODOLOGIES = new Set<Methodology>([
  "ethnography",
  "interviews",
  "focus-groups",
  "case-study",
  "grounded-theory",
  "discourse-analysis",
  "mixed-methods",
  "other",
]);

type ReviewStage =
  | "authentication"
  | "profile"
  | "request_validation"
  | "reservation"
  | "dispatch";

interface ReviewRequestContext {
  requestId: string;
  reservationId?: string;
  stage: ReviewStage;
}

function manuscriptSize(manuscript: ManuscriptInput) {
  return [
    manuscript.title,
    manuscript.abstract,
    manuscript.body,
    manuscript.methodology,
    manuscript.discipline,
    manuscript.targetJournal,
    manuscript.authorNotes,
  ].reduce((total, value) => total + (value?.length ?? 0), 0);
}

async function safelyMarkDispatchFailed(runId: string, requestId: string) {
  try {
    await markReviewRunFailed(
      runId,
      "dispatch_error",
      new Date(),
      `The background review could not be scheduled. Reference: ${requestId}.`,
    );
  } catch (error) {
    console.error(
      `[api/review] could not persist dispatch failure request=${requestId} run=${runId}`,
      error,
    );
  }
}

async function handleReviewRequest(request: Request, context: ReviewRequestContext) {
  context.stage = "authentication";
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json<ReviewResponse>(
      { ok: false, error: "Authentication is required to review a manuscript." },
      { status: 401 },
    );
  }

  context.stage = "profile";
  await getOrCreateResearcherProfile(session.user);

  context.stage = "request_validation";
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
    abstract: body.abstract?.trim() || undefined,
    body: body.body.trim(),
    methodology: body.methodology && METHODOLOGIES.has(body.methodology)
      ? body.methodology
      : undefined,
    discipline: body.discipline?.trim() || undefined,
    targetJournal: body.targetJournal?.trim() || undefined,
    authorNotes: body.authorNotes?.trim() || undefined,
  };
  if (manuscriptSize(manuscript) > MAX_MANUSCRIPT_CHARS) {
    return NextResponse.json<ReviewResponse>(
      {
        ok: false,
        error: "The manuscript is too large. Please keep the submitted text under 300,000 characters.",
        errorCode: "manuscript_too_large",
      },
      { status: 413 },
    );
  }

  context.stage = "reservation";
  let reservation;
  try {
    reservation = await reserveReviewRun(session.user.id, manuscript);
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json<ReviewResponse>(
        { ok: false, error: error.message, errorCode: error.code },
        { status: error.code === "active_review" ? 409 : 402 },
      );
    }
    throw error;
  }
  context.reservationId = reservation.id;

  context.stage = "dispatch";
  try {
    after(() => startReviewJob(reservation.id));
  } catch (error) {
    await safelyMarkDispatchFailed(reservation.id, context.requestId);
    throw error;
  }

  console.info(
    `[api/review] queued request=${context.requestId} run=${reservation.id} bodyChars=${manuscript.body.length}`,
  );
  return NextResponse.json<ReviewResponse>(
    {
      ok: true,
      job: { reviewId: reservation.id, status: "pending", stage: "queued" },
    },
    { status: 202, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const context: ReviewRequestContext = {
    requestId: randomUUID(),
    stage: "authentication",
  };

  try {
    const response = await handleReviewRequest(request, context);
    response.headers.set("X-Review-Request-Id", context.requestId);
    return response;
  } catch (error) {
    console.error(
      `[api/review] unhandled failure request=${context.requestId} stage=${context.stage}${
        context.reservationId ? ` run=${context.reservationId}` : ""
      }`,
      error,
    );
    return NextResponse.json<ReviewResponse>(
      {
        ok: false,
        error: `The review service failed during ${context.stage}. Reference: ${context.requestId}.`,
        errorCode: "provider_error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Review-Request-Id": context.requestId,
        },
      },
    );
  }
}
