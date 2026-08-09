import { describe, expect, it } from "vitest";
import { resolveAppOrigin, resolveOrcidRedirectUri } from "./app-url";

describe("resolveAppOrigin", () => {
  it("prefers NEXT_PUBLIC_APP_URL when set", () => {
    expect(
      resolveAppOrigin({
        NEXT_PUBLIC_APP_URL: "https://qualisapio.onrender.com",
        BETTER_AUTH_URL: "https://example.com",
        RENDER_EXTERNAL_URL: "https://render.example.com",
      }),
    ).toBe("https://qualisapio.onrender.com");
  });

  it("falls back to Render external URL in production", () => {
    expect(
      resolveAppOrigin({
        NODE_ENV: "production",
        RENDER_EXTERNAL_URL: "https://qualisapio.onrender.com/",
      }),
    ).toBe("https://qualisapio.onrender.com");
  });

  it("defaults to localhost in development", () => {
    expect(resolveAppOrigin({ NODE_ENV: "development" })).toBe("http://localhost:3000");
  });
});

describe("resolveOrcidRedirectUri", () => {
  it("derives the callback from the app origin when unset", () => {
    expect(
      resolveOrcidRedirectUri({
        NEXT_PUBLIC_APP_URL: "https://qualisapio.onrender.com",
      }),
    ).toBe("https://qualisapio.onrender.com/api/auth/oauth2/callback/orcid");
  });
});
