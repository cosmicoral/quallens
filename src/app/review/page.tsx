"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewResults } from "@/components/ReviewResults";
import { ResearchIcon } from "@/components/ResearchIcon";
import { QualiSapioAgentMascot } from "@/components/review/QualiSapioAgentMascot";
import type { ManuscriptInput, ReviewResponse, ReviewResult } from "@/lib/types";
import type { UsageView } from "@/lib/billing/entitlement";

async function loadUsage(): Promise<UsageView | null> {
  const response = await fetch("/api/billing/usage", { cache: "no-store" });
  const data = await response.json() as { ok?: boolean; usage?: UsageView };
  return response.ok && data.usage ? data.usage : null;
}

export default function ReviewPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
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

  async function handleSubmit(manuscript: ManuscriptInput) {
    setSubmitting(true);
    setError(null);
    setErrorCode(null);
    setResult(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manuscript),
      });
      const data: ReviewResponse = await res.json();
      if (!data.ok || !data.result) {
        setError(data.error ?? "The review failed. Please try again.");
        setErrorCode(data.errorCode ?? null);
      } else {
        setResult(data.result);
      }
    } catch {
      setError("Could not reach the review service. Please try again.");
    } finally {
      setSubmitting(false);
      void loadUsage().then((value) => { if (value) setUsage(value); }).catch(() => {});
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
                    {usage.remaining} remaining · {usage.used} of {usage.limit} successful reviews used
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
              <QualiSapioAgentMascot illustrativeSequence className="mt-5" />
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
