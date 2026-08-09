const authorBenefits = [
  {
    title: "Catch scope problems before submission",
    description:
      "See where claims outrun evidence, sampling, or qualitative transferability—while you can still revise.",
  },
  {
    title: "Journal-style structure, not generic praise",
    description:
      "Six specialist AI reviewers examine evidence, design, theory, and overclaim—then a final synthesis prioritizes what to fix.",
  },
  {
    title: "A complete report in one sitting",
    description:
      "Upload your manuscript and receive a structured peer-review report—no waiting on informal reads or piecing together scattered notes.",
  },
];

const reviewerBenefits = [
  {
    title: "Organize a constructive assessment",
    description:
      "Use the same specialist lenses to map evidence support, design fit, theory use, and claim scope before you write reviewer comments.",
  },
  {
    title: "Keep your judgment in charge",
    description:
      "Qualisapio surfaces manuscript-grounded findings and preserves uncertainty—it does not replace your expert evaluation.",
  },
  {
    title: "Move from reading to recommendations",
    description:
      "A final synthesis turns parallel reviewer perspectives into prioritized, section-aware revision points you can accept, refine, or reject.",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="border-y border-[var(--line)] bg-white">
      <div className="section-shell py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Why Qualisapio</p>
          <h2 className="section-title">AI peer review that earns researcher trust</h2>
          <p className="section-copy mx-auto">
            Qualisapio is an AI product built for qualitative social science—not a general
            writing assistant. A coordinated panel reads your manuscript and returns
            reviewer-grade feedback authors and peer reviewers can act on.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm sm:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--blue-soft)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--blue-deep)]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--blue)]" />
              For authors
            </div>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
              Strengthen a manuscript before you submit
            </h3>
            <ul className="mt-6 space-y-5">
              {authorBenefits.map(({ title, description }) => (
                <li key={title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--paper-blue)] text-xs font-bold text-[var(--blue-deep)]"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--slate)]">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm sm:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--slate)]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--ink)]" />
              For peer reviewers
            </div>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
              Structure feedback without rewriting the paper
            </h3>
            <ul className="mt-6 space-y-5">
              {reviewerBenefits.map(({ title, description }) => (
                <li key={title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--paper-warm)] text-xs font-bold text-[var(--ink)]"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--slate)]">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
