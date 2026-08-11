import { after, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { getReviewRunForUser } from "@/lib/billing/repository";
import { startReviewJob } from "@/lib/review/worker";
import type { ReviewResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 1800;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json<ReviewResponse>(
      { ok: false, error: "Authentication is required to view this review." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { id } = await params;
  const run = await getReviewRunForUser(session.user.id, id);
  if (!run) {
    return NextResponse.json<ReviewResponse>(
      { ok: false, error: "Review not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (run.status === "pending" || run.status === "running") {
    // Polling also acts as a recovery signal after a Render restart.
    after(() => startReviewJob(run.id));
  }

  const response: ReviewResponse = {
    ok: run.status !== "failed",
    job: {
      reviewId: run.id,
      status: run.status,
      stage: run.progressStage ?? undefined,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
    },
    result: run.status === "completed" ? run.result ?? undefined : undefined,
    error: run.status === "failed"
      ? run.failureDetail ?? "The review could not be completed. Please try again."
      : undefined,
    errorCode: run.status === "failed" ? run.failureCode ?? "provider_error" : undefined,
  };

  return NextResponse.json(response, {
    status: run.status === "failed" ? 422 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
