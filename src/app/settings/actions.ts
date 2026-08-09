"use server";

import { redirect } from "next/navigation";
import { profileFormSchema } from "@/lib/auth/forms";
import { updateResearcherProfile } from "@/lib/auth/profile";
import { requireSession } from "@/lib/auth/session";

export async function saveProfile(formData: FormData) {
  const parsed = profileFormSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    institution: String(formData.get("institution") ?? ""),
    discipline: String(formData.get("discipline") ?? ""),
  });

  if (!parsed.success) {
    redirect("/settings?error=profile");
  }

  const session = await requireSession("/settings");
  await updateResearcherProfile(session.user.id, {
    fullName: parsed.data.fullName,
    email: parsed.data.email || null,
    institution: parsed.data.institution || null,
    discipline: parsed.data.discipline || null,
  });
  redirect("/settings?saved=1");
}
