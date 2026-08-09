type AppUrlEnvironment = Record<string, string | undefined>;

/** Resolve the public app origin used for auth callbacks and billing redirects. */
export function resolveAppOrigin(environment: AppUrlEnvironment = process.env): string {
  const candidates = [
    environment.NEXT_PUBLIC_APP_URL,
    environment.BETTER_AUTH_URL,
    environment.RENDER_EXTERNAL_URL,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    return new URL(trimmed).origin;
  }

  if (environment.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error(
    "App origin is not configured. Set NEXT_PUBLIC_APP_URL, BETTER_AUTH_URL, or deploy on Render.",
  );
}

export function resolveOrcidRedirectUri(environment: AppUrlEnvironment = process.env): string {
  const configured = environment.ORCID_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${resolveAppOrigin(environment)}/api/auth/oauth2/callback/orcid`;
}
