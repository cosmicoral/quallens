"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await authClient.signOut();
        router.push("/auth/login");
        router.refresh();
      }}
      className="rounded-lg border border-[var(--line-strong)] bg-white/90 px-3 py-2 text-sm font-medium text-[var(--slate)] shadow-sm transition hover:border-[var(--line)] hover:bg-white hover:text-[var(--ink)] disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
