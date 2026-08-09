import { describe, expect, it } from "vitest";
import { loginSchema, safeCallbackPath, signupSchema } from "./forms";

describe("email authentication forms", () => {
  it("accepts email signup with a name and sufficiently long password", () => {
    expect(
      signupSchema.safeParse({
        fullName: "Mina Patel",
        email: "mina@example.edu",
        password: "long-enough-password",
      }).success,
    ).toBe(true);
  });

  it("rejects a username-only signup and short passwords", () => {
    expect(
      signupSchema.safeParse({
        username: "mina",
        email: "mina@example.edu",
        password: "short",
      }).success,
    ).toBe(false);
  });

  it("validates email login input", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "secret" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "mina@example.edu", password: "secret" }).success).toBe(true);
  });
});

describe("post-authentication callback paths", () => {
  it("preserves local paths", () => {
    expect(safeCallbackPath("/review?draft=1")).toBe("/review?draft=1");
  });

  it("rejects absolute and protocol-relative redirects", () => {
    expect(safeCallbackPath("https://attacker.test/path")).toBe("/dashboard");
    expect(safeCallbackPath("//attacker.test/path")).toBe("/dashboard");
  });
});
