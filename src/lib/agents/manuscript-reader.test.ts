import { describe, expect, it } from "vitest";
import { readManuscript } from "./manuscript-reader";
import { FakeProvider } from "@/test/fake-provider";
import {
  expectedProfile,
  qualitativeManuscript,
} from "@/test/fixtures/qualitative-manuscript";

describe("readManuscript", () => {
  it("returns a validated profile wrapped in an AgentReview on success", async () => {
    const provider = new FakeProvider({ kind: "value", value: expectedProfile });

    const result = await readManuscript(qualitativeManuscript, provider);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.review.agentId).toBe("manuscript-reader");
    expect(result.review.profile).toEqual(expectedProfile);
    // The prompt contains the manuscript, not a summary of it
    expect(provider.lastRequest?.prompt).toContain(qualitativeManuscript.title);
    expect(provider.lastRequest?.prompt).toContain("You learn to read the room");
  });

  it("represents missing reflexivity and sampling information faithfully", async () => {
    // Profile of a manuscript that reports neither reflexivity nor sampling:
    // both fields are null AND both appear in missing_information — absence
    // is recorded, never paraphrased into content.
    const profileWithGaps = {
      ...expectedProfile,
      sampling_strategy: null,
      reflexivity_or_positionality: null,
      missing_information: [
        "sampling strategy",
        "reflexivity or positionality statement",
      ],
    };
    const provider = new FakeProvider({ kind: "value", value: profileWithGaps });

    const result = await readManuscript(qualitativeManuscript, provider);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const profile = result.review.profile!;
    expect(profile.sampling_strategy).toBeNull();
    expect(profile.reflexivity_or_positionality).toBeNull();
    expect(profile.missing_information).toContain("sampling strategy");
    expect(profile.missing_information).toContain(
      "reflexivity or positionality statement",
    );
    // The gaps surface as reviewable findings, flagged as methodologically
    // significant, and the comprehension summary mentions them.
    const findingTitles = result.review.findings.map((f) => f.title);
    expect(findingTitles).toContain("Not reported: sampling strategy");
    expect(findingTitles).toContain(
      "Not reported: reflexivity or positionality statement",
    );
    const missingFindings = result.review.findings.filter((f) =>
      f.title.startsWith("Not reported:"),
    );
    expect(missingFindings.every((f) => f.severity === "moderate")).toBe(true);
  });

  it("does not treat a merely-mentioned theory as operationalised", async () => {
    const provider = new FakeProvider({ kind: "value", value: expectedProfile });

    const result = await readManuscript(qualitativeManuscript, provider);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const framework = result.review.profile!.theoretical_framework[0];
    expect(framework.name).toMatch(/Hochschild/);
    expect(framework.operationalized_in_analysis).toBe("unclear");
    // And the reader's instructions actually demand that distinction.
    expect(provider.lastRequest?.system).toMatch(/necessarily operationalised/);
  });

  it("returns a typed invalid_output error when the model output fails validation", async () => {
    const malformed = { ...expectedProfile, main_findings: "two themes were found" };
    const provider = new FakeProvider({ kind: "value", value: malformed });

    const result = await readManuscript(qualitativeManuscript, provider);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("invalid_output");
    expect(result.error.message).toMatch(/schema/i);
  });

  it("propagates provider errors as typed errors", async () => {
    const provider = new FakeProvider({
      kind: "error",
      error: { code: "missing_api_key", message: "Set ANTHROPIC_API_KEY." },
    });

    const result = await readManuscript(qualitativeManuscript, provider);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("missing_api_key");
  });
});
