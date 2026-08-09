const principles = [
  "Distinguish participant accounts from researcher interpretation",
  "Preserve uncertainty and ambiguity",
  "Respect qualitative transferability rather than assuming statistical generalization",
  "Identify missing methodological information",
  "Examine whether theory is operationalized in analysis",
  "Flag claims that exceed available evidence",
  "Preserve contradictory and deviant cases",
  "Never invent missing evidence",
];

export function RigorSection() {
  return (
    <section className="section-shell py-20 sm:py-28">
      <div className="overflow-hidden rounded-[2rem] bg-[var(--ink)] text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="rigor-grid grid gap-12 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-16 lg:py-20">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--blue-light)]">
              Peer-review reasoning, encoded
            </p>
            <h2 className="max-w-md text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Built for reviewer-grade rigor
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
              Qualisapio applies the distinctions authors and peer reviewers actually
              make in qualitative social science—not generic writing-quality checks.
            </p>
            <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-slate-300">
              <span className="size-2 rounded-full bg-[var(--blue-light)]" />
              Evidence · Methods · Theory · Claims
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-slate-200"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="mt-0.5 size-5 shrink-0 text-[var(--blue-light)]"
                  fill="none"
                >
                  <circle cx="10" cy="10" r="8" stroke="currentColor" />
                  <path
                    d="m6.5 10 2.2 2.2 4.8-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
