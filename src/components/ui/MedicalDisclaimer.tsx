"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type DisclaimerVariant = "labs" | "protocol" | "compact" | "blog";

const COPY: Record<DisclaimerVariant, string> = {
  labs:
    "Interpretation only — not medical advice. Optimal ranges assume health on a very minimal cycle; deviations should be monitored. Do not stop, start, or change any medication, treatment, or protocol based on automated reads. Discuss any concerns with a qualified clinician.",
  protocol:
    "Reference material for planning and education — not medical advice. Doses and responses vary; pair with labs and clinical judgment.",
  compact:
    "Not medical advice. For informational use only — consult a qualified clinician before making health decisions.",
  blog:
    "Educational reference only — not medical advice. Consult a qualified clinician before making health or protocol decisions.",
};

type Props = {
  variant?: DisclaimerVariant;
  className?: string;
};

export function MedicalDisclaimer({ variant = "labs", className }: Props) {
  const isBlog = variant === "blog";

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 text-sm leading-relaxed",
        isBlog
          ? "text-[var(--muted)]"
          : variant === "protocol"
            ? "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/40 px-4 py-3 text-[var(--muted)]"
            : "rounded-[var(--radius-md)] border border-[var(--warning)]/25 bg-[var(--warning)]/5 px-4 py-3 text-[var(--foreground)]/80",
        className,
      )}
    >
      {!isBlog && (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
      )}
      <p>{COPY[variant]}</p>
    </div>
  );
}