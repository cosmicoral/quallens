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
  unlimited?: boolean;
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
  isUnlimited: boolean;
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

  if (input.unlimited) {
    const reserved = input.activeReservations;
    return {
      plan: input.subscription.plan,
      billingInterval: input.subscription.billingInterval,
      subscriptionStatus: input.subscription.subscriptionStatus,
      isPaid: paid,
      isUnlimited: true,
      limit: 0,
      used: input.completedFreeReviews + input.completedPaidReviewsInPeriod,
      reserved,
      remaining: 0,
      canReview: reserved === 0,
      reason: reserved > 0 ? "active_review" : "available",
      quotaPeriodStart: null,
      quotaPeriodEnd: null,
      cancelAtPeriodEnd: input.subscription.cancelAtPeriodEnd,
      canManageBilling: Boolean(input.subscription.stripeCustomerId),
    };
  }

  if (paid) {
    const plan = input.subscription.plan;
    const limit = PLAN_CONFIG[plan].monthlyLimit ?? 0;
    const used = input.completedPaidReviewsInPeriod;
    const reserved = input.activeReservations;
    // Active work blocks a second concurrent submission, but it is not usage.
    // The allowance is consumed only after the run reaches `completed`.
    const remaining = Math.max(0, limit - used);
    const period = getUtcMonthlyQuotaPeriod(now);
    return {
      plan,
      billingInterval: input.subscription.billingInterval,
      subscriptionStatus: input.subscription.subscriptionStatus,
      isPaid: true,
      isUnlimited: false,
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
  // Failed or interrupted reviews must not consume the lifetime free review.
  const remaining = Math.max(0, limit - used);
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
    isUnlimited: false,
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
  isUnlimited: boolean;
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
    planName: entitlement.isUnlimited ? "Owner" : PLAN_CONFIG[entitlement.plan].name,
    quotaPeriodStart: entitlement.quotaPeriodStart?.toISOString() ?? null,
    quotaPeriodEnd: entitlement.quotaPeriodEnd?.toISOString() ?? null,
  };
}
