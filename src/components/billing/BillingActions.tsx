"use client";

import Link from "next/link";
import { useState } from "react";

export function BillingActions({ canManageBilling }: { canManageBilling: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Billing is unavailable.");
      window.location.assign(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Billing is unavailable.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/pricing"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-white hover:bg-[var(--navy)]"
        >
          View plans
        </Link>
        {canManageBilling && (
          <button
            type="button"
            onClick={openPortal}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-4 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-60"
          >
            {loading ? "Opening Stripe…" : "Manage billing"}
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-amber-800">{error}</p>}
    </div>
  );
}
