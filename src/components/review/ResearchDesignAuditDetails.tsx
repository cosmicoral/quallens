import type {
  DesignDimension,
  ResearchDesignAudit,
} from "@/lib/types";

const DIMENSIONS = [
  ["research_question_alignment", "Research question alignment"],
  ["sampling", "Sampling"],
  ["recruitment", "Recruitment"],
  ["data_collection", "Data collection"],
  ["analytical_process", "Analytical process"],
  ["reflexivity_and_positionality", "Reflexivity & positionality"],
  ["ethics", "Ethics"],
  ["transferability_and_context", "Transferability & context"],
  ["design_coherence", "Design coherence"],
] as const;

const ASSESSMENT_LABELS: Record<DesignDimension["assessment"], string> = {
  strong: "Strong",
  adequate: "Adequate",
  partially_adequate: "Partially adequate",
  weak: "Weak",
  not_reported: "Not reported",
  not_applicable: "Not applicable",
  cannot_assess: "Cannot assess",
};

const ASSESSMENT_STYLES: Record<DesignDimension["assessment"], string> = {
  strong: "border-sky-200 bg-sky-50 text-sky-900",
  adequate: "border-cyan-200 bg-cyan-50 text-cyan-900",
  partially_adequate: "border-amber-200 bg-amber-50 text-amber-900",
  weak: "border-orange-200 bg-orange-50 text-orange-900",
  not_reported: "border-rose-200 bg-rose-50 text-rose-900",
  not_applicable: "border-slate-200 bg-slate-50 text-slate-700",
  cannot_assess: "border-slate-200 bg-slate-50 text-slate-700",
};

function DimensionCard({
  label,
  dimension,
}: {
  label: string;
  dimension: DesignDimension;
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h5 className="text-sm font-semibold text-[var(--ink)]">{label}</h5>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${ASSESSMENT_STYLES[dimension.assessment]}`}
        >
          {ASSESSMENT_LABELS[dimension.assessment]}
        </span>
      </div>
      <p className="text-sm leading-6 text-[var(--slate)]">{dimension.reasoning}</p>

      {dimension.evidence_from_manuscript.length > 0 && (
        <div className="mt-4">
          <h6 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)]">
            Manuscript evidence
          </h6>
          <ul className="space-y-1.5 text-xs leading-5 text-[var(--slate)]">
            {dimension.evidence_from_manuscript.map((evidence, index) => (
              <li key={`${evidence}-${index}`} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--blue)]">
                  •
                </span>
                <span>{evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dimension.missing_information.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3">
          <h6 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-900">
            Missing information
          </h6>
          <p className="text-xs leading-5 text-amber-950">
            {dimension.missing_information.join("; ")}
          </p>
        </div>
      )}

      {dimension.recommended_revision && (
        <p className="mt-4 border-l-2 border-[var(--amber)] pl-3 text-xs leading-5 text-[var(--slate)]">
          <span className="font-semibold text-[var(--ink)]">Revision: </span>
          {dimension.recommended_revision}
        </p>
      )}
    </article>
  );
}

export function ResearchDesignAuditDetails({
  audit,
}: {
  audit: ResearchDesignAudit;
}) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Design dimensions
          </h4>
          <span className="font-mono text-[11px] text-[var(--muted)]">
            {DIMENSIONS.length} dimensions
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {DIMENSIONS.map(([key, label]) => (
            <DimensionCard key={key} label={label} dimension={audit[key]} />
          ))}
        </div>
      </div>

      {audit.major_concerns.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Major design concerns
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
                  <p className="mt-3 border-l-2 border-[var(--amber)] pl-3 text-xs leading-5 text-[var(--slate)]">
                    {concern.recommended_revision}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--blue)]">
            Design strengths
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
            Priority design revisions
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
