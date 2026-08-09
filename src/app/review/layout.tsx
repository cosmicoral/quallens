import type { ReactNode } from "react";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ReviewLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/review");
  await getOrCreateResearcherProfile(session.user);
  return children;
}
