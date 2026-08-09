import type {
  ManuscriptInput,
  ManuscriptProfile,
  TheoryAudit,
} from "@/lib/types";

function profileFor(
  manuscript: ManuscriptInput,
  fields: Partial<ManuscriptProfile>,
): ManuscriptProfile {
  return {
    title: manuscript.title,
    discipline: manuscript.discipline ?? null,
    research_topic: "Qualitative study of everyday social experience.",
    research_questions: [],
    stated_contribution: null,
    theoretical_framework: [],
    key_concepts: [],
    methodology: manuscript.methodology ?? null,
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
    major_analytical_claims: [],
    conclusions: [],
    limitations_explicitly_stated: [],
    missing_information: [],
    ambiguities: [],
    ...fields,
  };
}

export const mentionedTheoryManuscript: ManuscriptInput = {
  title: "Commuting routines after hybrid work",
  discipline: "sociology",
  methodology: "interviews",
  body: `Literature review
This study adopts Social Practice Theory as its central theoretical framework. Following the framework, practices are commonly discussed through meanings, materials, and competences. We argue that the study extends Social Practice Theory by showing how commuting practices change after hybrid work.

Methods
We conducted semi-structured interviews with 20 office workers and used inductive thematic analysis.

Findings
Participants described commuting less often, checking train times, buying bicycles, and valuing flexibility. Theme one concerns convenience. Theme two concerns cost. Theme three concerns wellbeing. The findings report these experiences descriptively and do not return to meanings, materials, or competences.

Discussion
These findings are important for Social Practice Theory and demonstrate a new theoretical understanding of hybrid commuting.`,
};

export const mentionedTheoryProfile = profileFor(mentionedTheoryManuscript, {
  research_topic: "How office workers describe commuting after hybrid work.",
  research_questions: [
    "How do office workers describe changes in commuting after hybrid work?",
  ],
  stated_contribution:
    "To extend Social Practice Theory through an account of hybrid commuting.",
  theoretical_framework: [
    {
      name: "Social Practice Theory",
      operationalized_in_analysis: "no",
      notes:
        "Meanings, materials, and competences are introduced in the literature review but do not structure the findings.",
    },
  ],
  key_concepts: ["meanings", "materials", "competences", "commuting practices"],
  sampling_strategy: "Purposive sampling",
  sample_description: "20 office workers",
  sample_size: { as_stated: "20 office workers", numeric: 20 },
  data_collection_methods: ["Semi-structured interviews"],
  analytical_method: "Inductive thematic analysis",
  main_findings: [
    {
      finding:
        "Participants described convenience, cost, and wellbeing in relation to changed commuting routines.",
      evidence_type: "mixed",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "The findings demonstrate a new theoretical understanding of hybrid commuting.",
      generalization_type: "unclear",
    },
  ],
  conclusions: ["The study extends Social Practice Theory."],
  missing_information: ["Explanation of how theoretical concepts informed analysis"],
});

export const mentionedTheoryAudit: TheoryAudit = {
  overall_assessment:
    "Social Practice Theory is presented as central, but its concepts do not shape the reported analysis or interpretation; the claimed theoretical extension therefore exceeds the demonstrated integration.",
  frameworks: [
    {
      framework_name: "Social Practice Theory",
      role_in_manuscript: "central",
      operationalization: "minimal",
      concepts_used: ["meanings", "materials", "competences"],
      reasoning:
        "The framework and its three elements appear in the literature review, while findings are organised descriptively around convenience, cost, and wellbeing.",
      evidence_from_manuscript: [
        "The manuscript calls Social Practice Theory its central framework.",
        "The findings do not return to meanings, materials, or competences.",
      ],
      recommended_revision:
        "Either use meanings, materials, and competences to interpret the empirical patterns or narrow the claim that the study extends Social Practice Theory.",
    },
  ],
  concept_consistency: [
    {
      concept: "meanings, materials, and competences",
      assessment: "undefined",
      reasoning:
        "The concepts are listed but their analytical meanings and relationships are not explained or applied.",
      examples: [
        "The literature review names the three elements without defining how they will guide interpretation.",
      ],
    },
  ],
  analytical_integration: {
    assessment: "weak",
    reasoning:
      "The inductively generated descriptive themes are not interpreted through the stated framework.",
    evidence_from_manuscript: [
      "Findings are organised as convenience, cost, and wellbeing rather than through the stated concepts.",
    ],
    recommended_revision:
      "Show how the framework changes interpretation of the themes, or present the analysis as descriptive and narrow the theoretical framing.",
  },
  empirical_theory_link: {
    assessment: "weak",
    reasoning:
      "The discussion asserts relevance to Social Practice Theory without tracing empirical patterns through its concepts.",
    evidence_from_manuscript: [
      "The discussion states that the findings are important for Social Practice Theory but provides no concept-level interpretation.",
    ],
    recommended_revision:
      "Connect specific empirical patterns to clearly defined theoretical concepts and explain the interpretive gain.",
  },
  theoretical_contribution: {
    assessment: "weak",
    reasoning:
      "The claimed extension is not proportionate to an analysis that does not operationalize the framework.",
    evidence_from_manuscript: ["The manuscript claims a new theoretical understanding."],
    recommended_revision:
      "Substantiate the claimed theoretical extension through analysis or narrow it to an empirical contribution.",
  },
  conceptual_drift: [],
  strengths: [
    "The manuscript clearly names the framework it intends to use.",
    "The empirical themes are plainly presented.",
  ],
  major_concerns: [
    {
      issue_type: "framework_mentioned_not_operationalized",
      severity: "high",
      description:
        "Social Practice Theory is central in the framing but absent from the analytical interpretation of findings.",
      why_it_matters:
        "Citing a framework does not establish that it generated theoretical insight or changed how the data were understood.",
      recommended_revision:
        "Integrate the stated concepts into the analysis or narrow the manuscript's theoretical claims.",
    },
  ],
  priority_revisions: [
    "Decide whether Social Practice Theory is an analytical framework or background literature.",
    "Align the contribution claim with the level of theoretical integration actually demonstrated.",
  ],
};

export const integratedTheoryManuscript: ManuscriptInput = {
  title: "Unequal confidence in elite graduate recruitment",
  discipline: "sociology",
  methodology: "interviews",
  body: `Theory
We use Bourdieu's concepts of habitus, capital, and field to explain how graduate applicants interpret and navigate elite recruitment. Habitus refers to durable, socially formed dispositions; cultural capital to valued knowledge and styles; social capital to usable relationships; and field to the structured recruitment arena in which forms of capital acquire value. We explicitly narrow the analysis to these concepts.

Methods and analysis
We interviewed 24 final-year students. Coding first identified recruitment experiences, then analytical memos examined how dispositions and resources encountered field-specific expectations. Cases were compared by class background, and negative cases were used to refine the relationship between habitus and strategic adaptation.

Findings
Working-class applicants often read informal networking events as tests of belonging and withdrew before applying. Through habitus, we interpret this not simply as low confidence but as an embodied anticipation of mismatch with the field. Applicants with family ties to professional employers mobilised social capital for insider advice. Familiarity with interview styles functioned as cultural capital because recruiters recognised and rewarded it. Two working-class applicants acquired mentoring and adapted their presentation, showing that habitus constrained but did not mechanically determine action.

Contribution
The analysis refines the relationship between habitus and capital in this recruitment field: access to mentoring can support strategic adaptation without erasing durable dispositions. This is a bounded theoretical refinement, not a universal model of graduate recruitment.`,
};

export const integratedTheoryProfile = profileFor(integratedTheoryManuscript, {
  research_topic:
    "How social background shapes applicants' navigation of elite graduate recruitment.",
  research_questions: [
    "How do applicants from different social backgrounds interpret and navigate elite graduate recruitment?",
  ],
  stated_contribution:
    "A bounded refinement of how habitus and capital interact in an elite recruitment field.",
  theoretical_framework: [
    {
      name: "Bourdieu's theory of practice",
      operationalized_in_analysis: "yes",
      notes:
        "Habitus, cultural capital, social capital, and field are defined and applied to empirical patterns and negative cases.",
    },
  ],
  key_concepts: ["habitus", "cultural capital", "social capital", "field"],
  sampling_strategy: "Comparison by class background",
  sample_description: "24 final-year students",
  sample_size: { as_stated: "24 final-year students", numeric: 24 },
  data_collection_methods: ["Interviews"],
  analytical_method:
    "Coding followed by theory-informed analytical memos and negative-case comparison",
  main_findings: [
    {
      finding:
        "Embodied expectations, valued styles, and usable relationships shaped navigation of recruitment, with mentoring enabling some adaptation.",
      evidence_type: "mixed",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "Mentoring can enable strategic adaptation without erasing durable dispositions within this recruitment field.",
      generalization_type: "qualitative_transferability",
    },
  ],
  conclusions: [
    "The case offers a bounded refinement of the relationship between habitus and capital.",
  ],
});

const integratedDimension: TheoryAudit["analytical_integration"] = {
  assessment: "strong",
  reasoning:
    "The stated concepts organise the move from descriptive patterns to a relational interpretation of dispositions, resources, and field expectations.",
  evidence_from_manuscript: [
    "Withdrawal is interpreted as an embodied anticipation of field mismatch rather than merely low confidence.",
  ],
  recommended_revision: null,
};

export const integratedTheoryAudit: TheoryAudit = {
  overall_assessment:
    "Bourdieu's concepts are defined, used consistently to interpret empirical patterns and negative cases, and support a bounded theoretical refinement proportionate to the analysis.",
  frameworks: [
    {
      framework_name: "Bourdieu's theory of practice",
      role_in_manuscript: "central",
      operationalization: "strong",
      concepts_used: ["habitus", "cultural capital", "social capital", "field"],
      reasoning:
        "The framework shapes coding, comparison, interpretation, and the contribution rather than appearing only in the framing.",
      evidence_from_manuscript: [
        "Analytical memos examined dispositions and resources against field-specific expectations.",
        "Negative cases refine rather than merely illustrate the habitus argument.",
      ],
      recommended_revision: null,
    },
  ],
  concept_consistency: [
    {
      concept: "habitus",
      assessment: "consistent",
      reasoning:
        "Habitus remains an embodied, durable but non-deterministic set of dispositions across theory, findings, and contribution.",
      examples: [
        "Anticipated mismatch shapes withdrawal.",
        "Mentored adaptation does not erase durable dispositions.",
      ],
    },
    {
      concept: "capital",
      assessment: "consistent",
      reasoning:
        "Social capital denotes usable relationships, while cultural capital denotes recognised knowledge and styles.",
      examples: [
        "Family ties provide insider advice as social capital.",
        "Interview styles are recognised as cultural capital.",
      ],
    },
    {
      concept: "field",
      assessment: "mostly_consistent",
      reasoning:
        "The recruitment arena consistently supplies the structured context in which dispositions and resources acquire value.",
      examples: ["Recruiters recognise and reward particular interview styles."],
    },
  ],
  analytical_integration: integratedDimension,
  empirical_theory_link: {
    ...integratedDimension,
    reasoning:
      "Specific empirical patterns are connected to distinct concepts, and the concepts add interpretation beyond participants' descriptions.",
  },
  theoretical_contribution: {
    assessment: "adequate",
    reasoning:
      "The bounded refinement concerning mentoring, adaptation, and durable dispositions follows from the analysis and avoids a universal claim.",
    evidence_from_manuscript: [
      "Two negative cases motivate the refinement and the manuscript limits it to this recruitment field.",
    ],
    recommended_revision: null,
  },
  conceptual_drift: [],
  strengths: [
    "Core concepts are clearly defined and differentiated.",
    "Theory changes the interpretation of descriptive patterns.",
    "Negative cases support a proportionate, bounded contribution.",
  ],
  major_concerns: [],
  priority_revisions: [],
};

export const driftingConceptsManuscript: ManuscriptInput = {
  title: "Resources and belonging in professional internships",
  discipline: "sociology",
  methodology: "interviews",
  body: `Framework
We distinguish social capital, meaning resources available through relationships, from cultural capital, meaning valued knowledge and styles.

Findings
Students who knew alumni received introductions to employers. We call this cultural capital. Students who knew how to speak in assessment centres displayed social capital. Later, we describe both alumni introductions and professional vocabulary as a sense of belonging.

Discussion
These findings show that social capital, cultural capital, and belonging are interchangeable resources in professional entry.`,
};

export const driftingConceptsProfile = profileFor(driftingConceptsManuscript, {
  research_topic: "Resources used by students entering professional internships.",
  theoretical_framework: [
    {
      name: "Bourdieusian capital framework",
      operationalized_in_analysis: "unclear",
      notes:
        "Social and cultural capital are defined distinctly but reversed and merged with belonging in findings.",
    },
  ],
  key_concepts: ["social capital", "cultural capital", "belonging"],
  analytical_method: "Thematic analysis",
  main_findings: [
    {
      finding: "Alumni ties, professional vocabulary, and belonging aid entry.",
      evidence_type: "mixed",
    },
  ],
  ambiguities: [
    "Social capital, cultural capital, and belonging are used interchangeably after being introduced as distinct.",
  ],
});

export const driftingConceptsAudit: TheoryAudit = {
  overall_assessment:
    "The manuscript defines social and cultural capital separately but reverses and merges them with belonging in the analysis without explanation, producing conceptual drift.",
  frameworks: [
    {
      framework_name: "Bourdieusian capital framework",
      role_in_manuscript: "central",
      operationalization: "partial",
      concepts_used: ["social capital", "cultural capital", "belonging"],
      reasoning:
        "The concepts label findings, but their use conflicts with the manuscript's own definitions.",
      evidence_from_manuscript: [
        "Relational introductions are called cultural capital after social capital was defined as relational resources.",
      ],
      recommended_revision:
        "Apply each concept according to a stable definition and explain whether belonging is an outcome, mechanism, or separate concept.",
    },
  ],
  concept_consistency: [
    {
      concept: "social capital and cultural capital",
      assessment: "drifting",
      reasoning:
        "Their empirical labels are reversed relative to the definitions supplied in the framework section.",
      examples: [
        "Alumni introductions are labelled cultural capital.",
        "Assessment-centre language is labelled social capital.",
      ],
    },
    {
      concept: "belonging",
      assessment: "undefined",
      reasoning:
        "Belonging is introduced as interchangeable with both forms of capital without definition or explanation.",
      examples: ["Both alumni ties and vocabulary become a sense of belonging."],
    },
  ],
  analytical_integration: {
    assessment: "partial",
    reasoning:
      "Theory labels empirical patterns, but unstable concept use prevents a coherent analytical interpretation.",
    evidence_from_manuscript: ["Distinct resources receive conflicting labels."],
    recommended_revision:
      "Reanalyse the examples using explicit, differentiated concepts.",
  },
  empirical_theory_link: {
    assessment: "weak",
    reasoning:
      "The empirical examples can be linked to the framework, but the current substitutions obscure those links.",
    evidence_from_manuscript: [
      "Relational ties and valued styles are both present but assigned to the opposite concepts.",
    ],
    recommended_revision:
      "Map each empirical example to the concept it evidences and justify any departure from the initial definitions.",
  },
  theoretical_contribution: {
    assessment: "weak",
    reasoning:
      "The claim that the concepts are interchangeable is not theoretically justified by the analysis.",
    evidence_from_manuscript: ["The discussion calls all three concepts interchangeable."],
    recommended_revision:
      "Remove the interchangeability claim or develop and evidence a clear argument for the relationship among the concepts.",
  },
  conceptual_drift: [
    {
      concepts_involved: ["social capital", "cultural capital", "belonging"],
      description:
        "Social and cultural capital are reversed relative to their stated definitions and then merged with an undefined notion of belonging.",
      severity: "high",
      recommended_revision:
        "Define the three concepts, maintain the distinctions across sections, and explain any proposed relationship among them.",
    },
  ],
  strengths: ["The framework section initially distinguishes two forms of capital."],
  major_concerns: [
    {
      issue_type: "conceptual_drift",
      severity: "high",
      description:
        "Related but distinct concepts are used interchangeably without explanation.",
      why_it_matters:
        "The reader cannot determine what analytical mechanism each empirical example is meant to demonstrate.",
      recommended_revision:
        "Stabilise definitions and trace each concept consistently from framework through findings and discussion.",
    },
  ],
  priority_revisions: [
    "Correct or justify the mapping between empirical examples and forms of capital.",
    "Define belonging and explain its relationship to social and cultural capital.",
  ],
};
