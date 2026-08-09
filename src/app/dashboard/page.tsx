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
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Researcher dashboard</p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
            Welcome, {profile.fullName}
          </h1>
          <p className="mt-3 text-[var(--slate)]">
            Begin a new structured review or return to your researcher profile.
          </p>
        </div>
        <Link
          href="/review"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ink)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--navy)]"
        >
          New manuscript review
        </Link>
      </div>

      {params.checkout === "success" && (
        <p role="status" className="mt-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Checkout returned successfully. Your plan updates after Stripe confirms payment; refresh shortly if it still shows Free.
        </p>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.025em] text-[var(--ink)]">
                Recent reviews
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Your completed reviews will appear here.</p>
            </div>
          </div>
          {recentReviews.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--paper)] px-6 py-12 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--paper-blue)] text-xl text-[var(--blue-deep)]" aria-hidden="true">
              Q
            </div>
            <p className="mt-4 font-semibold text-[var(--ink)]">No reviews yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--slate)]">
              Submit a qualitative manuscript to create your first evidence-aware review.
            </p>
            <Link href="/review" className="mt-5 inline-flex text-sm font-semibold text-[var(--blue-deep)] hover:underline">
              Start a review
            </Link>
          </div> : (
            <ul className="mt-5 divide-y divide-[var(--line)]">
              {recentReviews.map((review) => (
                <li key={review.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ink)]">{review.manuscriptTitle}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Started {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(review.startedAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${review.status === "completed" ? "bg-emerald-50 text-emerald-700" : review.status === "failed" ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-700"}`}>
                    {review.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Account identity</p>
            <p className="mt-3 text-lg font-semibold text-[var(--ink)]">{profile.fullName}</p>
            <p className="mt-1 break-words text-sm text-[var(--slate)]">
              {profile.email ?? "No public email supplied by ORCID"}
            </p>
            <p className="mt-3 text-xs capitalize text-[var(--muted)]">
              Signed up with {profile.authProvider}
            </p>
            {profile.orcidId && <div className="mt-4"><OrcidBadge orcidId={profile.orcidId} /></div>}
          </section>

          <UsageSummary usage={usage} compact />
        </div>
      </div>
    </AccountShell>
  );
}
