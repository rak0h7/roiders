"use client";

import { buildMarkerRangeBar, type RangeBarSegmentKind } from "@/lib/markerRangeBar";
import { cn } from "@/lib/utils";

const SEGMENT_STYLES: Record<RangeBarSegmentKind, string> = {
  optimal: "bg-[var(--success)]/35",
  caution: "bg-[var(--warning)]/35",
  high: "bg-[var(--danger)]/35",
  low: "bg-[var(--intel)]/25",
};

type MarkerRangeBarProps = {
  markerId: string;
  value: number;
  unit: string;
  className?: string;
};

export function MarkerRangeBar({ markerId, value, unit, className }: MarkerRangeBarProps) {
  const layout = buildMarkerRangeBar(markerId, value, unit);
  if (!layout) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative h-2 overflow-hidden rounded-full bg-[var(--bg-hover)]">
        {layout.segments.map((seg, i) => (
          <div
            key={`${seg.kind}-${i}`}
            className={cn("absolute inset-y-0", SEGMENT_STYLES[seg.kind])}
            style={{ left: `${seg.start * 100}%`, width: `${(seg.end - seg.start) * 100}%` }}
          />
        ))}
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--foreground)] bg-[var(--labs)] shadow-[0_0_6px_var(--labs-glow)]"
          style={{ left: `${layout.valuePercent * 100}%` }}
          aria-hidden
        />
      </div>
      <div className="flex justify-between font-mono text-[9px] text-[var(--muted-2)]">
        <span>{layout.domainMin.toFixed(layout.domainMax > 100 ? 0 : 1)}</span>
        <span>{layout.domainMax.toFixed(layout.domainMax > 100 ? 0 : 1)}</span>
      </div>
    </div>
  );
}