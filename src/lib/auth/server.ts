import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { getDatabase } from "./db";
import { mapOrcidProfile } from "./identity";

function createAuth() {
  return betterAuth({
    database: getDatabase(),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "orcid"],
        allowDifferentEmails: true,
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    plugins: [
      genericOAuth({
        config: [
          {
            providerId: "orcid",
            discoveryUrl: "https://orcid.org/.well-known/openid-configuration",
            issuer: "https://orcid.org",
            clientId: process.env.ORCID_CLIENT_ID ?? "",
            clientSecret: process.env.ORCID_CLIENT_SECRET ?? "",
            redirectURI: process.env.ORCID_REDIRECT_URI,
            scopes: ["openid"],
            pkce: true,
            mapProfileToUser: mapOrcidProfile,
          },
        ],
      }),
      nextCookies(),
    ],
  });
}

export type QualisapioAuth = ReturnType<typeof createAuth>;
let auth: QualisapioAuth | undefined;

export function getAuth(): QualisapioAuth {
  auth ??= createAuth();
  return auth;
}
