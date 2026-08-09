import type { OverclaimAudit, OverclaimFinding } from "@/lib/types";

const RISK_STYLES: Record<OverclaimFinding["risk"], string> = {
  none: "border-sky-200 bg-sky-50 text-sky-900",
  low: "border-cyan-200 bg-cyan-50 text-cyan-900",
  moderate: "border-amber-200 bg-amber-50 text-amber-900",
  high: "border-rose-200 bg-rose-50 text-rose-900",
};

const BASIS_LABELS: Record<OverclaimFinding["basis"], string> = {
  well_bounded: "Well bounded",
  sample_scope: "Sample scope",
  evidence_scope: "Evidence scope",
  causal_overreach: "Causal overreach",
  population_overreach: "Population overreach",
  unsupported_novelty: "Unsupported novelty",
  unsupported_recommendation: "Unsupported recommendation",
  new_conclusion_claim: "New conclusion claim",
  ambiguous: "Ambiguous",
  other: "Other",
};

export function OverclaimAuditDetails({ audit }: { audit: OverclaimAudit }) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Claim scope audit
          </h4>
          <span className="font-mono text-[11px] text-[var(--muted)]">
            {audit.claims.length} claim{audit.claims.length === 1 ? "" : "s"}
          </span>
        </div>

        {audit.claims.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
            No consequential claims were available for a responsible scope audit.
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
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${RISK_STYLES[claim.risk]}`}
                    >
                      {claim.risk} risk
                    </span>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 text-[10px] font-medium text-[var(--slate)]">
                      {claim.claim_type}
                    </span>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 text-[10px] font-medium text-[var(--slate)]">
                      {BASIS_LABELS[claim.basis]}
                    </span>
                  </div>
                  <h5 className="text-base font-semibold leading-6 tracking-[-0.01em] text-[var(--ink)]">
                    {claim.claim_text}
                  </h5>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  <p className="text-sm leading-6 text-[var(--slate)]">
                    {claim.reasoning}
                  </p>
                  {claim.supporting_context.length > 0 && (
                    <div>
                      <h6 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        Supporting context
                      </h6>
                      <ul className="space-y-1.5 text-xs leading-5 text-[var(--slate)]">
                        {claim.supporting_context.map((context, index) => (
                          <li key={`${context}-${index}`} className="flex gap-2">
                            <span aria-hidden="true" className="text-[var(--blue)]">
                              •
                            </span>
                            <span>{context}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {claim.recommended_revision && (
                    <p className="rounded-xl border-l-4 border-[var(--amber)] bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
                      <span className="font-semibold">Recommended revision: </span>
                      {claim.recommended_revision}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {audit.cross_cutting_patterns.length > 0 && (
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Cross-cutting patterns
          </h4>
          <ul className="grid gap-3 lg:grid-cols-2">
            {audit.cross_cutting_patterns.map((pattern, index) => (
              <li
                key={`${pattern.pattern_type}-${index}`}
                className="rounded-xl border border-[var(--line)] bg-white p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold capitalize text-[var(--ink)]">
                    {pattern.pattern_type.replaceAll("_", " ")}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {pattern.severity}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[var(--slate)]">
                  {pattern.description}
                </p>
                {pattern.affected_claim_ids.length > 0 && (
                  <p className="mt-2 font-mono text-[10px] text-[var(--muted)]">
                    Affects {pattern.affected_claim_ids.join(", ")}
                  </p>
                )}
                {pattern.recommended_revision && (
                  <p className="mt-3 border-l-2 border-[var(--amber)] pl-3 text-xs leading-5 text-[var(--slate)]">
                    {pattern.recommended_revision}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--blue)]">
            Scope strengths
          </h4>
          {audit.strengths.length > 0 ? (
            <ul className="space-y-2 text-sm leading-6 text-[var(--slate)]">
              {audit.strengths.map((strength, index) => (
                <li key={`${strength}-${index}`} className="flex gap-2">
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
            Priority scope revisions
          </h4>
          {audit.priority_revisions.length > 0 ? (
            <ol className="space-y-2 text-sm leading-6 text-[var(--slate)]">
              {audit.priority_revisions.map((revision, index) => (
                <li key={`${revision}-${index}`} className="flex gap-2.5">
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
    </div>
  );
}
