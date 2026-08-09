import { describe, expect, it } from "vitest";
import {
  boundedCaseStudyAudit,
  underreportedDesignAudit,
} from "@/test/fixtures/research-design-fixtures";
import { researchDesignAuditSchema } from "./research-design-audit";

describe("researchDesignAuditSchema", () => {
  it("accepts valid research design audits", () => {
    expect(researchDesignAuditSchema.safeParse(underreportedDesignAudit).success).toBe(
      true,
    );
    expect(researchDesignAuditSchema.safeParse(boundedCaseStudyAudit).success).toBe(
      true,
    );
  });

  it("rejects unknown fields at nested object levels", () => {
    const dimensionResult = researchDesignAuditSchema.safeParse({
      ...underreportedDesignAudit,
      sampling: {
        ...underreportedDesignAudit.sampling,
        inferred_sampling_logic: "maximum variation",
      },
    });
    const concernResult = researchDesignAuditSchema.safeParse({
      ...underreportedDesignAudit,
      major_concerns: [
        {
          ...underreportedDesignAudit.major_concerns[0],
          inferred_noncompliance: true,
        },
      ],
    });

    expect(dimensionResult.success).toBe(false);
    expect(concernResult.success).toBe(false);
  });

  it("rejects unknown top-level fields", () => {
    const result = researchDesignAuditSchema.safeParse({
      ...boundedCaseStudyAudit,
      overall_score: 5,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid assessment and severity enums", () => {
    const invalidAssessment = researchDesignAuditSchema.safeParse({
      ...underreportedDesignAudit,
      recruitment: {
        ...underreportedDesignAudit.recruitment,
        assessment: "insufficient_detail",
      },
    });
    const invalidSeverity = researchDesignAuditSchema.safeParse({
      ...underreportedDesignAudit,
      major_concerns: [
        { ...underreportedDesignAudit.major_concerns[0], severity: "critical" },
      ],
    });

    expect(invalidAssessment.success).toBe(false);
    expect(invalidSeverity.success).toBe(false);
  });

  it("allows a null recommended_revision", () => {
    const result = researchDesignAuditSchema.safeParse({
      ...boundedCaseStudyAudit,
      research_question_alignment: {
        ...boundedCaseStudyAudit.research_question_alignment,
        recommended_revision: null,
      },
    });

    expect(result.success).toBe(true);
  });

  it.each(["not_applicable", "cannot_assess"])(
    "allows the %s assessment when justified",
    (assessment) => {
      const result = researchDesignAuditSchema.safeParse({
        ...underreportedDesignAudit,
        ethics: {
          ...underreportedDesignAudit.ethics,
          assessment,
          evidence_from_manuscript: [],
          missing_information: [],
        },
      });

      expect(result.success).toBe(true);
    },
  );
});
