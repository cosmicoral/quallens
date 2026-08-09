import "server-only";
import { getDatabase } from "./db";
import {
  mapResearcherIdentity,
  type AuthProvider,
  type AuthUserIdentity,
  type ProviderAccount,
} from "./identity";

export interface ResearcherProfile {
  userId: string;
  fullName: string;
  email: string | null;
  authProvider: AuthProvider;
  orcidId: string | null;
  institution: string | null;
  discipline: string | null;
  createdAt: Date;
  connectedProviders: AuthProvider[];
}

interface ProfileRow {
  user_id: string;
  full_name: string;
  email: string | null;
  auth_provider: AuthProvider;
  orcid_id: string | null;
  institution: string | null;
  discipline: string | null;
  created_at: Date;
}

function connectedProviders(accounts: ProviderAccount[]): AuthProvider[] {
  const providers = new Set<AuthProvider>();
  for (const account of accounts) {
    if (account.providerId === "orcid") providers.add("orcid");
    else if (account.providerId === "google") providers.add("google");
    else if (account.providerId === "credential") providers.add("email");
  }
  return [...providers];
}

function mapRow(row: ProfileRow, accounts: ProviderAccount[]): ResearcherProfile {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    authProvider: row.auth_provider,
    orcidId: row.orcid_id,
    institution: row.institution,
    discipline: row.discipline,
    createdAt: row.created_at,
    connectedProviders: connectedProviders(accounts),
  };
}

async function getAccounts(userId: string): Promise<ProviderAccount[]> {
  const result = await getDatabase().query<ProviderAccount>(
    `SELECT "providerId", "accountId"
     FROM "account"
     WHERE "userId" = $1
     ORDER BY "createdAt" ASC`,
    [userId],
  );
  return result.rows;
}

export async function getOrCreateResearcherProfile(
  user: AuthUserIdentity,
): Promise<ResearcherProfile> {
  const database = getDatabase();
  const accounts = await getAccounts(user.id);
  const identity = mapResearcherIdentity(user, accounts);

  await database.query(
    `INSERT INTO "researcher_profile"
       ("user_id", "full_name", "email", "auth_provider", "orcid_id", "created_at")
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT ("user_id") DO UPDATE SET
       "orcid_id" = COALESCE(EXCLUDED."orcid_id", "researcher_profile"."orcid_id"),
       "updated_at" = CURRENT_TIMESTAMP`,
    [
      user.id,
      identity.fullName,
      identity.email,
      identity.authProvider,
      identity.orcidId,
      identity.createdAt,
    ],
  );

  const result = await database.query<ProfileRow>(
    `SELECT "user_id", "full_name", "email", "auth_provider", "orcid_id",
            "institution", "discipline", "created_at"
     FROM "researcher_profile"
     WHERE "user_id" = $1`,
    [user.id],
  );

  const row = result.rows[0];
  if (!row) throw new Error("Researcher profile could not be created.");
  return mapRow(row, accounts);
}

export async function updateResearcherProfile(
  userId: string,
  values: {
    fullName: string;
    email: string | null;
    institution: string | null;
    discipline: string | null;
  },
) {
  await getDatabase().query(
    `UPDATE "researcher_profile"
     SET "full_name" = $2, "email" = $3, "institution" = $4,
         "discipline" = $5, "updated_at" = CURRENT_TIMESTAMP
     WHERE "user_id" = $1`,
    [userId, values.fullName, values.email, values.institution, values.discipline],
  );
}
