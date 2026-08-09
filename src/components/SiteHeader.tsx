import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color:rgba(248,250,252,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Qualisapio home" className="rounded-md focus-ring">
          <BrandMark compact />
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/review"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--slate)] transition hover:bg-white hover:text-[var(--ink)] sm:inline-flex"
          >
            Review
          </Link>
          <Link
            href="/#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--slate)] transition hover:bg-white hover:text-[var(--ink)] md:inline-flex"
          >
            How it works
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--slate)] transition hover:bg-white hover:text-[var(--ink)] sm:inline-flex"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--slate)] transition hover:bg-white hover:text-[var(--ink)] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/review"
            className="ml-1 inline-flex items-center rounded-lg bg-[var(--ink)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--navy)] sm:px-4"
          >
            <span className="sm:hidden">Start review</span>
            <span className="hidden sm:inline">Review a manuscript</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
