import { z } from "zod";

/** Assessment of one dimension of a qualitative research design. */
export const designDimensionSchema = z
  .object({
    assessment: z.enum([
      "strong",
      "adequate",
      "partially_adequate",
      "weak",
      "not_reported",
      "not_applicable",
      "cannot_assess",
    ]),
    reasoning: z.string(),
    evidence_from_manuscript: z.array(z.string()),
    missing_information: z.array(z.string()),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** A design concern that warrants explicit attention or revision. */
export const designConcernSchema = z
  .object({
    issue_type: z.string(),
    severity: z.enum(["low", "moderate", "high"]),
    description: z.string(),
    why_it_matters: z.string(),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** Strict structured output produced by the Research Design Reviewer. */
export const researchDesignAuditSchema = z
  .object({
    overall_assessment: z.string(),
    research_question_alignment: designDimensionSchema,
    sampling: designDimensionSchema,
    recruitment: designDimensionSchema,
    data_collection: designDimensionSchema,
    analytical_process: designDimensionSchema,
    reflexivity_and_positionality: designDimensionSchema,
    ethics: designDimensionSchema,
    transferability_and_context: designDimensionSchema,
    design_coherence: designDimensionSchema,
    strengths: z.array(z.string()),
    major_concerns: z.array(designConcernSchema),
    priority_revisions: z.array(z.string()),
  })
  .strict();

export type DesignDimension = z.infer<typeof designDimensionSchema>;
export type DesignConcern = z.infer<typeof designConcernSchema>;
export type ResearchDesignAudit = z.infer<typeof researchDesignAuditSchema>;
