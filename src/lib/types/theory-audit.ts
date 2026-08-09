import { z } from "zod";

/** Assessment of how one named framework functions in the manuscript. */
export const theoryFrameworkAuditSchema = z
  .object({
    framework_name: z.string(),
    role_in_manuscript: z.enum([
      "central",
      "supporting",
      "background",
      "mentioned_only",
      "unclear",
    ]),
    operationalization: z.enum([
      "strong",
      "adequate",
      "partial",
      "minimal",
      "absent",
      "unclear",
    ]),
    concepts_used: z.array(z.string()),
    reasoning: z.string(),
    evidence_from_manuscript: z.array(z.string()),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** Assessment of whether one concept retains a stable analytical meaning. */
export const conceptConsistencyAuditSchema = z
  .object({
    concept: z.string(),
    assessment: z.enum([
      "consistent",
      "mostly_consistent",
      "drifting",
      "undefined",
      "unclear",
    ]),
    reasoning: z.string(),
    examples: z.array(z.string()),
  })
  .strict();

/** Assessment of a cross-framework dimension of theoretical use. */
export const theoryDimensionSchema = z
  .object({
    assessment: z.enum([
      "strong",
      "adequate",
      "partial",
      "weak",
      "not_present",
      "cannot_assess",
    ]),
    reasoning: z.string(),
    evidence_from_manuscript: z.array(z.string()),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** Unexplained substitution or slippage between related concepts. */
export const conceptDriftIssueSchema = z
  .object({
    concepts_involved: z.array(z.string()),
    description: z.string(),
    severity: z.enum(["low", "moderate", "high"]),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** A substantive concern about the manuscript's theoretical reasoning. */
export const theoryConcernSchema = z
  .object({
    issue_type: z.string(),
    severity: z.enum(["low", "moderate", "high"]),
    description: z.string(),
    why_it_matters: z.string(),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** Strict structured output produced by the Theory Auditor. */
export const theoryAuditSchema = z
  .object({
    overall_assessment: z.string(),
    frameworks: z.array(theoryFrameworkAuditSchema),
    concept_consistency: z.array(conceptConsistencyAuditSchema),
    analytical_integration: theoryDimensionSchema,
    empirical_theory_link: theoryDimensionSchema,
    theoretical_contribution: theoryDimensionSchema,
    conceptual_drift: z.array(conceptDriftIssueSchema),
    strengths: z.array(z.string()),
    major_concerns: z.array(theoryConcernSchema),
    priority_revisions: z.array(z.string()),
  })
  .strict();

export type TheoryFrameworkAudit = z.infer<typeof theoryFrameworkAuditSchema>;
export type ConceptConsistencyAudit = z.infer<
  typeof conceptConsistencyAuditSchema
>;
export type TheoryDimension = z.infer<typeof theoryDimensionSchema>;
export type ConceptDriftIssue = z.infer<typeof conceptDriftIssueSchema>;
export type TheoryConcern = z.infer<typeof theoryConcernSchema>;
export type TheoryAudit = z.infer<typeof theoryAuditSchema>;
