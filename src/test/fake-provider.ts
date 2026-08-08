import type { LLMProvider, LLMResult, StructuredRequest } from "@/lib/llm";

/**
 * Test double for the LLM provider abstraction.
 *
 * Returns a canned payload (validated against the request's schema, exactly
 * like a real provider must) or a canned typed error. Also records the last
 * request so tests can assert on the prompt.
 */
export class FakeProvider implements LLMProvider {
  readonly name = "fake";
  readonly model = "fake-model";
  lastRequest: StructuredRequest<unknown> | null = null;

  constructor(
    private readonly response:
      | { kind: "value"; value: unknown }
      | { kind: "error"; error: { code: LLMErrorCodeLike; message: string } },
  ) {}

  async generateStructured<T>(request: StructuredRequest<T>): Promise<LLMResult<T>> {
    this.lastRequest = request as StructuredRequest<unknown>;
    if (this.response.kind === "error") {
      return { ok: false, error: this.response.error };
    }
    // A real provider only ever returns schema-valid data; enforce the same
    // contract here so a fixture drifting out of sync fails loudly.
    const parsed = request.schema.safeParse(this.response.value);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: "invalid_output",
          message: `Fake payload failed schema validation: ${parsed.error.message}`,
        },
      };
    }
    return { ok: true, value: parsed.data };
  }
}

type LLMErrorCodeLike = "missing_api_key" | "refusal" | "invalid_output" | "provider_error";
