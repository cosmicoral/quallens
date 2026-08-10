import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import type { ResearcherProfile } from "@/lib/auth/profile";
import { AccountNav } from "./AccountNav";
import { SignOutButton } from "./SignOutButton";
import { StudioAttribution } from "@/components/StudioAttribution";
import "./account-workspace.css";

export function AccountShell({
  profile,
  children,
}: {
  profile: ResearcherProfile;
  children: ReactNode;
}) {
  return (
    <div className="account-shell min-h-screen">
      <header className="account-shell-header border-b backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" aria-label="Qualisapio dashboard" className="rounded-md focus-ring">
            <BrandMark compact />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold tracking-[-0.02em] text-[var(--ink)]">{profile.fullName}</p>
              <p className="max-w-56 truncate text-xs text-[var(--muted)]">
                {profile.email ?? profile.orcidId ?? "Researcher account"}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-8 lg:py-10">
        <aside className="flex flex-col gap-4 lg:gap-5">
          <AccountNav />

          <div className="account-mascot-card hidden overflow-hidden rounded-[1.15rem] border lg:block">
            <div className="relative aspect-[3/4] overflow-hidden bg-[var(--paper-warm)]">
              <Image
                src="/mascot/qualisapio-dashboard-campus.png"
                alt="Qualisapio scholarly cat mascot walking on a university campus"
                fill
                sizes="13.5rem"
                className="object-cover object-[center_28%] scale-[1.02]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(15,23,42,0.12)] to-transparent"
              />
            </div>
            <p className="account-mascot-caption border-t border-[var(--line)] px-3.5 py-3 text-center text-[9px] font-bold uppercase leading-relaxed text-[var(--blue-deep)]">
              Question · Uncover · Understand · Contribute
            </p>
          </div>

          <StudioAttribution className="hidden px-1 text-[11px] leading-5 text-[var(--muted)] lg:block" />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
