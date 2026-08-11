import Image from "next/image";
import { PricingPlans } from "@/components/billing/PricingPlans";
import "@/components/pricing/pricing.css";
import pricingMascot from "../../../public/mascot/qualisapio-pricing.png";

export const metadata = {
  title: "Pricing — QualiSapio",
  description: "Peer-review plans for authors and reviewers working on qualitative manuscripts.",
};

export default function PricingPage() {
  return (
    <main className="pricing-page mx-auto max-w-[92rem] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
      <div className="pricing-layout grid gap-8 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:items-start xl:gap-10">
        <section className="pricing-hero xl:sticky xl:top-8">
          <p className="eyebrow">Peer-review pricing</p>
          <h1 className="pricing-hero-title max-w-md font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-[var(--ink)] sm:text-6xl">
            Choose the plan that fits your author or reviewer workflow.
          </h1>
          <p className="pricing-hero-copy mt-6 max-w-sm text-base leading-7 text-[var(--slate)]">
            Every plan runs the same six-reviewer panel—for pre-submission revision or
            reviewer assistance. Paid plans increase only the number of successful reviews each month.
          </p>
          <div className="pricing-hero-art mt-8 hidden overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.1)] xl:block">
            <div className="relative aspect-[1402/1122]">
              <Image
                src={pricingMascot}
                alt="QualiSapio scholarly kitten in a navy blazer at a research desk"
                fill
                className="object-cover"
                sizes="20rem"
                priority
              />
            </div>
            <div className="border-t border-white/10 bg-[var(--ink)] p-4 text-sm leading-6 text-white">
              One complete peer review brings together evidence, design, theory, claim scope, and final synthesis.
            </div>
          </div>
        </section>

        <section aria-label="QualiSapio plans" className="pricing-plans-section min-w-0">
          <p className="pricing-plans-eyebrow eyebrow mb-5">Peer-review plans</p>
          <PricingPlans />
        </section>
      </div>

      <section className="mt-10 grid gap-6 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm md:grid-cols-3 md:p-8 xl:mt-12">
        <div>
          <h2 className="font-semibold text-[var(--ink)]">What counts as a peer review?</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
            A successful full six-reviewer analysis and final synthesis report. Provider or technical failures are released.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[var(--ink)]">How do annual limits reset?</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
            Annual subscriptions are billed yearly, while the review allowance resets monthly on the first day of each UTC calendar month.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[var(--ink)]">Can I change plans?</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
            Use the secure Stripe Customer Portal to manage or cancel an existing subscription.
          </p>
        </div>
      </section>
    </main>
  );
}
