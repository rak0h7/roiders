"use client";

import { AlertTriangle } from "lucide-react";
import type { ReviewFlag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type LabsCriticalBannerProps = {
  flags: ReviewFlag[];
  onMarkerClick?: (markerId: string) => void;
};

export function LabsCriticalBanner({ flags, onMarkerClick }: LabsCriticalBannerProps) {
  const critical = flags.filter((f) => f.severity === "stop" || f.severity === "high");
  if (critical.length === 0) return null;

  return (
    <div
      className={cn(
        ui.card,
        "border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4"
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--danger)]">
            {critical.length} marker{critical.length > 1 ? "s" : ""} need attention
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Review flags below — informational only, not medical advice.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {critical.map((flag) => (
              <button
                key={flag.markerId}
                type="button"
                onClick={() => onMarkerClick?.(flag.markerId)}
                className="rounded-full border border-[var(--danger)]/30 bg-[var(--bg-elevated)]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--danger)] transition hover:bg-[var(--danger)]/15"
              >
                {flag.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}