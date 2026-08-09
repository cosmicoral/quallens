import type {
  ManuscriptInput,
  ManuscriptProfile,
  ResearchDesignAudit,
} from "@/lib/types";

export const underreportedDesignManuscript: ManuscriptInput = {
  title: "How first-generation students seek academic support",
  discipline: "education",
  methodology: "interviews",
  body: `Research question
How do first-generation university students describe seeking academic support during their first year?

Methods
We interviewed 16 first-generation students. Interviews lasted 45 to 60 minutes, followed a semi-structured topic guide, and were audio-recorded and transcribed verbatim. Participants gave informed consent and were assigned pseudonyms. The transcripts were examined using thematic analysis.

Findings
Participants described informal peer networks as easier to approach than formal support services. Several also described uncertainty about which services they were entitled to use.

Conclusion
The study shows how students in this study navigated formal and informal sources of academic support.`,
};

export const underreportedDesignProfile: ManuscriptProfile = {
  title: underreportedDesignManuscript.title,
  discipline: "education",
  research_topic:
    "How first-generation students describe seeking academic support in their first university year.",
  research_questions: [
    "How do first-generation university students describe seeking academic support during their first year?",
  ],
  stated_contribution: null,
  theoretical_framework: [],
  key_concepts: ["first-generation students", "academic support"],
  methodology: "Qualitative interviews",
  qualitative_approach: null,
  sampling_strategy: null,
  sample_description: "16 first-generation university students",
  sample_size: { as_stated: "16 first-generation students", numeric: 16 },
  data_collection_methods: ["Semi-structured interviews"],
  analytical_method: "Thematic analysis",
  fieldwork_context: null,
  ethical_information:
    "Participants gave informed consent and were assigned pseudonyms.",
  reflexivity_or_positionality: null,
  main_findings: [
    {
      finding:
        "Participants found informal peer networks easier to approach than formal services.",
      evidence_type: "mixed",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "Students in this study navigated both formal and informal sources of academic support.",
      generalization_type: "case_specific",
    },
  ],
  conclusions: [
    "The study shows how students in this study navigated academic support.",
  ],
  limitations_explicitly_stated: [],
  missing_information: [
    "sampling strategy and rationale",
    "recruitment procedures and eligibility criteria",
    "fieldwork context",
    "analytical procedure beyond naming thematic analysis",
    "reflexivity or positionality statement",
  ],
  ambiguities: [],
};

export const underreportedDesignAudit: ResearchDesignAudit = {
  overall_assessment:
    "The interview design fits the exploratory question and data collection is described, but missing sampling rationale, recruitment detail, analytical steps, and reflexive information limit assessment of how the study was constituted and interpreted.",
  research_question_alignment: {
    assessment: "strong",
    reasoning:
      "An interview design is appropriate for examining how students describe help-seeking experiences.",
    evidence_from_manuscript: [
      "The question asks how first-generation students describe seeking academic support.",
      "The study uses semi-structured interviews.",
    ],
    missing_information: [],
    recommended_revision: null,
  },
  sampling: {
    assessment: "weak",
    reasoning:
      "The participants are identified, but the manuscript does not explain how or why they were selected for this question.",
    evidence_from_manuscript: ["The study reports interviewing 16 first-generation students."],
    missing_information: ["Sampling strategy", "Sampling rationale"],
    recommended_revision:
      "Explain the sampling strategy and why the selected participants could illuminate the research question.",
  },
  recruitment: {
    assessment: "not_reported",
    reasoning:
      "No recruitment route, eligibility process, or inclusion and exclusion criteria are reported.",
    evidence_from_manuscript: [],
    missing_information: [
      "Recruitment route",
      "Inclusion and exclusion criteria",
    ],
    recommended_revision:
      "Describe how participants were approached and the criteria used to determine eligibility.",
  },
  data_collection: {
    assessment: "adequate",
    reasoning:
      "The interview format, duration, recording, topic guide, and transcription are sufficiently described to understand how accounts were produced.",
    evidence_from_manuscript: [
      "Interviews lasted 45 to 60 minutes and followed a semi-structured topic guide.",
      "Interviews were audio-recorded and transcribed verbatim.",
    ],
    missing_information: [],
    recommended_revision: null,
  },
  analytical_process: {
    assessment: "partially_adequate",
    reasoning:
      "The manuscript names thematic analysis but does not describe coding, theme development, or how interpretations were checked against the data.",
    evidence_from_manuscript: ["The transcripts were examined using thematic analysis."],
    missing_information: ["Coding and theme-development procedures"],
    recommended_revision:
      "Describe the analytical steps from transcript engagement through coding and theme development.",
  },
  reflexivity_and_positionality: {
    assessment: "not_reported",
    reasoning:
      "The manuscript does not describe the researchers' positions or their relationship to participants, so their possible influence on access and interpretation cannot be assessed.",
    evidence_from_manuscript: [],
    missing_information: ["Researcher positionality and reflexive practice"],
    recommended_revision:
      "Add reflexive information relevant to recruitment, interviewing, and interpretation.",
  },
  ethics: {
    assessment: "adequate",
    reasoning:
      "The manuscript reports informed consent and pseudonymisation; it does not provide evidence of non-compliance.",
    evidence_from_manuscript: [
      "Participants gave informed consent and were assigned pseudonyms.",
    ],
    missing_information: [],
    recommended_revision: null,
  },
  transferability_and_context: {
    assessment: "partially_adequate",
    reasoning:
      "The conclusion remains bounded to students in the study, but the institutional and recruitment context is not described well enough for readers to judge transferability.",
    evidence_from_manuscript: ["The conclusion explicitly refers to students in this study."],
    missing_information: ["Institutional and fieldwork context"],
    recommended_revision:
      "Describe the study setting and relevant participant context so readers can assess possible transferability.",
  },
  design_coherence: {
    assessment: "partially_adequate",
    reasoning:
      "The question and interview method align and the claims are bounded, but unreported sampling and analytical logic leave important links in the design chain unclear.",
    evidence_from_manuscript: [
      "The exploratory question is addressed through interviews.",
      "The conclusion is limited to students in the study.",
    ],
    missing_information: ["Sampling logic", "Analytical process"],
    recommended_revision:
      "Make explicit how sampling and analytical choices connect the question to the reported themes.",
  },
  strengths: [
    "The research question and interview method are well aligned.",
    "Data collection procedures are clearly reported.",
    "The conclusion is bounded to the study rather than presented as statistically generalisable.",
  ],
  major_concerns: [
    {
      issue_type: "sampling_transparency",
      severity: "moderate",
      description:
        "The manuscript does not report its sampling strategy or rationale.",
      why_it_matters:
        "Readers cannot assess how participant selection served the research question or shaped the range of accounts included.",
      recommended_revision:
        "Explain the sampling logic and its relationship to the research question.",
    },
    {
      issue_type: "recruitment_transparency",
      severity: "moderate",
      description:
        "Recruitment procedures and eligibility criteria are not reported.",
      why_it_matters:
        "The route into the study may shape whose experiences are represented and which remain absent.",
      recommended_revision:
        "Report how participants were approached and how eligibility was determined.",
    },
    {
      issue_type: "analysis_named_not_described",
      severity: "moderate",
      description:
        "Thematic analysis is named, but the manuscript does not explain how it was conducted.",
      why_it_matters:
        "The path from transcripts to themes is not transparent enough to assess the grounding of interpretations.",
      recommended_revision:
        "Describe coding, theme development, and how interpretations were related back to the data.",
    },
  ],
  priority_revisions: [
    "Explain sampling and recruitment procedures and their rationale.",
    "Describe the analytical process rather than only naming thematic analysis.",
    "Add reflexive and contextual information relevant to this design.",
  ],
};

export const boundedCaseStudyManuscript: ManuscriptInput = {
  title: "Learning care coordination in one community health partnership",
  discipline: "health sociology",
  methodology: "case-study",
  body: `Research question
How do staff in the Northbank community health partnership learn to coordinate care across organisational boundaries?

Design and sampling
We used a bounded qualitative case study of the Northbank partnership between January and June 2025. We purposively sampled staff who had coordinated at least one cross-organisational case, seeking variation across nursing, social work, administration, and management roles. Twelve staff took part. The sample was chosen for role and experience diversity relevant to the question, not statistical representation.

Recruitment and data generation
An independent partnership coordinator emailed all 21 eligible staff using the inclusion criteria above; interested staff contacted the research team directly. We conducted 12 semi-structured interviews lasting 50 to 75 minutes. With consent, interviews were audio-recorded, transcribed, and pseudonymised. The topic guide covered boundary-crossing cases, breakdowns, and learning episodes.

Analysis and reflexivity
The first author, a former community nurse with no employment relationship to Northbank, kept a reflexive memo about how clinical experience shaped follow-up questions and interpretation. Two researchers independently coded three varied transcripts, compared their readings, refined a shared coding framework, coded the remaining material, and developed themes through constant comparison with extracts and negative cases.

Ethics and scope
The University Social Research Ethics Committee approved the study (SR-2025-14). All participants gave written informed consent. Findings are intended to illuminate coordination in this partnership; contextual detail is provided so readers can consider relevance to similarly organised settings, not statistical generalisability.

Conclusion
Within Northbank, informal case debriefs helped staff develop shared coordination routines, although two negative cases showed that workload sometimes prevented this learning.`,
};

export const boundedCaseStudyProfile: ManuscriptProfile = {
  title: boundedCaseStudyManuscript.title,
  discipline: "health sociology",
  research_topic:
    "How staff learn cross-organisational care coordination in one community health partnership.",
  research_questions: [
    "How do staff in the Northbank community health partnership learn to coordinate care across organisational boundaries?",
  ],
  stated_contribution:
    "A contextually bounded account of informal learning in one partnership.",
  theoretical_framework: [],
  key_concepts: ["care coordination", "informal learning"],
  methodology: "Bounded qualitative case study",
  qualitative_approach: "Case study",
  sampling_strategy:
    "Purposive sampling for role and experience diversity relevant to the question",
  sample_description:
    "Twelve Northbank staff across nursing, social work, administration, and management who had coordinated a cross-organisational case",
  sample_size: { as_stated: "Twelve staff", numeric: 12 },
  data_collection_methods: ["Semi-structured interviews"],
  analytical_method:
    "Thematic development through coding, comparison, and negative-case analysis",
  fieldwork_context:
    "Northbank community health partnership, January to June 2025",
  ethical_information:
    "University ethics approval SR-2025-14, written informed consent, recording, transcription, and pseudonymisation",
  reflexivity_or_positionality:
    "The first author disclosed prior community nursing experience, no employment relationship to the site, and use of a reflexive memo.",
  main_findings: [
    {
      finding:
        "Informal case debriefs helped staff develop shared coordination routines, with two negative cases linked to workload.",
      evidence_type: "mixed",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "Within Northbank, informal case debriefs helped staff develop shared coordination routines.",
      generalization_type: "case_specific",
    },
  ],
  conclusions: [
    "Within Northbank, informal case debriefs supported shared coordination routines, subject to workload constraints.",
  ],
  limitations_explicitly_stated: [
    "The findings are bounded to one partnership and are not statistically generalisable.",
  ],
  missing_information: [],
  ambiguities: [],
};

const strongDimension = (
  reasoning: string,
  evidence: string[],
): ResearchDesignAudit["research_question_alignment"] => ({
  assessment: "strong",
  reasoning,
  evidence_from_manuscript: evidence,
  missing_information: [],
  recommended_revision: null,
});

export const boundedCaseStudyAudit: ResearchDesignAudit = {
  overall_assessment:
    "The bounded case-study design is transparent and internally coherent: purposive sampling, recruitment, interviews, reflexive practice, analysis, ethics, and contextual scope are all explained in relation to the research question.",
  research_question_alignment: strongDimension(
    "A bounded case study and interviews are appropriate for examining how staff in one partnership learn coordination.",
    ["The question and case boundary both concern coordination learning at Northbank."],
  ),
  sampling: strongDimension(
    "Purposive selection is justified through role and experience variation relevant to the question, without claiming statistical representation.",
    ["The sample sought variation across four roles among staff with coordination experience."],
  ),
  recruitment: strongDimension(
    "The recruitment route, eligible pool, inclusion criterion, and direct response process are reported.",
    ["An independent coordinator emailed all 21 eligible staff; interested staff contacted researchers directly."],
  ),
  data_collection: strongDimension(
    "Interview duration, topic guide, consent, recording, transcription, and pseudonymisation are described.",
    ["Twelve 50-to-75-minute semi-structured interviews covered cases, breakdowns, and learning episodes."],
  ),
  analytical_process: strongDimension(
    "The manuscript explains coding, comparison, framework refinement, theme development, and attention to negative cases.",
    ["Two researchers compared initial coding and themes were developed through constant comparison with extracts and negative cases."],
  ),
  reflexivity_and_positionality: strongDimension(
    "The first author's relevant prior role, relationship to the site, and reflexive practice are explained in relation to data generation and interpretation.",
    ["The former community nurse kept a reflexive memo and had no employment relationship to Northbank."],
  ),
  ethics: strongDimension(
    "The manuscript reports context-appropriate ethics approval, consent, and confidentiality procedures.",
    ["Ethics approval SR-2025-14 and written informed consent are reported."],
  ),
  transferability_and_context: strongDimension(
    "The study gives temporal and organisational context and frames relevance through contextual comparison rather than statistical generalisability.",
    ["The manuscript bounds findings to Northbank and invites readers to consider similarly organised settings."],
  ),
  design_coherence: strongDimension(
    "The question, case boundary, purposive sample, interviews, analysis, negative cases, and claim scope form a coherent chain.",
    ["The conclusion is explicitly bounded to Northbank and retains workload-related negative cases."],
  ),
  strengths: [
    "Sampling rationale is tied directly to the research question.",
    "Recruitment, data generation, analysis, and reflexive practice are transparent.",
    "Claims and transferability are appropriately bounded to the case context.",
  ],
  major_concerns: [],
  priority_revisions: [],
};
