import type { ZodType } from "zod";

/**
 * Provider-agnostic LLM abstraction.
 *
 * Agents depend only on this interface, so the provider/model can be swapped
 * (or faked in tests) without touching agent code.
 */

export type LLMErrorCode =
  /** No usable credentials for the provider. */
  | "missing_api_key"
  /** The provider's safety layer declined the request. */
  | "refusal"
  /** The model's output failed schema validation or was truncated. */
  | "invalid_output"
  /** Any other provider/network error. */
  | "provider_error";

export interface LLMError {
  code: LLMErrorCode;
  message: string;
}

export interface LLMResponseMetadata {
  provider: string;
  model: string;
  requestId?: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  estimatedCostUsd: number;
}

export type LLMResult<T> =
  | { ok: true; value: T; metadata?: LLMResponseMetadata }
  | { ok: false; error: LLMError; metadata?: LLMResponseMetadata };

export interface StructuredRequest<T> {
  /** System prompt. */
  system: string;
  /** User-turn prompt. */
  prompt: string;
  /** Zod schema the output must validate against. */
  schema: ZodType<T>;
  /** Max output tokens (provider default if omitted). */
  maxTokens?: number;
}

export interface LLMProvider {
  /** e.g. "anthropic" */
  readonly name: string;
  /** Model identifier in the provider's namespace. */
  readonly model: string;
  /**
   * Generate output that strictly conforms to `request.schema`.
   * Never throws for expected failure modes — returns a typed LLMError.
   */
  generateStructured<T>(request: StructuredRequest<T>): Promise<LLMResult<T>>;
}
