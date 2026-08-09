import { z } from "zod";

/** A concrete piece of manuscript evidence considered for or against a claim. */
export const evidenceItemSchema = z
  .object({
    evidence_type: z.enum([
      "participant_quote",
      "participant_account",
      "fieldnote",
      "observation",
      "document",
      "researcher_interpretation",
      "theoretical_interpretation",
      "other",
    ]),
    excerpt_or_description: z.string(),
    source_label: z.union([z.string(), z.null()]),
  })
  .strict();

/** A concern that affects one or more claims across the manuscript. */
export const evidenceIssueSchema = z
  .object({
    issue_type: z.string(),
    description: z.string(),
    severity: z.enum(["low", "moderate", "high"]),
    affected_claim_ids: z.array(z.string()),
  })
  .strict();

/** The evidence assessment for one major analytical claim. */
export const claimEvidenceAuditSchema = z
  .object({
    claim_id: z.string(),
    claim_text: z.string(),
    claim_scope: z.union([z.string(), z.null()]),
    evidence_found: z.array(evidenceItemSchema),
    evidence_distribution: z.enum([
      "single_case",
      "small_subset",
      "multiple_cases",
      "broad_dataset",
      "unclear",
    ]),
    support_assessment: z.enum([
      "strongly_supported",
      "supported",
      "partially_supported",
      "weakly_supported",
      "unsupported",
      "cannot_assess",
    ]),
    reasoning: z.string(),
    overclaim_risk: z.enum(["none", "low", "moderate", "high"]),
    contradictory_or_complicating_evidence: z.array(evidenceItemSchema),
    recommended_revision: z.union([z.string(), z.null()]),
  })
  .strict();

/** Strict structured output produced by the Evidence Auditor. */
export const evidenceAuditSchema = z
  .object({
    overall_assessment: z.string(),
    claims: z.array(claimEvidenceAuditSchema),
    cross_cutting_issues: z.array(evidenceIssueSchema),
    strengths: z.array(z.string()),
    priority_revisions: z.array(z.string()),
  })
  .strict();

export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type EvidenceIssue = z.infer<typeof evidenceIssueSchema>;
export type ClaimEvidenceAudit = z.infer<typeof claimEvidenceAuditSchema>;
export type EvidenceAudit = z.infer<typeof evidenceAuditSchema>;
