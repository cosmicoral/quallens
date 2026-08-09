import { z } from "zod";

export const loginSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(1, "Enter your password."),
  })
  .strict();

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Use no more than 128 characters."),
  })
  .strict();

export const profileFormSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.union([z.literal(""), z.string().trim().email()]),
    institution: z.string().trim().max(180),
    discipline: z.string().trim().max(180),
  })
  .strict();

export function safeCallbackPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  try {
    const parsed = new URL(value, "https://qualisapio.local");
    return parsed.origin === "https://qualisapio.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : "/dashboard";
  } catch {
    return "/dashboard";
  }
}
