export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[var(--ink)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className={compact ? "size-8" : "size-9"}
        fill="none"
      >
        <circle cx="21" cy="21" r="15" stroke="currentColor" strokeWidth="4" />
        <path
          d="m32 32 10 10M18 25l4-4 3-6"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="25" cy="15" r="2.5" fill="currentColor" />
      </svg>
      <span
        className={`${compact ? "text-xl" : "text-2xl"} font-semibold tracking-[-0.04em]`}
      >
        QualiSapio
      </span>
    </span>
  );
}
