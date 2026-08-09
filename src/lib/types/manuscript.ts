/**
 * Manuscript input types.
 *
 * For the MVP a manuscript is submitted as plain text plus light metadata.
 * PDF parsing / file upload is intentionally out of scope.
 */

export type Methodology =
  | "ethnography"
  | "interviews"
  | "focus-groups"
  | "case-study"
  | "grounded-theory"
  | "discourse-analysis"
  | "mixed-methods"
  | "other";

export interface ManuscriptInput {
  /** Manuscript title. */
  title: string;
  /** Abstract, if available. */
  abstract?: string;
  /** Full manuscript body as plain text. */
  body: string;
  /** Self-reported qualitative methodology. */
  methodology?: Methodology;
  /** Target discipline or field, e.g. "sociology", "political science". */
  discipline?: string;
  /**
   * Optional target journal name (e.g. "Qualitative Research").
   * Stored for review history and future journal-aware RAG; not used by agents in the MVP.
   */
  targetJournal?: string;
  /** Optional notes from the author to the reviewers. */
  authorNotes?: string;
}
