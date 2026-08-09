import { describe, expect, it } from "vitest";
import { CONSULTATION_COPY, consultationMailtoHref } from "./copy";

describe("consultation copy", () => {
  it("builds the consultation mailto link with recipient and subject", () => {
    expect(consultationMailtoHref()).toBe(
      "mailto:coralhanyu@outlook.com?subject=Qualisapio%20Research%20Consultation&body=Hello%2C%0A%0AI%20would%20like%20to%20book%20a%20complimentary%2030-minute%20introductory%20consultation%20through%20Qualisapio.%0A%0AThank%20you.",
    );
  });

  it("includes requester details in the mailto body when provided", () => {
    const href = consultationMailtoHref({
      requesterName: "Ada Scholar",
      requesterEmail: "ada@example.com",
    });
    expect(href).toContain("mailto:coralhanyu@outlook.com?");
    expect(decodeURIComponent(href)).toContain("Name: Ada Scholar");
    expect(decodeURIComponent(href)).toContain("Email: ada@example.com");
  });

  it("keeps emphasized credibility signals in the shared copy", () => {
    const emphasized = CONSULTATION_COPY.credibility.filter(
      (item) => "emphasized" in item && item.emphasized,
    );
    expect(emphasized.map((item) => item.label)).toEqual([
      "PhD from a UK research university",
      "MA from a UK top-10 university",
      "Teaching experience at a world top-10 university",
    ]);
  });
});
