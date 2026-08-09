# QualLens

**QualLens** is a multi-agent reviewer for qualitative social science research.
You submit a manuscript; a panel of specialist reviewer agents each examines it
from a different angle, and a final reviewer synthesizes their assessments into
a verdict with prioritized revision recommendations.

> **Status: MVP.** The full frontend ↔ backend flow works end-to-end. The
> **Manuscript Reader, Evidence Auditor, Research Design Reviewer, and Theory
> Auditor are LLM-backed** (Claude, via a swappable provider abstraction). The
> Reader produces a strict manuscript profile, then all three specialist
> reviewers inspect the original manuscript; Overclaim and Final remain mocked.

## The reviewer panel

| Agent | Focus |
|---|---|
| **Manuscript Reader** | Reads the full manuscript; maps research question, structure, and coherence. Grounds the other reviewers. |
| **Research Design Reviewer** | Fit between question and method: sampling, data collection, reflexivity, ethics. |
| **Evidence Auditor** | Whether every claim is backed by data, including negative/disconfirming cases. |
| **Theory Auditor** | Whether the theoretical framework genuinely informs the analysis. |
| **Overclaim & Contribution Auditor** | Overgeneralization, inflated novelty, credibility of the stated contribution. |
| **Final Reviewer** | Synthesizes all specialist reviews into a verdict and revision plan. |

## Architecture

A single Next.js (App Router) application — no separate backend service. The
review pipeline lives in `src/lib/agents/` and is invoked by the
`POST /api/review` route handler, so swapping the mock agents for real
LLM-backed ones later requires no changes to the API surface or the frontend.

```
quallens/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page (reviewer panel overview)
│   │   ├── review/
│   │   │   └── page.tsx              # Review page: submit form + results
│   │   └── api/
│   │       └── review/
│   │           └── route.ts          # POST /api/review
│   ├── components/
│   │   ├── ReviewForm.tsx            # Manuscript submission form
│   │   └── ReviewResults.tsx         # Renders ReviewResult
│   ├── lib/
│   │   ├── types/
│   │   │   ├── manuscript.ts         # ManuscriptInput and related types
│   │   │   ├── manuscript-profile.ts # Zod schema + ManuscriptProfile type
│   │   │   ├── evidence-audit.ts      # Zod schema + EvidenceAudit type
│   │   │   ├── research-design-audit.ts # Zod schema + ResearchDesignAudit
│   │   │   ├── theory-audit.ts        # Zod schema + TheoryAudit
│   │   │   ├── review.ts             # ReviewResult, AgentReview, findings…
│   │   │   └── index.ts
│   │   ├── llm/
│   │   │   ├── types.ts              # LLMProvider abstraction + typed errors
│   │   │   ├── anthropic.ts          # Anthropic implementation (Claude)
│   │   │   └── index.ts              # Provider factory (env-configurable)
│   │   ├── agents/
│   │   │   ├── types.ts              # AgentInfo + ReviewerAgent contracts
│   │   │   ├── manuscript-reader.ts  # REAL: LLM-backed structured profiling
│   │   │   ├── research-design-reviewer.ts   # REAL: design audit
│   │   │   ├── evidence-auditor.ts           # REAL: claim-level evidence audit
│   │   │   ├── theory-auditor.ts             # REAL: theoretical integration audit
│   │   │   ├── overclaim-auditor.ts          # mock
│   │   │   ├── final-reviewer.ts             # mock
│   │   │   └── pipeline.ts           # Orchestrates reader → specialists → final
│   │   └── mock/
│   │       └── mock-review.ts        # Canned data for the remaining mock agents
│   └── test/
│       ├── fixtures/
│       │   ├── qualitative-manuscript.ts  # Realistic manuscript + profile
│       │   ├── evidence-audit-fixtures.ts # Evidence audit scenarios
│       │   ├── research-design-fixtures.ts # Design review scenarios
│       │   └── theory-audit-fixtures.ts # Theory integration scenarios
│       └── fake-provider.ts          # LLMProvider test double
├── .env.example
└── README.md
```

### The Manuscript Reader (LLM-backed)

The Manuscript Reader turns a manuscript into a strict **structured
manuscript profile** (`ManuscriptProfile` in
`src/lib/types/manuscript-profile.ts`): topic, research questions,
contribution, theoretical frameworks, key concepts, methodology, sampling,
sample, data collection, analysis, fieldwork context, ethics, reflexivity,
findings, analytical claims, conclusions, limitations, and
`missing_information`.

Social-science rules are enforced in both the prompt and the schema:

- **No inference.** Absent information becomes `null`/empty **and** is listed
  in `missing_information` — fields are never invented.
- **Participant accounts vs author interpretation** — every finding carries an
  `evidence_type`.
- **Statistical generalisability vs qualitative transferability** — every
  major claim carries a `generalization_type` (recording what the authors
  claim).
- **Mentioned ≠ operationalised** — each framework carries
  `operationalized_in_analysis: "yes" | "no" | "unclear"`.
- **Uncertainty is preserved** via `"unclear"` values and an `ambiguities`
  list.

Output is generated with Anthropic structured outputs against a Zod-derived
JSON schema and validated by the SDK before it reaches the app. If the model
refuses, the output fails validation, or the provider errors, the API returns
a typed error (`errorCode`: `missing_api_key` | `refusal` | `invalid_output`
| `provider_error`) — never partial or fabricated fields.

### The Evidence Auditor (LLM-backed)

The Evidence Auditor receives both the original `ManuscriptInput` and the
validated `ManuscriptProfile`. It starts from the Reader's
`major_analytical_claims`, then inspects the original manuscript for supporting
and complicating evidence. Its strict `EvidenceAudit` output records evidence
type and distribution, support level, overclaim risk, reasoning, deviant cases,
and claim-level revision advice. Claims that cannot be judged from the reported
material are marked `cannot_assess` rather than guessed.

### The Research Design Reviewer (LLM-backed)

The Research Design Reviewer also receives the original manuscript and the
validated profile. Its strict `ResearchDesignAudit` assesses question/design
alignment, sampling rationale, recruitment, data generation, analytical
process, reflexivity, ethics, transferability/context, and overall design
coherence. It preserves missing or unassessable information and does not treat
small non-random samples, absent universal saturation claims, or lack of
statistical generalisability as automatic qualitative design defects.

### The Theory Auditor (LLM-backed)

The Theory Auditor receives the same original manuscript and validated profile.
Its strict `TheoryAudit` distinguishes named frameworks from operationalized
analysis, traces concept definitions and consistency across sections, surfaces
conceptual drift, assesses whether theory changes empirical interpretation,
and tests whether theoretical contribution claims are proportionate to the
analysis. It does not invent mechanisms or treat citation as integration.

### LLM provider abstraction

Agents depend on the `LLMProvider` interface (`src/lib/llm/types.ts`), not on
a vendor SDK. The provider and model are chosen via environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required for the Anthropic provider |
| `LLM_PROVIDER` | `anthropic` | Which `LLMProvider` implementation to use |
| `LLM_MODEL` | `claude-opus-5` | Model ID passed to the provider |

Adding a provider = implementing `LLMProvider` and registering it in
`src/lib/llm/index.ts`. Tests use a `FakeProvider` the same way.

### Data flow

1. The review page (`/review`) collects a `ManuscriptInput` (title, abstract,
   body text, methodology, discipline) and POSTs it to `/api/review`.
2. The route handler validates the input and calls `runReviewPipeline()`.
3. The **Manuscript Reader runs first, for real**: the configured LLM
   produces a schema-validated `ManuscriptProfile`, attached to its
   `AgentReview`. A failure aborts the run with a typed error.
4. The **Evidence Auditor, Research Design Reviewer, and Theory Auditor run in
   parallel, for real**, using both the original manuscript and the validated
   profile. A failure from any specialist aborts with a typed error.
5. The Overclaim specialist (still mock) runs, then the Final Reviewer (mock)
   synthesizes a `FinalAssessment`.
6. The route returns a `ReviewResult`; the frontend renders the final verdict,
   strengths/weaknesses, recommendations, and each agent's findings.

### Key types (`src/lib/types/`)

- `ManuscriptInput` — plain-text manuscript plus light metadata.
- `ManuscriptProfile` — strict extraction of the manuscript's reported design,
  findings, and major claims.
- `EvidenceAudit` — strict claim-level support assessments and evidence items.
- `ResearchDesignAudit` — strict dimension-level design assessments, concerns,
  and revision priorities.
- `TheoryAudit` — strict framework, concept-consistency, integration, drift,
  and theoretical-contribution assessments.
- `ReviewerAgent` — the contract each specialist implements: `run(manuscript) → AgentReview`.
- `AgentReview` — one agent's summary, 1–5 score, and list of `ReviewFinding`s
  (severity, location, recommendation).
- `FinalAssessment` — verdict (`accept` … `reject`), overall score, strengths,
  weaknesses, prioritized recommendations.
- `ReviewResult` — the full run: all agent reviews plus the final assessment.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Review a
manuscript**, paste any text, and run a review.

Or hit the API directly:

```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{"title": "My Study", "body": "Full manuscript text…", "methodology": "interviews"}'
```

## Testing

```bash
npm test
```

Tests run offline against a `FakeProvider` (no API key needed). They cover the
strict Manuscript Profile, Evidence Audit, Research Design Audit, and Theory
Audit schemas; all four real agents; typed provider failures; evidence and
design scenarios; theory name-checking versus integration; and conceptual
drift.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) + Zod (structured outputs)
- Vitest

## Intentionally out of scope (for now)

- LLM-backed implementations of Overclaim and Final (mock data)
- Authentication, databases, payments, queues
- PDF parsing / file upload
- RAG, external literature search, or citation checking
- A separate backend service

## Roadmap

1. Implement the remaining agents behind the existing `LLMProvider`
   abstraction, grounded on the Manuscript Reader's profile.
2. Stream per-agent progress to the review page.
3. Manuscript file upload (PDF/DOCX) and parsing.
4. Persist review history.
