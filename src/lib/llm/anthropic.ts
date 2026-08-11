import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type {
  LLMProvider,
  LLMResponseMetadata,
  LLMResult,
  StructuredRequest,
} from "./types";
import { estimateTokenCostUsd } from "./pricing";

const DEFAULT_MODEL = "claude-opus-5";
const DEFAULT_MAX_TOKENS = 16000;

type AnthropicEffort = "low" | "medium" | "high" | "xhigh" | "max";

function resolveEffort(): AnthropicEffort {
  const effort = process.env.LLM_EFFORT?.trim().toLowerCase();
  return (["low", "medium", "high", "xhigh", "max"] as const).includes(
    effort as AnthropicEffort,
  ) ? effort as AnthropicEffort : "medium";
}

function responseMetadata(response: Anthropic.Message): LLMResponseMetadata {
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cacheCreationInputTokens = response.usage.cache_creation_input_tokens ?? 0;
  const cacheReadInputTokens = response.usage.cache_read_input_tokens ?? 0;
  const estimatedCostUsd = estimateTokenCostUsd(response.model, {
    inputTokens,
    outputTokens,
    cacheCreationInputTokens,
    cacheReadInputTokens,
  });
  const requestId = (response as Anthropic.Message & { _request_id?: string | null })._request_id;
  return {
    provider: "anthropic",
    model: response.model,
    requestId: requestId ?? response.id,
    inputTokens,
    outputTokens,
    cacheCreationInputTokens,
    cacheReadInputTokens,
    estimatedCostUsd,
  };
}

function resolveAnthropicApiKey(): string | undefined {
  const raw = process.env.ANTHROPIC_API_KEY?.trim();
  if (!raw) return undefined;
  if (
    (raw.startsWith('"') && raw.endsWith('"'))
    || (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1).trim() || undefined;
  }
  return raw;
}

export function toAnthropicOutputFormat<T>(schema: z.ZodType<T>) {
  // The SDK reuses repeated schemas through $ref and removes constraints that
  // Anthropic's grammar compiler does not support. The original Zod schema is
  // still used below to validate the completed response.
  return zodOutputFormat(schema);
}

/**
 * Anthropic implementation of the LLMProvider abstraction.
 *
 * Uses the structured-outputs API (`output_config.format`) with the Anthropic
 * SDK's Zod transformer, then validates the response against the original Zod
 * schema before returning it. Anything that can't be validated surfaces as a
 * typed LLMError — fields are never invented client-side.
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  readonly model: string;
  private client: Anthropic | null = null;

  constructor(model: string = process.env.LLM_MODEL ?? DEFAULT_MODEL) {
    this.model = model;
  }

  private getClient(): Anthropic {
    // Constructed lazily so importing this module (e.g. during `next build`)
    // never requires credentials.
    if (!this.client) {
      const apiKey = resolveAnthropicApiKey();
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is missing.");
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async generateStructured<T>(request: StructuredRequest<T>): Promise<LLMResult<T>> {
    let client: Anthropic;
    try {
      client = this.getClient();
    } catch (err) {
      // The SDK throws at construction when no credential can be resolved.
      return {
        ok: false,
        error: {
          code: "missing_api_key",
          message: `No Anthropic credentials found (set ANTHROPIC_API_KEY): ${
            err instanceof Error ? err.message : String(err)
          }`,
        },
      };
    }

    const outputFormat = toAnthropicOutputFormat(request.schema);

    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: this.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: request.system,
        messages: [{ role: "user", content: request.prompt }],
        output_config: {
          effort: resolveEffort(),
          format: outputFormat,
        },
      });
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        return {
          ok: false,
          error: {
            code: "missing_api_key",
            message:
              "Anthropic API authentication failed. Set ANTHROPIC_API_KEY in the environment.",
          },
        };
      }
      if (err instanceof Anthropic.APIError) {
        return {
          ok: false,
          error: {
            code: "provider_error",
            message: `Anthropic API error (${err.status ?? "network"}): ${err.message}`,
          },
        };
      }
      return {
        ok: false,
        error: {
          code: "provider_error",
          message: err instanceof Error ? err.message : String(err),
        },
      };
    }

    const metadata = responseMetadata(response);

    if (response.stop_reason === "refusal") {
      return {
        ok: false,
        error: {
          code: "refusal",
          message: "The model declined to process this manuscript.",
        },
        metadata,
      };
    }
    if (response.stop_reason === "max_tokens") {
      return {
        ok: false,
        error: {
          code: "invalid_output",
          message:
            "Model output was truncated (max_tokens reached) and cannot be validated.",
        },
        metadata,
      };
    }

    const text = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    )?.text;
    if (!text) {
      return {
        ok: false,
        error: { code: "invalid_output", message: "Model returned no text output." },
        metadata,
      };
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return {
        ok: false,
        error: {
          code: "invalid_output",
          message: "Model output was not valid JSON.",
        },
        metadata,
      };
    }

    const parsed = request.schema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: "invalid_output",
          message: `Model output failed schema validation: ${parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ")}`,
        },
        metadata,
      };
    }

    return { ok: true, value: parsed.data, metadata };
  }
}
