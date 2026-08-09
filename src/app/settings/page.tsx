import { AccountShell } from "@/components/account/AccountShell";
import { ConnectedIdentities } from "@/components/account/ConnectedIdentities";
import { OrcidBadge } from "@/components/account/OrcidBadge";
import { BillingActions } from "@/components/billing/BillingActions";
import { UsageSummary } from "@/components/billing/UsageSummary";
import { getOrCreateResearcherProfile } from "@/lib/auth/profile";
import { requireSession } from "@/lib/auth/session";
import { getUsageView } from "@/lib/billing/repository";
import { saveProfile } from "./actions";

export const dynamic = "force-dynamic";

function identityProviderConfigured(clientId?: string) {
  return Boolean(clientId?.trim());
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; billing?: string; linked?: string; identityError?: string }>;
}) {
  const [session, params] = await Promise.all([requireSession("/settings"), searchParams]);
  const [profile, usage] = await Promise.all([
    getOrCreateResearcherProfile(session.user),
    getUsageView(session.user.id),
  ]);

  return (
    <AccountShell profile={profile}>
      <div>
        <p className="eyebrow">Account settings</p>
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">Researcher profile</h1>
        <p className="mt-3 text-[var(--slate)]">Manage your public profile details and review connected identities.</p>
      </div>

      {params.identityError && (
        <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {params.identityError === "orcid"
            ? "ORCID could not be connected. The account may already belong to another Qualisapio user."
            : "Google could not be connected. The account may already belong to another Qualisapio user."}
        </p>
      )}
      {params.linked && (
        <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {params.linked === "orcid" ? "ORCID connected successfully." : "Google connected successfully."}
        </p>
      )}
      {params.saved && (
        <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Profile saved.
        </p>
      )}
      {params.error && (
        <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Check the profile fields and try again.
        </p>
      )}
      {params.billing === "returned" && (
        <p role="status" className="mt-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Returned from Stripe billing. Subscription changes appear after Stripe confirms them.
        </p>
      )}

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Profile</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Only information you provide or a provider supplies is stored.</p>
          <form action={saveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--ink)] sm:col-span-2">
              Full name
              <input name="fullName" defaultValue={profile.fullName} required minLength={2} className="mt-2 h-11 w-full rounded-xl border border-[var(--line-strong)] px-3.5 shadow-sm" />
            </label>
            <label className="block text-sm font-medium text-[var(--ink)] sm:col-span-2">
              Email
              <input name="email" type="email" defaultValue={profile.email ?? ""} placeholder="you@university.edu" className="mt-2 h-11 w-full rounded-xl border border-[var(--line-strong)] px-3.5 shadow-sm" />
              {profile.authProvider === "orcid" && !profile.email && (
                <span className="mt-2 block text-xs font-normal text-[var(--muted)]">ORCID did not supply a public email. Add one only if you wish.</span>
              )}
            </label>
            <label className="block text-sm font-medium text-[var(--ink)]">
              Institution <span className="font-normal text-[var(--muted)]">(optional)</span>
              <input name="institution" defaultValue={profile.institution ?? ""} placeholder="Your institution" className="mt-2 h-11 w-full rounded-xl border border-[var(--line-strong)] px-3.5 shadow-sm" />
            </label>
            <label className="block text-sm font-medium text-[var(--ink)]">
              Discipline <span className="font-normal text-[var(--muted)]">(optional)</span>
              <input name="discipline" defaultValue={profile.discipline ?? ""} placeholder="e.g. Sociology" className="mt-2 h-11 w-full rounded-xl border border-[var(--line-strong)] px-3.5 shadow-sm" />
            </label>
            <button type="submit" className="h-11 rounded-xl bg-[var(--ink)] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--navy)] sm:col-span-2 sm:justify-self-start">
              Save profile
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Connected identities</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Link additional sign-in methods to this Qualisapio account. Account merging is not included in this MVP.
          </p>
          <div className="mt-4">
            <ConnectedIdentities
              connectedProviders={profile.connectedProviders}
              googleConfigured={identityProviderConfigured(process.env.GOOGLE_CLIENT_ID)}
              orcidConfigured={identityProviderConfigured(process.env.ORCID_CLIENT_ID)}
            />
          </div>
          {profile.orcidId && <div className="mt-5"><OrcidBadge orcidId={profile.orcidId} /></div>}
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper-warm)] p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-center">
          <div>
            <p className="eyebrow">Billing</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">Plan and subscription</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--slate)]">
              Checkout and subscription management are handled securely by Stripe. Qualisapio access changes only after a verified webhook updates your account.
            </p>
            {usage.cancelAtPeriodEnd && <p className="mt-3 text-sm font-semibold text-amber-900">Cancellation is scheduled for the end of the current paid period.</p>}
            <div className="mt-5"><BillingActions canManageBilling={usage.canManageBilling} /></div>
          </div>
          <UsageSummary usage={usage} compact />
        </div>
      </section>
    </AccountShell>
  );
}
