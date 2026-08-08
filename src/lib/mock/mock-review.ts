import type { AgentId, AgentReview, FinalAssessment } from "@/lib/types";

/**
 * Canned review data for the reviewer agents that are not yet LLM-backed.
 * The Manuscript Reader is real (see src/lib/agents/manuscript-reader.ts)
 * and no longer has a mock entry here.
 */

export type MockableAgentId = Exclude<AgentId, "final-reviewer" | "manuscript-reader">;

const MOCK_AGENT_REVIEWS: Record<MockableAgentId, AgentReview> = {
  "research-design-reviewer": {
    agentId: "research-design-reviewer",
    agentName: "Research Design Reviewer",
    summary:
      "The interview-based design is broadly appropriate for the research question, but the sampling strategy and stopping criteria are under-specified.",
    score: 3,
    findings: [
      {
        id: "rd-1",
        severity: "major",
        title: "Sampling strategy not justified",
        detail:
          "Participants are described as 'purposively sampled' but no criteria are given for inclusion, exclusion, or how saturation was assessed.",
        location: "Methods, sampling subsection",
        recommendation:
          "State the sampling frame, inclusion criteria, and how the final sample size was determined.",
      },
      {
        id: "rd-2",
        severity: "moderate",
        title: "Positionality not addressed",
        detail:
          "The author's relationship to the field site and participants is not discussed, though it plausibly shaped access and interpretation.",
        location: "Methods",
        recommendation:
          "Add a brief positionality statement and reflect on its implications for the analysis.",
      },
    ],
  },
  "evidence-auditor": {
    agentId: "evidence-auditor",
    agentName: "Evidence Auditor",
    summary:
      "Most thematic claims are supported by interview excerpts, but several key claims rest on a single quotation and negative cases are not discussed.",
    score: 3,
    findings: [
      {
        id: "ea-1",
        severity: "moderate",
        title: "Thin evidentiary base for theme 2",
        detail:
          "The second theme ('institutional distrust') is supported by quotations from only two of the reported participants, yet is presented as pervasive.",
        location: "Findings, theme 2",
        recommendation:
          "Report how many participants expressed this theme, or soften the claim about its prevalence.",
      },
      {
        id: "ea-2",
        severity: "minor",
        title: "No treatment of disconfirming cases",
        detail:
          "The analysis does not indicate whether any participants contradicted the main themes, which weakens confidence in the coding.",
        location: "Findings",
        recommendation:
          "Describe negative or deviant cases and how they were handled in the analysis.",
      },
    ],
  },
  "theory-auditor": {
    agentId: "theory-auditor",
    agentName: "Theory Auditor",
    summary:
      "The manuscript engages a relevant theoretical framework, but the link between the framework and the coding scheme is asserted rather than demonstrated.",
    score: 3,
    findings: [
      {
        id: "ta-1",
        severity: "moderate",
        title: "Framework applied post hoc",
        detail:
          "The theoretical framework appears only in the introduction and discussion; the analysis section never shows how it informed coding or interpretation.",
        location: "Analysis; Discussion",
        recommendation:
          "Show explicitly how the framework's concepts map onto the codes and themes, or reframe the study as inductive.",
      },
    ],
  },
  "overclaim-auditor": {
    agentId: "overclaim-auditor",
    agentName: "Overclaim & Contribution Auditor",
    summary:
      "The stated contribution is plausible, but several conclusions generalize beyond what a single-site qualitative study can support.",
    score: 2,
    findings: [
      {
        id: "oa-1",
        severity: "major",
        title: "Generalization beyond the sample",
        detail:
          "The conclusion claims the findings 'characterize frontline workers nationally', but the data come from one organization in one region.",
        location: "Conclusion",
        recommendation:
          "Reframe conclusions as analytic (theoretical) rather than statistical generalization, and state scope conditions.",
      },
      {
        id: "oa-2",
        severity: "moderate",
        title: "Contribution overlaps with prior work",
        detail:
          "The claimed novelty ('first study to examine X') is contradicted by at least one strand of literature cited in the manuscript itself.",
        location: "Introduction; Discussion",
        recommendation:
          "Narrow the novelty claim to the specific empirical or theoretical gap the study actually fills.",
      },
    ],
  },
};

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

/** Mock output for a single specialist agent. */
export function buildMockAgentReview(agentId: MockableAgentId): AgentReview {
  return MOCK_AGENT_REVIEWS[agentId];
}

/** Mock output for the Final Reviewer. */
export function buildMockFinalAssessment(): FinalAssessment {
  return MOCK_FINAL_ASSESSMENT;
}
