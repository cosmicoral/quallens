import Link from "next/link";
import type { UsageView } from "@/lib/billing/entitlement";

function periodCopy(usage: UsageView) {
  if (!usage.isPaid) return usage.reason === "former_paid_user" ? "Paid access ended" : "Lifetime trial";
  if (!usage.quotaPeriodEnd) return "Current allowance";
  return `Resets ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(usage.quotaPeriodEnd))}`;
}

function quotaPeriodCopy(usage: UsageView) {
  if (!usage.quotaPeriodStart || !usage.quotaPeriodEnd) return "One-time allowance";
  const format = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  const inclusiveEnd = new Date(new Date(usage.quotaPeriodEnd).getTime() - 1);
  return `${format.format(new Date(usage.quotaPeriodStart))}–${format.format(inclusiveEnd)} UTC`;
}

export function UsageSummary({ usage, compact = false }: { usage: UsageView; compact?: boolean }) {
  const percent = usage.limit > 0 ? Math.min(100, ((usage.used + usage.reserved) / usage.limit) * 100) : 100;
  return (
    <section className={`account-card rounded-[1.15rem] ${compact ? "p-5 sm:p-6" : "p-6"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Peer-review allowance
          </p>
          <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">{usage.planName}</p>
          <p className="mt-1 text-xs capitalize leading-5 text-[var(--muted)]">
            {usage.billingInterval ? `${usage.billingInterval} billing` : quotaPeriodCopy(usage)}
          </p>
        </div>
        <span className="account-identity-badge rounded-full px-2.5 py-1 text-xs font-semibold capitalize text-[var(--blue-deep)]">
          {usage.isPaid ? usage.subscriptionStatus.replaceAll("_", " ") : "free"}
        </span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4 border-t border-[var(--line)]/70 pt-5">
        <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
          {usage.remaining}
          <span className="ml-1.5 text-sm font-medium tracking-normal text-[var(--muted)]">remaining</span>
        </p>
        <p className="text-xs leading-5 text-[var(--muted)]">
          {usage.used} of {usage.limit} used
        </p>
      </div>
      <div
        className="account-quota-track mt-4 h-2.5 overflow-hidden rounded-full"
        aria-hidden="true"
        role="presentation"
      >
        <div className="account-quota-fill h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-3 text-xs leading-5 text-[var(--muted)]">
        <span>
          {periodCopy(usage)}
          {usage.isPaid ? ` · ${quotaPeriodCopy(usage)}` : ""}
        </span>
        {usage.reserved > 0 && <span>1 review in progress</span>}
      </div>
      {!usage.canReview && usage.reason !== "active_review" && (
        <Link
          href="/pricing"
          className="mt-4 inline-flex text-sm font-semibold text-[var(--blue-deep)] transition hover:text-[var(--ink)] hover:underline"
        >
          Compare plans →
        </Link>
      )}
    </section>
  );
}
