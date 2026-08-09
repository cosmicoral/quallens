import { describe, expect, it } from "vitest";
import { FakeProvider } from "@/test/fake-provider";
import {
  driftingConceptsAudit,
  driftingConceptsManuscript,
  driftingConceptsProfile,
  integratedTheoryAudit,
  integratedTheoryManuscript,
  integratedTheoryProfile,
  mentionedTheoryAudit,
  mentionedTheoryManuscript,
  mentionedTheoryProfile,
} from "@/test/fixtures/theory-audit-fixtures";
import { auditTheory } from "./theory-auditor";

describe("auditTheory", () => {
  it("distinguishes a central named framework from analytical integration", async () => {
    const provider = new FakeProvider({ kind: "value", value: mentionedTheoryAudit });

    const result = await auditTheory(
      mentionedTheoryManuscript,
      mentionedTheoryProfile,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const audit = result.review.theoryAudit;
    expect(["central", "supporting"]).toContain(
      audit.frameworks[0].role_in_manuscript,
    );
    expect(["minimal", "absent"]).toContain(
      audit.frameworks[0].operationalization,
    );
    expect(["weak", "partial"]).toContain(audit.analytical_integration.assessment);
    expect(audit.frameworks[0].recommended_revision).toMatch(
      /integrate|use|narrow/i,
    );
    expect(audit.major_concerns[0].recommended_revision).toMatch(
      /integrate|narrow/i,
    );

    // Both inputs are supplied, while the prompt guards against name-checking.
    expect(provider.lastRequest?.prompt).toContain(
      "Theme one concerns convenience. Theme two concerns cost.",
    );
    expect(provider.lastRequest?.prompt).toContain(
      '"operationalized_in_analysis": "no"',
    );
    expect(provider.lastRequest?.system).toMatch(/MUST inspect the original manuscript/);
    expect(provider.lastRequest?.system).toMatch(
      /Citing a theorist.*does not establish theoretical integration/i,
    );
    expect(provider.lastRequest?.system).toMatch(/Never invent theorists/i);
  });

  it("recognises consistent theory that changes empirical interpretation", async () => {
    const provider = new FakeProvider({ kind: "value", value: integratedTheoryAudit });

    const result = await auditTheory(
      integratedTheoryManuscript,
      integratedTheoryProfile,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const audit = result.review.theoryAudit;
    expect(["adequate", "strong"]).toContain(
      audit.frameworks[0].operationalization,
    );
    expect(["adequate", "strong"]).toContain(
      audit.analytical_integration.assessment,
    );
    expect(
      audit.concept_consistency.every((concept) =>
        ["consistent", "mostly_consistent"].includes(concept.assessment),
      ),
    ).toBe(true);
    expect(["adequate", "strong"]).toContain(
      audit.theoretical_contribution.assessment,
    );
    expect(audit.major_concerns).toHaveLength(0);
  });

  it("surfaces unexplained substitution between related concepts", async () => {
    const provider = new FakeProvider({ kind: "value", value: driftingConceptsAudit });

    const result = await auditTheory(
      driftingConceptsManuscript,
      driftingConceptsProfile,
      provider,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const audit = result.review.theoryAudit;
    expect(audit.conceptual_drift).toHaveLength(1);
    expect(audit.conceptual_drift[0].concepts_involved).toEqual(
      expect.arrayContaining(["social capital", "cultural capital", "belonging"]),
    );
    expect(audit.concept_consistency).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ assessment: "drifting" }),
      ]),
    );
    expect(audit.conceptual_drift[0].recommended_revision).toMatch(
      /define|distinction|relationship/i,
    );
    expect(result.review.findings).toHaveLength(1);
  });

  it("returns invalid_output when provider output fails the strict schema", async () => {
    const provider = new FakeProvider({
      kind: "value",
      value: {
        ...mentionedTheoryAudit,
        frameworks: [{ framework_name: "Social Practice Theory" }],
      },
    });

    const result = await auditTheory(
      mentionedTheoryManuscript,
      mentionedTheoryProfile,
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

    const result = await auditTheory(
      mentionedTheoryManuscript,
      mentionedTheoryProfile,
      provider,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toEqual({
      code: "refusal",
      message: "The model declined the request.",
    });
  });
});
