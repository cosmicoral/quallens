import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isProtectedPath, shouldRedirectToLogin } from "./access";
import { proxy } from "@/proxy";

describe("protected route access", () => {
  it("recognizes only protected application routes", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/review/draft")).toBe(true);
    expect(isProtectedPath("/settings")).toBe(true);
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/auth/login")).toBe(false);
  });

  it("redirects an unauthenticated protected request to login", () => {
    const response = proxy(new NextRequest("https://qualisapio.test/review?draft=1"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://qualisapio.test/auth/login?callbackURL=%2Freview%3Fdraft%3D1",
    );
  });

  it("allows optimistic access when a session cookie is present", () => {
    const request = new NextRequest("https://qualisapio.test/dashboard", {
      headers: { cookie: "better-auth.session_token=test-session" },
    });
    const response = proxy(request);

    expect(shouldRedirectToLogin("/dashboard", true)).toBe(false);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
