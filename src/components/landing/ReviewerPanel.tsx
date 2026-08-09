import type { AgentId } from "@/lib/types";
import { ResearchIcon } from "@/components/ResearchIcon";
import { AgentMascot } from "@/components/review/AgentMascot";

const reviewers: Array<{
  id: AgentId;
  name: string;
  description: string;
  status: "Active" | "In development";
}> = [
  {
    id: "manuscript-reader",
    name: "Manuscript Reader",
    description: "Understands what the manuscript actually says.",
    status: "Active",
  },
  {
    id: "evidence-auditor",
    name: "Evidence Auditor",
    description: "Checks whether empirical evidence supports analytical claims.",
    status: "Active",
  },
  {
    id: "research-design-reviewer",
    name: "Research Design Reviewer",
    description: "Evaluates sampling, methods, reflexivity, and research design.",
    status: "Active",
  },
  {
    id: "theory-auditor",
    name: "Theory Auditor",
    description: "Examines whether theory is actually operationalized in analysis.",
    status: "Active",
  },
  {
    id: "overclaim-auditor",
    name: "Overclaim Auditor",
    description: "Flags claims that exceed the evidence, sample, or study design.",
    status: "Active",
  },
  {
    id: "final-reviewer",
    name: "Final Reviewer",
    description:
      "Synthesizes specialist reviews into prioritized, constructive feedback.",
    status: "Active",
  },
];

export function ReviewerPanel() {
  return (
    <section id="reviewers" className="section-shell py-20 sm:py-28">
      <div className="mb-10 max-w-2xl sm:mb-14">
        <p className="eyebrow">The peer-review panel</p>
        <h2 className="section-title">One review. Many reviewer lenses.</h2>
        <p className="section-copy">
          Six specialist lenses mirror journal peer review—for authors testing a
          submission and reviewers organizing a constructive assessment.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviewers.map((reviewer, index) => (
          <li
            key={reviewer.id}
            className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-300 hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
          >
            <div className="relative h-36 overflow-hidden border-b border-[var(--line)] bg-[linear-gradient(145deg,var(--paper-blue),white_72%)] sm:h-40">
              <div className="absolute inset-2 transition duration-500 group-hover:scale-[1.025]">
                <AgentMascot
                  agentId={reviewer.id}
                  className="size-full"
                  sizes="(max-width: 767px) 90vw, (max-width: 1023px) 44vw, 27vw"
                />
              </div>
              <span
                className={`absolute top-3 right-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur-sm ${
                  reviewer.status === "Active"
                    ? "border-[var(--blue-soft)] bg-white/90 text-[var(--blue)]"
                    : "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)]"
                }`}
              >
                {reviewer.status}
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-[var(--muted)]">0{index + 1}</p>
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--paper-blue)] text-[var(--blue)] transition group-hover:bg-[var(--ink)] group-hover:text-white">
                  <ResearchIcon name={reviewer.id} className="size-4" />
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
                {reviewer.name}
              </h3>
              <p className="text-sm leading-6 text-[var(--slate)]">
                {reviewer.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-[var(--blue-soft)] bg-[var(--paper-blue)] px-5 py-4 text-xs leading-5 text-[var(--slate)] sm:flex sm:items-center sm:justify-between sm:gap-6">
        <p>
          <span className="font-semibold text-[var(--ink)]">How peer review runs: </span>
          Reader establishes context; Evidence, Research Design, and Theory run as
          parallel reviewer lenses; Overclaim checks scope; Final synthesizes a
          revision-ready report.
        </p>
        <p className="mt-2 shrink-0 font-semibold text-[var(--blue)] sm:mt-0">
          All six reviewers active
        </p>
      </div>
    </section>
  );
}
