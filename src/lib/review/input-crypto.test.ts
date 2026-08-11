import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { decryptManuscript, encryptManuscript } from "./input-crypto";

const originalKey = process.env.REVIEW_INPUT_ENCRYPTION_KEY;

describe("temporary manuscript encryption", () => {
  beforeEach(() => {
    process.env.REVIEW_INPUT_ENCRYPTION_KEY = "test-only-secret-with-at-least-32-characters";
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.REVIEW_INPUT_ENCRYPTION_KEY;
    else process.env.REVIEW_INPUT_ENCRYPTION_KEY = originalKey;
  });

  it("round-trips a long Unicode manuscript without storing plaintext", () => {
    const manuscript = {
      title: "长期田野研究",
      body: `开头-${"访谈与田野材料".repeat(2_000)}-结尾`,
      methodology: "ethnography" as const,
    };
    const encrypted = encryptManuscript(manuscript);

    expect(JSON.stringify(encrypted)).not.toContain("长期田野研究");
    expect(JSON.stringify(encrypted)).not.toContain("访谈与田野材料");
    expect(decryptManuscript(encrypted)).toEqual(manuscript);
  });

  it("rejects a modified authenticated payload", () => {
    const encrypted = encryptManuscript({ title: "Study", body: "Evidence" });
    const tampered = { ...encrypted, ciphertext: `${encrypted.ciphertext.slice(0, -1)}A` };
    expect(() => decryptManuscript(tampered)).toThrow();
  });
});
