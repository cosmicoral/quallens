import type { ManuscriptInput, ManuscriptProfile } from "@/lib/types";

/**
 * A realistic (abbreviated) qualitative social science manuscript used as a
 * test fixture. Deliberately: names a theory in the literature review that is
 * NOT clearly operationalised in the analysis; omits any reflexivity or
 * positionality statement; and describes sampling only vaguely — so tests can
 * assert how the profile represents mentioned-but-not-used theory and
 * missing methodological information.
 */
export const qualitativeManuscript: ManuscriptInput = {
  title:
    "“You Learn to Read the Room”: Emotional Labour Among Hospice Volunteers",
  abstract:
    "Hospice volunteers perform sustained emotional work with dying patients and their families, yet remain peripheral in the sociology of care work. Drawing on semi-structured interviews with hospice volunteers in a mid-sized city, this article examines how volunteers describe managing their own and others' emotions. We identify two practices — calibrated presence and boundary talk — and argue that volunteers develop an occupational emotional repertoire despite their formally amateur status. The findings extend debates on emotional labour beyond paid employment.",
  methodology: "interviews",
  discipline: "sociology",
  body: `Introduction

The sociology of care work has documented the emotional labour performed by nurses, care aides, and social workers, following Hochschild's (1983) canonical account of emotion management in paid employment. Volunteers, however, occupy an ambiguous position: they perform care without wages, occupational training, or formal accountability. This article asks: how do hospice volunteers describe the emotional work of accompanying dying patients and their families?

Literature

Hochschild's (1983) theory of emotional labour distinguishes surface acting from deep acting, and ties emotion management to the wage relation. Subsequent work has extended the concept to unpaid settings, though critics argue the extension dilutes its analytical core. Studies of hospice work specifically emphasise the institutional scripting of "good death" narratives.

Methods

We conducted semi-structured interviews with 14 hospice volunteers at two hospices in a mid-sized Canadian city. Volunteers were recruited through coordinator referrals. Interviews lasted between 45 and 90 minutes, were audio-recorded, and were transcribed verbatim. Transcripts were analysed thematically: two authors coded independently and reconciled codes across three meetings. Ethics approval was granted by the first author's university research ethics board, and all names used below are pseudonyms.

Findings

Calibrated presence. Volunteers repeatedly described adjusting their demeanour to the room. Margaret (seven years' experience) explained: "You learn to read the room. Some days they want stories and jokes. Some days you just sit." Several volunteers reported suppressing their own grief in the moment and "letting it out in the car afterwards" (Tom).

Boundary talk. Volunteers used a shared vocabulary for marking the limits of their role. Interviewees repeatedly distinguished themselves from nurses ("I'm not there to fix anything" — Priya) and from family ("You're close, but you're not family, and you can't forget that" — Douglas). We interpret this boundary talk as a practice through which volunteers protect both patients and themselves from misplaced expectations.

Discussion and conclusion

We argue that hospice volunteers develop an occupational emotional repertoire — a set of learned, transmissible emotion-management practices — despite lacking wages or formal occupational status. This suggests that emotional labour research should treat the wage relation as one condition among several rather than a definitional boundary. These practices are likely to be recognisable in other volunteer care settings, though our claims are grounded in the two hospices studied. The study is limited by its reliance on volunteers' own accounts; observational work could show whether described practices match enacted ones.`,
};

/**
 * A complete, valid profile of the fixture manuscript — the kind of output a
 * well-behaved Manuscript Reader should produce. Used to test schema
 * validation and the reader's success path via a fake provider.
 *
 * Note what it encodes about the fixture: reflexivity is null AND listed as
 * missing; sampling strategy is only partially reported; Hochschild's theory
 * is marked "unclear" for operationalisation (mentioned in the literature
 * review, loosely invoked later).
 */
export const expectedProfile: ManuscriptProfile = {
  title:
    "“You Learn to Read the Room”: Emotional Labour Among Hospice Volunteers",
  discipline: "sociology",
  research_topic:
    "How hospice volunteers describe the emotional work of accompanying dying patients and their families.",
  research_questions: [
    "How do hospice volunteers describe the emotional work of accompanying dying patients and their families?",
  ],
  stated_contribution:
    "Extends debates on emotional labour beyond paid employment by showing volunteers develop an occupational emotional repertoire despite amateur status.",
  theoretical_framework: [
    {
      name: "Hochschild's theory of emotional labour",
      operationalized_in_analysis: "unclear",
      notes:
        "Central in the literature review; the analysis invokes 'emotional repertoire' but does not visibly apply surface/deep acting to the coding.",
    },
  ],
  key_concepts: [
    "emotional labour",
    "calibrated presence",
    "boundary talk",
    "occupational emotional repertoire",
  ],
  methodology: "qualitative interview study",
  qualitative_approach: null,
  sampling_strategy: "recruited through coordinator referrals",
  sample_description: "hospice volunteers at two hospices in a mid-sized Canadian city",
  sample_size: { as_stated: "14 hospice volunteers", numeric: 14 },
  data_collection_methods: [
    "semi-structured interviews (45–90 minutes, audio-recorded, transcribed verbatim)",
  ],
  analytical_method:
    "thematic analysis; two authors coded independently and reconciled codes",
  fieldwork_context: "two hospices in a mid-sized Canadian city",
  ethical_information:
    "Ethics approval from the first author's university research ethics board; pseudonyms used.",
  reflexivity_or_positionality: null,
  main_findings: [
    {
      finding:
        "Volunteers describe 'calibrated presence' — adjusting demeanour to the room and suppressing their own grief in the moment.",
      evidence_type: "participant_account",
    },
    {
      finding:
        "Boundary talk functions as a practice protecting patients and volunteers from misplaced expectations.",
      evidence_type: "author_interpretation",
    },
  ],
  major_analytical_claims: [
    {
      claim:
        "Hospice volunteers develop an occupational emotional repertoire despite lacking wages or formal occupational status.",
      generalization_type: "qualitative_transferability",
    },
    {
      claim:
        "Emotional labour research should treat the wage relation as one condition among several rather than a definitional boundary.",
      generalization_type: "unclear",
    },
  ],
  conclusions: [
    "Volunteers' emotion-management practices are learned and transmissible, and likely recognisable in other volunteer care settings, though grounded in the two hospices studied.",
  ],
  limitations_explicitly_stated: [
    "Reliance on volunteers' own accounts; observational work could show whether described practices match enacted ones.",
  ],
  missing_information: [
    "reflexivity or positionality statement",
    "named qualitative approach",
    "sampling rationale and saturation criteria",
  ],
  ambiguities: [
    "Unclear whether Hochschild's surface/deep acting distinction informed the thematic coding or only frames the literature review.",
  ],
};
