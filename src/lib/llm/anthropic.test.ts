import { describe, expect, it, vi } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { finalReviewSchema } from "@/lib/types/final-review";
import { researchDesignAuditSchema } from "@/lib/types/research-design-audit";
import {
  AnthropicProvider,
  buildJsonFallbackSystemPrompt,
  isAnthropicSchemaComplexityError,
  parseStructuredJsonText,
  toAnthropicOutputFormat,
} from "./anthropic";

function hasProperty(value: unknown, key: string): boolean {
  if (!value || typeof value !== "object") return false;
  if (Object.prototype.hasOwnProperty.call(value, key)) return true;
  return Object.values(value).some((child) => hasProperty(child, key));
}

describe("Anthropic structured-output schema conversion", () => {
  it("reuses repeated research-design dimensions instead of inlining them", () => {
    const format = toAnthropicOutputFormat(researchDesignAuditSchema);
    const schema = JSON.stringify(format.schema);

    expect(schema).toContain("$ref");
    expect(schema.length).toBeLessThan(3_000);
  });

  it("removes unsupported array constraints from the final-review schema", () => {
    const format = toAnthropicOutputFormat(finalReviewSchema);

    expect(hasProperty(format.schema, "maxItems")).toBe(false);
  });

  it("recognizes Anthropic's internal grammar-size rejection", () => {
    expect(isAnthropicSchemaComplexityError({
      status: 400,
      message: "The compiled grammar is too large, which would cause performance issues.",
    })).toBe(true);
    expect(isAnthropicSchemaComplexityError({ status: 429, message: "Rate limited" })).toBe(false);
  });

  it("builds a compact non-grammar JSON contract while retaining schema validation fields", () => {
    const prompt = buildJsonFallbackSystemPrompt("Review carefully.", {
      type: "object",
      description: "large annotation",
      properties: { verdict: { type: "string", enum: ["accept", "reject"] } },
      required: ["verdict"],
      additionalProperties: false,
    });

    expect(prompt).toContain("Review carefully.");
    expect(prompt).toContain('"required":["verdict"]');
    expect(prompt).not.toContain("large annotation");
  });

  it("parses JSON returned with or without a Markdown fence", () => {
    expect(parseStructuredJsonText('{"ok":true}')).toEqual({ ok: true });
    expect(parseStructuredJsonText('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("retries without grammar constraints and still validates with Zod", async () => {
    const create = vi.fn()
      .mockRejectedValueOnce({
        status: 400,
        message: "The compiled grammar is too large, which would cause performance issues.",
      })
      .mockResolvedValueOnce({
        id: "msg_fallback",
        model: "claude-opus-test-fallback",
        stop_reason: "end_turn",
        content: [{ type: "text", text: '{"verdict":"accept"}' }],
        usage: { input_tokens: 100, output_tokens: 10 },
      });
    const client = { messages: { create } } as unknown as Anthropic;
    const provider = new AnthropicProvider("claude-opus-test-fallback", client);

    const result = await provider.generateStructured({
      system: "Return a verdict.",
      prompt: "Assess this manuscript.",
      schema: z.object({ verdict: z.enum(["accept", "reject"]) }).strict(),
    });

    expect(result).toMatchObject({ ok: true, value: { verdict: "accept" } });
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[0]?.[0].output_config.format).toBeDefined();
    expect(create.mock.calls[1]?.[0].output_config.format).toBeUndefined();
    expect(create.mock.calls[1]?.[0].system).toContain("<json_output_contract>");
  });
});
