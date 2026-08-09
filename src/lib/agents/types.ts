import type { AgentId, AgentReview, ManuscriptInput } from "@/lib/types";

/** Display metadata shared by every agent in the panel. */
export interface AgentInfo {
  id: AgentId;
  name: string;
  /** What this agent scrutinizes in the manuscript. */
  focus: string;
}

/**
 * Contract for a specialist reviewer agent.
 *
 * LLM-backed agents expose typed-result entry points and are wired explicitly
 * in the pipeline, so failures surface as typed errors rather than thrown
 * exceptions. This interface remains available for compatible implementations.
 */
export interface ReviewerAgent extends AgentInfo {
  run(manuscript: ManuscriptInput): Promise<AgentReview>;
}
