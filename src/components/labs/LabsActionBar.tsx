"use client";

import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { ArrowLeft, Flag, Save } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";

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
        <button type="button" onClick={onBack} className={cn(ui.btnGhost, "gap-1.5 text-xs")}>
          <AppIcon icon={ArrowLeft} size="sm" />
          {backLabel}
        </button>
      ) : (
        <div />
      )}
      {(showReviewFlags || showSaveInsights) && (
        <div className="flex flex-wrap items-center gap-2">
          {showReviewFlags && onReviewFlags && (
            <button
              type="button"
              onClick={onReviewFlags}
              className={cn(
                ui.btnToolbar,
                "border-[var(--warning)]/30 bg-[var(--protocol-dim)] uppercase text-[var(--warning)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <AppIcon icon={Flag} size="sm" />
              Review Flags
            </button>
          )}
          {showSaveInsights && onSaveInsights && (
            <button
              type="button"
              onClick={onSaveInsights}
              className={cn(ui.btnPrimary, "gap-1.5 text-xs font-bold uppercase")}
            >
              <AppIcon icon={Save} size="sm" />
              {saveInsightsLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}