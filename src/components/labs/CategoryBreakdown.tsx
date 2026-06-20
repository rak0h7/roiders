"use client";

import { useMemo } from "react";
import { X, AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import { CATEGORY_DESCRIPTIONS, buildCategoryMarkerRows, summarizeCategoryRows } from "@/lib/categoryBreakdown";
import type { CategoryScore, MarkerCategory, ReviewFlag } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { MarkerValue } from "@/lib/types";
import {
  CompoundPills,
  SeverityBadge,
  optimalRangeLabel,
  scoreColor,
} from "@/components/labs/labsUi";

interface CategoryBreakdownProps {
  category: MarkerCategory;
  categoryScore: CategoryScore;
  currentValues: Record<string, MarkerValue>;
  reviewFlags: ReviewFlag[];
  onClose: () => void;
}

export function CategoryBreakdown({
  category,
  categoryScore,
  currentValues,
  reviewFlags,
  onClose,
}: CategoryBreakdownProps) {
  const rows = useMemo(
    () => buildCategoryMarkerRows(category, currentValues, reviewFlags),
    [category, currentValues, reviewFlags]
  );
  const summary = summarizeCategoryRows(rows);
  const rangeLabel = optimalRangeLabel();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 pt-12 backdrop-blur-md sm:p-4 sm:pt-16">
      <div className={cn(ui.card, "flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden")}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-4 sm:p-5">
          <div className="min-w-0">
            <p className={ui.overline}>{rangeLabel} view</p>
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              {categoryScore.label}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{CATEGORY_DESCRIPTIONS[category]}</p>
          </div>
          <button type="button" onClick={onClose} className={cn(ui.btnGhost, "shrink-0")} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 border-b border-[var(--border)] p-4 sm:grid-cols-4 sm:p-5">
          <Panel className="p-3 text-center">
            <p className={cn("font-display text-3xl font-bold", scoreColor(categoryScore.score))}>
              {categoryScore.score ?? "—"}
            </p>
            <p className="text-[10px] text-[var(--muted)]">{categoryScore.status}</p>
          </Panel>
          <Panel className="p-3 text-center">
            <p className="font-display text-2xl font-bold text-[var(--danger)]">{summary.flagged}</p>
            <p className="text-[10px] text-[var(--muted)]">Flagged</p>
          </Panel>
          <Panel className="p-3 text-center">
            <p className="font-display text-2xl font-bold text-[var(--success)]">{summary.normal}</p>
            <p className="text-[10px] text-[var(--muted)]">In range</p>
          </Panel>
          <Panel className="p-3 text-center">
            <p className="font-display text-2xl font-bold text-[var(--muted)]">{summary.missing}</p>
            <p className="text-[10px] text-[var(--muted)]">Not logged</p>
          </Panel>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
          {rows.map((row) => {
            const isFlagged = row.logged && row.severity !== "normal";
            const isMissing = !row.logged;

            return (
              <Panel
                key={row.markerId}
                className={cn(
                  "p-4",
                  isFlagged && "border-l-4 border-l-[var(--warning)]",
                  isMissing && row.severity !== "normal" && "border-l-4 border-l-[var(--protocol)]",
                  isMissing && row.severity === "normal" && "opacity-70"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isFlagged ? (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
                      ) : isMissing ? (
                        <CircleDashed className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
                      )}
                      <span className="font-display font-semibold text-[var(--foreground)]">{row.name}</span>
                      {row.logged ? (
                        <SeverityBadge severity={row.severity} />
                      ) : (
                        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--muted)]">
                          Not logged
                        </span>
                      )}
                      {row.source === "cycle" && (
                        <span className="rounded-full border border-[var(--protocol)]/30 bg-[var(--protocol-dim)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--protocol)]">
                          Stack-linked
                        </span>
                      )}
                    </div>

                    {row.logged && row.value !== null && (
                      <p className={cn("mt-1 text-lg font-bold", isFlagged ? ui.statDanger : ui.statSuccess)}>
                        {row.value} {row.unit}
                      </p>
                    )}

                    {row.deviation && (
                      <p className="mt-1 text-xs text-[var(--muted)]">{row.deviation}</p>
                    )}

                    {row.recommendation && (
                      <p className="mt-2 text-xs text-[var(--intel)]">{row.recommendation}</p>
                    )}

                    <CompoundPills compoundIds={row.relatedCompounds} />
                  </div>

                  <div className="shrink-0 text-right text-[10px] text-[var(--muted)]">
                    <p>
                      <span className="text-[var(--muted-2)]">{rangeLabel}: </span>
                      {row.optimalRange}
                    </p>
                    {row.cautionRange && (
                      <p className="mt-0.5">
                        <span className="text-[var(--muted-2)]">Caution: </span>
                        {row.cautionRange}
                      </p>
                    )}
                    {row.strictThreshold !== undefined && (
                      <p className="mt-0.5 text-[var(--danger)]">
                        Hard stop ≥ {row.strictThreshold} {row.unit}
                      </p>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </div>
  );
}