import { buildMockAgentReview } from "@/lib/mock/mock-review";
import type { ReviewerAgent } from "./types";

/**
 * Evaluates methodological soundness: fit between question and method,
 * sampling, data collection, reflexivity, and ethics. LLM call not
 * implemented yet — returns mock.
 */
export const researchDesignReviewer: ReviewerAgent = {
  id: "research-design-reviewer",
  name: "Research Design Reviewer",
  focus:
    "Fit between research question and design; sampling, data collection, reflexivity, ethics.",
  async run() {
    return buildMockAgentReview("research-design-reviewer");
  },
};
