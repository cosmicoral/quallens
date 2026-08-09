export function ScoreBadge({ score, large = false }: { score: number; large?: boolean }) {
  return (
    <span
      className={
        large
          ? "font-mono text-5xl font-medium tracking-[-0.06em] text-white sm:text-6xl"
          : "shrink-0 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 font-mono text-xs font-semibold text-[var(--ink)]"
      }
    >
      {score}
      <span className={large ? "ml-1 text-lg text-slate-400" : "text-[var(--muted)]"}>
        /5
      </span>
    </span>
  );
}
