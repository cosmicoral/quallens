import "server-only";

interface AccountIdentity {
  userId: string;
  email?: string | null;
  emailVerified?: boolean;
}

function allowlist(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(/[\s,;]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Server-only owner/tester override. Email matches require a verified address. */
export function hasUnlimitedReviewAccess(
  identity: AccountIdentity,
  environment: Record<string, string | undefined> = process.env,
) {
  const userIds = allowlist(environment.UNLIMITED_REVIEW_USER_IDS);
  if (userIds.has(identity.userId.toLowerCase())) return true;

  const email = identity.email?.trim().toLowerCase();
  return Boolean(
    email
    && identity.emailVerified
    && allowlist(environment.UNLIMITED_REVIEW_EMAILS).has(email),
  );
}
