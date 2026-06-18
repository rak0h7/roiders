"use client";

import { Share, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddToHomeScreenModal({ open, onClose }: Props) {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--intel)]/30 bg-[var(--intel-dim)]">
            <Smartphone className="h-5 w-5 text-[var(--intel)]" />
          </div>
          <button type="button" onClick={onClose} className={ui.btnIcon} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className={cn(ui.sectionTitle, "mt-4")}>Add to Home Screen</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Install Roiders Club like an app for quick access from your home screen — no App Store required.
        </p>

        <ol className="mt-5 space-y-4 text-sm text-[var(--foreground)]">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--intel-dim)] text-xs font-bold text-[var(--intel)]">
              1
            </span>
            <span>
              Open this site in <strong>Safari</strong> (iPhone) or <strong>Chrome</strong> (Android).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--intel-dim)] text-xs font-bold text-[var(--intel)]">
              2
            </span>
            <span className="flex flex-wrap items-center gap-1.5">
              Tap the <Share className="inline h-4 w-4 text-[var(--intel)]" aria-hidden />{" "}
              <strong>Share</strong> button in your browser toolbar.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--intel-dim)] text-xs font-bold text-[var(--intel)]">
              3
            </span>
            <span>
              Scroll and tap <strong>Add to Home Screen</strong>, then confirm.
            </span>
          </li>
        </ol>

        <p className="mt-4 text-[11px] leading-relaxed text-[var(--muted)]">
          On iPhone the Share icon is at the bottom of Safari. On Android it is usually the three-dot menu or
          the share icon at the top of Chrome.
        </p>

        <button type="button" onClick={onClose} className={cn(ui.btnPrimary, "mt-6 w-full")}>
          Got it
        </button>
      </div>
    </div>
  );
}