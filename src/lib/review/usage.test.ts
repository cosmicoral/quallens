import { describe, expect, it } from "vitest";
import { summarizeReviewUsage } from "./usage";

describe("review usage summary", () => {
  it("sums completed stages in pipeline order", () => {
    const summary = summarizeReviewUsage({
      "evidence-auditor": {
        provider: "anthropic",
        model: "claude-opus-5",
        requestId: "req_evidence",
        inputTokens: 2_000,
        outputTokens: 200,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
        estimatedCostUsd: 0.015,
      },
      "manuscript-reader": {
        provider: "anthropic",
        model: "claude-opus-5",
        requestId: "req_reader",
        inputTokens: 1_000,
        outputTokens: 100,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
        estimatedCostUsd: 0.0075,
      },
    });

    expect(summary).toMatchObject({
      inputTokens: 3_000,
      outputTokens: 300,
      estimatedCostUsd: 0.0225,
    });
    expect(summary.stages.map((stage) => stage.stage)).toEqual([
      "manuscript-reader",
      "evidence-auditor",
    ]);
  });
});
