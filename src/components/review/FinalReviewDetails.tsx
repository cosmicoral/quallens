import type {
  FinalReview,
  FinalReviewPoint,
  FinalReviewSourceAgent,
  SectionReview,
} from "@/lib/types";
import { AgentMascot } from "./AgentMascot";

const RECOMMENDATION_LABELS: Record<FinalReview["recommendation"], string> = {
  minor_revision: "Minor revision",
  major_revision: "Major revision",
  borderline: "Borderline",
  not_ready: "Not ready",
  cannot_assess: "Cannot assess",
};

const RECOMMENDATION_STYLES: Record<FinalReview["recommendation"], string> = {
  minor_revision: "border-sky-200 bg-sky-50 text-sky-900",
  major_revision: "border-amber-200 bg-amber-50 text-amber-950",
  borderline: "border-orange-200 bg-orange-50 text-orange-950",
  not_ready: "border-rose-200 bg-rose-50 text-rose-950",
  cannot_assess: "border-slate-200 bg-slate-50 text-slate-800",
};

const SECTION_LABELS = {
  introduction: "Introduction",
  methods: "Methods",
  findings: "Findings",
  discussion: "Discussion",
  conclusion: "Conclusion",
} as const;

const SECTION_ASSESSMENT_LABELS: Record<SectionReview["assessment"], string> = {
  strong: "Strong",
  adequate: "Adequate",
  needs_revision: "Needs revision",
  major_revision: "Major revision",
  cannot_assess: "Cannot assess",
};

const SECTION_ASSESSMENT_STYLES: Record<SectionReview["assessment"], string> = {
  strong: "border-sky-200 bg-sky-50 text-sky-900",
  adequate: "border-cyan-200 bg-cyan-50 text-cyan-900",
  needs_revision: "border-amber-200 bg-amber-50 text-amber-950",
  major_revision: "border-rose-200 bg-rose-50 text-rose-950",
  cannot_assess: "border-slate-200 bg-slate-50 text-slate-700",
};

const SOURCE_LABELS: Record<FinalReviewSourceAgent, string> = {
  reader: "Reader",
  evidence: "Evidence",
  research_design: "Research design",
  theory: "Theory",
  overclaim: "Overclaim",
};

const COHERENCE_LABELS: Record<keyof FinalReview["cross_section_coherence"], string> = {
  research_question_to_design: "Question → design",
  design_to_findings: "Design → findings",
  findings_to_discussion: "Findings → discussion",
  discussion_to_contribution: "Discussion → contribution",
  conclusion_proportionality: "Conclusion proportionality",
};

function Sources({ sources }: { sources: FinalReviewSourceAgent[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Review sources">
      {sources.map((source) => (
        <span
          key={source}
          className="rounded-full border border-[var(--line)] bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]"
        >
          {SOURCE_LABELS[source]}
        </span>
      ))}
    </div>
  );
}

function ReviewPointList({
  points,
  emptyLabel,
}: {
  points: FinalReviewPoint[];
  emptyLabel: string;
}) {
  if (points.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {points.map((point, index) => (
        <li
          key={`${point.title}-${index}`}
          className="rounded-xl border border-[var(--line)] bg-white p-4"
        >
          <h5 className="text-sm font-semibold text-[var(--ink)]">{point.title}</h5>
          <p className="mt-1.5 text-sm leading-6 text-[var(--slate)]">
            {point.description}
          </p>
          <Sources sources={point.source_agents} />
        </li>
      ))}
    </ul>
  );
}

function SectionCard({ label, review }: { label: string; review: SectionReview }) {
  return (
    <details className="group rounded-2xl border border-[var(--line)] bg-white open:shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
      <summary className="flex list-none items-center justify-between gap-3 px-4 py-4 marker:hidden sm:px-5">
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="text-sm text-[var(--muted)] transition-transform group-open:rotate-90"
          >
            ›
          </span>
          <span className="text-sm font-semibold text-[var(--ink)]">{label}</span>
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${SECTION_ASSESSMENT_STYLES[review.assessment]}`}
        >
          {SECTION_ASSESSMENT_LABELS[review.assessment]}
        </span>
      </summary>
      <div className="grid gap-5 border-t border-[var(--line)] px-4 py-5 sm:px-5 lg:grid-cols-3">
        <div>
          <h5 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)]">
            Strengths
          </h5>
          <CompactList items={review.strengths} emptyLabel="None identified." />
        </div>
        <div>
          <h5 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--amber)]">
            Concerns
          </h5>
          <CompactList items={review.concerns} emptyLabel="No section concerns." />
        </div>
        <div>
          <h5 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--slate)]">
            Recommended actions
          </h5>
          <CompactList items={review.recommended_actions} emptyLabel="No action required." />
        </div>
      </div>
    </details>
  );
}

function CompactList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-xs leading-5 text-[var(--muted)]">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2 text-xs leading-5 text-[var(--slate)]">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span aria-hidden="true" className="text-[var(--blue)]">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FinalReviewDetails({ review }: { review: FinalReview }) {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-[var(--ink)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--blue-light)]">
              Overall assessment
            </p>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${RECOMMENDATION_STYLES[review.recommendation]}`}
            >
              {RECOMMENDATION_LABELS[review.recommendation]}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Review confidence
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-white">
                {review.confidence}
              </p>
            </div>
            <AgentMascot
              agentId="final-reviewer"
              className="size-20 rounded-xl border border-white/15 bg-white sm:size-24"
              sizes="96px"
            />
          </div>
        </div>
        <p className="max-w-4xl text-base leading-7 text-slate-100 sm:text-lg sm:leading-8">
          {review.overall_assessment}
        </p>
        <div className="mt-7 border-t border-white/10 pt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Manuscript in brief
          </p>
          <p className="max-w-4xl text-sm leading-6 text-slate-300">
            {review.manuscript_summary}
          </p>
        </div>
      </section>

      <section aria-labelledby="priority-revisions-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Revision plan</p>
            <h3
              id="priority-revisions-heading"
              className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]"
            >
              Priority revisions
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[var(--muted)]">
            {review.priority_revisions.length} of 5
          </span>
        </div>
        {review.priority_revisions.length > 0 ? (
          <ol className="space-y-3">
            {review.priority_revisions.map((revision) => (
              <li
                key={`${revision.priority}-${revision.title}`}
                className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:grid-cols-[2.5rem_1fr]"
              >
                <span className="grid size-9 place-items-center rounded-full bg-[var(--paper-blue)] font-mono text-xs font-bold text-[var(--blue)]">
                  {String(revision.priority).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="text-base font-semibold text-[var(--ink)]">
                    {revision.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
                    <span className="font-semibold text-[var(--ink)]">Why it matters: </span>
                    {revision.why_it_matters}
                  </p>
                  <p className="mt-2 border-l-2 border-[var(--amber)] pl-3 text-sm leading-6 text-[var(--slate)]">
                    <span className="font-semibold text-[var(--ink)]">Action: </span>
                    {revision.action}
                  </p>
                  <Sources sources={revision.source_agents} />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)]">
            No priority revisions were identified.
          </p>
        )}
      </section>

      <section aria-labelledby="section-review-heading">
        <p className="eyebrow">By manuscript section</p>
        <h3
          id="section-review-heading"
          className="mb-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]"
        >
          Section review
        </h3>
        <div className="space-y-3">
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <SectionCard
              key={key}
              label={label}
              review={review.section_reviews[key as keyof typeof SECTION_LABELS]}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="coherence-heading">
        <p className="eyebrow">Argument chain</p>
        <h3
          id="coherence-heading"
          className="mb-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]"
        >
          Cross-section coherence
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(review.cross_section_coherence).map(([key, value]) => (
            <article
              key={key}
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 last:md:col-span-2"
            >
              <h4 className="text-xs font-semibold text-[var(--ink)]">
                {COHERENCE_LABELS[key as keyof typeof COHERENCE_LABELS]}
              </h4>
              <p className="mt-1.5 text-sm leading-6 text-[var(--slate)]">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="final-concerns-heading">
        <p className="eyebrow">Synthesis</p>
        <h3
          id="final-concerns-heading"
          className="mb-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]"
        >
          Major concerns
        </h3>
        <ReviewPointList
          points={review.major_concerns}
          emptyLabel="No major manuscript-level concerns were identified."
        />
        {review.minor_concerns.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Minor concerns
            </h4>
            <ReviewPointList points={review.minor_concerns} emptyLabel="" />
          </div>
        )}
      </section>

      <section aria-labelledby="final-strengths-heading">
        <p className="eyebrow">What works</p>
        <h3
          id="final-strengths-heading"
          className="mb-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]"
        >
          Strengths
        </h3>
        <ReviewPointList
          points={review.strengths}
          emptyLabel="No manuscript-level strengths could be assessed."
        />
      </section>
    </div>
  );
}
