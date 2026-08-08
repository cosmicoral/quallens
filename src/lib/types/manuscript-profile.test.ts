import { describe, expect, it } from "vitest";
import { manuscriptProfileSchema } from "./manuscript-profile";
import { expectedProfile } from "@/test/fixtures/qualitative-manuscript";

describe("manuscriptProfileSchema", () => {
  it("accepts a complete, valid profile", () => {
    const result = manuscriptProfileSchema.safeParse(expectedProfile);
    expect(result.success).toBe(true);
  });

  it("rejects a profile with a missing required field", () => {
    const { research_topic: _dropped, ...withoutTopic } = expectedProfile;
    const result = manuscriptProfileSchema.safeParse(withoutTopic);
    expect(result.success).toBe(false);
  });

  it("rejects wrong types instead of coercing them", () => {
    const result = manuscriptProfileSchema.safeParse({
      ...expectedProfile,
      research_questions: "how do volunteers manage emotions?", // must be array
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown extra fields (strict schema — no invented fields)", () => {
    const result = manuscriptProfileSchema.safeParse({
      ...expectedProfile,
      reviewer_verdict: "accept", // not part of the profile
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid enum values on evidence_type", () => {
    const result = manuscriptProfileSchema.safeParse({
      ...expectedProfile,
      main_findings: [{ finding: "x", evidence_type: "hearsay" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts nulls for absent information", () => {
    const result = manuscriptProfileSchema.safeParse({
      ...expectedProfile,
      qualitative_approach: null,
      reflexivity_or_positionality: null,
      ethical_information: null,
      sample_size: { as_stated: null, numeric: null },
    });
    expect(result.success).toBe(true);
  });

  it("preserves hedged sample sizes without forcing a number", () => {
    const result = manuscriptProfileSchema.safeParse({
      ...expectedProfile,
      sample_size: { as_stated: "approximately 20 participants", numeric: null },
    });
    expect(result.success).toBe(true);
  });
});
