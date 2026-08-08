import type { ReviewResult, Severity, Verdict } from "@/lib/types";

const VERDICT_LABELS: Record<Verdict, string> = {
  accept: "Accept",
  "minor-revisions": "Minor revisions",
  "major-revisions": "Major revisions",
  reject: "Reject",
};

const VERDICT_STYLES: Record<Verdict, string> = {
  accept:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "minor-revisions":
    "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  "major-revisions":
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  reject: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const SEVERITY_STYLES: Record<Severity, string> = {
  minor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  moderate: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  major: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs font-medium dark:bg-zinc-800">
      {score}/5
    </span>
  );
}

export function ReviewResults({ result }: { result: ReviewResult }) {
  const { finalAssessment: final } = result;

  return (
    <div className="space-y-8">
      {/* Final assessment */}
      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Final assessment</h2>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${VERDICT_STYLES[final.verdict]}`}
          >
            {VERDICT_LABELS[final.verdict]}
          </span>
          <ScoreBadge score={final.overallScore} />
        </div>
        <p className="mb-6 text-zinc-700 dark:text-zinc-300">{final.summary}</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Strengths
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {final.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
              Weaknesses
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {final.weaknesses.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Recommended revisions
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            {final.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* Per-agent reviews */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Specialist reviews</h2>
        <div className="space-y-4">
          {result.agentReviews.map((review) => (
            <details
              key={review.agentId}
              className="group rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-5">
                <span className="font-medium">{review.agentName}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">
                    {review.findings.length} finding
                    {review.findings.length === 1 ? "" : "s"}
                  </span>
                  <ScoreBadge score={review.score} />
                </span>
              </summary>
              <div className="border-t border-zinc-200 p-5 dark:border-zinc-800">
                <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
                  {review.summary}
                </p>
                <ul className="space-y-3">
                  {review.findings.map((finding) => (
                    <li
                      key={finding.id}
                      className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900"
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITY_STYLES[finding.severity]}`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-sm font-medium">
                          {finding.title}
                        </span>
                        {finding.location && (
                          <span className="text-xs text-zinc-500">
                            ({finding.location})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {finding.detail}
                      </p>
                      {finding.recommendation && (
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            Suggestion:{" "}
                          </span>
                          {finding.recommendation}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
