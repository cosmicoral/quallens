# Qualisapio

**Qualisapio** is an AI-powered multi-agent reviewer purpose-built for qualitative social science research.
You submit a manuscript; a panel of specialist reviewer agents each examines it
from a different angle, and a final reviewer synthesizes their assessments into
a revision-readiness judgment with prioritized recommendations.

The system combines specialized review perspectives for manuscript understanding,
evidence support, research design, theory use, overclaim detection, and final synthesis.

> **Status: MVP.** The full frontend ↔ backend flow works end-to-end.
> All six reviewers are LLM-backed (Claude, via a swappable provider abstraction).
> The Reader produces a strict profile; Evidence, Research Design, and Theory
> inspect the manuscript in parallel; Overclaim also uses the real Evidence Audit;
> then Final produces a structured, section-aware synthesis of every validated review.

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
`POST /api/review` route handler. Each agent uses the same provider abstraction
and typed error model. Better Auth provides Google, ORCID, and email/password
authentication with PostgreSQL-backed sessions and researcher profiles.

```
quallens/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page (reviewer panel overview)
│   │   ├── auth/                     # Login and signup
│   │   ├── dashboard/                # Protected researcher dashboard
│   │   ├── settings/                 # Protected profile and identities
│   │   ├── review/
│   │   │   ├── layout.tsx            # Server-side session guard
│   │   │   └── page.tsx              # Review page: submit form + results
│   │   └── api/
│   │       ├── review/                # Authenticated, quota-gated review API
│   │       ├── billing/               # Stripe Checkout, Portal, usage
│   │       └── stripe/webhook/        # Verified subscription webhooks
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
│   │   │   ├── overclaim-audit.ts     # Zod schema + OverclaimAudit
│   │   │   ├── final-review.ts         # Zod schema + FinalReview
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
│   │   │   ├── overclaim-auditor.ts          # REAL: claim-scope audit
│   │   │   ├── final-reviewer.ts             # REAL: prioritized synthesis
│   │   │   └── pipeline.ts           # Orchestrates reader → specialists → final
│   │   └── auth/                      # Better Auth, identity mapping, profiles
│   └── test/
│       ├── fixtures/
│       │   ├── qualitative-manuscript.ts  # Realistic manuscript + profile
│       │   ├── evidence-audit-fixtures.ts # Evidence audit scenarios
│       │   ├── research-design-fixtures.ts # Design review scenarios
│       │   ├── theory-audit-fixtures.ts # Theory integration scenarios
│       │   ├── overclaim-audit-fixtures.ts # Claim-scope scenarios
│       │   └── final-review-fixtures.ts # Final synthesis scenarios
│       └── fake-provider.ts          # LLMProvider test double
├── db/migrations/0001_auth.sql        # Better Auth + researcher profile schema
├── db/migrations/0002_billing.sql     # Subscriptions, review runs, webhook ledger
├── .env.example
└── README.md
```

### Authentication

Qualisapio uses one authentication framework: [Better Auth](https://www.better-auth.com/)
with PostgreSQL. Google is configured as a built-in social provider; ORCID uses
its supported OpenID Connect discovery document through Better Auth's generic
OAuth provider; and email/password uses Better Auth's password hashing and
session implementation. OAuth state, PKCE for ORCID, and secure HTTP-only
session cookies are handled by Better Auth.

The Proxy performs a fast cookie-presence redirect for `/dashboard`, `/review`,
and `/settings`. Each protected server route also performs authoritative
session validation. The review API validates the same server-side session.

`researcher_profile` stores the application profile: name, nullable public
email, first auth provider, nullable ORCID iD, optional institution and
discipline, and timestamps. ORCID profiles without a public email use a
reserved `.invalid` value only inside Better Auth; that value is never exposed
or copied into the researcher profile.

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

### The Overclaim Auditor (LLM-backed)

The Overclaim Auditor receives the original manuscript, validated profile, and
completed real `EvidenceAudit`. Its strict `OverclaimAudit` distinguishes
well-bounded qualitative claims from causal, population, cultural, novelty,
policy, practical, and conclusion-stage overreach. It preserves contextual
transferability and participant perceptions while separating minor wording
calibration from serious scope problems.

### The Final Reviewer (LLM-backed)

The Final Reviewer receives the original manuscript, validated profile, and all
four completed specialist audits. Its strict `FinalReview` prioritizes rather
than concatenates their findings, preserves specialist uncertainty, assesses
each main manuscript section, traces cross-section coherence, and returns at
most five actionable revisions. Its recommendation describes revision
readiness, not journal acceptance or rejection.

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
5. The **Overclaim Auditor runs for real** using the original manuscript,
   validated profile, and completed Evidence Audit.
6. The **Final Reviewer runs for real** using the original manuscript, profile,
   and all four completed specialist audits. It returns a validated `FinalReview`
   plus a legacy `FinalAssessment` compatibility view.
7. The route returns a `ReviewResult`; the frontend renders the structured final
   synthesis first, followed by each specialist audit.

### Key types (`src/lib/types/`)

- `ManuscriptInput` — plain-text manuscript plus light metadata.
- `ManuscriptProfile` — strict extraction of the manuscript's reported design,
  findings, and major claims.
- `EvidenceAudit` — strict claim-level support assessments and evidence items.
- `ResearchDesignAudit` — strict dimension-level design assessments, concerns,
  and revision priorities.
- `TheoryAudit` — strict framework, concept-consistency, integration, drift,
  and theoretical-contribution assessments.
- `OverclaimAudit` — strict claim-level risk, overreach basis, patterns, and
  scope-revision assessments.
- `FinalReview` — strict section-aware synthesis, cross-section coherence,
  revision-readiness recommendation, concerns, strengths, and up to five priorities.
- `ReviewerAgent` — the contract each specialist implements: `run(manuscript) → AgentReview`.
- `AgentReview` — one agent's summary, 1–5 score, and list of `ReviewFinding`s
  (severity, location, recommendation).
- `FinalAssessment` — legacy compatibility view derived from `FinalReview`.
- `ReviewResult` — the full run: all specialist reviews plus both final views.

## Getting started

```bash
npm install
cp .env.example .env.local
psql "$DATABASE_URL" -f db/migrations/0001_auth.sql
psql "$DATABASE_URL" -f db/migrations/0002_billing.sql
npm run dev
```

Set `BETTER_AUTH_SECRET`, `DATABASE_URL`, Google and ORCID credentials, and the
existing `ANTHROPIC_API_KEY` in `.env.local`. Open
[http://localhost:3000](http://localhost:3000), sign in, click **Review a
manuscript**, paste any text, and run a review.

## Billing and review allowances

Qualisapio uses Stripe Billing and Stripe-hosted Checkout/Customer Portal pages.
Stripe webhooks are authoritative: returning from Checkout does not itself
grant access. The local `subscription` row is a projection of verified Stripe
events, while `review_run` records quota reservations and outcomes.

Allowances are centralized in `src/lib/billing/config.ts`:

| Plan | Price | Successful full reviews |
|---|---:|---:|
| Free | £0 | 1 total, once per account |
| Plus monthly | £12/month | 5 per UTC calendar month |
| Plus annual | £120/year | 5 per UTC calendar month |
| Pro monthly | £24/month | 12 per UTC calendar month |
| Pro annual | £240/year | 12 per UTC calendar month |

Annual billing does not create an annual usage pool. For this MVP, every paid
allowance uses deterministic UTC calendar months (the first day at 00:00 UTC
through the next first day). A pending or running review reserves capacity and
only one review may run per user at once. The reservation becomes chargeable
only when all six agents complete successfully. Technical/provider failures
become `failed` and release the allowance; abandoned reservations are released
after two hours on the next reservation attempt. PostgreSQL advisory locking,
a row lock, and a unique partial index prevent concurrent double-spending.

Paid access is centralized in `getUserEntitlement`:

- `active` is allowed through the recorded paid period.
- `past_due` receives grace access through the recorded paid period while
  Stripe retries payment.
- `canceled` is allowed only until the recorded paid period ends.
- `trialing`, `unpaid`, `incomplete`, `incomplete_expired`, and `paused` do not
  grant paid access.
- A former paid user never receives a fresh Free allowance after cancellation.

### Required billing environment variables

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PLUS_MONTHLY=price_...
STRIPE_PRICE_PLUS_ANNUAL=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
```

The publishable key is reserved for future client-side Stripe components;
current purchases redirect to server-created Checkout Sessions. Secret and
webhook keys must never use a `NEXT_PUBLIC_` prefix.

### Stripe test-mode setup

1. In Stripe test mode, create Plus and Pro products. Add recurring GBP Prices:
   Plus £12 monthly and £120 yearly; Pro £24 monthly and £240 yearly.
2. Copy the four `price_...` IDs into the matching environment variables.
3. Enable/configure the Stripe Customer Portal for subscription management.
4. Install and authenticate the Stripe CLI, then forward the required events:

   ```bash
   stripe login
   stripe listen \
     --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed \
     --forward-to localhost:3000/api/stripe/webhook
   ```

5. Copy the CLI `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET` and
   restart `npm run dev`.
6. Sign in, choose a paid plan at `/pricing`, and complete test Checkout using
   Stripe's standard successful test card `4242 4242 4242 4242`, any future
   expiry, and any CVC/postcode.
7. Confirm the CLI reports successful webhook deliveries, then confirm the
   dashboard changes to Plus/Pro and decrements only after a successful review.
8. Run through the allowance limit and confirm the API blocks the next request
   before an LLM call. Trigger a provider failure and confirm it is not counted.
9. Open Settings → Manage billing, cancel in the Customer Portal, and confirm
   access remains only through the paid period and no new Free trial appears.

For Vercel, add the same variables to the intended deployment environment, use
the production HTTPS origin for `NEXT_PUBLIC_APP_URL`, apply both migrations to
the production PostgreSQL database, and register
`https://YOUR_DOMAIN/api/stripe/webhook` as a Stripe webhook endpoint with the
six events above. Start in Stripe test mode; moving to live mode later requires
replacing all Stripe keys, Price IDs, and the webhook signing secret together.
Qualisapio does not create products, switch modes, or charge live cards itself.

Or hit the API directly:

```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{"title": "My Study", "body": "Full manuscript text…", "methodology": "interviews"}'
```

## Testing

```bash
npm test
```

Tests run offline against a `FakeProvider` (no API key needed). They cover the
strict Manuscript Profile, all four specialist schemas, and the Final Review
schema; all six real agents; typed provider failures; bounded versus population claims; participant
perception versus causality; evidence and design scenarios; and theory
integration and drift.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [Better Auth](https://www.better-auth.com/) + PostgreSQL
- [Stripe Billing](https://stripe.com/billing) (Checkout, webhooks, Customer Portal)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) + Zod (structured outputs)
- Vitest

## Intentionally out of scope (for now)

- Background job queues and Stripe usage-based metering
- PDF parsing / file upload
- RAG, external literature search, or citation checking
- A separate backend service

## Future Plans

The MVP described above is **manuscript-grounded**: six specialist agents and a
Final Reviewer reason over the submitted text, with strict schemas and no
external retrieval. Everything below is **planned, not implemented**. It
extends Qualisapio toward methodology-aware, socially informed qualitative
review—without replacing human peer review or predicting journal acceptance.

### Design principles

Qualisapio will use retrieval only where external knowledge improves the review
task. Internal evidence coherence, claim proportionality, and manuscript-level
reasoning should remain grounded primarily in the submitted manuscript rather
than external retrieval.

Future development should preserve methodological pluralism: Qualisapio should
adapt to different qualitative traditions rather than enforcing a single
universal standard of rigor.

### Near term

Focus: production readiness, account infrastructure, and core workflow improvements
that make iterative qualitative writing practical.

- **Production deployment** — hardened hosting, environment configuration, and
  operational monitoring for the existing review pipeline.
- **Authentication and billing** — complete Google, ORCID, and email sign-in;
  Stripe subscriptions and usage controls in production (local/test flows exist
  in the MVP).
- **Review history** — persist completed review payloads so researchers can
  reopen prior runs, compare outcomes, and track allowance usage over time.
- **Per-agent progress** — stream specialist status to the review page during
  long runs (today the UI shows illustrative workflow only).
- **PDF / DOCX ingestion** — structured manuscript upload preserving headings,
  quotations, tables, appendices, and line/page references where possible, so
  feedback can point to specific sections.
- **Revision tracking (foundations)** — store manuscript versions and link each
  review to a version, preparing for diff-based revision review.

### Mid term

Focus: targeted RAG, qualitative-methodology grounding, and review modes that
respect paradigm diversity.

#### Journal-aware RAG

Retrieval-augmented review using **publicly available** target-journal materials:

- aims and scope
- author guidelines
- methodological expectations
- article-type requirements
- review criteria where published
- formatting and submission guidance

Users could select a target journal and receive feedback that distinguishes
**general manuscript quality** from **journal-specific fit and expectations**.
Qualisapio will **not** predict acceptance. Retrieved journal guidance should
be **cited or traceable in the UI** where it informs a recommendation.

#### Social-science methodology RAG

A curated knowledge base for qualitative social science—not generic literature
search. Intended to ground Research Design and related agents in established
guidance across traditions such as:

- thematic analysis and reflexive thematic analysis
- grounded theory
- ethnography
- narrative analysis
- discourse analysis
- phenomenology
- case study research
- qualitative comparative approaches
- mixed qualitative designs
- interview-based research, focus groups, and observational research

The goal is methodological grounding, not paradigm enforcement. Multiple
qualitative traditions should remain valid review contexts.

#### Theory-aware retrieval

Support the Theory Auditor with retrieval of:

- canonical conceptual definitions
- methodological/theoretical distinctions
- user-selected theoretical traditions
- manuscript-cited theoretical sources where legally and technically feasible

This should help distinguish theory name-dropping, descriptive concept use,
and genuine analytical operationalization—without claiming automated authority
over contested interpretations.

#### User-owned research library

Private project libraries containing, for example:

- prior manuscripts and dissertation chapters
- coding frameworks and interview guides
- memos and prior reviewer comments
- user-approved methodological references

Used for **contextual continuity across reviews** within a project. Principles:
private-by-default, user-controlled retrieval, no silent cross-user reuse of
manuscript content, and clear retention/deletion controls.

#### Revision-aware review

Manuscript-version comparison so reviewers can:

- compare V1 vs V2 (and later versions)
- identify whether major concerns were addressed
- detect newly introduced inconsistencies
- track changes in claims, theory, and evidence
- distinguish resolved vs unresolved issues

Supports iterative academic writing rather than one-off scoring.

#### Reflexivity and positionality support

Explicit qualitative support for researcher positionality, reflexivity,
insider/outsider positioning, power relations, field relationships, and
interpretation boundaries. Qualisapio will **never invent** a positionality
statement; it will report what is present, what is missing, and where reflexive
implications matter analytically.

#### Epistemology / paradigm-aware review

Optional (or cautiously inferred) paradigmatic orientation, e.g. interpretivist,
constructivist, critical realist, critical theory, feminist,
postcolonial/decolonial, pragmatist, phenomenological, or other orientations.
Review criteria should adapt accordingly. **No single epistemology is the
default standard** for all qualitative work. If the paradigm is unclear,
uncertainty is preserved rather than guessed.

#### Richer qualitative evidence reasoning

Expand the Evidence Auditor to better reason about:

- depth vs breadth of evidence
- negative and deviant cases
- participant heterogeneity
- saturation claims (without treating small *n* as an automatic flaw)
- interpretive richness vs quote dumping
- descriptive vs analytical findings
- transferability rather than statistical generalizability
- triangulation where appropriate
- contextual specificity

#### Section-aware manuscript diagnostics

Extend the Final Reviewer with richer section-specific checks across
Introduction, Literature Review, Methods, Findings, Discussion, and Conclusion—for
example gap-to-RQ alignment, RQ-to-design alignment, findings-to-evidence
alignment, findings-to-theory linkage, discussion-to-contribution coherence, and
conclusion proportionality.

#### Reviewer-mode customization

User-selectable modes such as developmental, critical, methods-focused,
theory-focused, pre-submission, and revise-and-resubmit response check—each
keeping the same evidence-grounded safety principles (no inference, no fabricated
evidence, preserved uncertainty).

#### Citation and source transparency

For any external retrieval:

- show which source informed a recommendation
- distinguish manuscript-derived judgments from retrieved methodological or
  journal guidance
- avoid fabricated citations
- avoid implying consensus where literature is contested

### Longer term

Focus: specialization, collaboration, routing optimization, and formal evaluation.

- **Journal-specific review profiles** — reusable configurations combining
  journal RAG, article type, and review mode.
- **Multi-model routing** — optional cost/latency optimization (e.g. lighter
  models for extraction, stronger models for theory/evidence synthesis), routed
  by task complexity. The current architecture intentionally prioritizes **role
  specialization over model heterogeneity**; routing is an optimization, not a
  prerequisite.
- **Collaborative supervisor/lab workflows** — shared projects, delegated
  review permissions, and advisor visibility where appropriate.
- **Longitudinal manuscript revision memory** — cross-version learning within a
  user's library without cross-user leakage.
- **Evaluation framework** — benchmark against qualitative social science expert
  reviewers, measuring agreement on priorities, hallucination rate,
  evidence-grounding accuracy, overclaim detection precision, methodological
  fairness across paradigms, usefulness/actionability, and latency/cost per full
  review. Human peer review remains the reference standard; Qualisapio aims to
  **complement**, not replace, expert judgment.
