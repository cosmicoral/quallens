import type { AgentId } from "@/lib/types";
import { ResearchIcon } from "@/components/ResearchIcon";

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
    status: "In development",
  },
  {
    id: "final-reviewer",
    name: "Final Reviewer",
    description:
      "Synthesizes specialist reviews into prioritized, constructive feedback.",
    status: "In development",
  },
];

export function ReviewerPanel() {
  return (
    <section id="reviewers" className="section-shell py-20 sm:py-28">
      <div className="mb-10 max-w-2xl sm:mb-14">
        <p className="eyebrow">The reviewer panel</p>
        <h2 className="section-title">One Reviewer. Many Perspectives.</h2>
        <p className="section-copy">
          Six specialized agents. One integrated qualitative review. Each lens
          stays focused on a distinct part of scholarly reasoning.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviewers.map((reviewer, index) => (
          <li
            key={reviewer.id}
            className="group rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-300 hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--paper-blue)] text-[var(--blue)] transition group-hover:bg-[var(--ink)] group-hover:text-white">
                <ResearchIcon name={reviewer.id} className="size-6" />
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  reviewer.status === "Active"
                    ? "border-[var(--blue-soft)] bg-[var(--paper-blue)] text-[var(--blue)]"
                    : "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)]"
                }`}
              >
                {reviewer.status}
              </span>
            </div>
            <p className="mb-2 font-mono text-xs text-[var(--muted)]">
              0{index + 1}
            </p>
            <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
              {reviewer.name}
            </h3>
            <p className="text-sm leading-6 text-[var(--slate)]">{reviewer.description}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs leading-5 text-[var(--muted)]">
        Manuscript Reader, Evidence Auditor, Research Design Reviewer, and
        Theory Auditor are live. Overclaim and Final currently use structured
        MVP data.
      </p>
    </section>
  );
}
