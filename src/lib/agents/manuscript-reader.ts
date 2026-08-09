import { getLLMProvider } from "@/lib/llm";
import type { LLMError, LLMProvider } from "@/lib/llm";
import {
  manuscriptProfileSchema,
  type AgentReview,
  type ManuscriptInput,
  type ManuscriptProfile,
  type ReviewFinding,
  type Severity,
} from "@/lib/types";
import type { AgentInfo } from "./types";

/**
 * Manuscript Reader — the first LLM-backed agent in the review pipeline.
 *
 * Reads the manuscript end-to-end and produces a strict, structured
 * ManuscriptProfile that grounds the other reviewers. It extracts and
 * describes; it does not evaluate.
 */
export const manuscriptReader: AgentInfo = {
  id: "manuscript-reader",
  name: "Manuscript Reader",
  focus:
    "Overall comprehension: research question, structure, and coherence of the manuscript.",
};

const SYSTEM_PROMPT = `You are the Manuscript Reader in QualLens, a multi-agent reviewer for qualitative social science research. Your sole task is to read a manuscript and produce a faithful structured profile of it. You are an extractor and describer, not an evaluator — later agents judge quality; you record what the manuscript actually says.

Follow these rules strictly:

1. Extract only what is present in the manuscript. Never infer, guess, or fill in information that is not stated. If you are tempted to write something the authors did not say, stop.
2. If expected information is absent, set that field to null (or an empty array) AND add a short label for it to missing_information (e.g. "sampling strategy", "reflexivity or positionality statement", "ethical approval", "analytical method"). Do not paraphrase absence into content.
3. Distinguish participant accounts from author interpretation. A finding grounded in what participants said or reported is a "participant_account"; a finding that rests on the authors' analytical reading of the data is "author_interpretation"; use "mixed" or "unclear" where appropriate.
4. Distinguish statistical generalisability from qualitative transferability. For each major analytical claim, record the kind of generality the AUTHORS claim ("statistical_generalization", "qualitative_transferability", "case_specific", or "unclear"). Record their claim faithfully even if it is methodologically inappropriate — flagging that is another agent's job.
5. Do not treat a theory mentioned in the introduction or literature review as necessarily operationalised in the analysis. Mark operationalized_in_analysis "yes" only when the analysis demonstrably uses the framework's concepts; "no" when it is merely cited; "unclear" when you cannot tell.
6. Preserve uncertainty. Where the manuscript is ambiguous, choose the "unclear" option or hedge in the text ("unclear whether ...") and record the point in ambiguities. Never resolve ambiguity in either direction.
7. Stay close to the authors' own terminology, quoting short phrases where that adds fidelity.`;

function buildPrompt(manuscript: ManuscriptInput): string {
  const parts = [
    `Produce the structured profile for the following manuscript.`,
    ``,
    `<manuscript>`,
    `<title>${manuscript.title}</title>`,
  ];
  if (manuscript.discipline) {
    parts.push(`<submitted_discipline>${manuscript.discipline}</submitted_discipline>`);
  }
  if (manuscript.methodology) {
    parts.push(
      `<self_reported_methodology>${manuscript.methodology}</self_reported_methodology>`,
    );
  }
  if (manuscript.abstract) {
    parts.push(`<abstract>`, manuscript.abstract, `</abstract>`);
  }
  parts.push(`<body>`, manuscript.body, `</body>`, `</manuscript>`);
  return parts.join("\n");
}

export type ManuscriptReaderReview = AgentReview & {
  profile: ManuscriptProfile;
};

export type ManuscriptReaderResult =
  | { ok: true; review: ManuscriptReaderReview }
  | { ok: false; error: LLMError };

/** Findings about missing methodological information, derived from the profile. */
function findingsFromProfile(profile: ManuscriptProfile): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  profile.missing_information.forEach((item, i) => {
    const severity: Severity = /sampling|ethic|reflexivit|positionalit|analytical/i.test(item)
      ? "moderate"
      : "minor";
    findings.push({
      id: `mr-missing-${i + 1}`,
      severity,
      title: `Not reported: ${item}`,
      detail: `The manuscript does not report ${item}. This information is expected in a qualitative social science manuscript and its absence limits what downstream reviewers can assess.`,
      recommendation: `Report ${item} explicitly.`,
    });
  });
  profile.ambiguities.forEach((item, i) => {
    findings.push({
      id: `mr-ambiguous-${i + 1}`,
      severity: "minor",
      title: "Ambiguity in the manuscript",
      detail: item,
      recommendation: "Clarify this point so reviewers and readers need not guess.",
    });
  });
  return findings;
}

/** Comprehension score is a simple completeness heuristic for the MVP. */
function scoreFromProfile(profile: ManuscriptProfile): number {
  const missing = profile.missing_information.length;
  if (missing === 0) return 5;
  if (missing <= 2) return 4;
  if (missing <= 5) return 3;
  if (missing <= 8) return 2;
  return 1;
}

function summaryFromProfile(profile: ManuscriptProfile): string {
  const approach =
    profile.qualitative_approach ?? profile.methodology ?? "an unspecified methodology";
  const questions =
    profile.research_questions.length > 0
      ? `It states ${profile.research_questions.length} research question(s).`
      : "No explicit research question is stated.";
  const missing =
    profile.missing_information.length > 0
      ? ` ${profile.missing_information.length} expected item(s) of information are not reported.`
      : " All expected methodological information is reported.";
  return `The manuscript examines ${profile.research_topic} using ${approach}. ${questions}${missing}`;
}

/**
 * Run the Manuscript Reader against a real LLM.
 *
 * Returns a typed result: on success, an AgentReview carrying the validated
 * ManuscriptProfile; on failure (auth, refusal, invalid/unparseable output,
 * provider error), the typed LLMError — never invented or partial fields.
 */
export async function readManuscript(
  manuscript: ManuscriptInput,
  provider: LLMProvider = getLLMProvider(),
): Promise<ManuscriptReaderResult> {
  const result = await provider.generateStructured({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(manuscript),
    schema: manuscriptProfileSchema,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const profile = result.value;
  return {
    ok: true,
    review: {
      agentId: manuscriptReader.id,
      agentName: manuscriptReader.name,
      summary: summaryFromProfile(profile),
      score: scoreFromProfile(profile),
      findings: findingsFromProfile(profile),
      profile,
    },
  };
}
