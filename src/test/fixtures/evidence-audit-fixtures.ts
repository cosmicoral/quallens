import type {
  EvidenceAudit,
  ManuscriptInput,
  ManuscriptProfile,
} from "@/lib/types";

const sharedProfileFields = {
  discipline: "sociology",
  stated_contribution: null,
  theoretical_framework: [],
  key_concepts: [],
  methodology: "Semi-structured interviews",
  qualitative_approach: "Thematic analysis",
  sampling_strategy: "Purposive sampling",
  data_collection_methods: ["Semi-structured interviews"],
  analytical_method: "Thematic analysis",
  fieldwork_context: "A single UK field site in 2025",
  ethical_information: "Participants gave informed consent and were pseudonymised.",
  reflexivity_or_positionality: null,
  limitations_explicitly_stated: [],
  missing_information: ["reflexivity or positionality statement"],
  ambiguities: [],
} satisfies Partial<ManuscriptProfile>;

export const broadClaimManuscript: ManuscriptInput = {
  title: "Sustainability and everyday food purchasing",
  discipline: "sociology",
  methodology: "interviews",
  body: `Methods
We conducted semi-structured interviews with 18 adult residents recruited purposively in Bristol. Participants gave informed consent and were assigned pseudonyms. We analysed the interviews thematically.

Findings
Priya said, "I check whether the packaging can be recycled before I put anything in my basket." Ben similarly explained that avoiding food waste mattered when he planned meals. Other interviewees discussed price, convenience, and family preferences. We did not record how frequently each consideration appeared across the interviews.

Discussion
Participants prioritised sustainability when purchasing food. This demonstrates that sustainability guides food purchasing among consumers.`,
};

export const broadClaimProfile: ManuscriptProfile = {
  ...sharedProfileFields,
  title: broadClaimManuscript.title,
  research_topic: "How adult residents describe considerations shaping food purchases.",
  research_questions: ["What considerations shape participants' food purchases?"],
  key_concepts: ["sustainability", "food purchasing"],
  sample_description: "18 adult residents in Bristol",
  sample_size: { as_stated: "18 adult residents", numeric: 18 },
  main_findings: [
    {
      finding: "Participants prioritised sustainability when purchasing food.",
      evidence_type: "mixed",
    },
  ],
  major_analytical_claims: [
    {
      claim: "Participants prioritised sustainability when purchasing food.",
      generalization_type: "unclear",
    },
  ],
  conclusions: ["Sustainability guides food purchasing among consumers."],
};

export const broadClaimAudit: EvidenceAudit = {
  overall_assessment:
    "The sustainability claim is broader than the evidence shown: only two of 18 participants are connected to supporting material.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text: "Participants prioritised sustainability when purchasing food.",
      claim_scope: "All study participants",
      evidence_found: [
        {
          evidence_type: "participant_quote",
          excerpt_or_description:
            "I check whether the packaging can be recycled before I put anything in my basket.",
          source_label: "Priya",
        },
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Ben explained that avoiding food waste mattered when planning meals.",
          source_label: "Ben",
        },
      ],
      evidence_distribution: "small_subset",
      support_assessment: "partially_supported",
      reasoning:
        "The manuscript presents sustainability-related material from two participants but applies the claim to participants collectively and reports no prevalence information.",
      overclaim_risk: "high",
      contradictory_or_complicating_evidence: [],
      recommended_revision:
        "Narrow the wording to the two participants whose accounts are shown, or provide broader evidence across the sample and report its distribution.",
    },
  ],
  cross_cutting_issues: [
    {
      issue_type: "unreported_prevalence",
      description:
        "The manuscript does not report how sustainability considerations were distributed across the 18 interviews.",
      severity: "high",
      affected_claim_ids: ["claim-1"],
    },
  ],
  strengths: ["The manuscript provides identifiable support from two participants."],
  priority_revisions: [
    "Align the collective wording of the sustainability claim with the evidence distribution.",
  ],
};

export const boundedClaimManuscript: ManuscriptInput = {
  title: "Learning volunteer work in the Riverside cooperative",
  discipline: "sociology",
  methodology: "case-study",
  body: `Methods
This case study draws on interviews with eight long-standing volunteers at the Riverside cooperative, supplemented by six months of observation. Participants consented to the study and were assigned pseudonyms. We used thematic analysis.

Findings
Across interviews with Amina, Jo, Luis, Mei, and Rob, volunteers described learning the role by shadowing an experienced member and asking questions during shifts. Fieldnotes from four shifts also recorded experienced volunteers demonstrating routines to newer members. Amina called this "learning side by side." One deviant case was Sara, who said she learned from the written handbook and deliberately avoided informal mentoring after an early disagreement.

Discussion
Within the Riverside cooperative, informal mentoring was central to how several long-standing volunteers described learning the role. Sara's account shows that this was a recurring pattern rather than a universal pathway.`,
};

export const boundedClaimProfile: ManuscriptProfile = {
  ...sharedProfileFields,
  title: boundedClaimManuscript.title,
  research_topic: "How volunteers learn their roles in one cooperative.",
  research_questions: ["How do Riverside volunteers learn their roles?"],
  key_concepts: ["informal mentoring", "role learning"],
  sample_description: "Eight long-standing volunteers at the Riverside cooperative",
  sample_size: { as_stated: "eight long-standing volunteers", numeric: 8 },
  data_collection_methods: ["Semi-structured interviews", "Observation"],
  fieldwork_context: "The Riverside cooperative during six months of fieldwork",
  main_findings: [
    {
      finding:
        "Several volunteers described informal mentoring as central to learning the role, with one deviant case.",
      evidence_type: "mixed",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "Within the Riverside cooperative, informal mentoring was central to how several long-standing volunteers described learning the role.",
      generalization_type: "case_specific",
    },
  ],
  conclusions: [
    "Informal mentoring was a recurring but non-universal pathway in this cooperative.",
  ],
};

export const boundedClaimAudit: EvidenceAudit = {
  overall_assessment:
    "The bounded claim is supported across several cases and observations, while the explicitly reported deviant case appropriately limits its scope.",
  claims: [
    {
      claim_id: "claim-1",
      claim_text:
        "Within the Riverside cooperative, informal mentoring was central to how several long-standing volunteers described learning the role.",
      claim_scope: "Several long-standing volunteers within one named cooperative",
      evidence_found: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Five named participants described shadowing experienced members and asking questions during shifts.",
          source_label: "Amina, Jo, Luis, Mei, and Rob",
        },
        {
          evidence_type: "participant_quote",
          excerpt_or_description: "learning side by side",
          source_label: "Amina",
        },
        {
          evidence_type: "fieldnote",
          excerpt_or_description:
            "Four shifts recorded experienced volunteers demonstrating routines to newer members.",
          source_label: "Fieldnotes",
        },
      ],
      evidence_distribution: "multiple_cases",
      support_assessment: "supported",
      reasoning:
        "The claim is limited to several participants in the named site and is supported by five accounts plus observations. The deviant case qualifies, rather than defeats, the recurring pattern.",
      overclaim_risk: "low",
      contradictory_or_complicating_evidence: [
        {
          evidence_type: "participant_account",
          excerpt_or_description:
            "Sara learned from the written handbook and avoided informal mentoring after an early disagreement.",
          source_label: "Sara",
        },
      ],
      recommended_revision: null,
    },
  ],
  cross_cutting_issues: [],
  strengths: [
    "The claim is context-specific, supported across several cases, and preserves a deviant case.",
  ],
  priority_revisions: [],
};
