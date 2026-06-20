"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CategoryMarkerRow } from "@/lib/categoryBreakdown";
import { Panel } from "@/components/ui/Panel";
import { MarkerRangeBar } from "@/components/labs/MarkerRangeBar";
import { CompoundPills, SeverityBadge, optimalRangeLabel } from "@/components/labs/labsUi";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type MarkerResultRowProps = {
  row: CategoryMarkerRow;
  id?: string;
};

export function MarkerResultRow({ row, id }: MarkerResultRowProps) {
  const [open, setOpen] = useState(false);
  const isFlagged = row.logged && row.severity !== "normal";
  const rangeLabel = optimalRangeLabel();

  return (
    <Panel
      id={id ?? `marker-${row.markerId}`}
      className={cn(
        "p-4 transition",
        isFlagged && "border-l-4 border-l-[var(--warning)]"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isFlagged ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
            )}
            <span className="font-display font-semibold text-[var(--foreground)]">{row.name}</span>
            {row.logged && <SeverityBadge severity={row.severity} />}
          </div>

          {row.logged && row.value !== null && (
            <p className={cn("mt-1 text-xl font-bold", isFlagged ? ui.statDanger : ui.statSuccess)}>
              {row.value} {row.unit}
            </p>
          )}

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            <span className="text-[var(--muted-2)]">{rangeLabel}: </span>
            {row.optimalRange}
            {row.cautionRange ? ` · Caution: ${row.cautionRange}` : ""}
          </p>
        </div>

        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[var(--muted)] transition", open && "rotate-180")}
        />
      </button>

      {row.logged && row.value !== null && (
        <div className="mt-3 max-w-md">
          <MarkerRangeBar markerId={row.markerId} value={row.value} unit={row.unit} />
        </div>
      )}

      {open && (
        <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
          {row.deviation && (
            <p className="text-xs text-[var(--muted)]">{row.deviation}</p>
          )}
          {row.recommendation && (
            <p className="text-xs text-[var(--foreground)]/85">{row.recommendation}</p>
          )}
          <CompoundPills compoundIds={row.relatedCompounds} />
        </div>
      )}
    </Panel>
  );
}