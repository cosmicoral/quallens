import { describe, expect, it } from "vitest";
import {
  internalOrcidEmail,
  isInternalOrcidEmail,
  mapOrcidProfile,
  mapResearcherIdentity,
} from "./identity";

const createdAt = new Date("2026-08-09T12:00:00.000Z");

describe("ORCID identity mapping", () => {
  it("preserves the ORCID iD and provider-supplied public name", () => {
    expect(
      mapOrcidProfile({
        sub: "https://orcid.org/0000-0002-1825-0097",
        given_name: "Jane",
        family_name: "Researcher",
      }),
    ).toEqual({
      id: "0000-0002-1825-0097",
      name: "Jane Researcher",
      email: internalOrcidEmail("0000-0002-1825-0097"),
      emailVerified: false,
    });
  });

  it("does not expose the internal non-deliverable address as profile email", () => {
    const identity = mapResearcherIdentity(
      {
        id: "user-orcid",
        name: "0000-0002-1825-0097",
        email: "0000-0002-1825-0097@orcid.invalid",
        createdAt,
      },
      [{ providerId: "orcid", accountId: "0000-0002-1825-0097" }],
    );

    expect(isInternalOrcidEmail("0000-0002-1825-0097@orcid.invalid")).toBe(true);
    expect(identity).toMatchObject({
      email: null,
      authProvider: "orcid",
      orcidId: "0000-0002-1825-0097",
    });
  });
});

describe("researcher provider mapping", () => {
  it("maps a Google identity without inventing profile fields", () => {
    const identity = mapResearcherIdentity(
      {
        id: "user-google",
        name: "Ada Lovelace",
        email: "ada@example.edu",
        createdAt,
      },
      [{ providerId: "google", accountId: "google-123" }],
    );

    expect(identity).toEqual({
      fullName: "Ada Lovelace",
      email: "ada@example.edu",
      authProvider: "google",
      orcidId: null,
      createdAt,
    });
  });

  it("maps an email/password account to the email provider", () => {
    const identity = mapResearcherIdentity(
      {
        id: "user-email",
        name: "Sam Scholar",
        email: "sam@example.edu",
        createdAt,
      },
      [{ providerId: "credential", accountId: "user-email" }],
    );

    expect(identity.authProvider).toBe("email");
    expect(identity.fullName).toBe("Sam Scholar");
    expect(identity.email).toBe("sam@example.edu");
  });
});
