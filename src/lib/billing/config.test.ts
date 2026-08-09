import { afterEach, describe, expect, it } from "vitest";
import {
  checkoutSelectionSchema,
  getApprovedPriceId,
  getPlanForPriceId,
} from "./config";

const env = {
  STRIPE_PRICE_PLUS_MONTHLY: "price_plus_monthly",
  STRIPE_PRICE_PLUS_ANNUAL: "price_plus_annual",
  STRIPE_PRICE_PRO_MONTHLY: "price_pro_monthly",
  STRIPE_PRICE_PRO_ANNUAL: "price_pro_annual",
};

afterEach(() => {
  delete process.env.STRIPE_PRICE_PLUS_MONTHLY;
});

describe("approved Stripe price mapping", () => {
  it.each([
    ["plus", "monthly", "price_plus_monthly"],
    ["plus", "annual", "price_plus_annual"],
    ["pro", "monthly", "price_pro_monthly"],
    ["pro", "annual", "price_pro_annual"],
  ] as const)("maps %s %s to its server-configured price", (plan, interval, expected) => {
    expect(getApprovedPriceId({ plan, interval }, env)).toBe(expected);
    expect(getPlanForPriceId(expected, env)).toEqual({ plan, interval });
  });

  it("rejects arbitrary price IDs and unknown client fields", () => {
    expect(
      checkoutSelectionSchema.safeParse({
        plan: "plus",
        interval: "monthly",
        priceId: "price_attacker_controlled",
      }).success,
    ).toBe(false);
    expect(checkoutSelectionSchema.safeParse({ plan: "enterprise", interval: "monthly" }).success).toBe(false);
  });
});
