import { BrandMark } from "@/components/BrandMark";
import { ConsultationTrigger } from "@/components/consultation/ConsultationTrigger";
import { StudioAttribution } from "@/components/StudioAttribution";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-white">
      <div className="section-shell flex flex-col gap-5 py-8 sm:flex-row sm:items-start sm:justify-between">
        <BrandMark compact />
        <div className="flex max-w-xl flex-col items-start gap-2 sm:items-end sm:text-right">
          <p className="text-xs text-[var(--muted)]">
            Peer review for authors and reviewers in qualitative social science. Not a
            substitute for journal peer review.
          </p>
          <StudioAttribution className="text-xs leading-5 text-[var(--muted)] sm:text-right" />
          <ConsultationTrigger variant="subtle" label="Human research consultation" />
        </div>
      </div>
    </footer>
  );
}
