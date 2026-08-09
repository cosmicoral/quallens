import type { ReactNode } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { PublicPricingShell } from "@/components/pricing/PublicPricingShell";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PricingLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    return <PublicPricingShell>{children}</PublicPricingShell>;
  }

  const profile = await getOrCreateResearcherProfile(session.user);
  return <AccountShell profile={profile}>{children}</AccountShell>;
}
