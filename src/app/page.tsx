import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SiteHeader } from "@/components/SiteHeader";
import { ReviewerPanel } from "@/components/landing/ReviewerPanel";
import { RigorSection } from "@/components/landing/RigorSection";
import { Workflow } from "@/components/landing/Workflow";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="section-shell grid gap-12 py-12 sm:py-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--slate)] shadow-sm">
              <span className="size-1.5 rounded-full bg-[var(--blue)]" />
              Purpose-built for qualitative social science
            </div>

            <p className="eyebrow">AI-Powered Review for</p>
            <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.065em] text-[var(--ink)]">
              Qualitative
              <span className="block text-[var(--blue)]">Social Science</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[var(--slate)] sm:text-xl">
              Rigorous, evidence-aware feedback built around how qualitative
              researchers actually reason.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/review"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-[var(--navy)]"
              >
                Review a manuscript
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-5 py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--slate-soft)] hover:bg-[var(--paper)]"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-10 border-t border-[var(--line)] pt-5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                Evidence <span className="mx-2 text-[var(--line-strong)]">·</span>
                Methods <span className="mx-2 text-[var(--line-strong)]">·</span>
                Theory <span className="mx-2 text-[var(--line-strong)]">·</span>
                Claims
              </p>
            </div>
          </div>

          <figure className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[var(--paper-warm)] shadow-[0_32px_80px_rgba(15,23,42,0.16)]">
            <div className="relative aspect-[4/3] min-h-[360px] sm:min-h-[500px] lg:min-h-[610px]">
              <Image
                src="/mascot/quallens-hero.png"
                alt="The QualLens spotted white kitten reviewing an annotated manuscript in a scholarly office"
                fill
                sizes="(max-width: 1024px) 100vw, 56vw"
                className="object-cover object-center"
                preload
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(15,23,42,0.9)] via-[rgba(15,23,42,0.35)] to-transparent px-5 pt-20 pb-5 sm:px-7 sm:pb-7">
                <p className="text-lg font-semibold tracking-[-0.02em] text-white">
                  Rigorous. Fair. Constructive.
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  See the study. Strengthen the science.
                </p>
              </div>
            </div>
          </figure>
        </section>

        <ReviewerPanel />
        <Workflow />
        <RigorSection />

        <section className="section-shell pb-24 sm:pb-28">
          <div className="grid gap-8 rounded-[2rem] border border-[var(--line)] bg-[var(--paper-warm)] px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14">
            <div>
              <p className="eyebrow">A more disciplined first review</p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">
                Bring your manuscript. Keep your uncertainty.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--slate)]">
                Get structured feedback that respects qualitative evidence,
                methodological context, and the limits of what a study can claim.
              </p>
            </div>
            <Link
              href="/review"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--blue)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--blue-deep)]"
            >
              Review a manuscript <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] bg-white">
        <div className="section-shell flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark compact />
          <p className="text-xs text-[var(--muted)]">
            AI-powered review for qualitative social science.
          </p>
        </div>
      </footer>
    </div>
  );
}
