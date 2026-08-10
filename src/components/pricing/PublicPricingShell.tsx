import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ConsultationTrigger } from "@/components/consultation/ConsultationTrigger";
import { SiteFooter } from "@/components/SiteFooter";

export function PublicPricingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[92rem] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Qualisapio home">
            <BrandMark compact />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <ConsultationTrigger variant="link" className="hidden sm:inline-flex" />
            <span className="hidden text-[var(--muted)] lg:inline">Secure billing powered by Stripe</span>
            <Link href="/auth/login" className="font-semibold text-[var(--ink)] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </header>
      {children}
      <SiteFooter />
    </div>
  );
}
