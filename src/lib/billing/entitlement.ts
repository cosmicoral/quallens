import { PLAN_CONFIG, type BillingInterval, type Plan } from "./config";

export interface SubscriptionState {
  plan: Plan;
  billingInterval: BillingInterval | null;
  subscriptionStatus: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  hasHadPaidPlan: boolean;
  stripeCustomerId: string | null;
}

export interface EntitlementInput {
  subscription: SubscriptionState;
  completedFreeReviews: number;
  completedPaidReviewsInPeriod: number;
  activeReservations: number;
  now?: Date;
}

export type EntitlementReason =
  | "available"
  | "free_trial_used"
  | "former_paid_user"
  | "quota_exhausted"
  | "active_review";

export interface UserEntitlement {
  plan: Plan;
  billingInterval: BillingInterval | null;
  subscriptionStatus: string;
  isPaid: boolean;
  limit: number;
  used: number;
  reserved: number;
  remaining: number;
  canReview: boolean;
  reason: EntitlementReason;
  quotaPeriodStart: Date | null;
  quotaPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canManageBilling: boolean;
}

export function getUtcMonthlyQuotaPeriod(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

/**
 * Paid access policy:
 * - active: allowed through the recorded paid period
 * - past_due: grace access through the recorded paid period while Stripe retries
 * - canceled: access only until the already-paid period ends
 * - trialing, unpaid, incomplete, incomplete_expired, paused: blocked
 */
export function hasPaidAccess(subscription: SubscriptionState, now = new Date()): boolean {
  if (subscription.plan === "free" || !subscription.currentPeriodEnd) return false;
  if (subscription.currentPeriodEnd.getTime() <= now.getTime()) return false;
  return ["active", "past_due", "canceled"].includes(subscription.subscriptionStatus);
}

export function getUserEntitlement(input: EntitlementInput): UserEntitlement {
  const now = input.now ?? new Date();
  const paid = hasPaidAccess(input.subscription, now);

  if (paid) {
    const plan = input.subscription.plan;
    const limit = PLAN_CONFIG[plan].monthlyLimit ?? 0;
    const used = input.completedPaidReviewsInPeriod;
    const reserved = input.activeReservations;
    const remaining = Math.max(0, limit - used - reserved);
    const period = getUtcMonthlyQuotaPeriod(now);
    return {
      plan,
      billingInterval: input.subscription.billingInterval,
      subscriptionStatus: input.subscription.subscriptionStatus,
      isPaid: true,
      limit,
      used,
      reserved,
      remaining,
      canReview: remaining > 0 && reserved === 0,
      reason: reserved > 0 ? "active_review" : remaining > 0 ? "available" : "quota_exhausted",
      quotaPeriodStart: period.start,
      quotaPeriodEnd: period.end,
      cancelAtPeriodEnd: input.subscription.cancelAtPeriodEnd,
      canManageBilling: Boolean(input.subscription.stripeCustomerId),
    };
  }

  const freeUnavailable = input.subscription.hasHadPaidPlan;
  const limit = freeUnavailable ? 0 : PLAN_CONFIG.free.totalLimit;
  const used = input.completedFreeReviews;
  const reserved = input.activeReservations;
  const remaining = Math.max(0, limit - used - reserved);
  const reason: EntitlementReason = reserved > 0
    ? "active_review"
    : freeUnavailable
      ? "former_paid_user"
      : remaining > 0
        ? "available"
        : "free_trial_used";

  return {
    plan: "free",
    billingInterval: null,
    subscriptionStatus: input.subscription.subscriptionStatus,
    isPaid: false,
    limit,
    used,
    reserved,
    remaining,
    canReview: remaining > 0 && reserved === 0,
    reason,
    quotaPeriodStart: null,
    quotaPeriodEnd: null,
    cancelAtPeriodEnd: false,
    canManageBilling: Boolean(input.subscription.stripeCustomerId),
  };
}

export interface UsageView {
  plan: Plan;
  planName: string;
  billingInterval: BillingInterval | null;
  subscriptionStatus: string;
  isPaid: boolean;
  limit: number;
  used: number;
  reserved: number;
  remaining: number;
  canReview: boolean;
  reason: EntitlementReason;
  quotaPeriodStart: string | null;
  quotaPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canManageBilling: boolean;
}

export function toUsageView(entitlement: UserEntitlement): UsageView {
  return {
    ...entitlement,
    planName: PLAN_CONFIG[entitlement.plan].name,
    quotaPeriodStart: entitlement.quotaPeriodStart?.toISOString() ?? null,
    quotaPeriodEnd: entitlement.quotaPeriodEnd?.toISOString() ?? null,
  };
}
