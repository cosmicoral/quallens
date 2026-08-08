import { buildMockAgentReview } from "@/lib/mock/mock-review";
import type { ReviewerAgent } from "./types";

/**
 * Checks that every empirical claim is backed by data: quotation coverage,
 * theme prevalence, and treatment of negative/disconfirming cases. LLM call
 * not implemented yet — returns mock.
 */
export const evidenceAuditor: ReviewerAgent = {
  id: "evidence-auditor",
  name: "Evidence Auditor",
  focus:
    "Whether claims are supported by the presented data, including negative cases.",
  async run() {
    return buildMockAgentReview("evidence-auditor");
  },
};
