import type { AgentId } from "@/lib/types";

export type ResearchIconName =
  | AgentId
  | "read"
  | "audit"
  | "synthesize"
  | "recommend";

export function ResearchIcon({
  name,
  className = "size-6",
}: {
  name: ResearchIconName;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} {...common}>
      {(name === "manuscript-reader" || name === "read") && (
        <>
          <path d="M6 3.5h9l3 3V20.5H6z" />
          <path d="M15 3.5v3h3M9 10h6M9 13.5h6M9 17h4" />
        </>
      )}
      {(name === "evidence-auditor" || name === "audit") && (
        <>
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="m15 15 4.5 4.5M8 8.5h5M8 11h3.5" />
        </>
      )}
      {name === "research-design-reviewer" && (
        <>
          <circle cx="12" cy="4.5" r="2.5" />
          <circle cx="5" cy="18.5" r="2.5" />
          <circle cx="19" cy="18.5" r="2.5" />
          <path d="m10.8 6.7-4.6 9.5M13.2 6.7l4.6 9.5M7.5 18.5h9" />
        </>
      )}
      {name === "theory-auditor" && (
        <>
          <circle cx="9" cy="10" r="5" />
          <circle cx="15" cy="10" r="5" />
          <circle cx="12" cy="15" r="5" />
        </>
      )}
      {name === "overclaim-auditor" && (
        <>
          <path d="M4 19V5M4 19h16M7 15l4-5 3 2 5-7" />
          <path d="m15.5 5 3.5-.2-.2 3.5" />
        </>
      )}
      {(name === "final-reviewer" || name === "recommend") && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16.5 9" />
        </>
      )}
      {name === "synthesize" && (
        <>
          <circle cx="5" cy="6" r="2.5" />
          <circle cx="19" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="m7.2 7.2 3.6 8.6M16.8 7.2l-3.6 8.6M7.5 6h9" />
        </>
      )}
    </svg>
  );
}
