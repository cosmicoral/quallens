import { describe, expect, it } from "vitest";
import { finalReviewSchema } from "@/lib/types/final-review";
import { researchDesignAuditSchema } from "@/lib/types/research-design-audit";
import { toAnthropicOutputFormat } from "./anthropic";

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
});
