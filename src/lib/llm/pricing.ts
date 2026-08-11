interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
}

function numericEnvironment(
  environment: Record<string, string | undefined>,
  key: string,
  fallback: number,
) {
  const value = Number(environment[key]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/** Estimate direct Claude API token cost; environment overrides keep pricing configurable. */
export function estimateTokenCostUsd(
  model: string,
  usage: TokenUsage,
  environment: Record<string, string | undefined> = process.env,
) {
  const defaults = model.includes("opus")
    ? { input: 5, output: 25 }
    : model.includes("sonnet")
      ? { input: 3, output: 15 }
      : { input: 1, output: 5 };
  const input = numericEnvironment(
    environment,
    "LLM_INPUT_COST_PER_MILLION_USD",
    defaults.input,
  );
  const output = numericEnvironment(
    environment,
    "LLM_OUTPUT_COST_PER_MILLION_USD",
    defaults.output,
  );
  const cacheCreation = numericEnvironment(
    environment,
    "LLM_CACHE_WRITE_COST_PER_MILLION_USD",
    input * 1.25,
  );
  const cacheRead = numericEnvironment(
    environment,
    "LLM_CACHE_READ_COST_PER_MILLION_USD",
    input * 0.1,
  );
  return (
    usage.inputTokens * input
    + usage.outputTokens * output
    + (usage.cacheCreationInputTokens ?? 0) * cacheCreation
    + (usage.cacheReadInputTokens ?? 0) * cacheRead
  ) / 1_000_000;
}
