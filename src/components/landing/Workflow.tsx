import { ResearchIcon, type ResearchIconName } from "@/components/ResearchIcon";

const steps: Array<{
  name: string;
  description: string;
  icon: ResearchIconName;
}> = [
  {
    name: "Read",
    description: "Understand the manuscript in context.",
    icon: "read",
  },
  {
    name: "Audit",
    description: "Examine evidence, design, theory, and claims.",
    icon: "audit",
  },
  {
    name: "Synthesize",
    description: "Compare findings across specialist reviewers.",
    icon: "synthesize",
  },
  {
    name: "Recommend",
    description: "Produce prioritized, actionable peer-review recommendations.",
    icon: "recommend",
  },
];

export function Workflow() {
  return (
    <section id="how-it-works" className="border-y border-[var(--line)] bg-white">
      <div className="section-shell py-20 sm:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">Peer-review workflow</p>
          <h2 className="section-title">In the flow of a qualitative peer review</h2>
          <p className="section-copy">
            The same sequence authors and peer reviewers follow—from reading to
            synthesis and prioritized recommendations.
          </p>
        </div>

        <ol className="grid gap-8 md:grid-cols-4 md:gap-0">
          {steps.map((step, index) => (
            <li key={step.name} className="relative md:pr-8">
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-6 right-0 hidden h-px w-8 bg-[var(--line-strong)] md:block"
                />
              )}
              <div className="mb-5 flex items-center gap-4 md:block">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--paper)] text-[var(--ink)] md:mb-5">
                  <ResearchIcon name={step.icon} className="size-6" />
                </span>
                <span className="font-mono text-xs text-[var(--muted)]">0{index + 1}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--ink)]">{step.name}</h3>
              <p className="max-w-[15rem] text-sm leading-6 text-[var(--slate)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
