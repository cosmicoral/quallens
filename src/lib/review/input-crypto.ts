import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { ManuscriptInput } from "@/lib/types";

interface EncryptedManuscript {
  v: 1;
  algorithm: "aes-256-gcm";
  iv: string;
  tag: string;
  ciphertext: string;
}

function encryptionKey() {
  const secret = process.env.REVIEW_INPUT_ENCRYPTION_KEY?.trim()
    || process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("REVIEW_INPUT_ENCRYPTION_KEY or BETTER_AUTH_SECRET is required.");
  }
  return createHash("sha256").update(secret, "utf8").digest();
}

function isEncryptedManuscript(value: unknown): value is EncryptedManuscript {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<EncryptedManuscript>;
  return payload.v === 1
    && payload.algorithm === "aes-256-gcm"
    && typeof payload.iv === "string"
    && typeof payload.tag === "string"
    && typeof payload.ciphertext === "string";
}

export function encryptManuscript(manuscript: ManuscriptInput): EncryptedManuscript {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(manuscript), "utf8"),
    cipher.final(),
  ]);
  return {
    v: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  };
}

export function decryptManuscript(payload: unknown): ManuscriptInput {
  if (!isEncryptedManuscript(payload)) {
    throw new Error("Stored manuscript input is not a supported encrypted payload.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(payload.iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(plaintext) as ManuscriptInput;
}
