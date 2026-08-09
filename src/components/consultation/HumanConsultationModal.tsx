"use client";

import { useEffect, useId, useRef } from "react";
import { authClient } from "@/lib/auth/client";
import {
  CONSULTATION_COPY,
  consultationMailtoHref,
  consultationOutlookComposeHref,
  openConsultationMailto,
} from "./copy";
import "./human-consultation.css";

function CredibilityChip({
  label,
  emphasized = false,
}: {
  label: string;
  emphasized?: boolean;
}) {
  return (
    <span
      className={
        emphasized
          ? "consultation-chip consultation-chip--emphasized"
          : "consultation-chip"
      }
    >
      {label}
    </span>
  );
}

function ExpertiseChip({ label }: { label: string }) {
  return <span className="consultation-tag">{label}</span>;
}

export function HumanConsultationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { data: session } = authClient.useSession();

  const mailtoHref = consultationMailtoHref({
    requesterName: session?.user.name,
    requesterEmail: session?.user.email,
  });
  const outlookHref = consultationOutlookComposeHref({
    requesterName: session?.user.name,
    requesterEmail: session?.user.email,
  });

  function openConsultationEmail() {
    openConsultationMailto(mailtoHref);
    onClose();
  }

  function openConsultationInBrowser() {
    window.open(outlookHref, "_blank", "noopener,noreferrer");
    onClose();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
      document.body.classList.add("consultation-modal-open");
    } else if (dialog.open) {
      dialog.close();
      document.body.classList.remove("consultation-modal-open");
    }

    return () => {
      document.body.classList.remove("consultation-modal-open");
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="consultation-dialog"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="consultation-dialog-panel">
        <div className="consultation-dialog-header">
          <p className="consultation-eyebrow">{CONSULTATION_COPY.eyebrow}</p>
          <button
            type="button"
            className="consultation-close focus-ring"
            aria-label="Close consultation dialog"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="consultation-dialog-body">
          <h2 id={titleId} className="consultation-heading">
            {CONSULTATION_COPY.heading}
          </h2>

          <p className="consultation-consultant">{CONSULTATION_COPY.consultant}</p>
          <p id={descriptionId} className="consultation-positioning">
            {CONSULTATION_COPY.positioning}
          </p>

          <div className="consultation-chip-grid">
            {CONSULTATION_COPY.credibility.map((item) => (
              <CredibilityChip
                key={item.label}
                label={item.label}
                emphasized={"emphasized" in item && item.emphasized}
              />
            ))}
          </div>

          <div className="consultation-group">
            <p className="consultation-group-label">{CONSULTATION_COPY.methodsHeading}</p>
            <div className="consultation-tag-grid">
              {CONSULTATION_COPY.methods.map((label) => (
                <ExpertiseChip key={label} label={label} />
              ))}
            </div>
          </div>

          <div className="consultation-group">
            <p className="consultation-group-label">{CONSULTATION_COPY.areasHeading}</p>
            <div className="consultation-tag-grid">
              {CONSULTATION_COPY.areas.map((label) => (
                <ExpertiseChip key={label} label={label} />
              ))}
            </div>
          </div>

          <p className="consultation-support">{CONSULTATION_COPY.support}</p>

          <div className="consultation-pricing">
            <p className="consultation-rate">{CONSULTATION_COPY.rate}</p>
            <p className="consultation-intro">{CONSULTATION_COPY.introductory}</p>
          </div>

          <div className="consultation-actions">
            <button
              type="button"
              onClick={openConsultationInBrowser}
              className="consultation-cta focus-ring"
            >
              {CONSULTATION_COPY.cta}
            </button>
            <button
              type="button"
              onClick={openConsultationEmail}
              className="consultation-email-alt focus-ring"
            >
              Use default mail app instead
            </button>
            <a
              href={mailtoHref}
              className="consultation-email focus-ring"
              onClick={(event) => {
                event.preventDefault();
                openConsultationEmail();
              }}
            >
              {CONSULTATION_COPY.email}
            </a>
          </div>

          <p className="consultation-integrity">{CONSULTATION_COPY.integrity}</p>
        </div>
      </div>
    </dialog>
  );
}
