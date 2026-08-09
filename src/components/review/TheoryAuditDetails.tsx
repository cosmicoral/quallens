import type {
  TheoryAudit,
  TheoryDimension,
  TheoryFrameworkAudit,
} from "@/lib/types";

const DIMENSIONS = [
  ["analytical_integration", "Analytical integration"],
  ["empirical_theory_link", "Empirical–theory link"],
  ["theoretical_contribution", "Theoretical contribution"],
] as const;

const DIMENSION_LABELS: Record<TheoryDimension["assessment"], string> = {
  strong: "Strong",
  adequate: "Adequate",
  partial: "Partial",
  weak: "Weak",
  not_present: "Not present",
  cannot_assess: "Cannot assess",
};

const ASSESSMENT_STYLES: Record<TheoryDimension["assessment"], string> = {
  strong: "border-sky-200 bg-sky-50 text-sky-900",
  adequate: "border-cyan-200 bg-cyan-50 text-cyan-900",
  partial: "border-amber-200 bg-amber-50 text-amber-900",
  weak: "border-orange-200 bg-orange-50 text-orange-900",
  not_present: "border-slate-200 bg-slate-50 text-slate-700",
  cannot_assess: "border-slate-200 bg-slate-50 text-slate-700",
};

const OPERATIONALIZATION_LABELS: Record<
  TheoryFrameworkAudit["operationalization"],
  string
> = {
  strong: "Strong integration",
  adequate: "Adequate integration",
  partial: "Partial integration",
  minimal: "Minimal integration",
  absent: "Not operationalized",
  unclear: "Integration unclear",
};

function Revision({ children }: { children: string }) {
  return (
    <p className="mt-4 border-l-2 border-[var(--amber)] pl-3 text-xs leading-5 text-[var(--slate)]">
      <span className="font-semibold text-[var(--ink)]">Revision: </span>
      {children}
    </p>
  );
}

function DimensionCard({
  label,
  dimension,
}: {
  label: string;
  dimension: TheoryDimension;
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h5 className="text-sm font-semibold text-[var(--ink)]">{label}</h5>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${ASSESSMENT_STYLES[dimension.assessment]}`}
        >
          {DIMENSION_LABELS[dimension.assessment]}
        </span>
      </div>
      <p className="text-sm leading-6 text-[var(--slate)]">{dimension.reasoning}</p>
      {dimension.evidence_from_manuscript.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs leading-5 text-[var(--muted)]">
          {dimension.evidence_from_manuscript.map((evidence, index) => (
            <li key={`${evidence}-${index}`} className="flex gap-2">
              <span aria-hidden="true" className="text-[var(--blue)]">
                •
              </span>
              <span>{evidence}</span>
            </li>
          ))}
        </ul>
      )}
      {dimension.recommended_revision && (
        <Revision>{dimension.recommended_revision}</Revision>
      )}
    </article>
  );
}

export function TheoryAuditDetails({ audit }: { audit: TheoryAudit }) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Frameworks
          </h4>
          <span className="font-mono text-[11px] text-[var(--muted)]">
            {audit.frameworks.length} framework
            {audit.frameworks.length === 1 ? "" : "s"}
          </span>
        </div>
        {audit.frameworks.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
            No material theoretical framework was identified in the manuscript.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {audit.frameworks.map((framework, index) => (
              <article
                key={`${framework.framework_name}-${index}`}
                className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h5 className="text-base font-semibold text-[var(--ink)]">
                      {framework.framework_name}
                    </h5>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted)]">
                      {framework.role_in_manuscript.replaceAll("_", " ")}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--slate)]">
                    {OPERATIONALIZATION_LABELS[framework.operationalization]}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[var(--slate)]">
                  {framework.reasoning}
                </p>
                {framework.concepts_used.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {framework.concepts_used.map((concept, conceptIndex) => (
                      <span
                        key={`${concept}-${conceptIndex}`}
                        className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-[var(--blue)]"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                )}
                {framework.evidence_from_manuscript.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-xs leading-5 text-[var(--muted)]">
                    {framework.evidence_from_manuscript.map((evidence, evidenceIndex) => (
                      <li key={`${evidence}-${evidenceIndex}`} className="flex gap-2">
                        <span aria-hidden="true" className="text-[var(--blue)]">
                          •
                        </span>
                        <span>{evidence}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {framework.recommended_revision && (
                  <Revision>{framework.recommended_revision}</Revision>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Theory in the analysis
        </h4>
        <div className="grid gap-4 lg:grid-cols-3">
          {DIMENSIONS.map(([key, label]) => (
            <DimensionCard key={key} label={label} dimension={audit[key]} />
          ))}
        </div>
      </section>

      {audit.concept_consistency.length > 0 && (
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Concept consistency
          </h4>
          <div className="grid gap-3 lg:grid-cols-2">
            {audit.concept_consistency.map((concept, index) => (
              <article
                key={`${concept.concept}-${index}`}
                className="rounded-xl border border-[var(--line)] bg-white p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h5 className="text-sm font-semibold text-[var(--ink)]">
                    {concept.concept}
                  </h5>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {concept.assessment.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[var(--slate)]">
                  {concept.reasoning}
                </p>
                {concept.examples.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-[var(--muted)]">
                    {concept.examples.map((example, exampleIndex) => (
                      <li key={`${example}-${exampleIndex}`}>— {example}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {audit.conceptual_drift.length > 0 && (
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--amber)]">
            Conceptual drift
          </h4>
          <ul className="grid gap-3 lg:grid-cols-2">
            {audit.conceptual_drift.map((issue, index) => (
              <li
                key={`${issue.concepts_involved.join("-")}-${index}`}
                className="rounded-xl border border-amber-200 bg-amber-50/70 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-amber-950">
                    {issue.concepts_involved.join(" / ")}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm leading-6 text-amber-950">{issue.description}</p>
                {issue.recommended_revision && (
                  <p className="mt-3 border-l-2 border-[var(--amber)] pl-3 text-xs leading-5 text-amber-950">
                    {issue.recommended_revision}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {audit.major_concerns.length > 0 && (
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Major theory concerns
          </h4>
          <ul className="grid gap-3 lg:grid-cols-2">
            {audit.major_concerns.map((concern, index) => (
              <li
                key={`${concern.issue_type}-${index}`}
                className="rounded-xl border border-[var(--line)] bg-white p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold capitalize text-[var(--ink)]">
                    {concern.issue_type.replaceAll("_", " ")}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {concern.severity}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[var(--slate)]">
                  {concern.description}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  <span className="font-semibold text-[var(--slate)]">Why it matters: </span>
                  {concern.why_it_matters}
                </p>
                {concern.recommended_revision && (
                  <Revision>{concern.recommended_revision}</Revision>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--blue)]">
            Theory strengths
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
            Priority theory revisions
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
