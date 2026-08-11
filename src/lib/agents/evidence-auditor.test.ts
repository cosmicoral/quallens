import { describe, expect, it } from "vitest";
import type { LLMProvider, LLMResult, StructuredRequest } from "@/lib/llm";
import { FakeProvider } from "@/test/fake-provider";
import {
  boundedClaimAudit,
  boundedClaimManuscript,
  boundedClaimProfile,
  broadClaimAudit,
  broadClaimManuscript,
  broadClaimProfile,
} from "@/test/fixtures/evidence-audit-fixtures";
import { underreportedDesignAudit } from "@/test/fixtures/research-design-fixtures";
import { mentionedTheoryAudit } from "@/test/fixtures/theory-audit-fixtures";
import { culturalOverreachAudit } from "@/test/fixtures/overclaim-audit-fixtures";
import { strongSynthesisFixture } from "@/test/fixtures/final-review-fixtures";
import { auditEvidence } from "./evidence-auditor";
import { runReviewPipeline } from "./pipeline";

class SequenceProvider implements LLMProvider {
  readonly name = "sequence-fake";
  readonly model = "sequence-fake-model";
  readonly requests: StructuredRequest<unknown>[] = [];

  constructor(private readonly values: unknown[]) {}

  async generateStructured<T>(request: StructuredRequest<T>): Promise<LLMResult<T>> {
    const value = this.values[this.requests.length];
    this.requests.push(request as StructuredRequest<unknown>);
    const parsed = request.schema.safeParse(value);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "invalid_output", message: parsed.error.message },
      };
    }
    return { ok: true, value: parsed.data };
  }
}

describe("auditEvidence", () => {
  it("flags a collective claim supported by only two participants", async () => {
    const provider = new FakeProvider({ kind: "value", value: broadClaimAudit });

    const result = await auditEvidence(
      broadClaimManuscript,
      broadClaimProfile,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const claim = result.review.evidenceAudit.claims[0];
    expect(claim.evidence_distribution).toBe("small_subset");
    expect(["partially_supported", "weakly_supported"]).toContain(
      claim.support_assessment,
    );
    expect(["moderate", "high"]).toContain(claim.overclaim_risk);
    expect(claim.recommended_revision).toMatch(/narrow|broader evidence/i);
    expect(result.review.findings).not.toHaveLength(0);

    // The model receives both inputs and is told to use the manuscript itself.
    expect(provider.lastRequest?.prompt).toContain(
      "We conducted semi-structured interviews with 18 adult residents",
    );
    expect(provider.lastRequest?.prompt).toContain(
      "Priya said, \\\"I check whether the packaging can be recycled",
    );
    expect(provider.lastRequest?.prompt).toContain(
      broadClaimProfile.major_analytical_claims[0].claim,
    );
    expect(provider.lastRequest?.system).toMatch(/MUST inspect the original manuscript/);
    expect(provider.lastRequest?.system).toMatch(/Never infer prevalence/);
  });

  it("supports a bounded multi-case claim while preserving a deviant case", async () => {
    const provider = new FakeProvider({ kind: "value", value: boundedClaimAudit });

    const result = await auditEvidence(
      boundedClaimManuscript,
      boundedClaimProfile,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const claim = result.review.evidenceAudit.claims[0];
    expect(["supported", "strongly_supported"]).toContain(claim.support_assessment);
    expect(["none", "low"]).toContain(claim.overclaim_risk);
    expect(claim.contradictory_or_complicating_evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_label: "Sara",
          excerpt_or_description: expect.stringMatching(/handbook/),
        }),
      ]),
    );
    expect(claim.reasoning).toMatch(/qualifies|deviant/i);
  });

  it("returns invalid_output when provider output fails the audit schema", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: { ...broadClaimAudit, claims: "claim-1" },
    });

    const result = await auditEvidence(
      broadClaimManuscript,
      broadClaimProfile,
      provider,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("invalid_output");
  });

  it("propagates typed provider failures", async () => {
    const provider = new FakeProvider({
      kind: "error",
      error: { code: "refusal", message: "The model declined the request." },
    });

    const result = await auditEvidence(
      broadClaimManuscript,
      broadClaimProfile,
      provider,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("refusal");
  });

  it("runs all live reviewers in pipeline order", async () => {
    const provider = new SequenceProvider([
      broadClaimProfile,
      broadClaimAudit,
      underreportedDesignAudit,
      mentionedTheoryAudit,
      culturalOverreachAudit,
      strongSynthesisFixture.finalReview,
    ]);

    const result = await runReviewPipeline(broadClaimManuscript, provider);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(provider.requests).toHaveLength(6);
    expect(provider.requests[0].system).toMatch(/Manuscript Reader/);
    expect(provider.requests[1].system).toMatch(/Evidence Auditor/);
    expect(provider.requests[2].system).toMatch(/Research Design Reviewer/);
    expect(provider.requests[3].system).toMatch(/Theory Auditor/);
    expect(provider.requests[4].system).toMatch(/Overclaim & Contribution Auditor/);
    expect(provider.requests[5].system).toMatch(/Final Reviewer/);
    expect(provider.requests[4].prompt).toContain(
      '"support_assessment": "partially_supported"',
    );
    expect(provider.requests[5].prompt).toContain(
      '"claim_id": "claim-1"',
    );
    expect(result.result.agentReviews.map((review) => review.agentId)).toEqual([
      "manuscript-reader",
      "evidence-auditor",
      "research-design-reviewer",
      "theory-auditor",
      "overclaim-auditor",
    ]);
    expect(result.result.agentReviews[1].evidenceAudit).toEqual(broadClaimAudit);
    expect(result.result.agentReviews[2].researchDesignAudit).toEqual(
      underreportedDesignAudit,
    );
    expect(result.result.agentReviews[3].theoryAudit).toEqual(mentionedTheoryAudit);
    expect(result.result.agentReviews[4].overclaimAudit).toEqual(
      culturalOverreachAudit,
    );
    expect(result.result.finalReview).toEqual(strongSynthesisFixture.finalReview);
  });

  it("passes a 10,000+ character manuscript intact through every reviewer", async () => {
    const provider = new SequenceProvider([
      broadClaimProfile,
      broadClaimAudit,
      underreportedDesignAudit,
      mentionedTheoryAudit,
      culturalOverreachAudit,
      strongSynthesisFixture.finalReview,
    ]);
    const tailMarker = "END-OF-LONG-MANUSCRIPT-9284";
    const manuscript = {
      ...broadClaimManuscript,
      body: `${broadClaimManuscript.body}\n${"qualitative evidence ".repeat(650)}\n${tailMarker}`,
    };
    const stages: string[] = [];

    const result = await runReviewPipeline(
      manuscript,
      provider,
      (stage) => { stages.push(stage); },
    );

    expect(manuscript.body.length).toBeGreaterThan(10_000);
    expect(result.ok).toBe(true);
    expect(provider.requests).toHaveLength(6);
    for (const request of provider.requests) {
      expect(request.prompt).toContain(tailMarker);
    }
    expect(stages).toEqual([
      "manuscript-reader",
      "evidence-auditor",
      "research-design-reviewer",
      "theory-auditor",
      "overclaim-auditor",
      "final-reviewer",
    ]);
  });
});
