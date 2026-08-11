import type { ManuscriptProfile } from "./manuscript-profile";
import type { EvidenceAudit } from "./evidence-audit";
import type { ResearchDesignAudit } from "./research-design-audit";
import type { TheoryAudit } from "./theory-audit";
import type { OverclaimAudit } from "./overclaim-audit";
import type { FinalReview } from "./final-review";

/**
 * Review output types.
 *
 * A review run fans the manuscript out to specialist reviewer agents; each
 * produces an AgentReview, and the Final Reviewer synthesizes them into an
 * overall revision-readiness judgment.
 */

export type AgentId =
  | "manuscript-reader"
  | "research-design-reviewer"
  | "evidence-auditor"
  | "theory-auditor"
  | "overclaim-auditor"
  | "final-reviewer";

export type Severity = "minor" | "moderate" | "major";

export type Verdict =
  | "accept"
  | "minor-revisions"
  | "major-revisions"
  | "reject";

/** A single issue or observation raised by a reviewer agent. */
export interface ReviewFinding {
  id: string;
  severity: Severity;
  /** Short label, e.g. "Sampling strategy not justified". */
  title: string;
  /** Full explanation of the concern. */
  detail: string;
  /** Where in the manuscript the issue occurs, e.g. "Methods, para 3". */
  location?: string;
  /** Concrete suggestion for addressing the issue. */
  recommendation?: string;
}

/** Output of one specialist reviewer agent. */
export interface AgentReview {
  agentId: AgentId;
  /** Human-readable agent name, e.g. "Evidence Auditor". */
  agentName: string;
  /** Narrative summary of this agent's assessment. */
  summary: string;
  /** 1 (poor) to 5 (excellent) on this agent's dimension. */
  score: number;
  findings: ReviewFinding[];
  /**
   * Structured manuscript profile — produced by the Manuscript Reader only.
   * Downstream agents will use it to ground their reviews.
   */
  profile?: ManuscriptProfile;
  /** Structured claim-level audit — produced by the Evidence Auditor only. */
  evidenceAudit?: EvidenceAudit;
  /** Structured design audit — produced by the Research Design Reviewer only. */
  researchDesignAudit?: ResearchDesignAudit;
  /** Structured theory audit — produced by the Theory Auditor only. */
  theoryAudit?: TheoryAudit;
  /** Structured scope audit — produced by the Overclaim Auditor only. */
  overclaimAudit?: OverclaimAudit;
}

/** Synthesis produced by the Final Reviewer agent. */
export interface FinalAssessment {
  verdict: Verdict;
  /** 1 (poor) to 5 (excellent), overall. */
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  /** Prioritized revision recommendations. */
  recommendations: string[];
}

/** Full result of a review run. */
export interface ReviewResult {
  reviewId: string;
  manuscriptTitle: string;
  /** ISO 8601 timestamp of when the review completed. */
  createdAt: string;
  agentReviews: AgentReview[];
  /** Structured, section-aware synthesis from the real Final Reviewer. */
  finalReview?: FinalReview;
  /** Legacy summary retained additively for existing API consumers. */
  finalAssessment: FinalAssessment;
  /** Provider usage recorded for each completed reviewer stage. */
  usage?: ReviewUsageSummary;
}

export interface ReviewStageUsage {
  stage: AgentId;
  provider: string;
  model: string;
  requestId?: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  estimatedCostUsd: number;
}

export interface ReviewUsageSummary {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  stages: ReviewStageUsage[];
}

export type ReviewJobStatus = "pending" | "running" | "completed" | "failed";

export interface ReviewJobView {
  reviewId: string;
  status: ReviewJobStatus;
  stage?: string;
  startedAt?: string;
  completedAt?: string;
  usage?: ReviewUsageSummary;
}

/** Shape shared by review submission and status responses. */
export interface ReviewResponse {
  ok: boolean;
  job?: ReviewJobView;
  result?: ReviewResult;
  error?: string;
  /** Machine-readable error code when an agent fails (e.g. LLM errors). */
  errorCode?: string;
}

/** One durable reviewer checkpoint delivered over the review SSE stream. */
export interface ReviewCheckpointEvent {
  stage: AgentId;
  output: unknown;
  usage?: ReviewUsageSummary;
}
