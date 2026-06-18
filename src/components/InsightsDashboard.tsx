"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useCycleStore } from "@/store/cycleStore";
import { generateCrossAlerts } from "@/lib/crossIntelligence";
import { CrossAlerts } from "@/components/home/CrossAlerts";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { MarkerCategory } from "@/lib/types";
import { CategoryBreakdown } from "@/components/labs/CategoryBreakdown";
import { PreviousBloodworkLog } from "@/components/labs/PreviousBloodworkLog";
import {
  CATEGORY_ICONS,
  CATEGORY_TAG_STYLES,
  scoreBarColor,
  scoreColor,
} from "@/components/labs/labsUi";
import { Activity, ChevronRight } from "lucide-react";

export function InsightsDashboard() {
  const {
    categoryScores,
    overallScore,
    extractionFileName,
    currentValues,
    activeReport,
    reviewFlags,
    reports,
    rangeMode,
  } = useApp();
  const { compounds } = useCycleStore();
  const [selectedCategory, setSelectedCategory] = useState<MarkerCategory | null>(null);
  const markerCount = Object.keys(currentValues).length;
  const crossAlerts = generateCrossAlerts(currentValues, reviewFlags, compounds);
  const selectedScore = selectedCategory
    ? categoryScores.find((c) => c.category === selectedCategory)
    : null;

  if (markerCount === 0 && reports.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        variant="labs"
        title="No insights yet"
        description="Enter lab values or upload a report to unlock category scores, health analysis, and cross-module recommendations."
      />
    );
  }

  if (markerCount === 0) {
    return (
      <div className="space-y-6">
        <PreviousBloodworkLog />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CrossAlerts alerts={crossAlerts} />
      {(extractionFileName || activeReport) && (
        <Panel variant="labs" className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--labs)]" />
              <span className={ui.overline}>Currently Analysing</span>
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {activeReport?.name || extractionFileName}
              </span>
            </div>
            <div className="text-right text-[10px] text-[var(--muted)]">
              <p>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}</p>
              <p>{markerCount} MARKERS</p>
            </div>
          </div>
        </Panel>
      )}

      <Panel variant="labs" className="p-8 text-center">
        <p className={ui.overline}>Overall Health Score</p>
        <p
          className={cn("mt-2 font-display text-6xl font-bold", ui.statLabs)}
          style={{ filter: "drop-shadow(0 0 20px var(--labs-glow))" }}
        >
          {overallScore.score}
        </p>
        <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-[var(--bg-hover)]">
          <div
            className={cn("h-full rounded-full transition-all", scoreBarColor(overallScore.score))}
            style={{ width: `${overallScore.score}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{overallScore.status}</p>
      </Panel>

      <div>
        <p className={cn(ui.overline, "mb-3")}>Category breakdown — tap a panel for full marker detail</p>
        <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 lg:grid-cols-4">
          {categoryScores.map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat.category)}
                className="h-full text-left"
              >
                <Panel
                  hover
                  className={cn(
                    "flex h-full flex-col p-4 transition",
                    isSelected && "border-[var(--labs)]/50 ring-1 ring-[var(--labs)]/30"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-1.5 text-[var(--muted)]">
                    <div className="flex items-center gap-1.5">
                      {CATEGORY_ICONS[cat.category]}
                      <span className={ui.overline}>{cat.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  </div>
                  <p className={cn("font-display text-2xl font-bold", scoreColor(cat.score))}>
                    {cat.score ?? "—"}
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">{cat.status}</p>
                  <p className="mt-1 text-[10px] text-[var(--muted-2)]">
                    {cat.assessed}/{cat.total} markers
                  </p>
                  {cat.score !== null && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                      <div className={cn("h-full", scoreBarColor(cat.score))} style={{ width: `${cat.score}%` }} />
                    </div>
                  )}
                  {cat.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-2">
                      {cat.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={cn("rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase", CATEGORY_TAG_STYLES[tag.type])}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </Panel>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory && selectedScore && (
        <CategoryBreakdown
          category={selectedCategory}
          categoryScore={selectedScore}
          currentValues={currentValues}
          reviewFlags={reviewFlags}
          rangeMode={rangeMode}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      <div className="border-t border-[var(--border)] pt-6">
        <PreviousBloodworkLog embedded />
      </div>
    </div>
  );
}