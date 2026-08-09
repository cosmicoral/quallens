import Image from "next/image";

export function OrcidBadge({ orcidId }: { orcidId: string }) {
  return (
    <a
      href={`https://orcid.org/${orcidId}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-[#a6ce39] bg-[#f7faef] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[#eef6dd]"
    >
      <Image src="/brand/orcid.svg" alt="ORCID iD" width={18} height={18} />
      {orcidId}
    </a>
  );
}
