export const ORCID_PROVIDER_ID = "orcid";
export const GOOGLE_PROVIDER_ID = "google";
export const EMAIL_PROVIDER_ID = "credential";
const ORCID_INTERNAL_EMAIL_DOMAIN = "orcid.invalid";

export type AuthProvider = "google" | "orcid" | "email";

export interface ProviderAccount {
  providerId: string;
  accountId: string;
}

export interface AuthUserIdentity {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ResearcherIdentity {
  fullName: string;
  email: string | null;
  authProvider: AuthProvider;
  orcidId: string | null;
  createdAt: Date;
}

export interface OrcidUserInfo {
  sub?: unknown;
  name?: unknown;
  given_name?: unknown;
  family_name?: unknown;
  email?: unknown;
  email_verified?: unknown;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeOrcidId(value: string): string {
  return value.trim().replace(/^https?:\/\/orcid\.org\//i, "");
}

export function isInternalOrcidEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${ORCID_INTERNAL_EMAIL_DOMAIN}`);
}

export function internalOrcidEmail(orcidId: string): string {
  return `${normalizeOrcidId(orcidId)}@${ORCID_INTERNAL_EMAIL_DOMAIN}`;
}

/**
 * ORCID's public OpenID profile can omit email. Better Auth requires one for
 * its user record, so a reserved, non-deliverable value is used internally.
 * It is never copied into the researcher profile or shown as the user's email.
 */
export function mapOrcidProfile(profile: OrcidUserInfo) {
  const subject = stringValue(profile.sub);
  if (!subject) {
    throw new Error("ORCID profile did not include a subject identifier.");
  }

  const orcidId = normalizeOrcidId(subject);
  const suppliedName = stringValue(profile.name);
  const splitName = [stringValue(profile.given_name), stringValue(profile.family_name)]
    .filter(Boolean)
    .join(" ");
  const suppliedEmail = stringValue(profile.email);

  return {
    id: orcidId,
    name: suppliedName ?? (splitName || orcidId),
    email: suppliedEmail ?? internalOrcidEmail(orcidId),
    emailVerified: suppliedEmail ? profile.email_verified === true : false,
  };
}

export function resolveAuthProvider(accounts: ProviderAccount[]): AuthProvider {
  const first = accounts[0]?.providerId;
  if (first === ORCID_PROVIDER_ID) return "orcid";
  if (first === GOOGLE_PROVIDER_ID) return "google";
  return "email";
}

export function mapResearcherIdentity(
  user: AuthUserIdentity,
  accounts: ProviderAccount[],
): ResearcherIdentity {
  const orcid = accounts.find((account) => account.providerId === ORCID_PROVIDER_ID);

  return {
    fullName: user.name,
    email: isInternalOrcidEmail(user.email) ? null : user.email,
    authProvider: resolveAuthProvider(accounts),
    orcidId: orcid ? normalizeOrcidId(orcid.accountId) : null,
    createdAt: user.createdAt,
  };
}
