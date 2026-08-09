import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  createCheckoutSession: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("@/lib/billing/checkout", () => ({
  createCheckoutSession: mocks.createCheckoutSession,
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("https://qualisapio.test/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/billing/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "user_1", email: "ada@example.com" } });
    mocks.createCheckoutSession.mockResolvedValue({ url: "https://checkout.stripe.com/example" });
  });

  it("requires authentication", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await POST(request({ plan: "plus", interval: "monthly" }));
    expect(response.status).toBe(401);
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("rejects arbitrary prices and unknown fields", async () => {
    const response = await POST(request({
      plan: "plus",
      interval: "monthly",
      priceId: "price_attacker_supplied",
    }));
    expect(response.status).toBe(400);
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("passes only a validated server-side plan selection to checkout", async () => {
    const response = await POST(request({ plan: "pro", interval: "annual" }));
    expect(response.status).toBe(200);
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user_1" }),
      { plan: "pro", interval: "annual" },
    );
  });
});
