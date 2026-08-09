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
    <section className={`rounded-2xl border border-[var(--line)] bg-white shadow-sm ${compact ? "p-5" : "p-6"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Review allowance</p>
          <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{usage.planName}</p>
          <p className="mt-0.5 text-xs capitalize text-[var(--muted)]">
            {usage.billingInterval ? `${usage.billingInterval} billing` : quotaPeriodCopy(usage)}
          </p>
        </div>
        <span className="rounded-full bg-[var(--paper-blue)] px-2.5 py-1 text-xs font-semibold capitalize text-[var(--blue-deep)]">
          {usage.isPaid ? usage.subscriptionStatus.replaceAll("_", " ") : "free"}
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
          {usage.remaining}<span className="ml-1 text-sm font-medium tracking-normal text-[var(--muted)]">remaining</span>
        </p>
        <p className="text-xs text-[var(--muted)]">{usage.used} of {usage.limit} used</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-[var(--blue)] transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
        <span>{periodCopy(usage)}{usage.isPaid ? ` · ${quotaPeriodCopy(usage)}` : ""}</span>
        {usage.reserved > 0 && <span>1 review in progress</span>}
      </div>
      {!usage.canReview && usage.reason !== "active_review" && (
        <Link href="/pricing" className="mt-4 inline-flex text-sm font-semibold text-[var(--blue-deep)] hover:underline">
          Compare plans →
        </Link>
      )}
    </section>
  );
}
