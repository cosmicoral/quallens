import { AnthropicProvider } from "./anthropic";
import type { LLMProvider } from "./types";

export type { LLMError, LLMErrorCode, LLMProvider, LLMResult, StructuredRequest } from "./types";
export { AnthropicProvider } from "./anthropic";

let defaultProvider: LLMProvider | null = null;

/**
 * Resolve the configured LLM provider.
 *
 * Selected via the LLM_PROVIDER env var (default "anthropic"); the model via
 * LLM_MODEL. Adding a provider means implementing LLMProvider and adding a
 * case here — no agent code changes.
 */
export function getLLMProvider(): LLMProvider {
  if (defaultProvider) return defaultProvider;

  const providerName = process.env.LLM_PROVIDER ?? "anthropic";
  switch (providerName) {
    case "anthropic":
      defaultProvider = new AnthropicProvider();
      return defaultProvider;
    default:
      throw new Error(
        `Unknown LLM_PROVIDER "${providerName}". Supported providers: anthropic.`,
      );
  }
}
