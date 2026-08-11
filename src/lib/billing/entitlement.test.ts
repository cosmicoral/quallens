import { describe, expect, it } from "vitest";
import { getUserEntitlement, type SubscriptionState } from "./entitlement";

const now = new Date("2026-08-09T12:00:00.000Z");

function subscription(overrides: Partial<SubscriptionState> = {}): SubscriptionState {
  return {
    plan: "free",
    billingInterval: null,
    subscriptionStatus: "free",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    hasHadPaidPlan: false,
    stripeCustomerId: null,
    ...overrides,
  };
}

function entitlement(
  state: SubscriptionState,
  completedFreeReviews: number,
  completedPaidReviewsInPeriod: number,
  activeReservations = 0,
  unlimited = false,
) {
  return getUserEntitlement({
    subscription: state,
    completedFreeReviews,
    completedPaidReviewsInPeriod,
    activeReservations,
    unlimited,
    now,
  });
}

describe("review entitlements", () => {
  it("grants unlimited reviews only while no review is already active", () => {
    expect(entitlement(subscription(), 300, 200, 0, true)).toMatchObject({
      isUnlimited: true,
      canReview: true,
      reason: "available",
      used: 500,
    });
    expect(entitlement(subscription(), 300, 200, 1, true)).toMatchObject({
      isUnlimited: true,
      canReview: false,
      reason: "active_review",
    });
  });

  it("allows one lifetime free review and blocks the second", () => {
    expect(entitlement(subscription(), 0, 0).canReview).toBe(true);
    expect(entitlement(subscription(), 1, 0)).toMatchObject({
      canReview: false,
      reason: "free_trial_used",
    });
  });

  it("allows Plus below five and blocks at five", () => {
    const plus = subscription({
      plan: "plus",
      billingInterval: "monthly",
      subscriptionStatus: "active",
      currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z"),
      hasHadPaidPlan: true,
    });
    expect(entitlement(plus, 1, 4).canReview).toBe(true);
    expect(entitlement(plus, 1, 5)).toMatchObject({ canReview: false, reason: "quota_exhausted" });
  });

  it("allows Pro below twelve and blocks at twelve", () => {
    const pro = subscription({
      plan: "pro",
      billingInterval: "annual",
      subscriptionStatus: "active",
      currentPeriodEnd: new Date("2027-01-01T00:00:00.000Z"),
      hasHadPaidPlan: true,
    });
    expect(entitlement(pro, 1, 11).canReview).toBe(true);
    expect(entitlement(pro, 1, 12).canReview).toBe(false);
  });

  it("counts a pending reservation against availability", () => {
    const plus = subscription({
      plan: "plus",
      billingInterval: "monthly",
      subscriptionStatus: "active",
      currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z"),
      hasHadPaidPlan: true,
    });
    expect(entitlement(plus, 0, 4, 1)).toMatchObject({
      canReview: false,
      reason: "active_review",
      remaining: 0,
    });
  });

  it("blocks a second concurrent review even when quota remains", () => {
    const plus = subscription({
      plan: "plus",
      billingInterval: "monthly",
      subscriptionStatus: "active",
      currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z"),
      hasHadPaidPlan: true,
    });
    expect(entitlement(plus, 0, 3, 1)).toMatchObject({
      canReview: false,
      reason: "active_review",
      remaining: 1,
    });
  });

  it("retains past_due grace access only through the paid period", () => {
    const state = subscription({
      plan: "plus",
      billingInterval: "monthly",
      subscriptionStatus: "past_due",
      currentPeriodEnd: new Date("2026-08-20T00:00:00.000Z"),
      hasHadPaidPlan: true,
    });
    expect(entitlement(state, 1, 0).isPaid).toBe(true);
    expect(getUserEntitlement({
      subscription: state,
      completedFreeReviews: 1,
      completedPaidReviewsInPeriod: 0,
      activeReservations: 0,
      now: new Date("2026-08-21T00:00:00.000Z"),
    }).canReview).toBe(false);
  });

  it("retains canceled access only through the already-paid period", () => {
    const canceled = subscription({
      plan: "plus",
      billingInterval: "annual",
      subscriptionStatus: "canceled",
      currentPeriodEnd: new Date("2026-08-20T00:00:00.000Z"),
      cancelAtPeriodEnd: true,
      hasHadPaidPlan: true,
    });
    expect(entitlement(canceled, 1, 0)).toMatchObject({ isPaid: true, canReview: true });
    expect(getUserEntitlement({
      subscription: canceled,
      completedFreeReviews: 1,
      completedPaidReviewsInPeriod: 0,
      activeReservations: 0,
      now: new Date("2026-08-21T00:00:00.000Z"),
    })).toMatchObject({ isPaid: false, canReview: false, reason: "former_paid_user" });
  });

  it.each(["unpaid", "incomplete", "incomplete_expired", "trialing", "paused"])(
    "does not grant paid access for %s",
    (status) => {
      const state = subscription({
        plan: "plus",
        billingInterval: "monthly",
        subscriptionStatus: status,
        currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z"),
        hasHadPaidPlan: true,
      });
      expect(entitlement(state, 0, 0)).toMatchObject({ canReview: false, isPaid: false });
    },
  );

  it("does not grant a new free trial after paid access ends", () => {
    const formerPaid = subscription({
      subscriptionStatus: "canceled",
      hasHadPaidPlan: true,
    });
    expect(entitlement(formerPaid, 0, 0)).toMatchObject({
      canReview: false,
      reason: "former_paid_user",
    });
  });
});
