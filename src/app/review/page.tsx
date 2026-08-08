"use client";

import { useState } from "react";
import Link from "next/link";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewResults } from "@/components/ReviewResults";
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <nav className="mb-10">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← QualLens
        </Link>
      </nav>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Review a manuscript
      </h1>
      <p className="mb-10 text-zinc-600 dark:text-zinc-400">
        Paste your manuscript below. The reviewer panel will return a
        structured assessment.{" "}
        <span className="text-zinc-500">
          (MVP: results are placeholder data.)
        </span>
      </p>

      <div className="mb-12">
        <ReviewForm onSubmit={handleSubmit} submitting={submitting} />
      </div>

      {error && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {result && <ReviewResults result={result} />}
    </main>
  );
}
