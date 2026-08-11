"use client";

import { useEffect, useState } from "react";
import {
  ResearchIcon,
  type ResearchIconName,
} from "@/components/ResearchIcon";
import styles from "./QualiSapioAgentMascot.module.css";
import { AgentMascot } from "./AgentMascot";
import type { AgentId } from "@/lib/types";

export type QualiSapioMascotStage =
  | "reading"
  | "evidence"
  | "research-design"
  | "theory"
  | "overclaim"
  | "synthesis"
  | "complete";

interface StagePresentation {
  label: string;
  description: string;
  badge: string;
  icon: ResearchIconName;
  agentId: AgentId;
}

const STAGES: Record<QualiSapioMascotStage, StagePresentation> = {
  reading: {
    label: "Reading the manuscript",
    description: "Building a faithful map of the study before specialist review.",
    badge: "Reader lens",
    icon: "manuscript-reader",
    agentId: "manuscript-reader",
  },
  evidence: {
    label: "Auditing empirical evidence",
    description: "Examining how the manuscript's material supports its claims.",
    badge: "Evidence lens",
    icon: "evidence-auditor",
    agentId: "evidence-auditor",
  },
  "research-design": {
    label: "Reviewing research design",
    description: "Considering design fit, transparency, and internal coherence.",
    badge: "Design lens",
    icon: "research-design-reviewer",
    agentId: "research-design-reviewer",
  },
  theory: {
    label: "Checking theoretical integration",
    description: "Tracing whether concepts genuinely shape the interpretation.",
    badge: "Theory lens",
    icon: "theory-auditor",
    agentId: "theory-auditor",
  },
  overclaim: {
    label: "Checking claim proportionality",
    description: "Comparing conclusion scope with the evidence and study design.",
    badge: "Claims lens",
    icon: "overclaim-auditor",
    agentId: "overclaim-auditor",
  },
  synthesis: {
    label: "Synthesizing the final review",
    description: "Bringing the specialist perspectives into one review workspace.",
    badge: "Synthesis",
    icon: "final-reviewer",
    agentId: "final-reviewer",
  },
  complete: {
    label: "Review complete",
    description: "The manuscript-specific review is ready to inspect.",
    badge: "Ready",
    icon: "final-reviewer",
    agentId: "final-reviewer",
  },
};

const ILLUSTRATIVE_SEQUENCE: QualiSapioMascotStage[] = [
  "reading",
  "evidence",
  "research-design",
  "theory",
  "overclaim",
  "synthesis",
];

const WORKFLOW_GROUPS: Array<{
  label: string;
  stages: QualiSapioMascotStage[];
}> = [
  { label: "Reader", stages: ["reading"] },
  {
    label: "Parallel specialists",
    stages: ["evidence", "research-design", "theory"],
  },
  { label: "Claim scope", stages: ["overclaim"] },
  { label: "Synthesis", stages: ["synthesis", "complete"] },
];

export function QualiSapioAgentMascot({
  stage = "reading",
  illustrativeSequence = false,
  className = "",
}: {
  stage?: QualiSapioMascotStage;
  /** Cycles workflow examples; it is not backend stage telemetry. */
  illustrativeSequence?: boolean;
  className?: string;
}) {
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    if (!illustrativeSequence) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setSequenceIndex((current) => (current + 1) % ILLUSTRATIVE_SEQUENCE.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [illustrativeSequence]);

  const activeStage = illustrativeSequence
    ? ILLUSTRATIVE_SEQUENCE[sequenceIndex]
    : stage;
  const presentation = STAGES[activeStage];
  const isComplete = activeStage === "complete";

  return (
    <section
      aria-label="QualiSapio review progress"
      className={`overflow-hidden rounded-2xl border border-[var(--blue-soft)] bg-[var(--paper-blue)] shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="grid sm:grid-cols-[minmax(13rem,0.82fr)_minmax(0,1.18fr)]">
        <div className="relative order-2 min-h-48 overflow-hidden border-t border-[var(--blue-soft)] sm:order-1 sm:min-h-64 sm:border-t-0 sm:border-r">
          <span
            aria-hidden="true"
            className={`${styles.ambientGlow} absolute top-8 left-1/2 z-10 size-36 -translate-x-1/2 rounded-full bg-[var(--blue-light)]/25 blur-3xl`}
          />
          <div
            className={`${styles.imageFloat} absolute inset-x-0 top-0 bottom-12 sm:inset-0`}
          >
            <div
              key={`mascot-${activeStage}`}
              className={`${styles.stageContent} absolute inset-3 sm:inset-5`}
            >
              <AgentMascot
                agentId={presentation.agentId}
                className="size-full"
                sizes="(max-width: 639px) 88vw, 30vw"
              />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/45 via-transparent to-white/5"
          />
          <div
            key={`badge-${activeStage}`}
            className={`${styles.stageContent} absolute right-3 bottom-3 left-3 z-20 flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-[var(--ink)]/88 px-3.5 py-2.5 text-white shadow-lg backdrop-blur-md`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                <ResearchIcon name={presentation.icon} className="size-4.5" />
              </span>
              <span className="truncate text-xs font-semibold">{presentation.badge}</span>
            </span>
            {isComplete ? (
              <ResearchIcon name="final-reviewer" className="size-4 text-sky-200" />
            ) : (
              <span
                aria-hidden="true"
                className={`${styles.workingDot} size-2 shrink-0 rounded-full bg-[var(--blue-light)]`}
              />
            )}
          </div>
        </div>

        <div className="order-1 flex min-w-0 flex-col justify-center p-4 sm:order-2 sm:p-7 lg:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--blue-soft)] bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--blue-deep)]">
              {isComplete ? (
                <ResearchIcon name="final-reviewer" className="size-3.5" />
              ) : (
                <span
                  aria-hidden="true"
                  className={`${styles.workingDot} size-1.5 rounded-full bg-[var(--blue)]`}
                />
              )}
              {isComplete ? "Review complete" : "Review in progress"}
            </span>
            {illustrativeSequence && (
              <span className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                Illustrative workflow
              </span>
            )}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--blue)]">
            QualiSapio agent workspace
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
            {isComplete
              ? "Your QualiSapio review is ready."
              : "QualiSapio is reviewing your manuscript."}
          </h3>

          <div
            key={`stage-${activeStage}`}
            aria-live="polite"
            aria-atomic="true"
            className={`${styles.stageContent} mt-5 border-l-2 border-[var(--blue)] pl-4`}
          >
            <p className="text-sm font-semibold text-[var(--ink)]">
              {illustrativeSequence
                ? "Illustrative step: "
                : isComplete
                  ? "Status: "
                  : "Current step: "}
              {presentation.label}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--slate)]">
              {presentation.description}
            </p>
          </div>

          {illustrativeSequence && (
            <p className="mt-5 max-w-xl text-xs leading-5 text-[var(--muted)]">
              This rotation illustrates reviewer roles, not live agent telemetry or
              execution order. Evidence, Research Design, and Theory may run in
              parallel. Completion appears only after the server returns the review.
            </p>
          )}

          <div
            aria-label="Review workflow groups"
            className="mt-5 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap"
          >
            {WORKFLOW_GROUPS.map((group) => (
              <span
                key={group.label}
                className={`rounded-full border px-2.5 py-1 text-center text-[9px] font-semibold uppercase tracking-[0.08em] transition-colors duration-500 motion-reduce:transition-none ${
                  group.stages.includes(activeStage)
                    ? "border-[var(--blue-soft)] bg-white text-[var(--blue)]"
                    : "border-transparent bg-white/45 text-[var(--muted)]"
                }`}
              >
                {group.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
