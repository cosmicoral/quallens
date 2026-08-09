"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewResults } from "@/components/ReviewResults";
import { ResearchIcon } from "@/components/ResearchIcon";
import { SiteHeader } from "@/components/SiteHeader";
import type { ManuscriptInput, ReviewResponse, ReviewResult } from "@/lib/types";

export default function ReviewPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(manuscript: ManuscriptInput) {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manuscript),
      });
      const data: ReviewResponse = await res.json();
      if (!data.ok || !data.result) {
        setError(data.error ?? "The review failed. Please try again.");
      } else {
        setResult(data.result);
      }
    } catch {
      setError("Could not reach the review service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="section-shell py-10 sm:py-14 lg:py-16">
        <header className="mb-10 max-w-3xl sm:mb-12">
          <p className="eyebrow">Manuscript review workspace</p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">
            Submit a manuscript for a structured scholarly review.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--slate)] sm:text-lg">
            QualLens reads the manuscript in full, maps its reported research
            design, and audits major claims against the evidence presented.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
          <aside className="rounded-2xl border border-[var(--line)] bg-[var(--ink)] p-6 text-white lg:sticky lg:top-24">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue-light)]">
              What happens next
            </p>
            <ol className="space-y-6">
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="manuscript-reader" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Manuscript Reader</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Builds a validated profile without filling in missing information.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="evidence-auditor" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Evidence Auditor</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Checks claim wording, evidence type, distribution, and deviant cases.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="research-design-reviewer" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Research Design Reviewer</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Assesses design fit, transparency, reflexivity, and coherence.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[var(--blue-light)]">
                  <ResearchIcon name="theory-auditor" className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Theory Auditor</p>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Traces frameworks, concepts, integration, and conceptual drift.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-slate-300">
                  <ResearchIcon name="synthesize" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Specialist synthesis</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Overclaim and final review remain MVP outputs.
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
              Plain-text submission only. File upload and document parsing are not
              part of this MVP.
            </div>
          </aside>

          <div className="min-w-0">
            <ReviewForm onSubmit={handleSubmit} submitting={submitting} />

            {submitting && (
              <div
                role="status"
                aria-live="polite"
                className="mt-5 flex items-center gap-4 rounded-2xl border border-[var(--blue-soft)] bg-[var(--paper-blue)] p-5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[var(--blue)] shadow-sm">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5 animate-spin"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeOpacity="0.22"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    Reviewing the manuscript
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--slate)]">
                    Reading in context, then checking claims against the evidence.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
              >
                <p className="font-semibold">The review could not be completed.</p>
                <p className="mt-1 text-amber-900">{error}</p>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-16 scroll-mt-24 sm:mt-20">
            <ReviewResults result={result} />
          </div>
        )}
      </main>
    </div>
  );
}
