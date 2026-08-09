export type BillingErrorCode =
  | "quota_exhausted"
  | "free_trial_used"
  | "former_paid_user"
  | "active_review"
  | "invalid_plan"
  | "subscription_exists"
  | "billing_not_configured"
  | "stripe_customer_missing";

export class BillingError extends Error {
  constructor(
    public readonly code: BillingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BillingError";
  }
}
