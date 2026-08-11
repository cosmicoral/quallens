import { describe, expect, it } from "vitest";
import { estimateTokenCostUsd } from "./pricing";

describe("Claude token cost estimate", () => {
  it("matches Opus 5 usage reporting", () => {
    expect(estimateTokenCostUsd(
      "claude-opus-5",
      { inputTokens: 15_247, outputTokens: 77 },
      {},
    )).toBeCloseTo(0.07816, 6);
  });

  it("honors explicit price overrides", () => {
    expect(estimateTokenCostUsd(
      "custom-model",
      { inputTokens: 1_000_000, outputTokens: 1_000_000 },
      {
        LLM_INPUT_COST_PER_MILLION_USD: "2",
        LLM_OUTPUT_COST_PER_MILLION_USD: "10",
      },
    )).toBe(12);
  });
});
