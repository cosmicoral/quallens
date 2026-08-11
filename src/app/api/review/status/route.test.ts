import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/review/status", () => {
  it("does not expose configuration or trigger a provider diagnostic", async () => {
    const response = await GET();

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("");
  });
});
