"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewResults } from "@/components/ReviewResults";
import { ResearchIcon } from "@/components/ResearchIcon";
import { QualiSapioAgentMascot } from "@/components/review/QualiSapioAgentMascot";
import { SpecialistReviewCard } from "@/components/review/SpecialistReviewCard";
import type {
  AgentId,
  AgentReview,
  ManuscriptInput,
  ReviewCheckpointEvent,
  ReviewResponse,
  ReviewResult,
  ReviewUsageSummary,
} from "@/lib/types";
import type { UsageView } from "@/lib/billing/entitlement";

async function loadUsage(): Promise<UsageView | null> {
  const response = await fetch("/api/billing/usage", { cache: "no-store" });
  const data = await response.json() as { ok?: boolean; usage?: UsageView };
  return response.ok && data.usage ? data.usage : null;
}

const STAGE_LABELS: Record<string, string> = {
  queued: "Queued safely",
  "manuscript-reader": "Reading and profiling the manuscript",
  "evidence-auditor": "Auditing evidence and claims",
  "research-design-reviewer": "Reviewing the research design",
  "theory-auditor": "Auditing theory and concepts",
  "overclaim-auditor": "Checking the scope of claims",
  "final-reviewer": "Synthesizing the final peer review",
};

const SPECIALIST_STAGE_ORDER: AgentId[] = [
  "manuscript-reader",
  "evidence-auditor",
  "research-design-reviewer",
  "theory-auditor",
  "overclaim-auditor",
];

function parseEventData<T>(event: Event): T | null {
  try {
    return JSON.parse((event as MessageEvent<string>).data) as T;
  } catch {
    return null;
  }
}

function isAgentReview(output: unknown): output is AgentReview {
  if (!output || typeof output !== "object") return false;
  const candidate = output as Partial<AgentReview>;
  return typeof candidate.agentId === "string"
    && typeof candidate.agentName === "string"
    && typeof candidate.summary === "string"
    && typeof candidate.score === "number"
    && Array.isArray(candidate.findings);
}

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

function ReviewUsageCard({ usage }: { usage: ReviewUsageSummary }) {
  const cost = usage.estimatedCostUsd < 0.01
    ? usage.estimatedCostUsd.toFixed(4)
    : usage.estimatedCostUsd.toFixed(2);
  return (
    <div className="mt-4 grid gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-xs text-[var(--slate)] shadow-sm sm:grid-cols-4">
      <p><span className="font-semibold text-[var(--ink)]">{usage.stages.length}/6</span> stages saved</p>
      <p><span className="font-semibold text-[var(--ink)]">{usage.inputTokens.toLocaleString()}</span> input tokens</p>
      <p><span className="font-semibold text-[var(--ink)]">{usage.outputTokens.toLocaleString()}</span> output tokens</p>
      <p><span className="font-semibold text-[var(--ink)]">${cost}</span> estimated API cost</p>
    </div>
  );
}

export default function ReviewPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<string | null>(null);
  const [reviewUsage, setReviewUsage] = useState<ReviewUsageSummary | null>(null);
  const [partialReviews, setPartialReviews] = useState<Partial<Record<AgentId, AgentReview>>>({});
  const [usage, setUsage] = useState<UsageView | null>(null);
  const [usageLoaded, setUsageLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadUsage()
      .then((value) => {
        if (!active) return;
        if (value) setUsage(value);
        setUsageLoaded(true);
      })
      .catch(() => {
        if (active) setUsageLoaded(true);
      });
    return () => { active = false; };
  }, []);

  const pollReview = useCallback(async (reviewId: string, signal?: AbortSignal) => {
    let consecutiveFailures = 0;
    while (!signal?.aborted) {
      try {
        const response = await fetch(`/api/review/${encodeURIComponent(reviewId)}`, {
          cache: "no-store",
          signal,
        });
        const raw = await response.text();
        let data: ReviewResponse;
        try {
          data = JSON.parse(raw) as ReviewResponse;
        } catch {
          throw new Error(`Unreadable status response (HTTP ${response.status})`);
        }

        consecutiveFailures = 0;
        if (data.job?.stage) setProgressStage(data.job.stage);
        if (data.job?.usage) setReviewUsage(data.job.usage);
        if (data.job?.status === "completed" && data.result) {
          setResult(data.result);
          setError(null);
          setErrorCode(null);
          setSubmitting(false);
          window.history.replaceState({}, "", "/review");
          void loadUsage().then((value) => { if (value) setUsage(value); }).catch(() => {});
          return;
        }
        if (data.job?.status === "failed" || (!data.ok && response.status < 500)) {
          setError(data.error ?? "The review could not be completed. Please try again.");
          setErrorCode(data.errorCode ?? "provider_error");
          setSubmitting(false);
          window.history.replaceState({}, "", "/review");
          void loadUsage().then((value) => { if (value) setUsage(value); }).catch(() => {});
          return;
        }
      } catch (caught) {
        if (signal?.aborted) return;
        consecutiveFailures += 1;
        setProgressStage("reconnecting");
        if (consecutiveFailures >= 10) {
          const detail = caught instanceof Error ? caught.message : "network error";
          setError(
            `The review is still saved, but its status could not be reached (${detail}). Refresh this page to resume checking it.`,
          );
          setErrorCode("status_unavailable");
          setSubmitting(false);
          return;
        }
      }
      await wait(consecutiveFailures > 0 ? 3_000 : 2_000, signal);
    }
  }, []);

  const streamReview = useCallback(async (reviewId: string, signal?: AbortSignal) => {
    if (typeof EventSource === "undefined") {
      await pollReview(reviewId, signal);
      return;
    }

    await new Promise<void>((resolve) => {
      if (signal?.aborted) {
        resolve();
        return;
      }

      const source = new EventSource(`/api/review/${encodeURIComponent(reviewId)}/stream`);
      let settled = false;
      let connectionFailures = 0;

      const finish = () => {
        if (settled) return;
        settled = true;
        source.close();
        signal?.removeEventListener("abort", onAbort);
        resolve();
      };
      const refreshUsage = () => {
        void loadUsage().then((value) => { if (value) setUsage(value); }).catch(() => {});
      };
      const onAbort = () => finish();

      source.onopen = () => {
        connectionFailures = 0;
      };
      source.addEventListener("status", (event) => {
        const data = parseEventData<ReviewResponse>(event);
        if (data?.job?.stage) setProgressStage(data.job.stage);
        if (data?.job?.usage) setReviewUsage(data.job.usage);
      });
      source.addEventListener("checkpoint", (event) => {
        const checkpoint = parseEventData<ReviewCheckpointEvent>(event);
        if (!checkpoint) return;
        if (checkpoint.usage) setReviewUsage(checkpoint.usage);
        if (checkpoint.stage !== "final-reviewer" && isAgentReview(checkpoint.output)) {
          setPartialReviews((current) => ({
            ...current,
            [checkpoint.stage]: checkpoint.output as AgentReview,
          }));
        }
      });
      source.addEventListener("complete", (event) => {
        const data = parseEventData<ReviewResponse>(event);
        if (!data?.result) return;
        setResult(data.result);
        setReviewUsage(data.result.usage ?? data.job?.usage ?? null);
        setError(null);
        setErrorCode(null);
        setSubmitting(false);
        window.history.replaceState({}, "", "/review");
        refreshUsage();
        finish();
      });
      source.addEventListener("failed", (event) => {
        const data = parseEventData<ReviewResponse>(event);
        setError(data?.error ?? "The review could not be completed. Please try again.");
        setErrorCode(data?.errorCode ?? "provider_error");
        setSubmitting(false);
        window.history.replaceState({}, "", "/review");
        refreshUsage();
        finish();
      });
      source.addEventListener("stream-warning", () => {
        setProgressStage("reconnecting");
      });
      source.onerror = () => {
        if (settled || signal?.aborted) return;
        connectionFailures += 1;
        setProgressStage("reconnecting");
        // EventSource reconnects automatically. If the stream endpoint itself is
        // unavailable, retain the existing durable status endpoint as a fallback.
        if (connectionFailures >= 5) {
          source.close();
          void pollReview(reviewId, signal).finally(finish);
        }
      };
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }, [pollReview]);

  useEffect(() => {
    const reviewId = new URLSearchParams(window.location.search).get("run");
    if (!reviewId) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSubmitting(true);
      setProgressStage("queued");
      void streamReview(reviewId, controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [streamReview]);

  async function handleSubmit(manuscript: ManuscriptInput) {
    setSubmitting(true);
    setError(null);
    setErrorCode(null);
    setResult(null);
    setProgressStage("queued");
    setReviewUsage(null);
    setPartialReviews({});
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manuscript),
      });
      const raw = await res.text();
      let data: ReviewResponse;
      try {
        data = JSON.parse(raw) as ReviewResponse;
      } catch {
        setError(
          res.status >= 500
            ? `The review service could not start the saved job (HTTP ${res.status}). Please try again.`
            : `The review service returned an unreadable response (HTTP ${res.status}). Please try again.`,
        );
        setErrorCode("provider_error");
        setSubmitting(false);
        return;
      }
      if (!data.ok || !data.job) {
        setError(data.error ?? "The review failed. Please try again.");
        setErrorCode(data.errorCode ?? null);
        setSubmitting(false);
      } else {
        window.history.replaceState({}, "", `/review?run=${encodeURIComponent(data.job.reviewId)}`);
        await streamReview(data.job.reviewId);
      }
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : "unknown network error";
      setError(
        `Could not submit the review (${detail}). Please try again.`,
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 border-b border-[var(--line)]/80 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-2">Peer-review workspace</p>
          <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.04] tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">
            Submit a manuscript for structured peer-review feedback.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--slate)]">
            Use QualiSapio as an author seeking revision guidance or as a reviewer
            organizing your assessment. The panel returns constructive feedback on
            evidence, design, theory, and claims—without rewriting the text.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-4 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:bg-[var(--paper-blue)]"
        >
          Peer-review history
        </Link>
      </div>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
          <aside className="rounded-2xl border border-[var(--line)] bg-[var(--ink)] p-6 text-white lg:sticky lg:top-24">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue-light)]">
              What happens next
            </p>
            <ol className="space-y-6">
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="manuscript-reader" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Manuscript Reader</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Builds a validated profile without filling in missing information.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="evidence-auditor" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Evidence Auditor</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Checks claim wording, evidence type, distribution, and deviant cases.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="research-design-reviewer" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Research Design Reviewer</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Assesses design fit, transparency, reflexivity, and coherence.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="theory-auditor" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Theory Auditor</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Traces frameworks, concepts, integration, and conceptual drift.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="overclaim-auditor" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Overclaim Auditor</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Tests causal, population, novelty, and recommendation scope.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-slate-300">
                  <ResearchIcon name="synthesize" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Final synthesis</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Delivers a peer-review report with prioritized revisions.
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
              Plain-text submission only. File upload and document parsing are not
              part of this MVP.
            </div>
          </aside>

          <div className="min-w-0">
            {usage && (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{usage.planName} peer-review allowance</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {usage.isUnlimited
                      ? `Unlimited reviews · ${usage.used} successful reviews completed`
                      : `${usage.remaining} remaining · ${usage.used} of ${usage.limit} successful reviews used`}
                    {usage.reserved > 0 ? " · one review in progress" : ""}
                  </p>
                </div>
                <Link href="/pricing" className="text-sm font-semibold text-[var(--blue-deep)] hover:underline">View plans</Link>
              </div>
            )}

            <ReviewForm
              onSubmit={handleSubmit}
              submitting={submitting}
              disabled={!usageLoaded || Boolean(usage && !usage.canReview)}
            />

            {submitting && (
              <div className="mt-5">
                <QualiSapioAgentMascot illustrativeSequence />
                <p role="status" className="mt-3 text-center text-sm font-semibold text-[var(--blue-deep)]">
                  {progressStage === "reconnecting"
                    ? "Reconnecting to the saved review…"
                    : STAGE_LABELS[progressStage ?? "queued"] ?? "Review in progress"}
                </p>
                <p className="mt-1 text-center text-xs text-[var(--muted)]">
                  You can refresh this page; the review will continue and resume automatically.
                </p>
              </div>
            )}

            {reviewUsage && !result && <ReviewUsageCard usage={reviewUsage} />}

            {submitting && SPECIALIST_STAGE_ORDER.some((stage) => partialReviews[stage]) && (
              <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper-blue)] p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">Reviewer reports arriving live</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Each completed reviewer is saved and shown immediately.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--blue-deep)] shadow-sm">
                    {SPECIALIST_STAGE_ORDER.filter((stage) => partialReviews[stage]).length}/5 complete
                  </span>
                </div>
                <div className="space-y-3">
                  {SPECIALIST_STAGE_ORDER.flatMap((stage) => {
                    const review = partialReviews[stage];
                    return review ? [<SpecialistReviewCard key={stage} review={review} />] : [];
                  })}
                </div>
              </section>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
              >
                <p className="font-semibold">The review could not be completed.</p>
                <p className="mt-1 text-amber-900">{error}</p>
                {errorCode === "active_review" && (
                  <Link href="/dashboard" className="mt-3 inline-flex font-semibold text-[var(--blue-deep)] underline">
                    Open review history
                  </Link>
                )}
                {["quota_exhausted", "free_trial_used", "former_paid_user"].includes(errorCode ?? "") && (
                  <Link href="/pricing" className="mt-3 inline-flex font-semibold text-[var(--blue-deep)] underline">Compare QualiSapio plans</Link>
                )}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-12 scroll-mt-24 sm:mt-14">
            <ReviewResults result={result} />
          </div>
        )}
    </>
  );
}
