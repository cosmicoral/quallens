import { z } from "zod";

/** Assessment of whether one manuscript claim stays within its support. */
export const overclaimFindingSchema = z
  .object({
    claim_id: z.string(),
    claim_text: z.string(),
    claim_type: z.enum([
      "empirical",
      "causal",
      "population",
      "cultural",
      "theoretical",
      "novelty",
      "policy",
      "practical",
      "other",
    ]),
    risk: z.enum(["none", "low", "moderate", "high"]),
    basis: z.enum([
      "well_bounded",
      "sample_scope",
      "evidence_scope",
      "causal_overreach",
      "population_overreach",
      "unsupported_novelty",
      "unsupported_recommendation",
      "new_conclusion_claim",
      "ambiguous",
      "other",
    ]),
    reasoning: z.string(),
    supporting_context: z.array(z.string()),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** A repeated overclaiming pattern affecting one or more audited claims. */
export const overclaimPatternSchema = z
  .object({
    pattern_type: z.string(),
    severity: z.enum(["low", "moderate", "high"]),
    description: z.string(),
    affected_claim_ids: z.array(z.string()),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** Strict structured output produced by the Overclaim Auditor. */
export const overclaimAuditSchema = z
  .object({
    overall_assessment: z.string(),
    claims: z.array(overclaimFindingSchema),
    cross_cutting_patterns: z.array(overclaimPatternSchema),
    strengths: z.array(z.string()),
    priority_revisions: z.array(z.string()),
  })
  .strict();

export type OverclaimFinding = z.infer<typeof overclaimFindingSchema>;
export type OverclaimPattern = z.infer<typeof overclaimPatternSchema>;
export type OverclaimAudit = z.infer<typeof overclaimAuditSchema>;
