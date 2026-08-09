import { describe, expect, it } from "vitest";
import {
  boundedOverclaimAudit,
  causalOverclaimAudit,
  culturalOverreachAudit,
} from "@/test/fixtures/overclaim-audit-fixtures";
import { overclaimAuditSchema } from "./overclaim-audit";

describe("overclaimAuditSchema", () => {
  it("accepts valid overclaim audits", () => {
    expect(overclaimAuditSchema.safeParse(culturalOverreachAudit).success).toBe(
      true,
    );
    expect(overclaimAuditSchema.safeParse(boundedOverclaimAudit).success).toBe(
      true,
    );
    expect(overclaimAuditSchema.safeParse(causalOverclaimAudit).success).toBe(
      true,
    );
  });

  it("rejects unknown fields at top and nested levels", () => {
    const topLevel = overclaimAuditSchema.safeParse({
      ...culturalOverreachAudit,
      overall_score: 2,
    });
    const claimLevel = overclaimAuditSchema.safeParse({
      ...culturalOverreachAudit,
      claims: [
        {
          ...culturalOverreachAudit.claims[0],
          inferred_population: "all consumers",
        },
      ],
    });
    const patternLevel = overclaimAuditSchema.safeParse({
      ...causalOverclaimAudit,
      cross_cutting_patterns: [
        {
          ...causalOverclaimAudit.cross_cutting_patterns[0],
          verified_cause: false,
        },
      ],
    });

    expect(topLevel.success).toBe(false);
    expect(claimLevel.success).toBe(false);
    expect(patternLevel.success).toBe(false);
  });

  it("rejects invalid enum values", () => {
    const risk = overclaimAuditSchema.safeParse({
      ...culturalOverreachAudit,
      claims: [
        { ...culturalOverreachAudit.claims[0], risk: "critical" },
      ],
    });
    const basis = overclaimAuditSchema.safeParse({
      ...causalOverclaimAudit,
      claims: [
        { ...causalOverclaimAudit.claims[0], basis: "correlation_only" },
      ],
    });

    expect(risk.success).toBe(false);
    expect(basis.success).toBe(false);
  });

  it("allows null recommended revisions", () => {
    const result = overclaimAuditSchema.safeParse({
      ...boundedOverclaimAudit,
      claims: [
        {
          ...boundedOverclaimAudit.claims[0],
          recommended_revision: null,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("allows empty claim and pattern arrays", () => {
    const result = overclaimAuditSchema.safeParse({
      ...boundedOverclaimAudit,
      claims: [],
      cross_cutting_patterns: [],
    });

    expect(result.success).toBe(true);
  });

  it("strictly requires every claim field", () => {
    const result = overclaimAuditSchema.safeParse({
      ...causalOverclaimAudit,
      claims: [
        {
          claim_id: "claim-1",
          claim_text: "Platform use causes food waste.",
          risk: "high",
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
