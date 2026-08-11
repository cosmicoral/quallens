import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { hasUnlimitedReviewAccess } from "./unlimited-access";

describe("unlimited review allowlist", () => {
  it("matches stable user IDs case-insensitively", () => {
    expect(hasUnlimitedReviewAccess(
      { userId: "OWNER_123" },
      { UNLIMITED_REVIEW_USER_IDS: "tester_1, owner_123" },
    )).toBe(true);
  });

  it("requires allowlisted emails to be verified", () => {
    const environment = {
      UNLIMITED_REVIEW_EMAILS: "owner@example.com",
    };
    expect(hasUnlimitedReviewAccess(
      { userId: "user_1", email: "OWNER@example.com", emailVerified: true },
      environment,
    )).toBe(true);
    expect(hasUnlimitedReviewAccess(
      { userId: "user_1", email: "owner@example.com", emailVerified: false },
      environment,
    )).toBe(false);
  });

  it("does not grant access to similar addresses", () => {
    expect(hasUnlimitedReviewAccess(
      { userId: "user_1", email: "owner+other@example.com", emailVerified: true },
      { UNLIMITED_REVIEW_EMAILS: "owner@example.com" },
    )).toBe(false);
  });
});
