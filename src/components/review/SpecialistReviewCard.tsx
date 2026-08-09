import type { AgentReview, ReviewFinding, Severity } from "@/lib/types";
import { AgentMascot } from "./AgentMascot";
import { EvidenceAuditDetails } from "./EvidenceAuditDetails";
import { OverclaimAuditDetails } from "./OverclaimAuditDetails";
import { ResearchDesignAuditDetails } from "./ResearchDesignAuditDetails";
import { ScoreBadge } from "./ScoreBadge";
import { TheoryAuditDetails } from "./TheoryAuditDetails";

const SEVERITY_STYLES: Record<Severity, string> = {
  minor: "border-slate-200 bg-slate-50 text-slate-700",
  moderate: "border-amber-200 bg-amber-50 text-amber-900",
  major: "border-rose-200 bg-rose-50 text-rose-900",
};

function FindingList({ findings }: { findings: ReviewFinding[] }) {
  if (findings.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
        No review findings were returned for this specialist.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {findings.map((finding) => (
        <li key={finding.id} className="rounded-xl border border-[var(--line)] bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${SEVERITY_STYLES[finding.severity]}`}
            >
              {finding.severity}
            </span>
            <h4 className="text-sm font-semibold text-[var(--ink)]">{finding.title}</h4>
            {finding.location && (
              <span className="text-xs text-[var(--muted)]">{finding.location}</span>
            )}
          </div>
          <p className="text-sm leading-6 text-[var(--slate)]">{finding.detail}</p>
          {finding.recommendation && (
            <p className="mt-3 border-l-2 border-[var(--line-strong)] pl-3 text-sm leading-6 text-[var(--slate)]">
              <span className="font-semibold text-[var(--ink)]">Revision guidance: </span>
              {finding.recommendation}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function SpecialistReviewCard({ review }: { review: AgentReview }) {
  const itemCount = review.evidenceAudit
    ? `${review.evidenceAudit.claims.length} claim${review.evidenceAudit.claims.length === 1 ? "" : "s"}`
    : review.researchDesignAudit
      ? "9 design dimensions"
      : review.theoryAudit
        ? `${review.theoryAudit.frameworks.length} framework${review.theoryAudit.frameworks.length === 1 ? "" : "s"}`
        : review.overclaimAudit
          ? `${review.overclaimAudit.claims.length} claim${review.overclaimAudit.claims.length === 1 ? "" : "s"}`
        : `${review.findings.length} finding${review.findings.length === 1 ? "" : "s"}`;

  return (
    <details
      open={review.agentId === "evidence-auditor"}
      className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
    >
      <summary className="flex list-none items-center justify-between gap-4 p-4 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-3.5">
          <AgentMascot
            agentId={review.agentId}
            className="size-12 shrink-0 rounded-xl border border-[var(--line)] bg-white"
            sizes="48px"
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--ink)]">{review.agentName}</span>
              <span
                className="rounded-full bg-[var(--paper-blue)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--blue)]"
              >
                Live analysis
              </span>
            </span>
            <span className="mt-1 block text-xs text-[var(--muted)]">{itemCount}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <ScoreBadge score={review.score} />
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-5 text-[var(--muted)] transition group-open:rotate-180"
            fill="none"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className="border-t border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5">
        <p className="mb-5 max-w-3xl text-sm leading-6 text-[var(--slate)]">{review.summary}</p>
        {review.evidenceAudit ? (
          <EvidenceAuditDetails audit={review.evidenceAudit} />
        ) : review.researchDesignAudit ? (
          <ResearchDesignAuditDetails audit={review.researchDesignAudit} />
        ) : review.theoryAudit ? (
          <TheoryAuditDetails audit={review.theoryAudit} />
        ) : review.overclaimAudit ? (
          <OverclaimAuditDetails audit={review.overclaimAudit} />
        ) : (
          <FindingList findings={review.findings} />
        )}
      </div>
    </details>
  );
}
