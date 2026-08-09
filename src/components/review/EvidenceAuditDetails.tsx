import type { ClaimEvidenceAudit, EvidenceAudit, EvidenceItem } from "@/lib/types";

const SUPPORT_LABELS: Record<ClaimEvidenceAudit["support_assessment"], string> = {
  strongly_supported: "Strongly supported",
  supported: "Supported",
  partially_supported: "Partially supported",
  weakly_supported: "Weakly supported",
  unsupported: "Unsupported",
  cannot_assess: "Cannot assess",
};

const SUPPORT_STYLES: Record<ClaimEvidenceAudit["support_assessment"], string> = {
  strongly_supported: "border-sky-200 bg-sky-50 text-sky-900",
  supported: "border-cyan-200 bg-cyan-50 text-cyan-900",
  partially_supported: "border-amber-200 bg-amber-50 text-amber-900",
  weakly_supported: "border-orange-200 bg-orange-50 text-orange-900",
  unsupported: "border-rose-200 bg-rose-50 text-rose-900",
  cannot_assess: "border-slate-200 bg-slate-50 text-slate-700",
};

const DISTRIBUTION_LABELS: Record<ClaimEvidenceAudit["evidence_distribution"], string> = {
  single_case: "Single case",
  small_subset: "Small subset",
  multiple_cases: "Multiple cases",
  broad_dataset: "Broad dataset",
  unclear: "Distribution unclear",
};

function EvidenceItems({
  items,
  emptyLabel,
}: {
  items: EvidenceItem[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li
          key={`${item.evidence_type}-${item.source_label ?? "unlabelled"}-${index}`}
          className="rounded-xl border border-[var(--line)] bg-white p-3.5"
        >
          <div className="mb-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
            <span>{item.evidence_type.replaceAll("_", " ")}</span>
            {item.source_label && (
              <>
                <span aria-hidden="true" className="text-[var(--line-strong)]">
                  /
                </span>
                <span>{item.source_label}</span>
              </>
            )}
          </div>
          <p className="text-sm leading-6 text-[var(--slate)]">
            {item.excerpt_or_description}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function EvidenceAuditDetails({ audit }: { audit: EvidenceAudit }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Claim-level evidence audit
          </h4>
          <span className="font-mono text-[11px] text-[var(--muted)]">
            {audit.claims.length} claim{audit.claims.length === 1 ? "" : "s"}
          </span>
        </div>

        {audit.claims.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
            No major analytical claims were available to audit.
          </p>
        ) : (
          <div className="space-y-4">
            {audit.claims.map((claim) => (
              <article
                key={claim.claim_id}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]"
              >
                <div className="border-b border-[var(--line)] bg-white p-4 sm:p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-medium text-[var(--blue)]">
                      {claim.claim_id}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${SUPPORT_STYLES[claim.support_assessment]}`}
                    >
                      {SUPPORT_LABELS[claim.support_assessment]}
                    </span>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 text-[11px] font-medium text-[var(--slate)]">
                      {DISTRIBUTION_LABELS[claim.evidence_distribution]}
                    </span>
                  </div>
                  <h5 className="text-base font-semibold leading-6 tracking-[-0.01em] text-[var(--ink)]">
                    {claim.claim_text}
                  </h5>
                  {claim.claim_scope && (
                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                      <span className="font-semibold text-[var(--slate)]">Claim scope:</span>{" "}
                      {claim.claim_scope}
                    </p>
                  )}
                </div>

                <div className="space-y-5 p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                    <p className="text-sm leading-6 text-[var(--slate)]">{claim.reasoning}</p>
                    <div className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--muted)]">
                      Overclaim risk:{" "}
                      <span className="font-semibold capitalize text-[var(--ink)]">
                        {claim.overclaim_risk}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h6 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                      Evidence found
                    </h6>
                    <EvidenceItems
                      items={claim.evidence_found}
                      emptyLabel="No supporting evidence was identified in the manuscript."
                    />
                  </div>

                  {claim.contradictory_or_complicating_evidence.length > 0 && (
                    <div>
                      <h6 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                        Contradictory or complicating evidence
                      </h6>
                      <EvidenceItems
                        items={claim.contradictory_or_complicating_evidence}
                        emptyLabel="No complicating evidence was identified."
                      />
                    </div>
                  )}

                  {claim.recommended_revision && (
                    <div className="rounded-xl border-l-4 border-[var(--amber)] bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
                      <span className="font-semibold">Recommended revision: </span>
                      {claim.recommended_revision}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {audit.cross_cutting_issues.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Cross-cutting issues
          </h4>
          <ul className="grid gap-3 sm:grid-cols-2">
            {audit.cross_cutting_issues.map((issue, index) => (
              <li
                key={`${issue.issue_type}-${index}`}
                className="rounded-xl border border-[var(--line)] bg-white p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold capitalize text-[var(--ink)]">
                    {issue.issue_type.replaceAll("_", " ")}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[var(--slate)]">{issue.description}</p>
                {issue.affected_claim_ids.length > 0 && (
                  <p className="mt-2 font-mono text-[10px] text-[var(--muted)]">
                    Affects {issue.affected_claim_ids.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(audit.strengths.length > 0 || audit.priority_revisions.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--blue)]">
              Evidence strengths
            </h4>
            {audit.strengths.length > 0 ? (
              <ul className="space-y-2 text-sm leading-6 text-[var(--slate)]">
                {audit.strengths.map((strength) => (
                  <li key={strength} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--blue)]">
                      ✓
                    </span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">None identified.</p>
            )}
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--amber)]">
              Priority evidence revisions
            </h4>
            {audit.priority_revisions.length > 0 ? (
              <ol className="space-y-2 text-sm leading-6 text-[var(--slate)]">
                {audit.priority_revisions.map((revision, index) => (
                  <li key={revision} className="flex gap-2.5">
                    <span className="font-mono text-xs text-[var(--amber)]">
                      {index + 1}.
                    </span>
                    <span>{revision}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[var(--muted)]">None identified.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
