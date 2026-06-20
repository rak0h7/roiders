"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useCycleStore } from "@/store/cycleStore";
import { generateCrossAlerts } from "@/lib/crossIntelligence";
import { buildCategoryMarkerRows } from "@/lib/categoryBreakdown";
import { CATEGORY_ORDER } from "@/lib/markers";
import { CrossAlerts } from "@/components/home/CrossAlerts";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { LabTrendChart } from "@/components/labs/LabTrendChart";
import { LabsCategoryScoreChart } from "@/components/labs/LabsCategoryScoreChart";
import { LabsFlaggedTrendChart } from "@/components/labs/LabsFlaggedTrendChart";
import { LabsCriticalBanner } from "@/components/labs/LabsCriticalBanner";
import { LabsCategoryFilter, type LabsCategoryFilterValue } from "@/components/labs/LabsCategoryFilter";
import { MarkerResultRow } from "@/components/labs/MarkerResultRow";
import { scoreBarColor, scoreColor } from "@/components/labs/labsUi";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { Activity } from "lucide-react";
import type { MarkerCategory } from "@/lib/types";
import { useLabsPanels } from "@/components/labs/LabsPanelsContext";

export function LabsReportDetail() {
  const {
    categoryScores,
    overallScore,
    currentValues,
    activeReport,
    reviewFlags,
    reports,
  } = useApp();
  const { compounds } = useCycleStore();
  const { openSheet } = useLabsPanels();
  const [categoryFilter, setCategoryFilter] = useState<LabsCategoryFilterValue>("all");

  const markerCount = Object.keys(currentValues).length;
  const crossAlerts = generateCrossAlerts(currentValues, reviewFlags, compounds);

  const categoryCounts = useMemo(() => {
    const counts = {} as Partial<Record<MarkerCategory, number>>;
    for (const cat of CATEGORY_ORDER) {
      const n = buildCategoryMarkerRows(cat, currentValues, reviewFlags).filter((r) => r.logged).length;
      if (n > 0) counts[cat] = n;
    }
    return counts;
  }, [currentValues, reviewFlags]);

  const rows = useMemo(() => {
    if (categoryFilter === "all") {
      return CATEGORY_ORDER.flatMap((cat) =>
        buildCategoryMarkerRows(cat, currentValues, reviewFlags)
      ).filter((r) => r.logged || r.severity !== "normal");
    }
    return buildCategoryMarkerRows(categoryFilter, currentValues, reviewFlags).filter(
      (r) => r.logged || r.severity !== "normal"
    );
  }, [categoryFilter, currentValues, reviewFlags]);

  const scrollToMarker = (markerId: string) => {
    const el = document.getElementById(`marker-${markerId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (markerCount === 0 && reports.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        variant="labs"
        title="No insights yet"
        description="Log lab values or upload a report, then select a panel from the sidebar."
      />
    );
  }

  if (markerCount === 0) {
    return (
      <EmptyState
        icon={Activity}
        variant="labs"
        title="Select a panel"
        description="Choose a saved bloodwork panel to view scores, flags, and trends."
        action={
          <button type="button" onClick={openSheet} className={cn(ui.btnPrimary, "text-xs")}>
            Choose a panel
          </button>
        }
      />
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <MedicalDisclaimer variant="labs" />
      <LabsCriticalBanner flags={reviewFlags} onMarkerClick={scrollToMarker} />
      <CrossAlerts alerts={crossAlerts} />

      <Panel variant="labs" className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={ui.overline}>Panel analysis</p>
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              {activeReport?.name ?? "Current panel"}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {activeReport?.date ?? "—"} · {markerCount} markers logged
            </p>
          </div>
          <div className="text-center">
            <p className={cn("font-display text-4xl font-bold", scoreColor(overallScore.score))}>
              {overallScore.score}
            </p>
            <p className="text-xs text-[var(--muted)]">{overallScore.status}</p>
            <div className="mx-auto mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-hover)]">
              <div
                className={cn("h-full rounded-full", scoreBarColor(overallScore.score))}
                style={{ width: `${overallScore.score}%` }}
              />
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <div className="min-w-0 overflow-x-auto">
          <LabsCategoryScoreChart categoryScores={categoryScores} />
        </div>
        {reports.length >= 2 && (
          <div className="min-w-0 overflow-x-auto">
            <LabTrendChart reports={reports} />
          </div>
        )}
      </div>

      {reports.length >= 2 && (
        <div className="min-w-0 overflow-x-auto">
          <LabsFlaggedTrendChart reports={reports} reviewFlags={reviewFlags} />
        </div>
      )}

      <div className="min-w-0">
        <p className={cn(ui.overline, "mb-2")}>Filter by system</p>
        <div className="overflow-x-auto pb-1">
          <LabsCategoryFilter value={categoryFilter} onChange={setCategoryFilter} counts={categoryCounts} />
        </div>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No markers in this category for the active panel.</p>
        ) : (
          rows.map((row) => (
            <MarkerResultRow key={row.markerId} row={row} id={`marker-${row.markerId}`} />
          ))
        )}
      </div>
    </div>
  );
}