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
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900";

interface ReviewFormProps {
  onSubmit: (manuscript: ManuscriptInput) => void;
  submitting: boolean;
}

export function ReviewForm({ onSubmit, submitting }: ReviewFormProps) {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [body, setBody] = useState("");
  const [methodology, setMethodology] = useState<Methodology>("interviews");
  const [discipline, setDiscipline] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title,
      abstract: abstract || undefined,
      body,
      methodology,
      discipline: discipline || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Manuscript title"
          className={inputClasses}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="methodology"
            className="mb-1.5 block text-sm font-medium"
          >
            Methodology
          </label>
          <select
            id="methodology"
            value={methodology}
            onChange={(e) => setMethodology(e.target.value as Methodology)}
            className={inputClasses}
          >
            {METHODOLOGIES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="discipline"
            className="mb-1.5 block text-sm font-medium"
          >
            Discipline
          </label>
          <input
            id="discipline"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            placeholder="e.g. sociology"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="abstract" className="mb-1.5 block text-sm font-medium">
          Abstract
        </label>
        <textarea
          id="abstract"
          rows={3}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Paste the abstract (optional)"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium">
          Manuscript text <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          required
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Paste the full manuscript text"
          className={`${inputClasses} font-mono text-xs leading-relaxed`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Reviewing…" : "Run review"}
      </button>
    </form>
  );
}
