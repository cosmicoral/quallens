import type { LLMError, LLMProvider, LLMResponseMetadata } from "@/lib/llm";
import type { AgentId, FinalAssessment, FinalReview, ManuscriptInput, ReviewResult } from "@/lib/types";
import { summarizeReviewUsage, type ReviewStageUsageMap } from "@/lib/review/usage";
import type { AgentInfo } from "./types";
import {
  manuscriptReader,
  readManuscript,
  type ManuscriptReaderReview,
} from "./manuscript-reader";
import {
  researchDesignReviewer,
  reviewResearchDesign,
  type ResearchDesignReviewerReview,
} from "./research-design-reviewer";
import {
  auditEvidence,
  evidenceAuditor,
  type EvidenceAuditorReview,
} from "./evidence-auditor";
import { auditTheory, theoryAuditor, type TheoryAuditorReview } from "./theory-auditor";
import {
  auditOverclaims,
  overclaimAuditor,
  type OverclaimAuditorReview,
} from "./overclaim-auditor";
import { finalReviewer, synthesizeFinalReview } from "./final-reviewer";

/** Specialist agents in the order their reviews are reported (for display). */
export const specialistAgents: AgentInfo[] = [
  manuscriptReader,
  evidenceAuditor,
  researchDesignReviewer,
  theoryAuditor,
  overclaimAuditor,
];

export interface PipelineError {
  /** The agent that failed. */
  agentId: AgentId;
  error: LLMError;
  /** Present when Anthropic returned a billable response that failed locally. */
  metadata?: LLMResponseMetadata;
}

export type ReviewPipelineResult =
  | { ok: true; result: ReviewResult }
  | { ok: false; error: PipelineError };

export type ReviewProgressCallback = (stage: AgentId) => void | Promise<void>;

export interface FinalReviewerCheckpoint {
  finalReview: FinalReview;
  finalAssessment: FinalAssessment;
}

export type ReviewCheckpointMap = Partial<Record<AgentId, unknown>>;

export interface ReviewPipelineCheckpointOptions {
  checkpoints?: ReviewCheckpointMap;
  usage?: ReviewStageUsageMap;
  onCheckpoint?: (
    stage: AgentId,
    output: unknown,
    metadata?: LLMResponseMetadata,
  ) => void | Promise<void>;
}

/**
 * Run the review pipeline, checkpointing each successful model response before
 * the next stage begins. Persisted checkpoints let a restarted Render process
 * skip completed, already-billed stages.
 */
export async function runReviewPipeline(
  manuscript: ManuscriptInput,
  provider?: LLMProvider,
  onProgress?: ReviewProgressCallback,
  checkpointOptions?: ReviewPipelineCheckpointOptions,
): Promise<ReviewPipelineResult> {
  const checkpoints = checkpointOptions?.checkpoints ?? {};
  const usage: ReviewStageUsageMap = { ...(checkpointOptions?.usage ?? {}) };

  async function saveCheckpoint(
    stage: AgentId,
    output: unknown,
    metadata?: LLMResponseMetadata,
  ) {
    checkpoints[stage] = output;
    if (metadata) usage[stage] = metadata;
    await checkpointOptions?.onCheckpoint?.(stage, output, metadata);
  }

  let readerReview = checkpoints[manuscriptReader.id] as ManuscriptReaderReview | undefined;
  if (!readerReview) {
    await onProgress?.(manuscriptReader.id);
    const readerResult = await readManuscript(manuscript, provider ?? undefined);
    if (!readerResult.ok) {
      return {
        ok: false,
        error: {
          agentId: manuscriptReader.id,
          error: readerResult.error,
          metadata: readerResult.metadata,
        },
      };
    }
    readerReview = readerResult.review;
    await saveCheckpoint(manuscriptReader.id, readerReview, readerResult.metadata);
  }

  let evidenceReview = checkpoints[evidenceAuditor.id] as EvidenceAuditorReview | undefined;
  if (!evidenceReview) {
    await onProgress?.(evidenceAuditor.id);
    const evidenceResult = await auditEvidence(
      manuscript,
      readerReview.profile,
      provider ?? undefined,
    );
    if (!evidenceResult.ok) {
      return {
        ok: false,
        error: {
          agentId: evidenceAuditor.id,
          error: evidenceResult.error,
          metadata: evidenceResult.metadata,
        },
      };
    }
    evidenceReview = evidenceResult.review;
    await saveCheckpoint(evidenceAuditor.id, evidenceReview, evidenceResult.metadata);
  }

  let researchDesignReview = checkpoints[researchDesignReviewer.id] as
    | ResearchDesignReviewerReview
    | undefined;
  if (!researchDesignReview) {
    await onProgress?.(researchDesignReviewer.id);
    const researchDesignResult = await reviewResearchDesign(
      manuscript,
      readerReview.profile,
      provider ?? undefined,
    );
    if (!researchDesignResult.ok) {
      return {
        ok: false,
        error: {
          agentId: researchDesignReviewer.id,
          error: researchDesignResult.error,
          metadata: researchDesignResult.metadata,
        },
      };
    }
    researchDesignReview = researchDesignResult.review;
    await saveCheckpoint(
      researchDesignReviewer.id,
      researchDesignReview,
      researchDesignResult.metadata,
    );
  }

  let theoryReview = checkpoints[theoryAuditor.id] as TheoryAuditorReview | undefined;
  if (!theoryReview) {
    await onProgress?.(theoryAuditor.id);
    const theoryResult = await auditTheory(
      manuscript,
      readerReview.profile,
      provider ?? undefined,
    );
    if (!theoryResult.ok) {
      return {
        ok: false,
        error: {
          agentId: theoryAuditor.id,
          error: theoryResult.error,
          metadata: theoryResult.metadata,
        },
      };
    }
    theoryReview = theoryResult.review;
    await saveCheckpoint(theoryAuditor.id, theoryReview, theoryResult.metadata);
  }

  let overclaimReview = checkpoints[overclaimAuditor.id] as OverclaimAuditorReview | undefined;
  if (!overclaimReview) {
    await onProgress?.(overclaimAuditor.id);
    const overclaimResult = await auditOverclaims(
      manuscript,
      readerReview.profile,
      evidenceReview.evidenceAudit,
      provider ?? undefined,
    );
    if (!overclaimResult.ok) {
      return {
        ok: false,
        error: {
          agentId: overclaimAuditor.id,
          error: overclaimResult.error,
          metadata: overclaimResult.metadata,
        },
      };
    }
    overclaimReview = overclaimResult.review;
    await saveCheckpoint(overclaimAuditor.id, overclaimReview, overclaimResult.metadata);
  }

  let finalCheckpoint = checkpoints[finalReviewer.id] as FinalReviewerCheckpoint | undefined;
  if (!finalCheckpoint) {
    await onProgress?.(finalReviewer.id);
    const finalResult = await synthesizeFinalReview(
      manuscript,
      readerReview.profile,
      evidenceReview.evidenceAudit,
      researchDesignReview.researchDesignAudit,
      theoryReview.theoryAudit,
      overclaimReview.overclaimAudit,
      provider ?? undefined,
    );
    if (!finalResult.ok) {
      return {
        ok: false,
        error: {
          agentId: finalReviewer.id,
          error: finalResult.error,
          metadata: finalResult.metadata,
        },
      };
    }
    finalCheckpoint = {
      finalReview: finalResult.finalReview,
      finalAssessment: finalResult.finalAssessment,
    };
    await saveCheckpoint(finalReviewer.id, finalCheckpoint, finalResult.metadata);
  }

  return {
    ok: true,
    result: {
      reviewId: `rev_${Math.random().toString(36).slice(2, 10)}`,
      manuscriptTitle: manuscript.title,
      createdAt: new Date().toISOString(),
      agentReviews: [
        readerReview,
        evidenceReview,
        researchDesignReview,
        theoryReview,
        overclaimReview,
      ],
      finalReview: finalCheckpoint.finalReview,
      finalAssessment: finalCheckpoint.finalAssessment,
      usage: summarizeReviewUsage(usage),
    },
  };
}
