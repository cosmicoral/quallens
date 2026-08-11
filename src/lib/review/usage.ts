import type { LLMResponseMetadata } from "@/lib/llm";
import type { AgentId, ReviewStageUsage, ReviewUsageSummary } from "@/lib/types";

export const REVIEW_STAGE_ORDER: AgentId[] = [
  "manuscript-reader",
  "evidence-auditor",
  "research-design-reviewer",
  "theory-auditor",
  "overclaim-auditor",
  "final-reviewer",
];

export type ReviewStageUsageMap = Partial<Record<AgentId, LLMResponseMetadata>>;

export function summarizeReviewUsage(usage: ReviewStageUsageMap): ReviewUsageSummary {
  const stages: ReviewStageUsage[] = REVIEW_STAGE_ORDER.flatMap((stage) => {
    const metadata = usage[stage];
    return metadata ? [{ stage, ...metadata }] : [];
  });
  return {
    inputTokens: stages.reduce((total, stage) => total + stage.inputTokens, 0),
    outputTokens: stages.reduce((total, stage) => total + stage.outputTokens, 0),
    estimatedCostUsd: stages.reduce((total, stage) => total + stage.estimatedCostUsd, 0),
    stages,
  };
}
