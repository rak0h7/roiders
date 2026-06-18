"use client";

import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { ArrowLeft, Flag, Save } from "lucide-react";

interface LabsActionBarProps {
  onBack?: () => void;
  backLabel?: string;
  onReviewFlags?: () => void;
  onSaveInsights?: () => void;
  showReviewFlags?: boolean;
  showSaveInsights?: boolean;
  saveInsightsLabel?: string;
}

export function LabsActionBar({
  onBack,
  backLabel = "Back",
  onReviewFlags,
  onSaveInsights,
  showReviewFlags = false,
  showSaveInsights = false,
  saveInsightsLabel = "Save & Insights",
}: LabsActionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {onBack ? (
        <button onClick={onBack} className={cn(ui.btnGhost, "h-10 gap-1.5 text-xs")}>
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </button>
      ) : (
        <div />
      )}
      {(showReviewFlags || showSaveInsights) && (
        <div className="flex flex-wrap items-center gap-2">
          {showReviewFlags && onReviewFlags && (
            <button
              onClick={onReviewFlags}
              className={cn(
                ui.btnSecondary,
                "gap-1.5 border-[var(--warning)]/30 bg-[var(--protocol-dim)] text-xs font-bold uppercase text-[var(--warning)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <Flag className="h-3.5 w-3.5" />
              Review Flags
            </button>
          )}
          {showSaveInsights && onSaveInsights && (
            <button onClick={onSaveInsights} className={cn(ui.btnPrimary, "gap-1.5 text-xs font-bold uppercase")}>
              <Save className="h-3.5 w-3.5" />
              {saveInsightsLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}