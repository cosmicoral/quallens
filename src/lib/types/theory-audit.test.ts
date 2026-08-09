import { describe, expect, it } from "vitest";
import {
  driftingConceptsAudit,
  integratedTheoryAudit,
  mentionedTheoryAudit,
} from "@/test/fixtures/theory-audit-fixtures";
import { theoryAuditSchema } from "./theory-audit";

describe("theoryAuditSchema", () => {
  it("accepts valid theory audits, including conceptual drift", () => {
    expect(theoryAuditSchema.safeParse(mentionedTheoryAudit).success).toBe(true);
    expect(theoryAuditSchema.safeParse(integratedTheoryAudit).success).toBe(true);
    expect(theoryAuditSchema.safeParse(driftingConceptsAudit).success).toBe(true);
  });

  it("rejects unknown fields at top and nested levels", () => {
    const topLevel = theoryAuditSchema.safeParse({
      ...integratedTheoryAudit,
      overall_score: 5,
    });
    const frameworkLevel = theoryAuditSchema.safeParse({
      ...mentionedTheoryAudit,
      frameworks: [
        {
          ...mentionedTheoryAudit.frameworks[0],
          cited_author_verified: true,
        },
      ],
    });
    const driftLevel = theoryAuditSchema.safeParse({
      ...driftingConceptsAudit,
      conceptual_drift: [
        {
          ...driftingConceptsAudit.conceptual_drift[0],
          inferred_mechanism: "status closure",
        },
      ],
    });

    expect(topLevel.success).toBe(false);
    expect(frameworkLevel.success).toBe(false);
    expect(driftLevel.success).toBe(false);
  });

  it("rejects invalid enum values", () => {
    const role = theoryAuditSchema.safeParse({
      ...mentionedTheoryAudit,
      frameworks: [
        { ...mentionedTheoryAudit.frameworks[0], role_in_manuscript: "decorative" },
      ],
    });
    const assessment = theoryAuditSchema.safeParse({
      ...mentionedTheoryAudit,
      analytical_integration: {
        ...mentionedTheoryAudit.analytical_integration,
        assessment: "mostly_weak",
      },
    });

    expect(role.success).toBe(false);
    expect(assessment.success).toBe(false);
  });

  it("allows null recommended revisions", () => {
    const result = theoryAuditSchema.safeParse({
      ...integratedTheoryAudit,
      frameworks: [
        {
          ...integratedTheoryAudit.frameworks[0],
          recommended_revision: null,
        },
      ],
      theoretical_contribution: {
        ...integratedTheoryAudit.theoretical_contribution,
        recommended_revision: null,
      },
    });

    expect(result.success).toBe(true);
  });

  it("allows empty drift and concern arrays", () => {
    const result = theoryAuditSchema.safeParse({
      ...integratedTheoryAudit,
      conceptual_drift: [],
      major_concerns: [],
    });

    expect(result.success).toBe(true);
  });

  it("strictly requires every dimension field", () => {
    const result = theoryAuditSchema.safeParse({
      ...mentionedTheoryAudit,
      empirical_theory_link: {
        assessment: "weak",
        reasoning: "The link is asserted.",
      },
    });

    expect(result.success).toBe(false);
  });
});
