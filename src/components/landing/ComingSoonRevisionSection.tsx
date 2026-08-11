const comingSoonBenefits = [
  {
    label: "Methods",
    title: "Feedback that understands your method",
    description:
      "Built-in guidance on thematic analysis, ethnography, grounded theory, and more—so suggestions reflect how qualitative methods are actually taught and reviewed, not vague “add more detail.”",
  },
  {
    label: "Theory",
    title: "See whether theory is doing real work",
    description:
      "Helps spot when a framework is cited but not used in the analysis—and points to where findings, interpretation, or your contribution may need strengthening.",
  },
  {
    label: "Journal fit",
    title: "Match the journal you have in mind",
    description:
      "Profiles from official aims, scope, and author guidelines—especially UK and European journals—separate “is this good work?” from “is this right for this outlet?”",
  },
];

const contrasts = [
  {
    generic: "Rewrites sentences and smooths prose",
    qualisapio: "Shows what to revise across evidence, design, theory, and claims",
  },
  {
    generic: "One chat, one generic voice",
    qualisapio: "Six specialist reviewers working in parallel, then one clear report",
  },
  {
    generic: "May invent references or speak in generalities",
    qualisapio: "Shows which methods or journal guidance informed a suggestion, when relevant",
  },
  {
    generic: "Treats qualitative work like a shorter quantitative paper",
    qualisapio: "Transferability, reflexivity, and overclaim—without forcing one school of thought",
  },
];

export function ComingSoonRevisionSection() {
  return (
    <section
      id="coming-soon-revisions"
      className="border-y border-[var(--line)] bg-[var(--paper)]"
    >
      <div className="section-shell py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-500" />
            Coming soon
          </div>
          <p className="eyebrow">Smarter revision guidance</p>
          <h2 className="section-title">
            Revision advice rooted in how qualitative research is actually reviewed
          </h2>
          <p className="section-copy mx-auto">
            QualiSapio already runs six specialist reviewers on your manuscript. Next,
            feedback will also draw on a built-in library of qualitative methods, social
            theory, and journal expectations—so you know what to fix before you submit,
            or while working through reviewer comments.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {comingSoonBenefits.map(({ label, title, description }) => (
            <li
              key={title}
              className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6 shadow-sm sm:p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--blue)]">
                {label}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--slate)]">{description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white">
          <div className="border-b border-[var(--line)] px-6 py-4 sm:px-8">
            <h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
              Why this is not another general AI writing tool
            </h3>
            <p className="mt-1 text-sm text-[var(--slate)]">
              Chat tools are built to produce fluent text. QualiSapio is built for
              peer review in qualitative social science—structured, manuscript-grounded,
              and clear about what it does and does not know.
            </p>
          </div>

          <ul className="divide-y divide-[var(--line)]">
            {contrasts.map(({ generic, qualisapio }) => (
              <li
                key={generic}
                className="grid gap-4 px-6 py-5 sm:grid-cols-2 sm:gap-8 sm:px-8 sm:py-6"
              >
                <div className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--paper-warm)] text-xs text-[var(--muted)]"
                  >
                    —
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                      Generic AI
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--slate)]">{generic}</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:border-l sm:border-[var(--line)] sm:pl-8">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--paper-blue)] text-xs font-bold text-[var(--blue-deep)]"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--blue)]">
                      QualiSapio
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink)]">{qualisapio}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-[var(--muted)]">
          The library will use curated methods and theory guides plus public journal
          information—not downloaded papers or automated literature searches. QualiSapio
          will not predict acceptance or replace human peer review.
        </p>
      </div>
    </section>
  );
}
