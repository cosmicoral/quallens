import type {
  DesignDimension,
  EvidenceAudit,
  FinalReview,
  ManuscriptInput,
  ManuscriptProfile,
  OverclaimAudit,
  ResearchDesignAudit,
  SectionReview,
  TheoryAudit,
  TheoryDimension,
} from "@/lib/types";
import {
  boundedCaseStudyAudit,
  boundedCaseStudyManuscript,
  boundedCaseStudyProfile,
} from "./research-design-fixtures";
import {
  causalOverclaimAudit,
  causalOverreachEvidenceAudit,
  causalOverreachManuscript,
  causalOverreachProfile,
} from "./overclaim-audit-fixtures";

export interface FinalReviewFixture {
  manuscript: ManuscriptInput;
  profile: ManuscriptProfile;
  evidenceAudit: EvidenceAudit;
  researchDesignAudit: ResearchDesignAudit;
  theoryAudit: TheoryAudit;
  overclaimAudit: OverclaimAudit;
  finalReview: FinalReview;
}

function section(
  assessment: SectionReview["assessment"],
  strengths: string[],
  concerns: string[],
  recommendedActions: string[],
): SectionReview {
  return {
    assessment,
    strengths,
    concerns,
    recommended_actions: recommendedActions,
  };
}

function theoryDimension(
  assessment: TheoryDimension["assessment"],
  reasoning: string,
  evidence: string[],
  revision: string | null,
): TheoryDimension {
  return {
    assessment,
    reasoning,
    evidence_from_manuscript: evidence,
    recommended_revision: revision,
  };
}

function designDimension(
  assessment: DesignDimension["assessment"],
  reasoning: string,
  missingInformation: string[] = [],
  revision: string | null = null,
): DesignDimension {
  return {
    assessment,
    reasoning,
    evidence_from_manuscript: [],
    missing_information: missingInformation,
    recommended_revision: revision,
  };
}

const strongManuscript: ManuscriptInput = {
  ...boundedCaseStudyManuscript,
  body: `${boundedCaseStudyManuscript.body}

Theoretical framing
We use communities of practice as a focused sensitising framework. Participation and shared repertoire help interpret how staff learn coordination routines; we do not claim to test the framework as a whole.

Discussion
Informal case debriefs functioned as sites of participation in which staff developed a shared repertoire for coordination. Workload-related negative cases qualify this pattern. We offer a bounded application to Northbank rather than a universal theoretical extension. Recruitment response rates and the coordinator's possible gatekeeping role remain reporting limitations.`,
};

const strongProfile: ManuscriptProfile = {
  ...boundedCaseStudyProfile,
  title: strongManuscript.title,
  stated_contribution:
    "A bounded account of coordination learning using selected communities-of-practice concepts.",
  theoretical_framework: [
    {
      name: "Communities of practice",
      operationalized_in_analysis: "yes",
      notes:
        "Participation and shared repertoire interpret debriefing and coordination routines.",
    },
  ],
  key_concepts: ["participation", "shared repertoire", "coordination routines"],
  limitations_explicitly_stated: [
    ...boundedCaseStudyProfile.limitations_explicitly_stated,
    "Recruitment response rates and possible coordinator gatekeeping are not fully reported.",
  ],
};

const strongEvidenceAudit: EvidenceAudit = {
  overall_assessment:
    "The bounded claim about informal debriefs is supported across multiple staff accounts and retains workload-related negative cases.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text:
        "Within Northbank, informal case debriefs helped staff develop shared coordination routines.",
      claim_scope: "Staff accounts within the Northbank partnership",
      evidence_found: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Staff across roles described learning coordination routines through informal debriefs.",
          source_label: "Interview findings",
        },
      ],
      evidence_distribution: "multiple_cases",
      support_assessment: "supported",
      reasoning:
        "The claim is explicitly bounded to Northbank, supported across roles, and qualified by two negative cases.",
      overclaim_risk: "low",
      contradictory_or_complicating_evidence: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Two participants reported that workload prevented participation in debriefs.",
          source_label: "Negative cases",
        },
      ],
      recommended_revision: null,
    },
  ],
  cross_cutting_issues: [],
  strengths: ["Evidence is distributed across roles and preserves negative cases."],
  priority_revisions: [],
};

const strongTheoryAudit: TheoryAudit = {
  overall_assessment:
    "Selected communities-of-practice concepts are defined, consistently applied, and appropriately limited to a supporting interpretive role.",
  frameworks: [
    {
      framework_name: "Communities of practice",
      role_in_manuscript: "supporting",
      operationalization: "adequate",
      concepts_used: ["participation", "shared repertoire"],
      reasoning:
        "The concepts change the interpretation of debriefs from information exchange to situated learning without claiming exhaustive framework use.",
      evidence_from_manuscript: [
        "Debriefs are interpreted as sites of participation that develop a shared coordination repertoire.",
      ],
      recommended_revision: null,
    },
  ],
  concept_consistency: [
    {
      concept: "participation and shared repertoire",
      assessment: "consistent",
      reasoning:
        "The concepts retain the same focused meanings in framing and discussion.",
      examples: ["Participation in debriefs develops shared coordination routines."],
    },
  ],
  analytical_integration: theoryDimension(
    "adequate",
    "Theory adds a situated-learning interpretation to the empirical pattern.",
    ["Debriefs are interpreted through participation and shared repertoire."],
    null,
  ),
  empirical_theory_link: theoryDimension(
    "adequate",
    "The concepts are linked to the reported debriefing pattern and its negative cases.",
    ["Workload limits participation in the practice."],
    null,
  ),
  theoretical_contribution: theoryDimension(
    "adequate",
    "The manuscript claims a bounded application rather than universal theory extension.",
    ["The contribution is explicitly limited to Northbank."],
    null,
  ),
  conceptual_drift: [],
  strengths: ["The manuscript explicitly narrows its theoretical use."],
  major_concerns: [],
  priority_revisions: [],
};

const strongOverclaimAudit: OverclaimAudit = {
  overall_assessment:
    "The empirical and theoretical claims remain bounded to Northbank and are proportionate to the evidence.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text:
        "Within Northbank, informal case debriefs helped staff develop shared coordination routines.",
      claim_type: "empirical",
      risk: "none",
      basis: "well_bounded",
      reasoning:
        "The claim names the case boundary, retains negative cases, and does not imply population generalisation.",
      supporting_context: [
        "The Evidence Audit assesses the claim as supported across multiple cases.",
      ],
      recommended_revision: null,
    },
  ],
  cross_cutting_patterns: [],
  strengths: ["Conclusion and contribution language remain contextually bounded."],
  priority_revisions: [],
};

const strongFinalReview: FinalReview = {
  manuscript_summary:
    "A bounded qualitative case study of how Northbank staff learn cross-organisational care coordination through informal debriefing practices.",
  overall_assessment:
    "The manuscript presents a coherent, well-supported case analysis with proportionate theoretical and empirical claims. Revision should focus on recruitment transparency and sharpening the introduction rather than repairing a validity failure.",
  recommendation: "minor_revision",
  confidence: "high",
  strengths: [
    {
      title: "Coherent qualitative design",
      description:
        "The question, case boundary, purposive sampling, interviews, analysis, and bounded claims form a clear chain.",
      source_agents: ["reader", "research_design"],
    },
    {
      title: "Well-grounded and qualified findings",
      description:
        "The main claim is supported across roles and preserves workload-related negative cases.",
      source_agents: ["evidence", "overclaim"],
    },
    {
      title: "Focused theoretical integration",
      description:
        "Selected concepts add interpretation without inflating the theoretical contribution.",
      source_agents: ["theory", "overclaim"],
    },
  ],
  major_concerns: [],
  minor_concerns: [
    {
      title: "Recruitment reporting could be more transparent",
      description:
        "Response rates and the independent coordinator's possible gatekeeping role are not fully described.",
      source_agents: ["research_design"],
    },
  ],
  priority_revisions: [
    {
      priority: 1,
      title: "Clarify recruitment and participation",
      why_it_matters:
        "Readers need to understand how the eligible pool became the final participant group.",
      action:
        "Report response numbers, non-participation where known, and the coordinator's role in access.",
      source_agents: ["research_design"],
    },
    {
      priority: 2,
      title: "Sharpen the introduction's contribution statement",
      why_it_matters:
        "The bounded empirical and theoretical contribution is clearer in the discussion than in the opening framing.",
      action:
        "State the case-specific empirical contribution and focused use of communities-of-practice concepts in the introduction.",
      source_agents: ["theory", "overclaim"],
    },
  ],
  section_reviews: {
    introduction: section(
      "adequate",
      ["The research problem and question are clear."],
      ["The bounded contribution is stated more precisely later in the manuscript."],
      ["Align the opening contribution statement with the discussion."],
    ),
    methods: section(
      "adequate",
      ["Design, sampling rationale, data generation, analysis, reflexivity, and ethics are described."],
      ["Recruitment response and gatekeeping detail remains limited."],
      ["Add recruitment-flow detail."],
    ),
    findings: section(
      "strong",
      ["Findings answer the question and preserve negative cases."],
      [],
      [],
    ),
    discussion: section(
      "strong",
      ["The discussion interprets the pattern through a focused theoretical lens."],
      [],
      [],
    ),
    conclusion: section(
      "adequate",
      ["Conclusions are bounded to Northbank and retain workload constraints."],
      [],
      [],
    ),
  },
  cross_section_coherence: {
    research_question_to_design:
      "The bounded case-study design and varied role sample fit the question about coordination learning.",
    design_to_findings:
      "The interview and comparative analytical process support the reported within-case patterns.",
    findings_to_discussion:
      "The discussion interprets rather than merely repeats the debriefing pattern and retains negative cases.",
    discussion_to_contribution:
      "The focused theoretical application follows from the discussion and remains proportionate.",
    conclusion_proportionality:
      "The conclusion stays within the case and does not imply statistical or universal reach.",
  },
};

export const strongSynthesisFixture: FinalReviewFixture = {
  manuscript: strongManuscript,
  profile: strongProfile,
  evidenceAudit: strongEvidenceAudit,
  researchDesignAudit: {
    ...boundedCaseStudyAudit,
    recruitment: {
      ...boundedCaseStudyAudit.recruitment,
      assessment: "partially_adequate",
      reasoning:
        "The recruitment route and eligibility are reported, but response and gatekeeping detail is limited.",
      missing_information: ["Response numbers", "Coordinator gatekeeping role"],
      recommended_revision:
        "Report the eligible pool, responses, and the coordinator's role in access.",
    },
    major_concerns: [],
    priority_revisions: ["Clarify recruitment response and access."],
  },
  theoryAudit: strongTheoryAudit,
  overclaimAudit: strongOverclaimAudit,
  finalReview: strongFinalReview,
};

const weakManuscript: ManuscriptInput = {
  ...causalOverreachManuscript,
  body: `Introduction
This is the first study to prove how platforms create food waste across Britain. We cite Social Practice Theory as our central framework.

Methods
We interviewed 22 grocery-platform users. Recruitment, sampling rationale, and analytical steps are not reported. We used thematic analysis.

Findings
Some participants believed app notifications encouraged impulse purchases. Several recalled discarding promoted products. Two participants did not connect their waste to platforms.

Discussion
The findings prove that platform use causes food waste among all UK households. Social Practice Theory confirms this conclusion, although its concepts are not used in the analysis.

Conclusion
Platforms cause household food waste nationwide. The government must prohibit grocery-app promotions immediately.`,
};

const weakProfile: ManuscriptProfile = {
  ...causalOverreachProfile,
  title: weakManuscript.title,
  stated_contribution:
    "The first study to prove that platforms cause food waste across Britain.",
  theoretical_framework: [
    {
      name: "Social Practice Theory",
      operationalized_in_analysis: "no",
      notes: "Cited as central but no concepts appear in findings or analysis.",
    },
  ],
  sampling_strategy: null,
  analytical_method: "Thematic analysis",
  conclusions: [
    "Platforms cause household food waste nationwide.",
    "Government must prohibit grocery-app promotions immediately.",
  ],
  missing_information: [
    "sampling rationale",
    "recruitment procedures",
    "analytical steps",
    "theoretical operationalization",
  ],
};

const weakDesignAudit: ResearchDesignAudit = {
  overall_assessment:
    "The interview method can explore perceptions, but sampling, recruitment, analysis, and design-to-claim coherence are inadequately reported.",
  research_question_alignment: designDimension(
    "partially_adequate",
    "Interviews fit perceptions but not proof of a population causal effect.",
  ),
  sampling: designDimension(
    "weak",
    "No sampling rationale is reported.",
    ["Sampling strategy and rationale"],
    "Explain participant selection in relation to the exploratory question.",
  ),
  recruitment: designDimension(
    "not_reported",
    "Recruitment procedures are absent.",
    ["Recruitment route", "Eligibility criteria"],
    "Report recruitment and eligibility procedures.",
  ),
  data_collection: designDimension(
    "partially_adequate",
    "Interviews are named but procedures are sparse.",
    ["Interview duration and topic coverage"],
  ),
  analytical_process: designDimension(
    "weak",
    "Thematic analysis is named but not described.",
    ["Coding and theme development"],
    "Describe the analytical process.",
  ),
  reflexivity_and_positionality: designDimension(
    "not_reported",
    "No reflexive information is reported.",
    ["Researcher positionality"],
  ),
  ethics: designDimension(
    "not_reported",
    "Ethics information is absent; non-compliance cannot be inferred.",
    ["Consent and confidentiality reporting"],
  ),
  transferability_and_context: designDimension(
    "weak",
    "The manuscript provides little context yet makes nationwide claims.",
    ["Study context"],
  ),
  design_coherence: designDimension(
    "weak",
    "Retrospective interviews do not support the causal and national conclusion.",
  ),
  strengths: ["Interviews provide access to participant perceptions."],
  major_concerns: [
    {
      issue_type: "design_claim_mismatch",
      severity: "high",
      description:
        "The design explores perceptions but the manuscript claims national causal proof.",
      why_it_matters:
        "The conclusion requires an evidential and design basis the study does not provide.",
      recommended_revision:
        "Reframe the study around participant perceptions and remove causal population claims.",
    },
  ],
  priority_revisions: [
    "Align the research question and claims with an interview study of perceptions.",
    "Report sampling, recruitment, and analytical procedures.",
  ],
};

const weakTheoryAudit: TheoryAudit = {
  overall_assessment:
    "Social Practice Theory is cited as central but is not defined or used in analysis.",
  frameworks: [
    {
      framework_name: "Social Practice Theory",
      role_in_manuscript: "central",
      operationalization: "minimal",
      concepts_used: [],
      reasoning:
        "The framework is named in the introduction and invoked as confirmation in discussion without concept-level analysis.",
      evidence_from_manuscript: ["No framework concepts appear in the findings."],
      recommended_revision:
        "Integrate defined concepts into analysis or narrow the theoretical claims.",
    },
  ],
  concept_consistency: [],
  analytical_integration: theoryDimension(
    "weak",
    "The framework does not shape coding or interpretation.",
    [],
    "Integrate the framework or reposition it as background.",
  ),
  empirical_theory_link: theoryDimension(
    "weak",
    "The discussion asserts confirmation without linking concepts to evidence.",
    [],
    "Link specific concepts to bounded empirical patterns.",
  ),
  theoretical_contribution: theoryDimension(
    "weak",
    "No theoretical contribution is demonstrated.",
    [],
    "Remove or substantiate the theoretical contribution claim.",
  ),
  conceptual_drift: [],
  strengths: ["The intended framework is named clearly."],
  major_concerns: [
    {
      issue_type: "framework_not_operationalized",
      severity: "high",
      description: "The central framework is absent from the analysis.",
      why_it_matters:
        "The theory cannot support the interpretation or contribution merely by being cited.",
      recommended_revision:
        "Use defined concepts analytically or narrow the theoretical positioning.",
    },
  ],
  priority_revisions: ["Resolve whether theory is analytical or background."],
};

const weakFinalReview: FinalReview = {
  manuscript_summary:
    "An interview study of grocery-platform users' retrospective perceptions of promotions, purchasing, and food disposal.",
  overall_assessment:
    "The manuscript is not ready for a publication-readiness judgment because its central causal and national claims exceed the interview evidence and design, while sampling, analysis, and theoretical integration remain under-specified. These validity and argument problems outweigh the clarity of the topic and require reconceptualisation rather than surface editing.",
  recommendation: "not_ready",
  confidence: "high",
  strengths: [
    {
      title: "Clear and consequential topic",
      description:
        "The manuscript addresses an understandable concern about platform-mediated purchasing and waste.",
      source_agents: ["reader"],
    },
    {
      title: "Participant perceptions are visible in the findings",
      description:
        "The findings report attributed perceptions and retain two complicating cases.",
      source_agents: ["evidence"],
    },
  ],
  major_concerns: [
    {
      title: "Evidence cannot support causal proof",
      description:
        "Retrospective accounts establish perceived influence and sequence, not an isolated causal effect.",
      source_agents: ["evidence", "research_design", "overclaim"],
    },
    {
      title: "Design and analysis are not transparent",
      description:
        "Sampling, recruitment, and thematic development are insufficiently described to assess the study's analytical basis.",
      source_agents: ["research_design"],
    },
    {
      title: "Theory and contribution are asserted",
      description:
        "Social Practice Theory and first-study claims are not demonstrated in the analysis or manuscript's own account.",
      source_agents: ["theory", "overclaim"],
    },
  ],
  minor_concerns: [],
  priority_revisions: [
    {
      priority: 1,
      title: "Reframe the central claim around participant perceptions",
      why_it_matters:
        "The current causal and nationwide claims are not supported by the evidence or design.",
      action:
        "Replace proof and causality language with a bounded account of how some participants perceived promotions as contributing to later waste.",
      source_agents: ["evidence", "research_design", "overclaim"],
    },
    {
      priority: 2,
      title: "Make the research design assessable",
      why_it_matters:
        "Readers cannot judge whose accounts are included or how themes were produced.",
      action:
        "Report sampling rationale, recruitment, interview procedures, and coding and theme-development steps.",
      source_agents: ["research_design"],
    },
    {
      priority: 3,
      title: "Resolve the role of theory",
      why_it_matters:
        "A cited framework cannot support interpretation without concept-level use.",
      action:
        "Either operationalize defined Social Practice Theory concepts throughout analysis or narrow the theoretical claims.",
      source_agents: ["theory"],
    },
    {
      priority: 4,
      title: "Remove unsupported novelty and policy certainty",
      why_it_matters:
        "The first-study claim and immediate nationwide prohibition are not established by this manuscript.",
      action:
        "State a bounded empirical contribution and offer implications proportionate to exploratory interview evidence.",
      source_agents: ["overclaim"],
    },
  ],
  section_reviews: {
    introduction: section(
      "needs_revision",
      ["The topic is clear."],
      ["Novelty and causal contribution are asserted rather than established."],
      ["State an exploratory, participant-centred question and bounded contribution."],
    ),
    methods: section(
      "major_revision",
      ["Interviews are an appropriate method for perceptions."],
      ["Sampling, recruitment, data-generation detail, analysis, reflexivity, and ethics are under-reported."],
      ["Provide a transparent account of design and analysis."],
    ),
    findings: section(
      "major_revision",
      ["Some perceptions and negative cases are attributed."],
      ["The evidence is too thin for the scope later placed on it."],
      ["Develop bounded analytical themes with evidence across cases."],
    ),
    discussion: section(
      "major_revision",
      [],
      ["The discussion converts perceptions into causality and invokes theory without integration."],
      ["Interpret participant accounts without causal proof and show any genuine theory link."],
    ),
    conclusion: section(
      "major_revision",
      [],
      ["National causality, novelty, and policy prescription exceed the manuscript's basis."],
      ["Rewrite the conclusion around bounded findings, limitations, and proportionate implications."],
    ),
  },
  cross_section_coherence: {
    research_question_to_design:
      "The interview method could address perceptions, but the manuscript promises causal national proof.",
    design_to_findings:
      "Sparse design and analytical reporting prevents a clear account of how themes were produced.",
    findings_to_discussion:
      "Participant-attributed perceptions become objective causal claims in discussion.",
    discussion_to_contribution:
      "Neither theory integration nor novelty is demonstrated by the discussion.",
    conclusion_proportionality:
      "The conclusion's national causal and policy claims substantially exceed the evidence and design.",
  },
};

export const weakSynthesisFixture: FinalReviewFixture = {
  manuscript: weakManuscript,
  profile: weakProfile,
  evidenceAudit: causalOverreachEvidenceAudit,
  researchDesignAudit: weakDesignAudit,
  theoryAudit: weakTheoryAudit,
  overclaimAudit: {
    ...causalOverclaimAudit,
    claims: [
      ...causalOverclaimAudit.claims,
      {
        claim_id: "overclaim-1",
        claim_text: "The government must prohibit grocery-app promotions immediately.",
        claim_type: "policy",
        risk: "high",
        basis: "unsupported_recommendation",
        reasoning:
          "An immediate nationwide prohibition is not supported by exploratory retrospective interviews.",
        supporting_context: ["The manuscript reports no policy evaluation."],
        recommended_revision:
          "Offer cautious implications for further research or practice rather than a nationwide prohibition.",
      },
    ],
  },
  finalReview: weakFinalReview,
};

const uncertainManuscript: ManuscriptInput = {
  title: "Belonging and remote work",
  discipline: "sociology",
  methodology: "other",
  body: `Abstract
This manuscript explores belonging in remote work. Employees described changing relationships with colleagues. The available submission excerpt does not include a methods, findings, discussion, or conclusion section.`,
};

const uncertainProfile: ManuscriptProfile = {
  title: uncertainManuscript.title,
  discipline: "sociology",
  research_topic: "Belonging in remote work.",
  research_questions: [],
  stated_contribution: null,
  theoretical_framework: [],
  key_concepts: ["belonging"],
  methodology: null,
  qualitative_approach: null,
  sampling_strategy: null,
  sample_description: null,
  sample_size: { as_stated: null, numeric: null },
  data_collection_methods: [],
  analytical_method: null,
  fieldwork_context: null,
  ethical_information: null,
  reflexivity_or_positionality: null,
  main_findings: [],
  major_analytical_claims: [
    {
      claim: "Employees described changing relationships with colleagues.",
      generalization_type: "unclear",
    },
  ],
  conclusions: [],
  limitations_explicitly_stated: [],
  missing_information: [
    "research question",
    "methods section",
    "findings section",
    "discussion section",
    "conclusion section",
  ],
  ambiguities: ["It is unclear whether the text is a full manuscript or excerpt."],
};

const uncertainFinalReview: FinalReview = {
  manuscript_summary:
    "An incomplete submission excerpt concerning employees' descriptions of belonging and workplace relationships in remote work.",
  overall_assessment:
    "A responsible publication-readiness assessment cannot be made because the available text omits the methods, findings, discussion, and conclusion needed to evaluate the study. The specialist uncertainty should be resolved through a complete submission rather than inferred away.",
  recommendation: "cannot_assess",
  confidence: "low",
  strengths: [
    {
      title: "Relevant topic is identifiable",
      description: "The excerpt identifies remote-work belonging as its topic.",
      source_agents: ["reader"],
    },
  ],
  major_concerns: [
    {
      title: "Core manuscript sections are unavailable",
      description:
        "The study design, evidence, analysis, interpretation, and conclusion cannot be assessed from the excerpt.",
      source_agents: ["reader", "evidence", "research_design", "theory", "overclaim"],
    },
  ],
  minor_concerns: [],
  priority_revisions: [
    {
      priority: 1,
      title: "Provide the complete manuscript",
      why_it_matters:
        "The missing sections prevent evidence-based synthesis and section-level review.",
      action:
        "Resubmit the research question, methods, findings, discussion, and conclusion in full.",
      source_agents: ["evidence", "research_design", "theory", "overclaim"],
    },
  ],
  section_reviews: {
    introduction: section(
      "needs_revision",
      ["The broad topic is identifiable."],
      ["Research question, gap, and contribution are not stated in the excerpt."],
      ["Provide the complete introduction."],
    ),
    methods: section(
      "cannot_assess",
      [],
      ["Methods are absent."],
      ["Provide the complete methods section."],
    ),
    findings: section(
      "cannot_assess",
      [],
      ["Findings and supporting material are absent."],
      ["Provide the complete findings section."],
    ),
    discussion: section(
      "cannot_assess",
      [],
      ["Discussion is absent."],
      ["Provide the complete discussion section."],
    ),
    conclusion: section(
      "cannot_assess",
      [],
      ["Conclusion is absent."],
      ["Provide the complete conclusion."],
    ),
  },
  cross_section_coherence: {
    research_question_to_design:
      "Cannot assess because neither an explicit question nor design is available.",
    design_to_findings:
      "Cannot assess because design and findings sections are absent.",
    findings_to_discussion:
      "Cannot assess because findings and discussion are absent.",
    discussion_to_contribution:
      "Cannot assess because discussion and contribution claims are unavailable.",
    conclusion_proportionality:
      "Cannot assess because no conclusion is included.",
  },
};

export const uncertainSynthesisFixture: FinalReviewFixture = {
  manuscript: uncertainManuscript,
  profile: uncertainProfile,
  evidenceAudit: {
    overall_assessment:
      "The claim cannot be assessed because no findings or supporting material are available.",
    claims: [
      {
        claim_id: "claim-1",
        claim_text: "Employees described changing relationships with colleagues.",
        claim_scope: null,
        evidence_found: [],
        evidence_distribution: "unclear",
        support_assessment: "cannot_assess",
        reasoning: "The excerpt contains no findings or evidence presentation.",
        overclaim_risk: "moderate",
        contradictory_or_complicating_evidence: [],
        recommended_revision: "Provide the full findings and supporting material.",
      },
    ],
    cross_cutting_issues: [],
    strengths: [],
    priority_revisions: ["Provide the complete findings section."],
  },
  researchDesignAudit: {
    overall_assessment: "The research design cannot be assessed from the excerpt.",
    research_question_alignment: designDimension(
      "cannot_assess",
      "No explicit question or design is available.",
    ),
    sampling: designDimension("not_reported", "Sampling is absent."),
    recruitment: designDimension("not_reported", "Recruitment is absent."),
    data_collection: designDimension("not_reported", "Data collection is absent."),
    analytical_process: designDimension("not_reported", "Analysis is absent."),
    reflexivity_and_positionality: designDimension(
      "cannot_assess",
      "Relevance cannot be assessed without a design.",
    ),
    ethics: designDimension(
      "cannot_assess",
      "The study context and procedures are unavailable.",
    ),
    transferability_and_context: designDimension(
      "cannot_assess",
      "Context is not reported.",
    ),
    design_coherence: designDimension(
      "cannot_assess",
      "The design chain is unavailable.",
    ),
    strengths: [],
    major_concerns: [],
    priority_revisions: ["Provide the full methods section."],
  },
  theoryAudit: {
    overall_assessment:
      "No theoretical framework or analytical use can be assessed from the excerpt.",
    frameworks: [],
    concept_consistency: [],
    analytical_integration: theoryDimension(
      "cannot_assess",
      "The analytical sections are absent.",
      [],
      "Provide the full framing and analysis.",
    ),
    empirical_theory_link: theoryDimension(
      "cannot_assess",
      "No findings or discussion are available.",
      [],
      null,
    ),
    theoretical_contribution: theoryDimension(
      "cannot_assess",
      "No contribution claim is available.",
      [],
      null,
    ),
    conceptual_drift: [],
    strengths: [],
    major_concerns: [],
    priority_revisions: [],
  },
  overclaimAudit: {
    overall_assessment:
      "Claim proportionality is ambiguous because evidence and conclusions are absent.",
    claims: [
      {
        claim_id: "claim-1",
        claim_text: "Employees described changing relationships with colleagues.",
        claim_type: "empirical",
        risk: "moderate",
        basis: "ambiguous",
        reasoning:
          "The wording is potentially bounded, but its evidence and intended scope cannot be checked.",
        supporting_context: ["Only an abstract excerpt is available."],
        recommended_revision: "Provide the full findings and clarify claim scope.",
      },
    ],
    cross_cutting_patterns: [],
    strengths: [],
    priority_revisions: [],
  },
  finalReview: uncertainFinalReview,
};
