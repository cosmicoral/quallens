import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { LLMProvider, LLMResult, StructuredRequest } from "./types";

const DEFAULT_MODEL = "claude-opus-5";
const DEFAULT_MAX_TOKENS = 16000;

/**
 * Anthropic implementation of the LLMProvider abstraction.
 *
 * Uses the structured-outputs API (`output_config.format` with a JSON schema
 * derived from the request's Zod schema via zod v4's native converter — the
 * SDK's zodOutputFormat helper produces a $defs-heavy schema that overflows
 * the API's grammar compiler), then validates the response against the Zod
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
      this.client = new Anthropic();
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

    const jsonSchema = z.toJSONSchema(request.schema) as Record<string, unknown>;
    delete jsonSchema["$schema"];

    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: this.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: request.system,
        messages: [{ role: "user", content: request.prompt }],
        output_config: {
          format: { type: "json_schema", schema: jsonSchema },
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

    if (response.stop_reason === "refusal") {
      return {
        ok: false,
        error: {
          code: "refusal",
          message: "The model declined to process this manuscript.",
        },
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
      };
    }

    const text = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    )?.text;
    if (!text) {
      return {
        ok: false,
        error: { code: "invalid_output", message: "Model returned no text output." },
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
      };
    }

    return { ok: true, value: parsed.data };
  }
}
