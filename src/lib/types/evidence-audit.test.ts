import { describe, expect, it } from "vitest";
import { evidenceAuditSchema } from "./evidence-audit";
import {
  boundedClaimAudit,
  broadClaimAudit,
} from "@/test/fixtures/evidence-audit-fixtures";

describe("evidenceAuditSchema", () => {
  it("accepts valid claim-level evidence audits", () => {
    expect(evidenceAuditSchema.safeParse(broadClaimAudit).success).toBe(true);
    expect(evidenceAuditSchema.safeParse(boundedClaimAudit).success).toBe(true);
  });

  it("rejects unknown fields at every object level", () => {
    const result = evidenceAuditSchema.safeParse({
      ...broadClaimAudit,
      claims: [
        {
          ...broadClaimAudit.claims[0],
          evidence_found: [
            {
              ...broadClaimAudit.claims[0].evidence_found[0],
              invented_frequency: "most participants",
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid enum values", () => {
    const result = evidenceAuditSchema.safeParse({
      ...broadClaimAudit,
      claims: [
        {
          ...broadClaimAudit.claims[0],
          support_assessment: "mostly_supported",
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it.each(["unsupported", "cannot_assess"])(
    "allows empty evidence_found for %s claims",
    (supportAssessment) => {
      const result = evidenceAuditSchema.safeParse({
        ...broadClaimAudit,
        claims: [
          {
            ...broadClaimAudit.claims[0],
            evidence_found: [],
            support_assessment: supportAssessment,
            evidence_distribution: "unclear",
          },
        ],
      });

      expect(result.success).toBe(true);
    },
  );

  it("allows a null source_label", () => {
    const result = evidenceAuditSchema.safeParse({
      ...broadClaimAudit,
      claims: [
        {
          ...broadClaimAudit.claims[0],
          evidence_found: [
            {
              ...broadClaimAudit.claims[0].evidence_found[0],
              source_label: null,
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown top-level fields", () => {
    const result = evidenceAuditSchema.safeParse({
      ...boundedClaimAudit,
      overall_score: 5,
    });

    expect(result.success).toBe(false);
  });
});
