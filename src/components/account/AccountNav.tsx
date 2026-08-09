"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConsultationTrigger } from "@/components/consultation/ConsultationTrigger";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    match: (path: string) => path === "/dashboard" || path.startsWith("/dashboard/"),
  },
  { href: "/review", label: "Peer review", match: (path: string) => path.startsWith("/review") },
  { href: "/pricing", label: "Plans", match: (path: string) => path.startsWith("/pricing") },
  { href: "/settings", label: "Settings", match: (path: string) => path.startsWith("/settings") },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Researcher workspace"
      className="account-nav flex gap-2 overflow-x-auto rounded-[1.15rem] border p-2 lg:block lg:space-y-0.5 lg:p-2.5"
    >
      {NAV_ITEMS.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            data-active={active}
            aria-current={active ? "page" : undefined}
            className="account-nav-link block shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--slate)] hover:bg-[var(--paper-blue)] hover:text-[var(--ink)]"
          >
            {label}
          </Link>
        );
      })}
      <ConsultationTrigger variant="sidebar" label="Human consultation" />
    </nav>
  );
}
