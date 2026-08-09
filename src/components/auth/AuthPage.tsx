import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { AuthPanel } from "./AuthPanel";

type AuthMode = "login" | "signup";

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center text-[#0d5685]" aria-hidden="true">
      {children}
    </span>
  );
}

function FeatureList() {
  return (
    <ul className="mt-8 space-y-4 text-[#0f2b49] xl:mt-9 xl:space-y-5">
      <li className="flex max-w-64 gap-3">
        <FeatureIcon>
          <svg viewBox="0 0 32 32" fill="none" className="size-8">
            <path d="M16 3.5 26 7v7.4c0 6.4-4 11.6-10 14.1-6-2.5-10-7.7-10-14.1V7l10-3.5Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="m11.5 15.5 3 3 6.3-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </FeatureIcon>
        <div>
          <p className="text-sm font-bold">Secure &amp; private</p>
          <p className="mt-1 text-xs leading-5 text-[#334b63]">Secure sessions, protected routes, and provider-managed credentials.</p>
        </div>
      </li>
      <li className="flex max-w-64 gap-3">
        <FeatureIcon>
          <svg viewBox="0 0 32 32" fill="none" className="size-8">
            <circle cx="12" cy="11" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4.5 25v-2.5A6.5 6.5 0 0 1 11 16h2a6.5 6.5 0 0 1 6.5 6.5V25M21 7.5a4 4 0 0 1 0 7.8M23 17a6.5 6.5 0 0 1 4.5 6.2V25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </FeatureIcon>
        <div>
          <p className="text-sm font-bold">Researcher-first</p>
          <p className="mt-1 text-xs leading-5 text-[#334b63]">Sign in with Google, ORCID, or email.</p>
        </div>
      </li>
      <li className="flex max-w-64 gap-3">
        <FeatureIcon>
          <svg viewBox="0 0 32 32" fill="none" className="size-8">
            <path d="m16 3.8 3.5 7.2 8 1.1-5.8 5.7 1.4 8-7.1-3.7-7.1 3.7 1.4-8-5.8-5.7 8-1.1L16 3.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </FeatureIcon>
        <div>
          <p className="text-sm font-bold">Authors and reviewers</p>
          <p className="mt-1 text-xs leading-5 text-[#334b63]">Pre-submission feedback and reviewer-assist reports—not rewriting.</p>
        </div>
      </li>
    </ul>
  );
}

function TrustBar() {
  const items = [
    {
      icon: "shield",
      title: "Secure by design",
      copy: "Provider-managed authentication and protected sessions.",
    },
    {
      icon: "lock",
      title: "You control your account",
      copy: "Manage your profile and billing from settings.",
    },
    {
      icon: "people",
      title: "Built for researchers",
      copy: "For authors preparing submissions and reviewers conducting assessments.",
    },
    {
      icon: "globe",
      title: "Global & inclusive",
      copy: "Sign in with Google, ORCID, or email.",
    },
  ];

  return (
    <footer className="hidden min-h-28 border-t border-[#173653] bg-[#08223d] px-6 text-white lg:grid lg:grid-cols-4 lg:items-center xl:px-10 2xl:px-14">
      {items.map((item, index) => (
        <div key={item.title} className={`flex min-h-16 items-center gap-3 px-5 ${index ? "border-l border-white/15" : ""}`}>
          <span className="grid size-9 shrink-0 place-items-center text-[#b8dff0]" aria-hidden="true">
            {item.icon === "shield" && (
              <svg viewBox="0 0 32 32" fill="none" className="size-8"><path d="M16 3.5 26 7v7.4c0 6.4-4 11.6-10 14.1-6-2.5-10-7.7-10-14.1V7l10-3.5Z" stroke="currentColor" strokeWidth="1.8" /><path d="m11.5 15.5 3 3 6.3-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            )}
            {item.icon === "lock" && (
              <svg viewBox="0 0 32 32" fill="none" className="size-8"><rect x="7" y="13" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M11 13V9a5 5 0 0 1 10 0v4M16 19v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            )}
            {item.icon === "people" && (
              <svg viewBox="0 0 32 32" fill="none" className="size-8"><circle cx="11" cy="10" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="23" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3 26v-3a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v3M20 18a6 6 0 0 1 8 5.7V26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            )}
            {item.icon === "globe" && (
              <svg viewBox="0 0 32 32" fill="none" className="size-8"><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.8" /><path d="M4.5 16h23M16 4c3 3.3 4.5 7.3 4.5 12S19 24.7 16 28c-3-3.3-4.5-7.3-4.5-12S13 7.3 16 4Z" stroke="currentColor" strokeWidth="1.8" /></svg>
            )}
          </span>
          <div className="text-xs leading-5 text-slate-300">
            <p className="font-bold text-white">{item.title}</p>
            <p className="max-w-52">{item.copy}</p>
          </div>
        </div>
      ))}
    </footer>
  );
}

export function AuthPage({
  mode,
  callbackURL,
  error,
}: {
  mode: AuthMode;
  callbackURL: string;
  error?: string;
}) {
  const signup = mode === "signup";

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0c2440]">
      <div className="lg:grid lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(30rem,0.95fr)]">
        <aside className="relative hidden min-h-[calc(100vh-7rem)] overflow-hidden border-r border-[#d8dee5] bg-[linear-gradient(135deg,#fbf8f2_0%,#f1e9dd_52%,#e7dac9_100%)] lg:block">
          <div className="absolute -left-24 top-1/4 size-80 rounded-full bg-white/65 blur-3xl" aria-hidden="true" />
          <div className="absolute -right-24 top-12 size-72 rounded-full bg-[#d6e8ef]/45 blur-3xl" aria-hidden="true" />

          <div className="absolute inset-x-0 top-0 z-10 px-9 py-7 xl:px-12 xl:py-8 2xl:px-14">
            <Link href="/" aria-label="Qualisapio home" className="inline-flex rounded-lg">
              <BrandMark />
            </Link>
          </div>

          <div className="absolute left-0 top-24 z-10 px-9 xl:top-28 xl:px-12 2xl:px-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0878b8]">
              Better science. Together.
            </p>
            <h2 className="mt-3 max-w-[34rem] font-serif text-[clamp(2.65rem,3.8vw,4.15rem)] leading-[0.98] tracking-[-0.045em] text-[#09213e]">
              {signup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-4 max-w-80 text-[15px] leading-6 text-[#102844] xl:mt-5 xl:text-base xl:leading-7">
              {signup
                ? "Join Qualisapio for peer-review support—as an author or reviewer of qualitative manuscripts."
                : "Return to your peer-review workspace."}
            </p>
            <FeatureList />
          </div>

          <div className="absolute -right-[5%] bottom-0 left-[14%] h-[54%]">
            <Image
              src="/mascot/auth-signup.png"
              alt="Qualisapio spotted white cat researcher working with a laptop, notebook, and books"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="55vw"
              className="object-contain object-bottom"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#e7dac9]/70 to-transparent" />
          </div>
        </aside>

        <section className="flex min-h-screen min-w-0 flex-col bg-[radial-gradient(circle_at_25%_10%,#ffffff_0%,#f8fafc_60%)] px-3 py-3 sm:px-6 sm:py-6 lg:min-h-[calc(100vh-7rem)] lg:justify-center lg:border-l-0 lg:px-8 lg:py-8 xl:px-12 2xl:px-16">
          <header className="flex items-center justify-between px-2 py-2 sm:px-1 lg:hidden">
            <Link href="/" aria-label="Qualisapio home"><BrandMark compact /></Link>
            <Link href="/" className="text-sm font-medium text-[#536579] hover:text-[#102844]">Back home</Link>
          </header>

          <div className="px-2 pt-7 lg:hidden">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0878b8]">Better science. Together.</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#536579]">
              Peer review for authors and reviewers. Sign in with Google, ORCID, or email.
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center py-5 lg:py-0">
            <AuthPanel mode={mode} callbackURL={callbackURL} initialError={error} />
          </div>

          <div className="relative mx-auto mb-4 h-56 w-full max-w-md overflow-hidden rounded-2xl border border-[#e2d7c8] bg-[linear-gradient(145deg,#fbf8f2,#eee3d4)] lg:hidden">
            <Image
              src="/mascot/auth-signup.png"
              alt="Qualisapio spotted white cat researcher working with a laptop, notebook, and books"
              fill
              loading="eager"
              sizes="(max-width: 1023px) 28rem, 0px"
              className="object-contain object-bottom"
            />
          </div>
        </section>
      </div>
      <TrustBar />
    </main>
  );
}
