import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getReviewRunForUser: vi.fn(),
  startReviewJob: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("@/lib/billing/repository", () => ({
  getReviewRunForUser: mocks.getReviewRunForUser,
}));
vi.mock("@/lib/review/worker", () => ({ startReviewJob: mocks.startReviewJob }));

import { GET } from "./route";

const context = { params: Promise.resolve({ id: "run_1" }) };

function request() {
  return new Request("https://qualisapio.test/api/review/run_1/stream");
}

const completedRun = {
  id: "run_1",
  manuscriptTitle: "Study",
  targetJournal: null,
  status: "completed",
  planAtRun: "free",
  startedAt: new Date("2026-08-11T12:00:00Z"),
  completedAt: new Date("2026-08-11T12:10:00Z"),
  hasStoredResult: true,
  progressStage: "completed",
  failureCode: null,
  failureDetail: null,
  inputTokens: 100,
  outputTokens: 20,
  estimatedCostUsd: 0.01,
  stageCheckpoints: {
    "manuscript-reader": {
      agentId: "manuscript-reader",
      agentName: "Manuscript Reader",
      summary: "Profile complete.",
      score: 4,
      findings: [],
    },
  },
  stageUsage: {},
  result: {
    reviewId: "run_1",
    manuscriptTitle: "Study",
    createdAt: "2026-08-11T12:10:00Z",
    agentReviews: [],
    finalAssessment: {
      verdict: "major-revisions",
      overallScore: 3,
      summary: "Revise.",
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
  },
};

describe("GET /api/review/[id]/stream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mocks.getSession.mockResolvedValue({ user: { id: "user_1" } });
  });

  it("requires authentication before opening a stream", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await GET(request(), context);
    expect(response.status).toBe(401);
    expect(mocks.getReviewRunForUser).not.toHaveBeenCalled();
  });

  it("does not expose another user's checkpoints", async () => {
    mocks.getReviewRunForUser.mockResolvedValue(null);
    const response = await GET(request(), context);
    expect(response.status).toBe(404);
    expect(mocks.getReviewRunForUser).toHaveBeenCalledWith("user_1", "run_1");
  });

  it("streams durable reviewer checkpoints before the completed report", async () => {
    mocks.getReviewRunForUser.mockResolvedValue(completedRun);
    const response = await GET(request(), context);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(body).toContain("event: status");
    expect(body).toContain("event: checkpoint");
    expect(body).toContain('"stage":"manuscript-reader"');
    expect(body).toContain("event: complete");
    expect(body.indexOf("event: checkpoint")).toBeLessThan(body.indexOf("event: complete"));
    expect(mocks.startReviewJob).not.toHaveBeenCalled();
  });

  it("resumes an active durable job and completes the same SSE connection", async () => {
    vi.useFakeTimers();
    mocks.startReviewJob.mockResolvedValue(undefined);
    mocks.getReviewRunForUser
      .mockResolvedValueOnce({
        ...completedRun,
        status: "running",
        completedAt: null,
        hasStoredResult: false,
        progressStage: "evidence-auditor",
        stageCheckpoints: {},
        result: null,
      })
      .mockResolvedValueOnce(completedRun);

    const response = await GET(request(), context);
    const bodyPromise = response.text();
    await vi.advanceTimersByTimeAsync(1_000);
    const body = await bodyPromise;

    expect(mocks.startReviewJob).toHaveBeenCalledWith("run_1");
    expect(body).toContain('"status":"running"');
    expect(body).toContain("event: complete");
  });
});
