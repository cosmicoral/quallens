export const STUDIO = {
  name: "Gethen Field Labs",
  url: "https://gethenfieldlabs.com/",
  tagline:
    "an independent AI studio building research-driven software products",
} as const;

export function StudioAttribution({
  className = "text-xs leading-5 text-[var(--muted)]",
  linkClassName = "font-medium text-[var(--slate)] underline decoration-[var(--line-strong)] underline-offset-2 transition hover:text-[var(--blue-deep)]",
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <p className={className}>
      Qualisapio is developed by{" "}
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
