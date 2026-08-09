import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import type { ResearcherProfile } from "@/lib/auth/profile";
import { SignOutButton } from "./SignOutButton";

export function AccountShell({
  profile,
  children,
}: {
  profile: ResearcherProfile;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" aria-label="Qualisapio dashboard">
            <BrandMark compact />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[var(--ink)]">{profile.fullName}</p>
              <p className="max-w-56 truncate text-xs text-[var(--muted)]">
                {profile.email ?? profile.orcidId ?? "Researcher account"}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-7 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-10">
        <nav
          aria-label="Researcher workspace"
          className="flex gap-2 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white p-2 shadow-sm lg:block lg:h-fit lg:space-y-1 lg:p-3"
        >
          {[
            ["/dashboard", "Dashboard"],
            ["/review", "New review"],
            ["/pricing", "Plans"],
            ["/settings", "Settings"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="block shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--slate)] transition hover:bg-[var(--paper-blue)] hover:text-[var(--ink)]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
