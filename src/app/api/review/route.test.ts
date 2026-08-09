import { beforeEach, describe, expect, it, vi } from "vitest";
import { BillingError } from "@/lib/billing/errors";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getOrCreateResearcherProfile: vi.fn(),
  reserveReviewRun: vi.fn(),
  markReviewRunRunning: vi.fn(),
  markReviewRunCompleted: vi.fn(),
  markReviewRunFailed: vi.fn(),
  runReviewPipeline: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("@/lib/auth/profile", () => ({
  getOrCreateResearcherProfile: mocks.getOrCreateResearcherProfile,
}));
vi.mock("@/lib/billing/repository", () => ({
  reserveReviewRun: mocks.reserveReviewRun,
  markReviewRunRunning: mocks.markReviewRunRunning,
  markReviewRunCompleted: mocks.markReviewRunCompleted,
  markReviewRunFailed: mocks.markReviewRunFailed,
}));
vi.mock("@/lib/agents/pipeline", () => ({ runReviewPipeline: mocks.runReviewPipeline }));

import { POST } from "./route";

const manuscript = { title: "A qualitative study", body: "A sufficiently complete manuscript." };

function request(body: unknown = manuscript) {
  return new Request("https://qualisapio.test/api/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/review billing gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "user_1", name: "Ada", email: "ada@example.com" } });
    mocks.reserveReviewRun.mockResolvedValue({ id: "run_1" });
    mocks.runReviewPipeline.mockResolvedValue({ ok: true, result: { manuscriptProfile: {} } });
  });

  it("rejects unauthenticated requests before reserving usage", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(mocks.reserveReviewRun).not.toHaveBeenCalled();
    expect(mocks.runReviewPipeline).not.toHaveBeenCalled();
  });

  it("rejects exhausted usage before invoking any agents", async () => {
    mocks.reserveReviewRun.mockRejectedValue(
      new BillingError("quota_exhausted", "Your monthly review allowance has been used."),
    );
    const response = await POST(request());
    expect(response.status).toBe(402);
    expect(await response.json()).toMatchObject({ ok: false, errorCode: "quota_exhausted" });
    expect(mocks.runReviewPipeline).not.toHaveBeenCalled();
  });

  it("consumes a reservation only after a successful review", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.reserveReviewRun).toHaveBeenCalledWith("user_1", manuscript.title, null);
    expect(mocks.markReviewRunRunning).toHaveBeenCalledWith("run_1");
    expect(mocks.markReviewRunCompleted).toHaveBeenCalledWith(
      "run_1",
      expect.objectContaining({ reviewId: "run_1" }),
    );
    expect(mocks.markReviewRunFailed).not.toHaveBeenCalled();
  });

  it("releases usage when the provider pipeline fails", async () => {
    mocks.runReviewPipeline.mockResolvedValue({
      ok: false,
      error: { agentId: "reader", error: { code: "provider_error", message: "Provider unavailable" } },
    });
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(mocks.markReviewRunFailed).toHaveBeenCalledWith("run_1", "provider_error");
    expect(mocks.markReviewRunCompleted).not.toHaveBeenCalled();
  });

  it("releases usage when the pipeline throws unexpectedly", async () => {
    mocks.runReviewPipeline.mockRejectedValue(new Error("Unexpected failure"));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      ok: false,
      errorCode: "provider_error",
    });
    expect(mocks.markReviewRunFailed).toHaveBeenCalledWith("run_1", "unexpected_pipeline_error");
    expect(mocks.markReviewRunCompleted).not.toHaveBeenCalled();
  });

  it("still returns a successful review when persistence fails", async () => {
    mocks.markReviewRunCompleted.mockRejectedValue(new Error("Database unavailable"));
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      result: { reviewId: "run_1" },
    });
  });
});
