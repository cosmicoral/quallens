import { describe, expect, it } from "vitest";
import { FakeProvider } from "@/test/fake-provider";
import {
  strongSynthesisFixture,
  uncertainSynthesisFixture,
  weakSynthesisFixture,
} from "@/test/fixtures/final-review-fixtures";
import { synthesizeFinalReview } from "./final-reviewer";

async function runFixture(
  fixture: typeof strongSynthesisFixture,
  provider: FakeProvider,
) {
  return synthesizeFinalReview(
    fixture.manuscript,
    fixture.profile,
    fixture.evidenceAudit,
    fixture.researchDesignAudit,
    fixture.theoryAudit,
    fixture.overclaimAudit,
    provider,
  );
}

describe("synthesizeFinalReview", () => {
  it("produces a focused revision-ready synthesis for a coherent manuscript", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: strongSynthesisFixture.finalReview,
    });

    const result = await runFixture(strongSynthesisFixture, provider);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(["minor_revision", "major_revision"]).toContain(
      result.finalReview.recommendation,
    );
    expect(result.finalReview.strengths.length).toBeGreaterThan(0);
    const sectionAssessments = Object.values(
      result.finalReview.section_reviews,
    ).map((review) => review.assessment);
    expect(
      sectionAssessments.filter((assessment) =>
        ["strong", "adequate"].includes(assessment),
      ).length,
    ).toBeGreaterThanOrEqual(4);
    expect(result.finalReview.priority_revisions.length).toBeLessThanOrEqual(5);
    expect(
      new Set(result.finalReview.priority_revisions.map((item) => item.title)).size,
    ).toBe(result.finalReview.priority_revisions.length);
    expect(result.finalAssessment.verdict).toBe("minor-revisions");

    // Every structured audit and the original manuscript reach the synthesis.
    expect(provider.lastRequest?.prompt).toContain("<evidence_audit>");
    expect(provider.lastRequest?.prompt).toContain("<research_design_audit>");
    expect(provider.lastRequest?.prompt).toContain("<theory_audit>");
    expect(provider.lastRequest?.prompt).toContain("<overclaim_audit>");
    expect(provider.lastRequest?.prompt).toContain(
      "Informal case debriefs functioned as sites of participation",
    );
    expect(provider.lastRequest?.system).toMatch(/not another specialist audit/i);
    expect(provider.lastRequest?.system).toMatch(/Do not make journal acceptance/i);
    expect(provider.lastRequest?.system).toMatch(/naive average/i);
  });

  it("prioritizes validity problems over superficial strengths", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: weakSynthesisFixture.finalReview,
    });

    const result = await runFixture(weakSynthesisFixture, provider);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(["major_revision", "not_ready"]).toContain(
      result.finalReview.recommendation,
    );
    expect(result.finalReview.priority_revisions[0].source_agents).toEqual(
      expect.arrayContaining(["evidence", "research_design", "overclaim"]),
    );
    expect(result.finalReview.major_concerns.map((point) => point.title).join(" ")).toMatch(
      /evidence|design|causal/i,
    );
    expect(result.finalReview.section_reviews.findings.assessment).toBe(
      "major_revision",
    );
    expect(result.finalReview.section_reviews.discussion.assessment).toBe(
      "major_revision",
    );
    expect(result.finalReview.section_reviews.conclusion.assessment).toBe(
      "major_revision",
    );
    expect(result.finalReview.overall_assessment).toMatch(
      /outweigh|not ready|validity|reconceptual/i,
    );
  });

  it("preserves specialist uncertainty without fabricating section judgments", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: uncertainSynthesisFixture.finalReview,
    });

    const result = await runFixture(uncertainSynthesisFixture, provider);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(["moderate", "low"]).toContain(result.finalReview.confidence);
    expect(result.finalReview.recommendation).toBe("cannot_assess");
    expect(result.finalReview.section_reviews.methods.assessment).toBe(
      "cannot_assess",
    );
    expect(result.finalReview.section_reviews.findings.assessment).toBe(
      "cannot_assess",
    );
    expect(result.finalReview.cross_section_coherence.design_to_findings).toMatch(
      /cannot assess/i,
    );
    expect(result.finalReview.overall_assessment).not.toMatch(
      /ethics approval was absent|sample was too small/i,
    );
  });

  it("returns invalid_output when provider output fails the strict schema", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: {
        ...strongSynthesisFixture.finalReview,
        section_reviews: { introduction: { assessment: "adequate" } },
      },
    });

    const result = await runFixture(strongSynthesisFixture, provider);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("invalid_output");
  });

  it("propagates typed provider failures", async () => {
    const provider = new FakeProvider({
      kind: "error",
      error: { code: "refusal", message: "The model declined synthesis." },
    });

    const result = await runFixture(strongSynthesisFixture, provider);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toEqual({
      code: "refusal",
      message: "The model declined synthesis.",
    });
  });
});
