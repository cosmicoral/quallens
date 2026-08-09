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
 * Mock agents implement this directly. LLM-backed agents expose their own
 * typed-result entry points and are wired explicitly in the pipeline, so
 * failures surface as typed errors rather than thrown exceptions.
 */
export interface ReviewerAgent extends AgentInfo {
  run(manuscript: ManuscriptInput): Promise<AgentReview>;
}
