import type { LLMError, LLMProvider } from "@/lib/llm";
import type { AgentId, ManuscriptInput, ReviewResult } from "@/lib/types";
import type { AgentInfo, ReviewerAgent } from "./types";
import { manuscriptReader, readManuscript } from "./manuscript-reader";
import {
  researchDesignReviewer,
  reviewResearchDesign,
} from "./research-design-reviewer";
import { auditEvidence, evidenceAuditor } from "./evidence-auditor";
import { theoryAuditor } from "./theory-auditor";
import { overclaimAuditor } from "./overclaim-auditor";
import { finalReviewer } from "./final-reviewer";

/** Specialists that remain mocked after the three live reviewers. */
const mockAgents: ReviewerAgent[] = [theoryAuditor, overclaimAuditor];

/** Specialist agents in the order their reviews are reported (for display). */
export const specialistAgents: AgentInfo[] = [
  manuscriptReader,
  evidenceAuditor,
  researchDesignReviewer,
  ...mockAgents,
];

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
 * The Manuscript Reader runs first. The Evidence Auditor and Research Design
 * Reviewer then run in parallel against the original manuscript and validated
 * profile. Theory, Overclaim, and the Final Reviewer still return mock data.
 * Any real agent can abort the pipeline with a typed error rather than
 * fabricated data.
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

  const [evidenceResult, researchDesignResult] = await Promise.all([
    auditEvidence(manuscript, readerResult.review.profile, provider ?? undefined),
    reviewResearchDesign(
      manuscript,
      readerResult.review.profile,
      provider ?? undefined,
    ),
  ]);
  if (!evidenceResult.ok) {
    return {
      ok: false,
      error: { agentId: evidenceAuditor.id, error: evidenceResult.error },
    };
  }
  if (!researchDesignResult.ok) {
    return {
      ok: false,
      error: {
        agentId: researchDesignReviewer.id,
        error: researchDesignResult.error,
      },
    };
  }

  const mockReviews = await Promise.all(
    mockAgents.map((agent) => agent.run(manuscript)),
  );
  const agentReviews = [
    readerResult.review,
    evidenceResult.review,
    researchDesignResult.review,
    ...mockReviews,
  ];
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
