import { ScoreBadge } from "@/components/review/ScoreBadge";
import { SpecialistReviewCard } from "@/components/review/SpecialistReviewCard";
import type { ReviewResult, Verdict } from "@/lib/types";

const VERDICT_LABELS: Record<Verdict, string> = {
  accept: "Accept",
  "minor-revisions": "Minor revisions",
  "major-revisions": "Major revisions",
  reject: "Reject",
};

const VERDICT_STYLES: Record<Verdict, string> = {
  accept: "border-sky-200 bg-sky-50 text-sky-900",
  "minor-revisions": "border-slate-200 bg-slate-50 text-slate-800",
  "major-revisions": "border-amber-200 bg-amber-50 text-amber-900",
  reject: "border-rose-200 bg-rose-50 text-rose-900",
};

export function ReviewResults({ result }: { result: ReviewResult }) {
  const { finalAssessment: final } = result;

  return (
    <section aria-labelledby="review-results-heading">
      <header className="mb-8 border-b border-[var(--line)] pb-6">
        <p className="eyebrow">Review complete</p>
        <h2
          id="review-results-heading"
          className="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl"
        >
          {result.manuscriptTitle}
        </h2>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
          Review ID {result.reviewId}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl bg-[var(--ink)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--blue-light)]">
                Overall Assessment
              </p>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${VERDICT_STYLES[final.verdict]}`}
              >
                {VERDICT_LABELS[final.verdict]}
              </span>
            </div>
            <ScoreBadge score={final.overallScore} large />
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-200">{final.summary}</p>
          <div className="mt-8 border-t border-white/10 pt-5 text-xs text-slate-400">
            Final synthesis is currently an MVP output; inspect the four live
            specialist panels below for manuscript-specific analysis.
          </div>
        </article>

        <div className="grid gap-5">
          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--blue)]">
              Key Strengths
            </h3>
            <ul className="space-y-3 text-sm leading-6 text-[var(--slate)]">
              {final.strengths.map((strength) => (
                <li key={strength} className="flex gap-3">
                  <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-[var(--paper-blue)] text-[10px] font-bold text-[var(--blue)]">
                    ✓
                  </span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--amber)]">
              Priority Revisions
            </h3>
            <ol className="space-y-3 text-sm leading-6 text-[var(--slate)]">
              {final.recommendations.map((recommendation, index) => (
                <li key={recommendation} className="flex gap-3">
                  <span className="font-mono text-xs font-semibold text-[var(--amber)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>

      {final.weaknesses.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper-warm)] p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slate)]">
            Review concerns
          </h3>
          <ul className="grid gap-2 text-sm leading-6 text-[var(--slate)] sm:grid-cols-2">
            {final.weaknesses.map((weakness) => (
              <li key={weakness} className="flex gap-2.5">
                <span aria-hidden="true" className="text-[var(--amber)]">
                  —
                </span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section aria-labelledby="specialist-reviews-heading" className="mt-14 sm:mt-16">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Panel findings</p>
            <h3
              id="specialist-reviews-heading"
              className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-3xl"
            >
              Specialist Reviews
            </h3>
          </div>
          <p className="text-xs text-[var(--muted)]">Open a reviewer to inspect its reasoning.</p>
        </div>

        <div className="space-y-3">
          {result.agentReviews.map((review) => (
            <SpecialistReviewCard key={review.agentId} review={review} />
          ))}
        </div>
      </section>
    </section>
  );
}
