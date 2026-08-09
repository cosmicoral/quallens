import type { FinalAssessment } from "@/lib/types";

const MOCK_FINAL_ASSESSMENT: FinalAssessment = {
  verdict: "major-revisions",
  overallScore: 3,
  summary:
    "A promising qualitative study with a clear narrative and mostly well-evidenced themes, held back by an under-specified research design and conclusions that outrun the evidence. The issues are addressable in revision.",
  strengths: [
    "Clear research question and readable thematic presentation",
    "Rich interview excerpts for most themes",
    "Engagement with a relevant theoretical framework",
  ],
  weaknesses: [
    "Sampling strategy and saturation criteria are not reported",
    "Key conclusions generalize beyond a single-site sample",
    "Theoretical framework is not visibly connected to the analysis",
  ],
  recommendations: [
    "Specify sampling frame, inclusion criteria, and stopping rule",
    "Reframe conclusions as analytic generalization with scope conditions",
    "Demonstrate how the framework informed coding, or reframe as inductive",
    "Report theme prevalence and address disconfirming cases",
  ],
};

/** Mock output for the Final Reviewer. */
export function buildMockFinalAssessment(): FinalAssessment {
  return MOCK_FINAL_ASSESSMENT;
}
