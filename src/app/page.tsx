import Link from "next/link";
import { specialistAgents } from "@/lib/agents/pipeline";
import { finalReviewer } from "@/lib/agents/final-reviewer";

const panel = [...specialistAgents, finalReviewer];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <header className="mb-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          QualLens
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Multi-agent review for qualitative research
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          QualLens runs your qualitative social science manuscript through a
          panel of specialist reviewer agents — design, evidence, theory, and
          overclaim auditors — and returns a structured, actionable review.
        </p>
        <Link
          href="/review"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Review a manuscript
        </Link>
      </header>

      <section>
        <h2 className="mb-6 text-xl font-semibold">The reviewer panel</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {panel.map((agent) => (
            <li
              key={agent.id}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <h3 className="mb-1 font-medium">{agent.name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {agent.focus}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-16 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800">
        MVP — reviews are currently generated from placeholder data.
      </footer>
    </main>
  );
}
