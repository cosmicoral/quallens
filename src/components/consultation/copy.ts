export const CONSULTATION_COPY = {
  eyebrow: "Human research consultation",
  heading: "Need a human perspective?",
  consultant: "Coral Yu Han, PhD",
  positioning:
    "UK-trained sociologist specialising in qualitative research, with experience across research, university teaching, academic publishing, peer review, and international conference presentation.",
  credibility: [
    { label: "PhD from a UK research university", emphasized: true },
    { label: "MA from a UK top-10 university", emphasized: true },
    { label: "Teaching experience at a world top-10 university", emphasized: true },
    { label: "Qualitative methods, applied ethnography & social theory" },
    { label: "Top-tier global sociology & anthropology conferences" },
    {
      label: "Published through Q1 SSCI outlets and leading international academic publishers",
    },
    { label: "Experience as an academic peer reviewer" },
  ],
  methodsHeading: "Methods & theory",
  methods: [
    "Qualitative Methodology",
    "Sociology",
    "Science & Technology Studies (STS)",
    "Research Design",
    "Applied Ethnography",
    "Social Theory",
  ],
  areasHeading: "Research areas",
  areas: [
    "Sustainability",
    "Food",
    "Consumption",
    "Gender",
    "Ethnicity",
    "Digital Society",
    "Technology and Society",
    "Everyday Life",
    "Social Practices",
    "Material Culture",
  ],
  support:
    "Discuss qualitative research design, analytical framing, theory–evidence alignment, findings and discussion development, reviewer feedback, or revision strategy.",
  rate: "£40 / hour",
  introductory:
    "Complimentary 30-minute introductory consultation for new clients.",
  cta: "Book a free introductory consultation",
  email: "coralhanyu@outlook.com",
  mailtoSubject: "QualiSapio Research Consultation",
  mailtoBodyIntro:
    "Hello,\n\nI would like to book a complimentary 30-minute introductory consultation through QualiSapio.\n\nThank you.",
  integrity:
    "Consultation supports research development and critical feedback. It does not include ghostwriting, fabricated data, or guarantees of publication.",
} as const;

function consultationMailBody(options?: {
  requesterEmail?: string | null;
  requesterName?: string | null;
}) {
  if (options?.requesterEmail || options?.requesterName) {
    const details = [
      "Hello,",
      "",
      "I would like to book a complimentary 30-minute introductory consultation through QualiSapio.",
      "",
    ];
    if (options.requesterName) details.push(`Name: ${options.requesterName}`);
    if (options.requesterEmail) details.push(`Email: ${options.requesterEmail}`);
    details.push("", "Thank you.");
    return details.join("\n");
  }
  return CONSULTATION_COPY.mailtoBodyIntro;
}

export function consultationMailtoHref(options?: {
  requesterEmail?: string | null;
  requesterName?: string | null;
}) {
  const body = consultationMailBody(options);
  return `mailto:${CONSULTATION_COPY.email}?subject=${encodeURIComponent(CONSULTATION_COPY.mailtoSubject)}&body=${encodeURIComponent(body)}`;
}

/** Outlook web compose fallback when no local mail client handles mailto: links. */
export function consultationOutlookComposeHref(options?: {
  requesterEmail?: string | null;
  requesterName?: string | null;
}) {
  const body = consultationMailBody(options);
  const params = new URLSearchParams({
    to: CONSULTATION_COPY.email,
    subject: CONSULTATION_COPY.mailtoSubject,
    body,
  });
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

/** Open the system mail client synchronously (works outside modal focus traps). */
export function openConsultationMailto(href: string) {
  const link = document.createElement("a");
  link.href = href;
  link.style.display = "none";
  link.setAttribute("aria-hidden", "true");
  document.body.appendChild(link);
  link.click();
  link.remove();
}
