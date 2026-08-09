import { describe, expect, it } from "vitest";
import { FakeProvider } from "@/test/fake-provider";
import {
  boundedCaseStudyAudit,
  boundedCaseStudyManuscript,
  boundedCaseStudyProfile,
  underreportedDesignAudit,
  underreportedDesignManuscript,
  underreportedDesignProfile,
} from "@/test/fixtures/research-design-fixtures";
import { reviewResearchDesign } from "./research-design-reviewer";

describe("reviewResearchDesign", () => {
  it("identifies reporting gaps without treating sample size as the defect", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: underreportedDesignAudit,
    });

    const result = await reviewResearchDesign(
      underreportedDesignManuscript,
      underreportedDesignProfile,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const audit = result.review.researchDesignAudit;
    expect(["adequate", "strong"]).toContain(
      audit.research_question_alignment.assessment,
    );
    expect(audit.data_collection.assessment).toBe("adequate");
    expect(["partially_adequate", "weak"]).toContain(audit.sampling.assessment);
    expect(["not_reported", "weak"]).toContain(audit.recruitment.assessment);
    expect(audit.reflexivity_and_positionality.assessment).toBe("not_reported");
    expect(audit.major_concerns.map((concern) => concern.issue_type)).toEqual(
      expect.arrayContaining([
        "sampling_transparency",
        "recruitment_transparency",
      ]),
    );
    expect(
      audit.major_concerns.map((concern) => concern.description).join(" "),
    ).not.toMatch(/small sample|sample (?:is|was) too small/i);

    // Both inputs are available, while the system prompt guards qualitative logic.
    expect(provider.lastRequest?.prompt).toContain(
      "How do first-generation university students describe seeking academic support",
    );
    expect(provider.lastRequest?.prompt).toContain(
      "sampling strategy and rationale",
    );
    expect(provider.lastRequest?.system).toMatch(/MUST inspect the original manuscript/);
    expect(provider.lastRequest?.system).toMatch(/Do not penalize.*sample is small/i);
    expect(provider.lastRequest?.system).toMatch(/Do not require saturation universally/);
    expect(provider.lastRequest?.system).toMatch(
      /transferability.*not statistical generalisability/i,
    );
  });

  it("recognises a transparent, bounded, and coherent case-study design", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: boundedCaseStudyAudit,
    });

    const result = await reviewResearchDesign(
      boundedCaseStudyManuscript,
      boundedCaseStudyProfile,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const audit = result.review.researchDesignAudit;
    const assessments = [
      audit.research_question_alignment.assessment,
      audit.sampling.assessment,
      audit.recruitment.assessment,
      audit.data_collection.assessment,
      audit.analytical_process.assessment,
      audit.reflexivity_and_positionality.assessment,
      audit.ethics.assessment,
      audit.transferability_and_context.assessment,
      audit.design_coherence.assessment,
    ];
    expect(assessments.every((value) => ["strong", "adequate"].includes(value))).toBe(
      true,
    );
    expect(audit.major_concerns).toHaveLength(0);
    expect(audit.transferability_and_context.reasoning).toMatch(
      /context|bounded|statistical generalisability/i,
    );
    expect(audit.transferability_and_context.recommended_revision).toBeNull();
  });

  it("returns invalid_output when provider output fails the strict schema", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: {
        ...underreportedDesignAudit,
        sampling: { assessment: "weak" },
      },
    });

    const result = await reviewResearchDesign(
      underreportedDesignManuscript,
      underreportedDesignProfile,
      provider,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("invalid_output");
  });

  it("propagates typed provider failures", async () => {
    const provider = new FakeProvider({
      kind: "error",
      error: { code: "provider_error", message: "Provider unavailable." },
    });

    const result = await reviewResearchDesign(
      underreportedDesignManuscript,
      underreportedDesignProfile,
      provider,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toEqual({
      code: "provider_error",
      message: "Provider unavailable.",
    });
  });
});
