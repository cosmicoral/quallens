"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { loginSchema, signupSchema } from "@/lib/auth/forms";

type AuthMode = "login" | "signup";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.6 4.6 0 0 1-2 3v2.8h3.3c1.9-1.8 2.9-4.4 2.9-7.9Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.7c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.8A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 13.8a6 6 0 0 1 0-3.7V7.4H3.1a10 10 0 0 0 0 9.2l3.4-2.8Z" />
      <path fill="#EA4335" d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 6Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" fill="none" className="size-7 text-[#0b2441]">
      <rect x="3.5" y="6" width="21" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m5 8 9 7 9-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
      <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      {hidden && <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  );
}

function friendlyError(message?: string) {
  if (!message) return "Authentication could not be completed. Please try again.";
  if (message.toLowerCase().includes("invalid email or password")) {
    return "The email or password was not recognized.";
  }
  return message;
}

export function AuthPanel({
  mode,
  callbackURL,
  initialError,
}: {
  mode: AuthMode;
  callbackURL: string;
  initialError?: string;
}) {
  const router = useRouter();
  const emailInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(initialError ?? "");
  const [busy, setBusy] = useState<"google" | "orcid" | "email" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const signup = mode === "signup";

  async function continueWithGoogle() {
    setError("");
    setBusy("google");
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL: `/auth/${mode}?error=oauth`,
    });
    if (result.error) {
      setError(friendlyError(result.error.message));
      setBusy(null);
    }
  }

  async function continueWithOrcid() {
    setError("");
    setBusy("orcid");
    const result = await authClient.signIn.oauth2({
      providerId: "orcid",
      callbackURL,
      errorCallbackURL: `/auth/${mode}?error=oauth`,
      requestSignUp: signup,
    });
    if (result.error) {
      setError(friendlyError(result.error.message));
      setBusy(null);
    }
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const fields = {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      ...(signup ? { fullName: String(data.get("fullName") ?? "") } : {}),
    };
    let result;
    setBusy("email");
    if (signup) {
      const parsed = signupSchema.safeParse(fields);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
        setBusy(null);
        return;
      }
      result = await authClient.signUp.email({
        name: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL,
      });
    } else {
      const parsed = loginSchema.safeParse(fields);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
        setBusy(null);
        return;
      }
      result = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL,
      });
    }

    if (result.error) {
      setError(friendlyError(result.error.message));
      setBusy(null);
      return;
    }
    router.push(callbackURL);
    router.refresh();
  }

  return (
    <section className="w-full max-w-[42rem] rounded-[1.4rem] border border-[#dce3e9] bg-white/95 p-6 shadow-[0_22px_70px_rgba(15,35,60,0.11)] backdrop-blur-sm sm:p-9 lg:p-10">
      <div className="mb-5">
        <h1 className="font-serif text-[2.65rem] font-semibold leading-none tracking-[-0.035em] text-[#0a213d] sm:text-5xl">
          {signup ? "Sign up" : "Log in"}
        </h1>
        <p className="mt-2 font-serif text-base text-[#52657b] sm:text-lg">
          {signup
            ? "Create your Qualisapio account to get started."
            : "Sign in to continue your research review."}
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={busy !== null}
          className="grid h-12 w-full grid-cols-[2rem_1fr] items-center rounded-lg border border-[#d4dce5] bg-white px-4 text-sm font-medium text-[#0c2440] transition hover:border-[#8fa1b3] hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 sm:grid-cols-[2.25rem_1fr_2.25rem] sm:px-5 sm:text-base"
        >
          <GoogleIcon />
          <span>{busy === "google" ? "Connecting to Google…" : "Continue with Google"}</span>
          <span className="hidden sm:block" />
        </button>
        <button
          type="button"
          onClick={continueWithOrcid}
          disabled={busy !== null}
          className="grid h-12 w-full grid-cols-[2rem_1fr] items-center rounded-lg border border-[#d4dce5] bg-white px-4 text-sm font-medium text-[#0c2440] transition hover:border-[#98b758] hover:bg-[#fbfdf7] disabled:cursor-wait disabled:opacity-60 sm:grid-cols-[2.25rem_1fr_auto] sm:px-5 sm:text-base"
        >
          <Image src="/brand/orcid.svg" alt="" width={25} height={25} />
          <span>{busy === "orcid" ? "Connecting to ORCID…" : "Continue with ORCID"}</span>
          <span className="hidden rounded-full bg-[#eef4f8] px-3 py-1 text-[10px] font-semibold text-[#315a78] sm:inline-flex sm:text-xs">
            Recommended
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            emailInput.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailInput.current?.focus();
          }}
          disabled={busy !== null}
          aria-controls="auth-email-form"
          className="grid h-12 w-full grid-cols-[2rem_1fr] items-center rounded-lg border border-[#d4dce5] bg-white px-4 text-sm font-medium text-[#0c2440] transition hover:border-[#8fa1b3] hover:bg-slate-50 disabled:opacity-60 sm:grid-cols-[2.25rem_1fr_2.25rem] sm:px-5 sm:text-base"
        >
          <EmailIcon />
          <span>Continue with email</span>
          <span className="hidden sm:block" />
        </button>
      </div>

      <div className="my-5 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-[#d8e0e8]" />
        <span className="text-xs font-semibold text-[#315a78]">or</span>
        <span className="h-px flex-1 bg-[#d8e0e8]" />
      </div>

      <form id="auth-email-form" onSubmit={submitEmail} noValidate className="space-y-3">
        {signup && (
          <label className="block text-sm font-semibold text-[#102844]">
            Full name
            <input
              name="fullName"
              autoComplete="name"
              required
              className="mt-2 h-11 w-full rounded-lg border border-[#d4dce5] bg-white px-4 text-sm font-normal shadow-sm placeholder:text-[#78899d]"
              placeholder="Your full name"
            />
          </label>
        )}
        <label className="block text-sm font-semibold text-[#102844]">
          Email address
          <input
            ref={emailInput}
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 h-11 w-full rounded-lg border border-[#d4dce5] bg-white px-4 text-sm font-normal shadow-sm placeholder:text-[#78899d]"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-semibold text-[#102844]">
          Password
          <span className="relative mt-2 block">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={signup ? 8 : undefined}
              required
              className="h-11 w-full rounded-lg border border-[#d4dce5] bg-white px-4 pr-12 text-sm font-normal shadow-sm placeholder:text-[#78899d]"
              placeholder={signup ? "Create a strong password" : "Enter your password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-[#78899d] hover:text-[#102844]"
            >
              <EyeIcon hidden={showPassword} />
            </button>
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950">
            {error === "oauth"
              ? "The identity provider did not complete sign-in. Please try again."
              : error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy !== null}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-[linear-gradient(90deg,#061b35,#0b3155)] px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60 sm:text-base"
        >
          {busy === "email"
            ? signup
              ? "Creating account…"
              : "Signing in…"
            : signup
              ? "Create account"
              : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#66778a]">
        {signup ? "Already have an account?" : "Don’t have an account?"}{" "}
        <Link
          href={signup ? "/auth/login" : "/auth/signup"}
          className="font-semibold text-[#0872b0] underline-offset-4 hover:underline"
        >
          {signup ? "Log in" : "Sign up"}
        </Link>
      </p>

      <div className="mt-4 flex items-center gap-4 rounded-lg bg-[#f4f7f9] px-5 py-3">
        <Image src="/brand/orcid.svg" alt="" width={26} height={26} className="shrink-0" />
        <div className="text-xs leading-5 text-[#52657b]">
          <p className="font-bold text-[#102844]">Why ORCID?</p>
          <p>Connect your researcher identity and keep your work linked to you, everywhere.</p>
        </div>
      </div>
    </section>
  );
}
