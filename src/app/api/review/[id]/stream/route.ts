import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import {
  getReviewRunForUser,
  type StoredReviewRun,
} from "@/lib/billing/repository";
import { startReviewJob } from "@/lib/review/worker";
import { REVIEW_STAGE_ORDER, summarizeReviewUsage } from "@/lib/review/usage";
import type { ReviewCheckpointEvent, ReviewResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 1800;

const POLL_INTERVAL_MS = 1_000;
const HEARTBEAT_INTERVAL_MS = 15_000;

function reviewResponse(run: StoredReviewRun): ReviewResponse {
  return {
    ok: run.status !== "failed",
    job: {
      reviewId: run.id,
      status: run.status,
      stage: run.progressStage ?? undefined,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      usage: summarizeReviewUsage(run.stageUsage),
    },
    result: run.status === "completed" ? run.result ?? undefined : undefined,
    error: run.status === "failed"
      ? run.failureDetail ?? "The review could not be completed. Please try again."
      : undefined,
    errorCode: run.status === "failed" ? run.failureCode ?? "provider_error" : undefined,
  };
}

function serializeEvent(event: string, data: unknown, id?: string) {
  return `${id ? `id: ${id}\n` : ""}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function waitForPoll(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, POLL_INTERVAL_MS);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

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
  const initialRun = await getReviewRunForUser(session.user.id, id);
  if (!initialRun) {
    return NextResponse.json<ReviewResponse>(
      { ok: false, error: "Review not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (initialRun.status === "pending" || initialRun.status === "running") {
    // Opening the stream is also a durable recovery signal after a Render restart.
    // Worker-level process and PostgreSQL locks make reconnects safe.
    void startReviewJob(initialRun.id);
  }

  const encoder = new TextEncoder();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown, eventId?: string) => {
        if (cancelled) return;
        controller.enqueue(encoder.encode(serializeEvent(event, data, eventId)));
      };
      const close = () => {
        if (cancelled) return;
        cancelled = true;
        controller.close();
      };

      controller.enqueue(encoder.encode("retry: 2000\n: review stream connected\n\n"));

      void (async () => {
        let run: StoredReviewRun | null = initialRun;
        let lastStatusSignature = "";
        let lastHeartbeatAt = Date.now();
        let consecutiveReadFailures = 0;
        const sentStages = new Set<string>();

        while (!cancelled && !request.signal.aborted && run) {
          const response = reviewResponse(run);
          const statusSignature = JSON.stringify(response.job);
          if (statusSignature !== lastStatusSignature) {
            send("status", response, `${run.id}:status:${run.progressStage ?? run.status}`);
            lastStatusSignature = statusSignature;
          }

          for (const stage of REVIEW_STAGE_ORDER) {
            const output = run.stageCheckpoints[stage];
            if (output === undefined || sentStages.has(stage)) continue;
            const checkpoint: ReviewCheckpointEvent = {
              stage,
              output,
              usage: summarizeReviewUsage(run.stageUsage),
            };
            send("checkpoint", checkpoint, `${run.id}:${stage}`);
            sentStages.add(stage);
          }

          if (run.status === "completed") {
            if (run.result) {
              send("complete", response, `${run.id}:complete`);
            } else {
              send("failed", {
                ok: false,
                job: response.job,
                error: "The completed reviewer report could not be loaded.",
                errorCode: "result_missing",
              } satisfies ReviewResponse, `${run.id}:failed`);
            }
            close();
            return;
          }

          if (run.status === "failed") {
            send("failed", response, `${run.id}:failed`);
            close();
            return;
          }

          if (Date.now() - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
            lastHeartbeatAt = Date.now();
          }

          await waitForPoll(request.signal);
          if (cancelled || request.signal.aborted) break;
          try {
            run = await getReviewRunForUser(session.user.id, id);
            consecutiveReadFailures = 0;
          } catch (error) {
            consecutiveReadFailures += 1;
            console.error(
              `[review-stream] status read failed run=${id} attempt=${consecutiveReadFailures}`,
              error,
            );
            send("stream-warning", { retrying: true });
            if (consecutiveReadFailures >= 5) {
              close();
              return;
            }
          }
        }
        close();
      })().catch((error) => {
        console.error(`[review-stream] unexpected stream failure run=${id}`, error);
        if (!cancelled) close();
      });
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
