# QualLens

**QualLens** is a multi-agent reviewer for qualitative social science research.
You submit a manuscript; a panel of specialist reviewer agents each examines it
from a different angle, and a final reviewer synthesizes their assessments into
a verdict with prioritized revision recommendations.

> **Status: MVP.** The full frontend ↔ backend flow works end-to-end. The
> **Manuscript Reader is LLM-backed** (Claude, via a swappable provider
> abstraction) and produces a strict, validated structured manuscript
> profile; the remaining reviewer agents still return mock data.

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
│   │   │   ├── review.ts             # ReviewResult, AgentReview, findings…
│   │   │   └── index.ts
│   │   ├── llm/
│   │   │   ├── types.ts              # LLMProvider abstraction + typed errors
│   │   │   ├── anthropic.ts          # Anthropic implementation (Claude)
│   │   │   └── index.ts              # Provider factory (env-configurable)
│   │   ├── agents/
│   │   │   ├── types.ts              # AgentInfo + ReviewerAgent contracts
│   │   │   ├── manuscript-reader.ts  # REAL: LLM-backed structured profiling
│   │   │   ├── research-design-reviewer.ts   # mock
│   │   │   ├── evidence-auditor.ts           # mock
│   │   │   ├── theory-auditor.ts             # mock
│   │   │   ├── overclaim-auditor.ts          # mock
│   │   │   ├── final-reviewer.ts             # mock
│   │   │   └── pipeline.ts           # Orchestrates reader → specialists → final
│   │   └── mock/
│   │       └── mock-review.ts        # Canned data for the not-yet-real agents
│   └── test/
│       ├── fixtures/
│       │   └── qualitative-manuscript.ts  # Realistic manuscript + profile
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
4. The four remaining specialists (still mock) run, then the Final Reviewer
   (mock) synthesizes a `FinalAssessment`.
5. The route returns a `ReviewResult`; the frontend renders the final verdict,
   strengths/weaknesses, recommendations, and each agent's findings.

### Key types (`src/lib/types/`)

- `ManuscriptInput` — plain-text manuscript plus light metadata.
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

Tests run offline against a `FakeProvider` (no API key needed):
schema-validation tests for `ManuscriptProfile`, Manuscript Reader tests on a
realistic qualitative manuscript fixture, a test showing how **missing
reflexivity and sampling information** is represented (`null` fields +
`missing_information` entries + findings), and typed-error tests for invalid
model output.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) + Zod (structured outputs)
- Vitest

## Intentionally out of scope (for now)

- LLM-backed implementations of the other five agents (mock data)
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
