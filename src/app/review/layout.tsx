import type { ReactNode } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ReviewLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/review");
  const profile = await getOrCreateResearcherProfile(session.user);
  return <AccountShell profile={profile}>{children}</AccountShell>;
}
