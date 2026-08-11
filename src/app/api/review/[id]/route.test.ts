import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  getSession: vi.fn(),
  getReviewRunForUser: vi.fn(),
  startReviewJob: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: mocks.after };
});
vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("@/lib/billing/repository", () => ({
  getReviewRunForUser: mocks.getReviewRunForUser,
}));
vi.mock("@/lib/review/worker", () => ({ startReviewJob: mocks.startReviewJob }));

import { GET } from "./route";

function request() {
  return new Request("https://qualisapio.test/api/review/run_1");
}

const context = { params: Promise.resolve({ id: "run_1" }) };
const baseRun = {
  id: "run_1",
  manuscriptTitle: "Study",
  targetJournal: null,
  planAtRun: "free",
  startedAt: new Date("2026-08-11T12:00:00Z"),
  completedAt: null,
  hasStoredResult: false,
  progressStage: "evidence-auditor",
  failureCode: null,
  failureDetail: null,
  inputTokens: 0,
  outputTokens: 0,
  estimatedCostUsd: 0,
  stageUsage: {},
  result: null,
};

describe("GET /api/review/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "user_1" } });
  });

  it("requires authentication", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await GET(request(), context);
    expect(response.status).toBe(401);
    expect(mocks.getReviewRunForUser).not.toHaveBeenCalled();
  });

  it("does not expose another user's review", async () => {
    mocks.getReviewRunForUser.mockResolvedValue(null);
    const response = await GET(request(), context);
    expect(response.status).toBe(404);
    expect(mocks.getReviewRunForUser).toHaveBeenCalledWith("user_1", "run_1");
  });

  it("returns progress and schedules recovery for an active job", async () => {
    mocks.getReviewRunForUser.mockResolvedValue({
      ...baseRun,
      status: "running",
      stageUsage: {
        "manuscript-reader": {
          provider: "anthropic",
          model: "claude-opus-5",
          requestId: "req_reader",
          inputTokens: 15_000,
          outputTokens: 700,
          cacheCreationInputTokens: 0,
          cacheReadInputTokens: 0,
          estimatedCostUsd: 0.0925,
        },
      },
    });
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      job: {
        reviewId: "run_1",
        status: "running",
        stage: "evidence-auditor",
        usage: { inputTokens: 15_000, outputTokens: 700, estimatedCostUsd: 0.0925 },
      },
    });
    expect(mocks.after).toHaveBeenCalledOnce();
  });

  it("returns a stored result without restarting the job", async () => {
    const result = { reviewId: "run_1", manuscriptTitle: "Study" };
    mocks.getReviewRunForUser.mockResolvedValue({
      ...baseRun,
      status: "completed",
      completedAt: new Date("2026-08-11T12:10:00Z"),
      result,
    });
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, result });
    expect(mocks.after).not.toHaveBeenCalled();
  });

  it("returns the persisted failure reason", async () => {
    mocks.getReviewRunForUser.mockResolvedValue({
      ...baseRun,
      status: "failed",
      failureCode: "provider_error",
      failureDetail: "Anthropic was temporarily unavailable.",
    });
    const response = await GET(request(), context);
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      ok: false,
      errorCode: "provider_error",
      error: "Anthropic was temporarily unavailable.",
    });
  });
});
