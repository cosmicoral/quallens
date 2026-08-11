import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  runReviewPipeline: vi.fn(),
  getReviewJob: vi.fn(),
  markReviewRunCompleted: vi.fn(),
  markReviewRunFailed: vi.fn(),
  markReviewRunProgress: vi.fn(),
  markReviewRunRunning: vi.fn(),
  recordReviewStageUsage: vi.fn(),
  saveReviewStageCheckpoint: vi.fn(),
  withReviewRunLock: vi.fn(),
}));

vi.mock("@/lib/agents/pipeline", () => ({ runReviewPipeline: mocks.runReviewPipeline }));
vi.mock("@/lib/billing/repository", () => ({
  getReviewJob: mocks.getReviewJob,
  markReviewRunCompleted: mocks.markReviewRunCompleted,
  markReviewRunFailed: mocks.markReviewRunFailed,
  markReviewRunProgress: mocks.markReviewRunProgress,
  markReviewRunRunning: mocks.markReviewRunRunning,
  recordReviewStageUsage: mocks.recordReviewStageUsage,
  saveReviewStageCheckpoint: mocks.saveReviewStageCheckpoint,
  withReviewRunLock: mocks.withReviewRunLock,
}));

import { startReviewJob } from "./worker";

describe("persisted review worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withReviewRunLock.mockImplementation(async (_id, work) => {
      await work();
      return true;
    });
    mocks.getReviewJob.mockResolvedValue({
      id: "run_1",
      userId: "user_1",
      status: "pending",
      manuscript: { title: "Long study", body: "文".repeat(12_000) },
      stageCheckpoints: {},
      stageUsage: {},
    });
    mocks.markReviewRunRunning.mockResolvedValue(undefined);
    mocks.markReviewRunProgress.mockResolvedValue(undefined);
    mocks.markReviewRunCompleted.mockResolvedValue(undefined);
    mocks.markReviewRunFailed.mockResolvedValue(undefined);
    mocks.recordReviewStageUsage.mockResolvedValue(undefined);
    mocks.saveReviewStageCheckpoint.mockResolvedValue(undefined);
  });

  it("runs and stores a manuscript longer than 10,000 characters", async () => {
    mocks.runReviewPipeline.mockImplementation(async (_manuscript, _provider, onProgress, options) => {
      await onProgress("manuscript-reader");
      await onProgress("final-reviewer");
      await options.onCheckpoint(
        "manuscript-reader",
        { agentId: "manuscript-reader" },
        {
          provider: "anthropic",
          model: "claude-opus-5",
          requestId: "req_1",
          inputTokens: 12_345,
          outputTokens: 456,
          cacheCreationInputTokens: 0,
          cacheReadInputTokens: 0,
          estimatedCostUsd: 0.073125,
        },
      );
      return {
        ok: true,
        result: { reviewId: "temporary", manuscriptTitle: "Long study", createdAt: "old" },
      };
    });

    await startReviewJob("run_1");

    expect(mocks.markReviewRunRunning).toHaveBeenCalledWith("run_1");
    expect(mocks.markReviewRunProgress).toHaveBeenNthCalledWith(1, "run_1", "manuscript-reader");
    expect(mocks.markReviewRunProgress).toHaveBeenNthCalledWith(2, "run_1", "final-reviewer");
    expect(mocks.saveReviewStageCheckpoint).toHaveBeenCalledWith(
      "run_1",
      "manuscript-reader",
      { agentId: "manuscript-reader" },
      expect.objectContaining({ requestId: "req_1", inputTokens: 12_345 }),
    );
    expect(mocks.markReviewRunCompleted).toHaveBeenCalledWith(
      "run_1",
      expect.objectContaining({ reviewId: "run_1", manuscriptTitle: "Long study" }),
    );
  });

  it("persists a typed agent failure for polling", async () => {
    mocks.runReviewPipeline.mockResolvedValue({
      ok: false,
      error: {
        agentId: "theory-auditor",
        error: { code: "provider_error", message: "Provider unavailable" },
        metadata: {
          provider: "anthropic",
          model: "claude-opus-5",
          requestId: "req_failed",
          inputTokens: 500,
          outputTokens: 10,
          cacheCreationInputTokens: 0,
          cacheReadInputTokens: 0,
          estimatedCostUsd: 0.00275,
        },
      },
    });

    await startReviewJob("run_1");

    expect(mocks.markReviewRunFailed).toHaveBeenCalledWith(
      "run_1",
      "provider_error",
      expect.any(Date),
      "theory-auditor failed: Provider unavailable",
    );
    expect(mocks.recordReviewStageUsage).toHaveBeenCalledWith(
      "run_1",
      "theory-auditor",
      expect.objectContaining({ requestId: "req_failed", outputTokens: 10 }),
    );
    expect(mocks.markReviewRunCompleted).not.toHaveBeenCalled();
  });

  it("fails safely if persisted input is missing", async () => {
    mocks.getReviewJob.mockResolvedValue({
      id: "run_1",
      userId: "user_1",
      status: "running",
      manuscript: null,
    });

    await startReviewJob("run_1");

    expect(mocks.runReviewPipeline).not.toHaveBeenCalled();
    expect(mocks.markReviewRunFailed).toHaveBeenCalledWith(
      "run_1",
      "input_missing",
      expect.any(Date),
      expect.stringContaining("missing"),
    );
  });
});
