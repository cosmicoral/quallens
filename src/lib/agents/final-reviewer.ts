import { buildMockFinalAssessment } from "@/lib/mock/mock-review";
import type { AgentReview, FinalAssessment, ManuscriptInput } from "@/lib/types";

/**
 * The Final Reviewer synthesizes the specialist agents' reviews into an
 * overall verdict with prioritized recommendations. Unlike the specialists it
 * takes their outputs as input. LLM call not implemented yet — returns mock.
 */
export const finalReviewer = {
  id: "final-reviewer" as const,
  name: "Final Reviewer",
  focus: "Synthesis of all specialist reviews into a verdict and revision plan.",
  async synthesize(
    _manuscript: ManuscriptInput,
    _agentReviews: AgentReview[],
  ): Promise<FinalAssessment> {
    return buildMockFinalAssessment();
  },
};
