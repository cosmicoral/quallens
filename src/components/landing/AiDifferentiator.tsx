const differentiators = [
  {
    label: "Multi-agent AI",
    title: "Six specialist reviewers, one coordinated run",
    description:
      "Each agent has a distinct peer-review role—reader, evidence, design, theory, overclaim, and final synthesis—mirroring how rigorous qualitative assessment actually unfolds.",
  },
  {
    label: "Qualitative-native",
    title: "Built for social-science reasoning",
    description:
      "The panel distinguishes participant accounts from interpretation, respects transferability, flags overclaim, and preserves missing or ambiguous information instead of inventing it.",
  },
  {
    label: "Structured output",
    title: "Reviewer-grade reports, not chat prose",
    description:
      "Every run returns validated, section-aware findings you can scan, revisit, and share—grounded in the manuscript you submitted.",
  },
  {
    label: "Actionable synthesis",
    title: "Prioritized revisions, not a score alone",
    description:
      "The final reviewer synthesizes specialist perspectives into a revision-ready report with clear priorities—useful before submission or while drafting reviewer comments.",
  },
];

export function AiDifferentiator() {
  return (
    <section className="section-shell py-20 sm:py-28">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(160deg,white_0%,var(--paper-blue)_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12 lg:px-12 lg:py-14">
          <div>
            <p className="eyebrow">An AI product, purpose-built</p>
            <h2 className="max-w-md text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">
              More than a single prompt to a general model
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[var(--slate)]">
              QualiSapio orchestrates multiple AI reviewers with strict qualitative
              schemas—so feedback reflects how authors and peer reviewers actually
              examine evidence, methods, theory, and claims.
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
              It supports your judgment. It does not predict journal acceptance or
              replace human peer review.{" "}
              <a
                href="#coming-soon-revisions"
                className="font-medium text-[var(--blue-deep)] underline decoration-[var(--blue-soft)] underline-offset-2 transition hover:text-[var(--blue)]"
              >
                Smarter revision guidance — coming soon
              </a>
              .
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {differentiators.map(({ label, title, description }) => (
              <li
                key={title}
                className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--blue)]">
                  {label}
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--slate)]">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
