import { buildMockAgentReview } from "@/lib/mock/mock-review";
import type { ReviewerAgent } from "./types";

/**
 * Hunts for conclusions that outrun the evidence — inappropriate
 * generalization, inflated novelty claims — and assesses the stated
 * contribution. LLM call not implemented yet — returns mock.
 */
export const overclaimAuditor: ReviewerAgent = {
  id: "overclaim-auditor",
  name: "Overclaim & Contribution Auditor",
  focus:
    "Overgeneralization, inflated novelty, and the credibility of the stated contribution.",
  async run() {
    return buildMockAgentReview("overclaim-auditor");
  },
};
