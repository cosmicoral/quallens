"use client";

import { useConsultation } from "./ConsultationProvider";

const triggerStyles = {
  nav: "rounded-lg px-3 py-2 text-sm font-medium text-[var(--slate)] transition hover:bg-white hover:text-[var(--ink)] focus-ring",
  link: "text-sm font-semibold text-[var(--blue-deep)] underline-offset-4 transition hover:text-[var(--ink)] hover:underline focus-ring",
  subtle:
    "text-xs font-medium text-[var(--muted)] underline-offset-2 transition hover:text-[var(--blue-deep)] hover:underline focus-ring",
  sidebar:
    "mt-1 block w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-[var(--slate)] transition hover:bg-[var(--paper-blue)] hover:text-[var(--ink)] focus-ring",
} as const;

export function ConsultationTrigger({
  label = "Research consultation",
  variant = "link",
  className = "",
}: {
  label?: string;
  variant?: keyof typeof triggerStyles;
  className?: string;
}) {
  const { openConsultation } = useConsultation();

  return (
    <button
      type="button"
      onClick={openConsultation}
      className={`${triggerStyles[variant]} ${className}`.trim()}
    >
      {label}
    </button>
  );
}
