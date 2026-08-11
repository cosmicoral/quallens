import Image from "next/image";
import type { AgentId } from "@/lib/types";

interface AgentMascotPresentation {
  src: string;
  alt: string;
}

const AGENT_MASCOTS: Record<AgentId, AgentMascotPresentation> = {
  "manuscript-reader": {
    src: "/mascot/agents/reader.png",
    alt: "QualiSapio Manuscript Reader mascot reading a manuscript",
  },
  "evidence-auditor": {
    src: "/mascot/agents/evidence.png",
    alt: "QualiSapio Evidence Auditor mascot examining evidence with a magnifying glass",
  },
  "research-design-reviewer": {
    src: "/mascot/agents/research-design.png",
    alt: "QualiSapio Research Design Reviewer mascot thoughtfully reviewing methodology notes",
  },
  "theory-auditor": {
    src: "/mascot/agents/theory.png",
    alt: "QualiSapio Theory Auditor mascot presenting a conceptual diagram",
  },
  "overclaim-auditor": {
    src: "/mascot/agents/overclaim.png",
    alt: "QualiSapio Overclaim Auditor mascot annotating a manuscript with a red pen",
  },
  "final-reviewer": {
    src: "/mascot/agents/final-reviewer.png",
    alt: "QualiSapio Final Reviewer mascot holding a completed review summary",
  },
};

export function AgentMascot({
  agentId,
  className = "",
  imageClassName = "",
  sizes = "96px",
}: {
  agentId: AgentId;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}) {
  const mascot = AGENT_MASCOTS[agentId];

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image
        src={mascot.src}
        alt={mascot.alt}
        fill
        sizes={sizes}
        className={`object-contain ${imageClassName}`}
      />
    </span>
  );
}
