"use client";

import { useState } from "react";
import type { ManuscriptInput, Methodology } from "@/lib/types";

const METHODOLOGIES: { value: Methodology; label: string }[] = [
  { value: "interviews", label: "Interviews" },
  { value: "ethnography", label: "Ethnography" },
  { value: "focus-groups", label: "Focus groups" },
  { value: "case-study", label: "Case study" },
  { value: "grounded-theory", label: "Grounded theory" },
  { value: "discourse-analysis", label: "Discourse analysis" },
  { value: "mixed-methods", label: "Mixed methods" },
  { value: "other", label: "Other" },
];

const inputClasses =
  "w-full rounded-xl border border-[var(--line-strong)] bg-white px-4 py-3 text-sm text-[var(--ink)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[var(--blue)] focus:ring-4 focus:ring-sky-100";

interface ReviewFormProps {
  onSubmit: (manuscript: ManuscriptInput) => void;
  submitting: boolean;
  disabled?: boolean;
}

export function ReviewForm({ onSubmit, submitting, disabled = false }: ReviewFormProps) {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [body, setBody] = useState("");
  const [methodology, setMethodology] = useState<Methodology>("interviews");
  const [discipline, setDiscipline] = useState("");
  const [targetJournal, setTargetJournal] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title,
      abstract: abstract || undefined,
      body,
      methodology,
      discipline: discipline || undefined,
      targetJournal: targetJournal.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]"
    >
      <div className="border-b border-[var(--line)] bg-[var(--paper-warm)] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-white bg-white/80 text-[var(--ink)] shadow-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
              <path
                d="M6 3.5h9l3 3V20.5H6zM15 3.5v3h3M9 11h6M9 14.5h6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
              Manuscript details
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--slate)]">
              Paste the manuscript as submitted to a journal—for author revision or
              reviewer assessment. Optional metadata preserves disciplinary context.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-8">
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <label htmlFor="title" className="text-sm font-semibold text-[var(--ink)]">
              Manuscript title <span className="text-[var(--amber)]">*</span>
            </label>
            <span className="text-xs text-[var(--muted)]">Required</span>
          </div>
          <input
            id="title"
            required
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the full manuscript title"
            className={inputClasses}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="methodology"
              className="mb-2 block text-sm font-semibold text-[var(--ink)]"
            >
              Methodological tradition
            </label>
            <select
              id="methodology"
              value={methodology}
              onChange={(e) => setMethodology(e.target.value as Methodology)}
              className={inputClasses}
            >
              {METHODOLOGIES.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="discipline"
              className="mb-2 block text-sm font-semibold text-[var(--ink)]"
            >
              Discipline or field
            </label>
            <input
              id="discipline"
              autoComplete="off"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              placeholder="e.g. sociology, anthropology"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <label htmlFor="targetJournal" className="text-sm font-semibold text-[var(--ink)]">
              Target journal
            </label>
            <span className="text-xs text-[var(--muted)]">Optional</span>
          </div>
          <input
            id="targetJournal"
            autoComplete="off"
            value={targetJournal}
            onChange={(e) => setTargetJournal(e.target.value)}
            placeholder="e.g. Qualitative Research, American Sociological Review"
            className={inputClasses}
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Saved with your review for history. Journal-aware guidance is planned; the current
            review still focuses on the manuscript itself.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <label htmlFor="abstract" className="text-sm font-semibold text-[var(--ink)]">
              Abstract
            </label>
            <span className="text-xs text-[var(--muted)]">Optional</span>
          </div>
          <textarea
            id="abstract"
            rows={4}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Paste the abstract exactly as written"
            className={`${inputClasses} resize-y leading-6`}
          />
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="body" className="text-sm font-semibold text-[var(--ink)]">
              Full manuscript text <span className="text-[var(--amber)]">*</span>
            </label>
            <span className="font-mono text-[11px] text-[var(--muted)]">
              {body.length.toLocaleString()} characters
            </span>
          </div>
          <textarea
            id="body"
            required
            rows={18}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste the full manuscript, including methods, findings, discussion, and references where available."
            className={`${inputClasses} min-h-[28rem] resize-y font-mono text-[13px] leading-6`}
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Include quotations, fieldnotes, tables described in text, and deviant
            cases so evidence support can be assessed faithfully.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-[var(--line)] bg-[var(--paper)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="max-w-md text-xs leading-5 text-[var(--muted)]">
          QualiSapio supports authors and reviewers with peer-review feedback only—it
          records missing information as missing and does not invent evidence or rewrite
          the manuscript.
        </p>
        <button
          type="submit"
          disabled={submitting || disabled}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--blue)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--blue-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Reviewing manuscript
            </>
          ) : disabled ? (
            "Review allowance unavailable"
          ) : (
            <>
              Run peer review <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
