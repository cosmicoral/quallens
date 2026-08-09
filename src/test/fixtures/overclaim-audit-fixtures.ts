import type {
  EvidenceAudit,
  ManuscriptInput,
  ManuscriptProfile,
  OverclaimAudit,
} from "@/lib/types";

function profileFor(
  manuscript: ManuscriptInput,
  fields: Partial<ManuscriptProfile>,
): ManuscriptProfile {
  return {
    title: manuscript.title,
    discipline: manuscript.discipline ?? null,
    research_topic: "Qualitative study of food practices.",
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

export const culturalOverreachManuscript: ManuscriptInput = {
  title: "Food-waste routines among households in Shanghai",
  discipline: "sociology",
  methodology: "interviews",
  body: `Methods
We interviewed 18 self-identified middle-class residents of Shanghai recruited through two neighbourhood organisations. The interviews explored shopping, cooking, and disposal routines. This is a one-city qualitative study.

Findings
Several participants described buying more food than planned during online promotions. Others discussed freezing leftovers or sharing food with relatives. The accounts varied by household composition and access to storage.

Conclusion
This study demonstrates how Chinese middle-class consumers respond to food waste.`,
};

export const culturalOverreachProfile = profileFor(culturalOverreachManuscript, {
  research_topic:
    "How 18 middle-class Shanghai residents describe household food-waste routines.",
  research_questions: [
    "How do participating Shanghai households describe their food-waste routines?",
  ],
  sampling_strategy: "Recruitment through two neighbourhood organisations",
  sample_description: "18 self-identified middle-class residents of Shanghai",
  sample_size: { as_stated: "18 residents", numeric: 18 },
  data_collection_methods: ["Interviews"],
  fieldwork_context: "Two neighbourhood organisations in Shanghai",
  main_findings: [
    {
      finding:
        "Several participants bought excess food during promotions, while household responses varied.",
      evidence_type: "participant_account",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "This study demonstrates how Chinese middle-class consumers respond to food waste.",
      generalization_type: "statistical_generalization",
    },
  ],
  conclusions: [
    "This study demonstrates how Chinese middle-class consumers respond to food waste.",
  ],
  limitations_explicitly_stated: ["This is a one-city qualitative study."],
});

export const culturalOverreachEvidenceAudit: EvidenceAudit = {
  overall_assessment:
    "The manuscript supports varied accounts among the interviewed Shanghai residents but not a general claim about Chinese middle-class consumers.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text:
        "This study demonstrates how Chinese middle-class consumers respond to food waste.",
      claim_scope: "Chinese middle-class consumers as a cultural and population category",
      evidence_found: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Several interviewed Shanghai residents described excess purchasing, freezing, or sharing food.",
          source_label: "Interview findings",
        },
      ],
      evidence_distribution: "multiple_cases",
      support_assessment: "partially_supported",
      reasoning:
        "The accounts support a claim about patterns among participants, while the conclusion expands to a national cultural category.",
      overclaim_risk: "high",
      contradictory_or_complicating_evidence: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Responses varied by household composition and access to storage.",
          source_label: "Findings",
        },
      ],
      recommended_revision:
        "Limit the conclusion to the interviewed residents and the Shanghai study context.",
    },
  ],
  cross_cutting_issues: [],
  strengths: ["The findings preserve variation among households."],
  priority_revisions: ["Narrow the conclusion to the study participants and context."],
};

export const culturalOverreachAudit: OverclaimAudit = {
  overall_assessment:
    "The conclusion turns a bounded one-city interview study into a claim about Chinese middle-class consumers generally, creating serious cultural and population overreach.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text:
        "This study demonstrates how Chinese middle-class consumers respond to food waste.",
      claim_type: "cultural",
      risk: "high",
      basis: "population_overreach",
      reasoning:
        "Eighteen participants recruited through two Shanghai organisations cannot establish how a national class and cultural category responds, even though the interviews can illuminate situated experiences.",
      supporting_context: [
        "The sample comprises 18 self-identified middle-class Shanghai residents.",
        "The manuscript itself identifies the design as a one-city qualitative study.",
        "The Evidence Audit finds varied participant accounts rather than a uniform response.",
      ],
      recommended_revision:
        "Narrow the claim to how participants in this Shanghai study described food-waste practices and retain the reported variation.",
    },
  ],
  cross_cutting_patterns: [
    {
      pattern_type: "context_to_population_shift",
      severity: "high",
      description:
        "The conclusion shifts from situated participant accounts to an undifferentiated national cultural category.",
      affected_claim_ids: ["claim-1"],
      recommended_revision:
        "Keep conclusions bounded to participants and explain possible transferability through context rather than population generalisation.",
    },
  ],
  strengths: ["The methods section accurately states that the study is one-city and qualitative."],
  priority_revisions: [
    "Replace the national cultural claim with a participant- and context-bounded conclusion.",
  ],
};

export const boundedClaimManuscript: ManuscriptInput = {
  title: "Household sharing practices in Bristol",
  discipline: "sociology",
  methodology: "interviews",
  body: `Methods
We conducted interviews with 14 residents recruited from two Bristol mutual-aid groups. The study aims to offer a contextually bounded account rather than a statistically representative estimate.

Findings
Among participants in this study, several described sharing surplus groceries through neighbourhood messaging groups. Other participants preferred to share only with relatives.

Conclusion
These accounts illuminate contrasting sharing practices in the two groups studied. Transferability should be considered in relation to the mutual-aid setting and local context; the findings are not population estimates.`,
};

export const boundedClaimProfile = profileFor(boundedClaimManuscript, {
  research_topic: "Food-sharing practices in two Bristol mutual-aid groups.",
  sampling_strategy: "Recruitment from two mutual-aid groups",
  sample_description: "14 Bristol residents in two mutual-aid groups",
  sample_size: { as_stated: "14 residents", numeric: 14 },
  data_collection_methods: ["Interviews"],
  fieldwork_context: "Two Bristol mutual-aid groups",
  main_findings: [
    {
      finding:
        "Several participants shared groceries through messaging groups, while others shared only with relatives.",
      evidence_type: "participant_account",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "Among participants in this study, several described sharing surplus groceries through neighbourhood messaging groups.",
      generalization_type: "case_specific",
    },
  ],
  conclusions: [
    "The accounts illuminate contrasting practices in the two groups studied.",
  ],
  limitations_explicitly_stated: [
    "Transferability depends on the mutual-aid setting and local context.",
    "The findings are not population estimates.",
  ],
});

export const boundedClaimEvidenceAudit: EvidenceAudit = {
  overall_assessment:
    "The participant-bounded claim matches the reported evidence and preserves contrasting accounts.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text:
        "Among participants in this study, several described sharing surplus groceries through neighbourhood messaging groups.",
      claim_scope: "Several participants in the two studied groups",
      evidence_found: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Several participants described sharing through neighbourhood messaging groups.",
          source_label: "Interview findings",
        },
      ],
      evidence_distribution: "multiple_cases",
      support_assessment: "supported",
      reasoning:
        "The wording is explicitly limited to several study participants and is paired with contrasting accounts.",
      overclaim_risk: "none",
      contradictory_or_complicating_evidence: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Other participants preferred sharing only with relatives.",
          source_label: "Interview findings",
        },
      ],
      recommended_revision: null,
    },
  ],
  cross_cutting_issues: [],
  strengths: ["The claim and transferability language remain explicitly bounded."],
  priority_revisions: [],
};

export const boundedOverclaimAudit: OverclaimAudit = {
  overall_assessment:
    "The manuscript appropriately limits its claims to participants and the two studied groups while describing transferability contextually rather than statistically.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text:
        "Among participants in this study, several described sharing surplus groceries through neighbourhood messaging groups.",
      claim_type: "empirical",
      risk: "none",
      basis: "well_bounded",
      reasoning:
        "The claim specifies both the participant basis and the qualitative distribution word 'several', and the conclusion retains the local context.",
      supporting_context: [
        "The wording says 'among participants in this study' and 'several'.",
        "The conclusion explicitly rejects population estimation and describes contextual transferability.",
        "The Evidence Audit assesses the claim as supported with no overclaim risk.",
      ],
      recommended_revision: null,
    },
  ],
  cross_cutting_patterns: [],
  strengths: [
    "Claim wording is calibrated to the evidence distribution.",
    "Transferability is handled through contextual information rather than population generalisation.",
  ],
  priority_revisions: [],
};

export const causalOverreachManuscript: ManuscriptInput = {
  title: "Platform shopping and household food waste",
  discipline: "sociology",
  methodology: "interviews",
  body: `Methods
We interviewed 22 grocery-platform users about shopping routines and household food disposal. Participants reflected retrospectively on occasions when promotions influenced their purchases.

Findings
Some participants believed that app notifications encouraged impulse purchases. Several recalled discarding promoted products they did not use. The interviews did not compare platform users with non-users or independently measure purchasing and waste.

Conclusion
Our findings prove that platform use causes food waste.`,
};

export const causalOverreachProfile = profileFor(causalOverreachManuscript, {
  research_topic:
    "How grocery-platform users perceive links between promotions, purchasing, and food disposal.",
  sample_description: "22 grocery-platform users",
  sample_size: { as_stated: "22 users", numeric: 22 },
  data_collection_methods: ["Retrospective interviews"],
  main_findings: [
    {
      finding:
        "Some participants perceived notifications as encouraging purchases, and several recalled waste.",
      evidence_type: "participant_account",
    },
  ],
  major_analytical_claims: [
    {
      claim: "Our findings prove that platform use causes food waste.",
      generalization_type: "statistical_generalization",
    },
  ],
  conclusions: ["Our findings prove that platform use causes food waste."],
  limitations_explicitly_stated: [
    "The study did not compare users and non-users or independently measure behaviour.",
  ],
});

export const causalOverreachEvidenceAudit: EvidenceAudit = {
  overall_assessment:
    "Interview accounts support participants' perceived sequence between promotions, purchasing, and disposal, but cannot establish that platform use causes food waste.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text: "Our findings prove that platform use causes food waste.",
      claim_scope: "A general causal effect of platform use",
      evidence_found: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Some participants believed notifications encouraged impulse purchases and recalled later disposal.",
          source_label: "Interview findings",
        },
      ],
      evidence_distribution: "multiple_cases",
      support_assessment: "weakly_supported",
      reasoning:
        "Retrospective perceived sequences do not isolate a causal effect, and the study has no behavioural comparison or independent measurement.",
      overclaim_risk: "high",
      contradictory_or_complicating_evidence: [],
      recommended_revision:
        "Report that some participants perceived platform promotions as contributing to purchases they later discarded.",
    },
  ],
  cross_cutting_issues: [],
  strengths: ["The findings report participant perceptions and temporal sequences."],
  priority_revisions: ["Replace causal proof language with a perception-bounded claim."],
};

export const causalOverclaimAudit: OverclaimAudit = {
  overall_assessment:
    "The conclusion converts retrospective participant perceptions into proof of a general causal effect, which the interview design and evidence cannot establish.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text: "Our findings prove that platform use causes food waste.",
      claim_type: "causal",
      risk: "high",
      basis: "causal_overreach",
      reasoning:
        "Interviews can establish that participants perceived a connection and described a sequence, but they do not isolate platform use as the cause of food waste.",
      supporting_context: [
        "The evidence consists of retrospective participant accounts.",
        "There is no comparison with non-users or independent measurement of purchasing and disposal.",
        "The Evidence Audit rates the causal wording as weakly supported with high overclaim risk.",
      ],
      recommended_revision:
        "State that some participants perceived promotions as contributing to purchases they later discarded, without claiming proof or causality.",
    },
  ],
  cross_cutting_patterns: [
    {
      pattern_type: "perception_to_causality",
      severity: "high",
      description:
        "Participant perceptions and recalled sequences are presented as objective proof of causation.",
      affected_claim_ids: ["claim-1"],
      recommended_revision:
        "Attribute the interpretation to participants and use non-causal language proportionate to interview evidence.",
    },
  ],
  strengths: [
    "The findings section itself generally attributes perceived influence to participants.",
  ],
  priority_revisions: [
    "Replace 'prove' and 'causes' with participant-attributed, non-causal wording.",
  ],
};
