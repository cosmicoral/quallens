"use client";

import Image from "next/image";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import type { AuthProvider } from "@/lib/auth/identity";

type IdentityProvider = "Google" | "ORCID" | "Email";

interface ConnectedIdentitiesProps {
  connectedProviders: AuthProvider[];
  googleConfigured: boolean;
  orcidConfigured: boolean;
}

function providerKey(provider: IdentityProvider): AuthProvider {
  if (provider === "Google") return "google";
  if (provider === "ORCID") return "orcid";
  return "email";
}

function IdentityRow({
  provider,
  connected,
  canConnect,
  unavailableReason,
  onConnect,
  busy,
}: {
  provider: IdentityProvider;
  connected: boolean;
  canConnect: boolean;
  unavailableReason?: string;
  onConnect?: () => void;
  busy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        {provider === "ORCID" ? (
          <Image src="/brand/orcid.svg" alt="" width={26} height={26} />
        ) : (
          <span
            className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--paper-blue)] text-xs font-bold text-[var(--blue-deep)]"
            aria-hidden="true"
          >
            {provider.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--ink)]">{provider}</p>
          {provider === "ORCID" && (
            <p className="text-xs text-[var(--muted)]">Researcher identity</p>
          )}
          {provider === "Email" && !connected && (
            <p className="text-xs text-[var(--muted)]">Use the email sign-in flow for this account</p>
          )}
          {!connected && unavailableReason && (
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{unavailableReason}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {connected ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Connected
          </span>
        ) : canConnect ? (
          <button
            type="button"
            onClick={onConnect}
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-white px-3.5 text-xs font-semibold text-[var(--ink)] shadow-sm transition hover:bg-[var(--paper-blue)] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Connecting…" : "Connect"}
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            Not connected
          </span>
        )}
      </div>
    </div>
  );
}

export function ConnectedIdentities({
  connectedProviders,
  googleConfigured,
  orcidConfigured,
}: ConnectedIdentitiesProps) {
  const [busyProvider, setBusyProvider] = useState<"google" | "orcid" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connectGoogle() {
    setError(null);
    setBusyProvider("google");
    const result = await authClient.linkSocial({
      provider: "google",
      callbackURL: "/settings?linked=google",
      errorCallbackURL: "/settings?identityError=google",
    });
    if (result.error) {
      setError(result.error.message ?? "Google could not be connected. Please try again.");
      setBusyProvider(null);
    }
  }

  async function connectOrcid() {
    setError(null);
    setBusyProvider("orcid");
    const result = await authClient.oauth2.link({
      providerId: "orcid",
      callbackURL: "/settings?linked=orcid",
      errorCallbackURL: "/settings?identityError=orcid",
    });
    if (result.error) {
      setError(result.error.message ?? "ORCID could not be connected. Please try again.");
      setBusyProvider(null);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error}
        </p>
      )}
      <IdentityRow
        provider="Google"
        connected={connectedProviders.includes("google")}
        canConnect={googleConfigured && !connectedProviders.includes("google")}
        unavailableReason={
          !googleConfigured && !connectedProviders.includes("google")
            ? "Google sign-in is not configured in this environment."
            : undefined
        }
        onConnect={connectGoogle}
        busy={busyProvider === "google"}
      />
      <IdentityRow
        provider="ORCID"
        connected={connectedProviders.includes("orcid")}
        canConnect={orcidConfigured && !connectedProviders.includes("orcid")}
        unavailableReason={
          !orcidConfigured && !connectedProviders.includes("orcid")
            ? "ORCID sign-in is not configured in this environment."
            : undefined
        }
        onConnect={connectOrcid}
        busy={busyProvider === "orcid"}
      />
      <IdentityRow
        provider="Email"
        connected={connectedProviders.includes(providerKey("Email"))}
        canConnect={false}
      />
    </div>
  );
}
