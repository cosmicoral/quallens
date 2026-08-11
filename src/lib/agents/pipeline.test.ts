import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readManuscript: vi.fn(),
  auditEvidence: vi.fn(),
  reviewResearchDesign: vi.fn(),
  auditTheory: vi.fn(),
  auditOverclaims: vi.fn(),
  synthesizeFinalReview: vi.fn(),
}));

vi.mock("./manuscript-reader", () => ({
  manuscriptReader: { id: "manuscript-reader", name: "Manuscript Reader", focus: "Profile" },
  readManuscript: mocks.readManuscript,
}));
vi.mock("./evidence-auditor", () => ({
  evidenceAuditor: { id: "evidence-auditor", name: "Evidence Auditor", focus: "Evidence" },
  auditEvidence: mocks.auditEvidence,
}));
vi.mock("./research-design-reviewer", () => ({
  researchDesignReviewer: {
    id: "research-design-reviewer",
    name: "Research Design Reviewer",
    focus: "Design",
  },
  reviewResearchDesign: mocks.reviewResearchDesign,
}));
vi.mock("./theory-auditor", () => ({
  theoryAuditor: { id: "theory-auditor", name: "Theory Auditor", focus: "Theory" },
  auditTheory: mocks.auditTheory,
}));
vi.mock("./overclaim-auditor", () => ({
  overclaimAuditor: { id: "overclaim-auditor", name: "Overclaim Auditor", focus: "Scope" },
  auditOverclaims: mocks.auditOverclaims,
}));
vi.mock("./final-reviewer", () => ({
  finalReviewer: { id: "final-reviewer", name: "Final Reviewer", focus: "Synthesis" },
  synthesizeFinalReview: mocks.synthesizeFinalReview,
}));

import { runReviewPipeline } from "./pipeline";

const STAGES = [
  "manuscript-reader",
  "evidence-auditor",
  "research-design-reviewer",
  "theory-auditor",
  "overclaim-auditor",
  "final-reviewer",
];

describe("review pipeline stage order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readManuscript.mockResolvedValue({
      ok: true,
      review: { agentId: "manuscript-reader", profile: {} },
    });
    mocks.auditEvidence.mockResolvedValue({
      ok: true,
      review: { agentId: "evidence-auditor", evidenceAudit: {} },
    });
    mocks.reviewResearchDesign.mockResolvedValue({
      ok: true,
      review: { agentId: "research-design-reviewer", researchDesignAudit: {} },
    });
    mocks.auditTheory.mockResolvedValue({
      ok: true,
      review: { agentId: "theory-auditor", theoryAudit: {} },
    });
    mocks.auditOverclaims.mockResolvedValue({
      ok: true,
      review: { agentId: "overclaim-auditor", overclaimAudit: {} },
    });
    mocks.synthesizeFinalReview.mockResolvedValue({
      ok: true,
      finalReview: { recommendation: "major_revision" },
      finalAssessment: {
        verdict: "major-revisions",
        overallScore: 3,
        summary: "Revise before publication.",
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },
    });
  });

  it("runs all five specialist reviewers and the final synthesis before completing", async () => {
    const onProgress = vi.fn();
    const onCheckpoint = vi.fn();

    const result = await runReviewPipeline(
      { title: "Study", body: "A qualitative manuscript." },
      undefined,
      onProgress,
      { onCheckpoint },
    );

    expect(result.ok).toBe(true);
    expect(onProgress.mock.calls.map(([stage]) => stage)).toEqual(STAGES);
    expect(onCheckpoint.mock.calls.map(([stage]) => stage)).toEqual(STAGES);
    expect(mocks.synthesizeFinalReview).toHaveBeenCalledOnce();
    if (result.ok) {
      expect(result.result.agentReviews).toHaveLength(5);
      expect(result.result.finalAssessment.verdict).toBe("major-revisions");
    }
  });
});
