import { describe, expect, it } from "vitest";
import {
  strongSynthesisFixture,
  uncertainSynthesisFixture,
  weakSynthesisFixture,
} from "@/test/fixtures/final-review-fixtures";
import { finalReviewSchema } from "./final-review";

describe("finalReviewSchema", () => {
  it("accepts valid section-aware final reviews", () => {
    expect(
      finalReviewSchema.safeParse(strongSynthesisFixture.finalReview).success,
    ).toBe(true);
    expect(
      finalReviewSchema.safeParse(weakSynthesisFixture.finalReview).success,
    ).toBe(true);
    expect(
      finalReviewSchema.safeParse(uncertainSynthesisFixture.finalReview).success,
    ).toBe(true);
  });

  it("rejects unknown fields at top and nested levels", () => {
    const topLevel = finalReviewSchema.safeParse({
      ...strongSynthesisFixture.finalReview,
      journal_decision: "accept",
    });
    const sectionLevel = finalReviewSchema.safeParse({
      ...strongSynthesisFixture.finalReview,
      section_reviews: {
        ...strongSynthesisFixture.finalReview.section_reviews,
        methods: {
          ...strongSynthesisFixture.finalReview.section_reviews.methods,
          invented_method: "member checking",
        },
      },
    });

    expect(topLevel.success).toBe(false);
    expect(sectionLevel.success).toBe(false);
  });

  it("rejects invalid recommendation and section enums", () => {
    const recommendation = finalReviewSchema.safeParse({
      ...strongSynthesisFixture.finalReview,
      recommendation: "accept",
    });
    const sectionAssessment = finalReviewSchema.safeParse({
      ...weakSynthesisFixture.finalReview,
      section_reviews: {
        ...weakSynthesisFixture.finalReview.section_reviews,
        findings: {
          ...weakSynthesisFixture.finalReview.section_reviews.findings,
          assessment: "reject",
        },
      },
    });

    expect(recommendation.success).toBe(false);
    expect(sectionAssessment.success).toBe(false);
  });

  it.each([0, 6, 2.5])("rejects priority value %s", (priority) => {
    const result = finalReviewSchema.safeParse({
      ...strongSynthesisFixture.finalReview,
      priority_revisions: [
        {
          ...strongSynthesisFixture.finalReview.priority_revisions[0],
          priority,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("allows empty minor concerns", () => {
    const result = finalReviewSchema.safeParse({
      ...strongSynthesisFixture.finalReview,
      minor_concerns: [],
    });

    expect(result.success).toBe(true);
  });

  it("validates source-agent enums for points and priorities", () => {
    const pointSource = finalReviewSchema.safeParse({
      ...strongSynthesisFixture.finalReview,
      strengths: [
        {
          ...strongSynthesisFixture.finalReview.strengths[0],
          source_agents: ["final"],
        },
      ],
    });
    const prioritySource = finalReviewSchema.safeParse({
      ...strongSynthesisFixture.finalReview,
      priority_revisions: [
        {
          ...strongSynthesisFixture.finalReview.priority_revisions[0],
          source_agents: ["reader"],
        },
      ],
    });

    expect(pointSource.success).toBe(false);
    expect(prioritySource.success).toBe(false);
  });

  it("strictly requires every cross-section coherence field", () => {
    const result = finalReviewSchema.safeParse({
      ...uncertainSynthesisFixture.finalReview,
      cross_section_coherence: {
        research_question_to_design: "Cannot assess.",
      },
    });

    expect(result.success).toBe(false);
  });
});
