import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";
import { OrcidBadge } from "@/components/account/OrcidBadge";
import { UsageSummary } from "@/components/billing/UsageSummary";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { requireSession } from "@/lib/auth/session";
import { getUsageView, listRecentReviewRuns } from "@/lib/billing/repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await requireSession("/dashboard");
  const [profile, usage, recentReviews, params] = await Promise.all([
    getOrCreateResearcherProfile(session.user),
    getUsageView(session.user.id),
    listRecentReviewRuns(session.user.id),
    searchParams,
  ]);

  return (
    <AccountShell profile={profile}>
      <div className="flex flex-col justify-between gap-6 border-b border-[var(--line)]/80 pb-8 sm:flex-row sm:items-end sm:gap-8">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">Researcher dashboard</p>
          <h1 className="font-serif text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--ink)] sm:text-[2.65rem]">
            Welcome, {profile.fullName}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--slate)]">
            Run peer review as an author or reviewer, or reopen past reports from your dashboard.
          </p>
        </div>
        <Link
          href="/review"
          className="account-primary-button inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ink)] px-5 text-sm font-semibold text-white hover:bg-[var(--navy)]"
        >
          New peer review
        </Link>
      </div>

      {params.checkout === "success" && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-sky-200/90 bg-sky-50/90 px-4 py-3 text-sm leading-6 text-sky-900 shadow-sm"
        >
          Checkout returned successfully. Your plan updates after Stripe confirms payment; refresh shortly if it still shows Free.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.42fr)_minmax(17.5rem,0.58fr)] lg:gap-7">
        <section className="account-card account-card--primary rounded-[1.25rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)]/70 pb-5">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
                Peer-review history
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                Reopen completed peer-review reports or track recent runs.
              </p>
            </div>
          </div>
          {recentReviews.length === 0 ? (
            <div className="dashboard-empty-state mt-7 rounded-[1.15rem] border border-[var(--line)] px-6 py-14 text-center sm:px-10 sm:py-16">
              <div
                className="dashboard-empty-icon mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--blue-soft)] bg-white font-serif text-2xl font-semibold text-[var(--blue-deep)]"
                aria-hidden="true"
              >
                Q
              </div>
              <p className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">No reviews yet</p>
              <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-[var(--slate)]">
                Submit a qualitative manuscript to create your first peer-review report—as an author or reviewer.
              </p>
              <Link
                href="/review"
                className="dashboard-empty-link mt-6 inline-flex items-center rounded-full border border-[var(--blue-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--blue-deep)] hover:bg-[var(--paper-blue)]"
              >
                Start a peer review
              </Link>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-[var(--line)]/80">
              {recentReviews.map((review) => {
                const dateLabel = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
                  review.completedAt ?? review.startedAt,
                );
                const canOpen = review.status === "completed" && review.hasStoredResult;
                return (
                  <li key={review.id} className="py-4 first:pt-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {canOpen ? (
                          <Link
                            href={`/dashboard/reviews/${review.id}`}
                            className="truncate text-sm font-semibold text-[var(--ink)] transition hover:text-[var(--blue-deep)] hover:underline"
                          >
                            {review.manuscriptTitle}
                          </Link>
                        ) : (
                          <p className="truncate text-sm font-semibold text-[var(--ink)]">
                            {review.manuscriptTitle}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {review.status === "completed" ? "Completed" : "Started"} {dateLabel}
                          {review.targetJournal ? ` · ${review.targetJournal}` : ""}
                        </p>
                        {review.status === "completed" && !review.hasStoredResult && (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Result not stored for this run.
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          review.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : review.status === "failed"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-5 lg:space-y-6">
          <section className="account-card rounded-[1.15rem] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Account identity
            </p>
            <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">{profile.fullName}</p>
            <p className="mt-1.5 break-words text-sm leading-6 text-[var(--slate)]">
              {profile.email ?? "No public email supplied by ORCID"}
            </p>
            <p className="account-identity-badge mt-4 inline-flex rounded-full px-3 py-1 text-xs capitalize text-[var(--slate-soft)]">
              Signed up with {profile.authProvider}
            </p>
            {profile.orcidId && (
              <div className="mt-4">
                <OrcidBadge orcidId={profile.orcidId} />
              </div>
            )}
          </section>

          <UsageSummary usage={usage} compact />
        </div>
      </div>
    </AccountShell>
  );
}
