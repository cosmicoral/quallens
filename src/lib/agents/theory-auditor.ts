import { buildMockAgentReview } from "@/lib/mock/mock-review";
import type { ReviewerAgent } from "./types";

/**
 * Audits the theoretical framing: whether the framework is used consistently,
 * actually informs the analysis, and is engaged with rather than name-checked.
 * LLM call not implemented yet — returns mock.
 */
export const theoryAuditor: ReviewerAgent = {
  id: "theory-auditor",
  name: "Theory Auditor",
  focus:
    "Coherence and genuine use of the theoretical framework in the analysis.",
  async run() {
    return buildMockAgentReview("theory-auditor");
  },
};
