"use client";

import { Lock, X } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  feature?: string;
};

function requestHref(supportUrl: string) {
  return supportUrl.trim() || "mailto:support@roiders.club?subject=Premium%20access%20request";
}

export function PremiumFeatureModal({ open, onClose, feature = "This feature" }: Props) {
  const { settings } = useSiteConfig();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={cn(ui.card, ui.cardPad, "w-full max-w-md shadow-2xl")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={ui.rowBetween}>
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--protocol)]/30 bg-[var(--protocol-dim)]">
            <Lock className="h-5 w-5 text-[var(--protocol)]" />
          </div>
          <button type="button" onClick={onClose} className={ui.btnIcon} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className={cn(ui.sectionTitle, "mt-4")}>{feature}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          This is only available for premium users.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={requestHref(settings.support_url)} className={ui.btnPrimary}>
            Request premium access
          </a>
          <button type="button" onClick={onClose} className={ui.btnSecondary}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}