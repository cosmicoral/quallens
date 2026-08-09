import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn(),
  headers: vi.fn(async () => new Headers({ cookie: "better-auth.session_token=test" })),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));

import { getServerSession, requireSession } from "./session";

describe("server session handling", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.redirect.mockReset();
  });

  it("returns a validated authenticated session", async () => {
    const session = {
      user: { id: "user-1", name: "Jane Scholar", email: "jane@example.edu" },
      session: { id: "session-1" },
    };
    mocks.getSession.mockResolvedValue(session);

    await expect(getServerSession()).resolves.toEqual(session);
    await expect(requireSession("/dashboard")).resolves.toEqual(session);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects when authoritative validation finds no session", async () => {
    mocks.getSession.mockResolvedValue(null);

    await requireSession("/settings");
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/auth/login?callbackURL=%2Fsettings",
    );
  });
});
