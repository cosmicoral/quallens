import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { PricingPlans } from "@/components/billing/PricingPlans";
import pricingMascot from "../../../public/mascot/qualisapio-pricing.png";

export const metadata = {
  title: "Pricing — Qualisapio",
  description: "Choose a Qualisapio review allowance for your qualitative research workflow.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[92rem] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Qualisapio home"><BrandMark compact /></Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-[var(--muted)] sm:inline">Secure billing powered by Stripe</span>
            <Link href="/dashboard" className="font-semibold text-[var(--ink)] hover:underline">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[92rem] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <div className="grid gap-10 xl:grid-cols-[23rem_minmax(0,1fr)] xl:items-start">
          <section className="xl:sticky xl:top-8">
            <p className="eyebrow">Transparent research pricing</p>
            <h1 className="max-w-md font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-[var(--ink)] sm:text-6xl">
              Choose the plan that fits your research.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-[var(--slate)]">
              Every plan uses the same six-agent review. Paid plans increase only the number of successful reviews you can run each month.
            </p>
            <div className="mt-8 hidden overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.1)] xl:block">
              <div className="relative aspect-[1402/1122]">
                <Image src={pricingMascot} alt="Qualisapio scholarly kitten in a navy blazer at a research desk" fill className="object-cover" sizes="23rem" priority />
              </div>
              <div className="border-t border-white/10 bg-[var(--ink)] p-4 text-sm leading-6 text-white">
                One complete review brings together evidence, design, theory, claim scope, and final synthesis.
              </div>
            </div>
          </section>

          <section aria-label="Qualisapio plans"><PricingPlans /></section>
        </div>

        <section className="mt-12 grid gap-6 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm md:grid-cols-3 md:p-8">
          <div><h2 className="font-semibold text-[var(--ink)]">What counts as a review?</h2><p className="mt-2 text-sm leading-6 text-[var(--slate)]">A successful full six-agent analysis and final synthesis. Provider or technical failures are released.</p></div>
          <div><h2 className="font-semibold text-[var(--ink)]">How do annual limits reset?</h2><p className="mt-2 text-sm leading-6 text-[var(--slate)]">Annual subscriptions are billed yearly, while the review allowance resets monthly on the first day of each UTC calendar month.</p></div>
          <div><h2 className="font-semibold text-[var(--ink)]">Can I change plans?</h2><p className="mt-2 text-sm leading-6 text-[var(--slate)]">Use the secure Stripe Customer Portal to manage or cancel an existing subscription.</p></div>
        </section>
      </main>
    </div>
  );
}
