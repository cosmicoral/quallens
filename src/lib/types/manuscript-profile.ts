import { z } from "zod";

/**
 * Structured manuscript profile — the Manuscript Reader's output.
 *
 * The schema encodes the epistemic rules of qualitative social science
 * reviewing rather than leaving them to prose:
 *
 * - Absent information is `null` (or an empty array) AND listed in
 *   `missing_information` — the reader must never invent fields.
 * - `evidence_type` on findings separates participant accounts from author
 *   interpretation.
 * - `generalization_type` on claims separates statistical generalisability
 *   from qualitative transferability (recording what the AUTHORS claim).
 * - `operationalized_in_analysis` records whether a theory is actually used
 *   in the analysis or merely mentioned in the literature review.
 * - Ambiguity is preserved via "unclear" enum values and `ambiguities`.
 *
 * All objects are `.strict()` so the LLM cannot smuggle in extra fields, and
 * strict mode maps to `additionalProperties: false`, which the structured
 * output API requires.
 */

export const theoreticalFrameworkSchema = z
  .object({
    name: z.string().describe("Name of the theory or framework as the authors use it"),
    operationalized_in_analysis: z
      .enum(["yes", "no", "unclear"])
      .describe(
        "'yes' only if the analysis demonstrably uses the framework's concepts; 'no' if it is only cited/mentioned; 'unclear' if ambiguous",
      ),
    notes: z
      .union([z.string(), z.null()])
      .describe("Brief note on how the framework is used, or null"),
  })
  .strict();

export const mainFindingSchema = z
  .object({
    finding: z.string().describe("The finding, stated close to the authors' own wording"),
    evidence_type: z
      .enum(["participant_account", "author_interpretation", "mixed", "unclear"])
      .describe(
        "Whether the finding rests on what participants reported, on the authors' analytical interpretation, on both, or is unclear",
      ),
  })
  .strict();

export const analyticalClaimSchema = z
  .object({
    claim: z.string().describe("The analytical claim as the authors state it"),
    generalization_type: z
      .enum([
        "statistical_generalization",
        "qualitative_transferability",
        "case_specific",
        "unclear",
      ])
      .describe(
        "The kind of generality the AUTHORS claim for this statement — record their claim, do not correct it",
      ),
  })
  .strict();

export const sampleSizeSchema = z
  .object({
    as_stated: z
      .union([z.string(), z.null()])
      .describe(
        "Sample size as reported, preserving hedges (e.g. 'approximately 20 participants'); null if not reported",
      ),
    numeric: z
      .union([z.number(), z.null()])
      .describe("Numeric sample size only when unambiguously stated; otherwise null"),
  })
  .strict();

export const manuscriptProfileSchema = z
  .object({
    title: z.string().describe("Manuscript title"),
    discipline: z
      .union([z.string(), z.null()])
      .describe("Discipline or field the manuscript addresses; null if not evident"),
    research_topic: z.string().describe("One- or two-sentence statement of the topic"),
    research_questions: z
      .array(z.string())
      .describe("Research questions as stated; empty array if none are explicitly stated"),
    stated_contribution: z
      .union([z.string(), z.null()])
      .describe("The contribution the authors claim; null if not stated"),
    theoretical_framework: z
      .array(theoreticalFrameworkSchema)
      .describe("Theories/frameworks the manuscript engages; empty array if none"),
    key_concepts: z.array(z.string()).describe("Central concepts used in the manuscript"),
    methodology: z
      .union([z.string(), z.null()])
      .describe("Overall methodology as described by the authors; null if not described"),
    qualitative_approach: z
      .union([z.string(), z.null()])
      .describe(
        "Named qualitative approach (e.g. grounded theory, IPA, ethnography); null if none is named",
      ),
    sampling_strategy: z
      .union([z.string(), z.null()])
      .describe("Sampling strategy as reported; null if not reported"),
    sample_description: z
      .union([z.string(), z.null()])
      .describe("Who the participants are, as reported; null if not reported"),
    sample_size: sampleSizeSchema,
    data_collection_methods: z
      .array(z.string())
      .describe("Data collection methods as reported; empty array if none are reported"),
    analytical_method: z
      .union([z.string(), z.null()])
      .describe("Analytical method (e.g. thematic analysis); null if not reported"),
    fieldwork_context: z
      .union([z.string(), z.null()])
      .describe("Setting/site/period of fieldwork; null if not reported"),
    ethical_information: z
      .union([z.string(), z.null()])
      .describe("Ethics approval, consent, anonymisation as reported; null if not reported"),
    reflexivity_or_positionality: z
      .union([z.string(), z.null()])
      .describe(
        "The authors' reflexivity/positionality statement, summarised; null if absent",
      ),
    main_findings: z.array(mainFindingSchema).describe("Main empirical findings"),
    major_analytical_claims: z
      .array(analyticalClaimSchema)
      .describe("The manuscript's major analytical claims"),
    conclusions: z.array(z.string()).describe("Conclusions as the authors state them"),
    limitations_explicitly_stated: z
      .array(z.string())
      .describe("Limitations the authors themselves state; empty array if none"),
    missing_information: z
      .array(z.string())
      .describe(
        "Short labels for expected information that is absent (e.g. 'sampling strategy', 'reflexivity or positionality statement')",
      ),
    ambiguities: z
      .array(z.string())
      .describe("Points where the manuscript is ambiguous and the ambiguity was preserved"),
  })
  .strict();

export type ManuscriptProfile = z.infer<typeof manuscriptProfileSchema>;
export type TheoreticalFramework = z.infer<typeof theoreticalFrameworkSchema>;
export type MainFinding = z.infer<typeof mainFindingSchema>;
export type AnalyticalClaim = z.infer<typeof analyticalClaimSchema>;
