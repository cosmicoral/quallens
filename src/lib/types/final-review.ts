import { z } from "zod";

export const finalReviewSourceAgentSchema = z.enum([
  "reader",
  "evidence",
  "research_design",
  "theory",
  "overclaim",
]);

export const specialistSourceAgentSchema = z.enum([
  "evidence",
  "research_design",
  "theory",
  "overclaim",
]);

/** A strength or concern synthesized from one or more review layers. */
export const finalReviewPointSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    source_agents: z.array(finalReviewSourceAgentSchema),
  })
  .strict();

/** One of at most five prioritized, actionable manuscript revisions. */
export const priorityRevisionSchema = z
  .object({
    priority: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
    title: z.string(),
    why_it_matters: z.string(),
    action: z.string(),
    source_agents: z.array(specialistSourceAgentSchema),
  })
  .strict();

/** Section-aware synthesis for a conventional manuscript section. */
export const sectionReviewSchema = z
  .object({
    assessment: z.enum([
      "strong",
      "adequate",
      "needs_revision",
      "major_revision",
      "cannot_assess",
    ]),
    strengths: z.array(z.string()),
    concerns: z.array(z.string()),
    recommended_actions: z.array(z.string()),
  })
  .strict();

/** Explicit evaluation of the manuscript's reasoning across sections. */
export const crossSectionCoherenceSchema = z
  .object({
    research_question_to_design: z.string(),
    design_to_findings: z.string(),
    findings_to_discussion: z.string(),
    discussion_to_contribution: z.string(),
    conclusion_proportionality: z.string(),
  })
  .strict();

/** Strict structured output produced by the Final Reviewer. */
export const finalReviewSchema = z
  .object({
    manuscript_summary: z.string(),
    overall_assessment: z.string(),
    recommendation: z.enum([
      "minor_revision",
      "major_revision",
      "borderline",
      "not_ready",
      "cannot_assess",
    ]),
    confidence: z.enum(["high", "moderate", "low"]),
    strengths: z.array(finalReviewPointSchema),
    major_concerns: z.array(finalReviewPointSchema),
    minor_concerns: z.array(finalReviewPointSchema),
    priority_revisions: z.array(priorityRevisionSchema).max(5),
    section_reviews: z
      .object({
        introduction: sectionReviewSchema,
        methods: sectionReviewSchema,
        findings: sectionReviewSchema,
        discussion: sectionReviewSchema,
        conclusion: sectionReviewSchema,
      })
      .strict(),
    cross_section_coherence: crossSectionCoherenceSchema,
  })
  .strict();

export type FinalReviewSourceAgent = z.infer<
  typeof finalReviewSourceAgentSchema
>;
export type SpecialistSourceAgent = z.infer<
  typeof specialistSourceAgentSchema
>;
export type FinalReviewPoint = z.infer<typeof finalReviewPointSchema>;
export type PriorityRevision = z.infer<typeof priorityRevisionSchema>;
export type SectionReview = z.infer<typeof sectionReviewSchema>;
export type CrossSectionCoherence = z.infer<
  typeof crossSectionCoherenceSchema
>;
export type FinalReview = z.infer<typeof finalReviewSchema>;
