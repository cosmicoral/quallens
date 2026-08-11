export const STUDIO = {
  name: "Gethen Field Labs",
  url: "https://gethenfieldlabs.com/",
  tagline:
    "an independent AI studio building research-driven software products",
} as const;

export function StudioProductBadge({
  className = "mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs font-medium text-[var(--slate)] shadow-sm transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]",
  linkClassName = "font-semibold text-[var(--ink)] underline decoration-transparent underline-offset-2 transition hover:text-[var(--blue-deep)] hover:decoration-[var(--blue-soft)]",
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <a
      href={STUDIO.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <span className="text-[var(--muted)]">A product from</span>
      <span className={linkClassName}>{STUDIO.name}</span>
      <span aria-hidden="true" className="text-[var(--muted)]">
        ↗
      </span>
    </a>
  );
}

export function StudioAttribution({
  className = "text-xs leading-5 text-[var(--muted)]",
  linkClassName = "font-medium text-[var(--slate)] underline decoration-[var(--line-strong)] underline-offset-2 transition hover:text-[var(--blue-deep)]",
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <p className={className}>
      QualiSapio is developed by{" "}
      <a
        href={STUDIO.url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {STUDIO.name}
      </a>
      , {STUDIO.tagline}.
    </p>
  );
}
