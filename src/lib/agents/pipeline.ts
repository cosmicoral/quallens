import type { LLMError, LLMProvider } from "@/lib/llm";
import type { AgentId, ManuscriptInput, ReviewResult } from "@/lib/types";
import type { AgentInfo, ReviewerAgent } from "./types";
import { manuscriptReader, readManuscript } from "./manuscript-reader";
import { researchDesignReviewer } from "./research-design-reviewer";
import { evidenceAuditor } from "./evidence-auditor";
import { theoryAuditor } from "./theory-auditor";
import { overclaimAuditor } from "./overclaim-auditor";
import { finalReviewer } from "./final-reviewer";

/** Mock specialists — everything except the (real) Manuscript Reader. */
const mockAgents: ReviewerAgent[] = [
  researchDesignReviewer,
  evidenceAuditor,
  theoryAuditor,
  overclaimAuditor,
];

/** Specialist agents in the order their reviews are reported (for display). */
export const specialistAgents: AgentInfo[] = [manuscriptReader, ...mockAgents];

export interface PipelineError {
  /** The agent that failed. */
  agentId: AgentId;
  error: LLMError;
}

export type ReviewPipelineResult =
  | { ok: true; result: ReviewResult }
  | { ok: false; error: PipelineError };

/**
 * Run the full review pipeline.
 *
 * The Manuscript Reader runs first, for real, against the configured LLM —
 * its structured profile leads the report and will ground the other agents
 * once they are LLM-backed. The remaining specialists still return mock
 * data, then the Final Reviewer synthesizes. A reader failure aborts the
 * pipeline with a typed error rather than fabricating a profile.
 */
export async function runReviewPipeline(
  manuscript: ManuscriptInput,
  provider?: LLMProvider,
): Promise<ReviewPipelineResult> {
  const readerResult = await readManuscript(manuscript, provider ?? undefined);
  if (!readerResult.ok) {
    return {
      ok: false,
      error: { agentId: manuscriptReader.id, error: readerResult.error },
    };
  }

  const mockReviews = await Promise.all(
    mockAgents.map((agent) => agent.run(manuscript)),
  );
  const agentReviews = [readerResult.review, ...mockReviews];
  const finalAssessment = await finalReviewer.synthesize(manuscript, agentReviews);

  return {
    ok: true,
    result: {
      reviewId: `rev_${Math.random().toString(36).slice(2, 10)}`,
      manuscriptTitle: manuscript.title,
      createdAt: new Date().toISOString(),
      agentReviews,
      finalAssessment,
    },
  };
}
