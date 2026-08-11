import { beforeEach, describe, expect, it, vi } from "vitest";
import { BillingError } from "@/lib/billing/errors";

const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  getSession: vi.fn(),
  getOrCreateResearcherProfile: vi.fn(),
  reserveReviewRun: vi.fn(),
  markReviewRunFailed: vi.fn(),
  startReviewJob: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: mocks.after };
});
vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("@/lib/auth/profile", () => ({
  getOrCreateResearcherProfile: mocks.getOrCreateResearcherProfile,
}));
vi.mock("@/lib/billing/repository", () => ({
  reserveReviewRun: mocks.reserveReviewRun,
  markReviewRunFailed: mocks.markReviewRunFailed,
}));
vi.mock("@/lib/review/worker", () => ({ startReviewJob: mocks.startReviewJob }));

import { POST } from "./route";

const manuscript = { title: "A qualitative study", body: "A sufficiently complete manuscript." };

function request(body: unknown = manuscript) {
  return new Request("https://qualisapio.test/api/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "user_1", name: "Ada", email: "ada@example.com" } });
    mocks.getOrCreateResearcherProfile.mockResolvedValue(undefined);
    mocks.reserveReviewRun.mockResolvedValue({ id: "run_1" });
    mocks.markReviewRunFailed.mockResolvedValue(undefined);
  });

  it("rejects unauthenticated requests before reserving usage", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(mocks.reserveReviewRun).not.toHaveBeenCalled();
  });

  it("returns a JSON 500 with a request reference when profile setup throws", async () => {
    mocks.getOrCreateResearcherProfile.mockRejectedValue(new Error("Database unavailable"));
    const response = await POST(request());
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(response.headers.get("x-review-request-id")).toBeTruthy();
    expect(data).toMatchObject({ ok: false, errorCode: "provider_error" });
    expect(data.error).toContain("during profile");
    expect(data.error).not.toContain("Database unavailable");
  });

  it("rejects exhausted usage before scheduling work", async () => {
    mocks.reserveReviewRun.mockRejectedValue(
      new BillingError("quota_exhausted", "Your monthly review allowance has been used."),
    );
    const response = await POST(request());
    expect(response.status).toBe(402);
    expect(await response.json()).toMatchObject({ ok: false, errorCode: "quota_exhausted" });
    expect(mocks.after).not.toHaveBeenCalled();
  });

  it("persists the manuscript and returns a job immediately", async () => {
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(mocks.reserveReviewRun).toHaveBeenCalledWith("user_1", manuscript);
    expect(mocks.after).toHaveBeenCalledOnce();
    expect(await response.json()).toMatchObject({
      ok: true,
      job: { reviewId: "run_1", status: "pending", stage: "queued" },
    });
  });

  it("accepts a manuscript longer than 10,000 characters", async () => {
    const longManuscript = { title: "Long study", body: "文".repeat(12_000) };
    const response = await POST(request(longManuscript));
    expect(response.status).toBe(202);
    expect(mocks.reserveReviewRun).toHaveBeenCalledWith("user_1", longManuscript);
  });

  it("rejects exceptionally large input before billing", async () => {
    const response = await POST(request({ title: "Too large", body: "x".repeat(300_001) }));
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ errorCode: "manuscript_too_large" });
    expect(mocks.reserveReviewRun).not.toHaveBeenCalled();
  });

  it("marks the reservation failed if background dispatch cannot be registered", async () => {
    mocks.after.mockImplementation(() => { throw new Error("No request context"); });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(mocks.markReviewRunFailed).toHaveBeenCalledWith(
      "run_1",
      "dispatch_error",
      expect.any(Date),
      expect.stringContaining("Reference:"),
    );
  });
});
