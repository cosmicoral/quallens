import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { ReviewResults } from "@/components/ReviewResults";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { requireSession } from "@/lib/auth/session";
import { getReviewRunForUser } from "@/lib/billing/repository";

export const dynamic = "force-dynamic";

export default async function DashboardReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession("/dashboard");
  const { id } = await params;
  const [profile, reviewRun] = await Promise.all([
    getOrCreateResearcherProfile(session.user),
    getReviewRunForUser(session.user.id, id),
  ]);

  if (!reviewRun || reviewRun.status !== "completed" || !reviewRun.result) {
    notFound();
  }

  const completedLabel = reviewRun.completedAt
    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
        reviewRun.completedAt,
      )
    : null;

  return (
    <AccountShell profile={profile}>
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--line)]/80 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-2">Review history</p>
          <h1 className="font-serif text-[2rem] font-semibold leading-[1.04] tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">
            {reviewRun.manuscriptTitle}
          </h1>
          {completedLabel && (
            <p className="mt-3 text-sm text-[var(--muted)]">Completed {completedLabel}</p>
          )}
          {reviewRun.targetJournal && (
            <p className="mt-1 text-sm text-[var(--slate)]">Target journal: {reviewRun.targetJournal}</p>
          )}
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-4 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:bg-[var(--paper-blue)]"
        >
          Back to dashboard
        </Link>
      </div>

      <ReviewResults result={reviewRun.result} />
    </AccountShell>
  );
}
