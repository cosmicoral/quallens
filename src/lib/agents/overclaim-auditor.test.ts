import { describe, expect, it } from "vitest";
import { FakeProvider } from "@/test/fake-provider";
import {
  boundedClaimEvidenceAudit,
  boundedClaimManuscript,
  boundedClaimProfile,
  boundedOverclaimAudit,
  causalOverclaimAudit,
  causalOverreachEvidenceAudit,
  causalOverreachManuscript,
  causalOverreachProfile,
  culturalOverreachAudit,
  culturalOverreachEvidenceAudit,
  culturalOverreachManuscript,
  culturalOverreachProfile,
} from "@/test/fixtures/overclaim-audit-fixtures";
import { auditOverclaims } from "./overclaim-auditor";

describe("auditOverclaims", () => {
  it("flags a one-city claim about Chinese middle-class consumers", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: culturalOverreachAudit,
    });

    const result = await auditOverclaims(
      culturalOverreachManuscript,
      culturalOverreachProfile,
      culturalOverreachEvidenceAudit,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const claim = result.review.overclaimAudit.claims[0];
    expect(["population", "cultural"]).toContain(claim.claim_type);
    expect(["moderate", "high"]).toContain(claim.risk);
    expect(claim.basis).toBe("population_overreach");
    expect(claim.recommended_revision).toMatch(
      /participant|Shanghai|context|narrow/i,
    );

    // The model receives all three inputs and manuscript-only scope rules.
    expect(provider.lastRequest?.prompt).toContain(
      "This study demonstrates how Chinese middle-class consumers respond",
    );
    expect(provider.lastRequest?.prompt).toContain(
      '"support_assessment": "partially_supported"',
    );
    expect(provider.lastRequest?.prompt).toContain(
      '"overclaim_risk": "high"',
    );
    expect(provider.lastRequest?.system).toMatch(/MUST inspect the original manuscript/);
    expect(provider.lastRequest?.system).toMatch(/Do not automatically treat a small/i);
    expect(provider.lastRequest?.system).toMatch(/Do not perform citation verification/i);
  });

  it("preserves participant-bounded claims and qualitative transferability", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: boundedOverclaimAudit,
    });

    const result = await auditOverclaims(
      boundedClaimManuscript,
      boundedClaimProfile,
      boundedClaimEvidenceAudit,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const claim = result.review.overclaimAudit.claims[0];
    expect(["none", "low"]).toContain(claim.risk);
    expect(claim.basis).toBe("well_bounded");
    expect(claim.recommended_revision).toBeNull();
    expect(result.review.findings).toHaveLength(0);
    expect(result.review.overclaimAudit.overall_assessment).toMatch(
      /bounded|transferability|context/i,
    );
  });

  it("flags causal proof language based on participant accounts", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: causalOverclaimAudit,
    });

    const result = await auditOverclaims(
      causalOverreachManuscript,
      causalOverreachProfile,
      causalOverreachEvidenceAudit,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const claim = result.review.overclaimAudit.claims[0];
    expect(claim.claim_type).toBe("causal");
    expect(claim.risk).toBe("high");
    expect(claim.basis).toBe("causal_overreach");
    expect(claim.reasoning).toMatch(/interview|participant|perception/i);
    expect(claim.recommended_revision).toMatch(/perceiv|non-causal|without.*caus/i);
  });

  it("returns invalid_output when provider output fails the strict schema", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: {
        ...causalOverclaimAudit,
        claims: [{ claim_id: "claim-1", risk: "high" }],
      },
    });

    const result = await auditOverclaims(
      causalOverreachManuscript,
      causalOverreachProfile,
      causalOverreachEvidenceAudit,
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

    const result = await auditOverclaims(
      boundedClaimManuscript,
      boundedClaimProfile,
      boundedClaimEvidenceAudit,
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
