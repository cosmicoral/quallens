import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  createPortalSession: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("@/lib/billing/checkout", () => ({ createPortalSession: mocks.createPortalSession }));

import { POST } from "./route";

describe("POST /api/billing/portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.createPortalSession.mockResolvedValue({ url: "https://billing.stripe.com/session" });
  });

  it("requires authentication", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await POST(new Request("https://qualisapio.test/api/billing/portal", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(mocks.createPortalSession).not.toHaveBeenCalled();
  });

  it("returns a portal URL for the authenticated Stripe customer", async () => {
    const response = await POST(new Request("https://qualisapio.test/api/billing/portal", { method: "POST" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, url: "https://billing.stripe.com/session" });
    expect(mocks.createPortalSession).toHaveBeenCalledWith("user_1");
  });
});
