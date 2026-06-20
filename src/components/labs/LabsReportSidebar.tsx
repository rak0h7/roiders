"use client";

import { useMemo } from "react";
import { GitCompare, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNavigation } from "@/context/NavigationContext";
import { useCycleStore } from "@/store/cycleStore";
import { scoreBloodworkReport } from "@/lib/reportScoring";
import { hasUnsavedLabEdits } from "@/lib/storage";
import { Panel } from "@/components/ui/Panel";
import { scoreColor } from "@/components/labs/labsUi";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type LabsReportSidebarProps = {
  onSelectReport?: (id: string) => void;
  layout?: "sidebar" | "sheet";
};

export function LabsReportSidebar({ onSelectReport, layout = "sidebar" }: LabsReportSidebarProps) {
  const {
    reports,
    activeReportId,
    currentValues,
    loadReport,
    startNewLabPanel,
    deleteReport,
    setCompareReports,
    setShowComparison,
  } = useApp();
  const { setRoute } = useNavigation();
  const { compounds } = useCycleStore();

  const summaries = useMemo(
    () => new Map(reports.map((r) => [r.id, scoreBloodworkReport(r, compounds)])),
    [reports, compounds]
  );

  const hasDraft = hasUnsavedLabEdits(currentValues, reports, activeReportId);
  const sorted = useMemo(
    () => [...reports].sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date)),
    [reports]
  );

  const handleNew = () => {
    startNewLabPanel();
    setRoute("bloodwork-log");
  };

  const handleSelect = (id: string) => {
    loadReport(id);
    onSelectReport?.(id);
  };

  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className={ui.sectionTitle}>Panels</h2>
          <p className={ui.sectionSub}>{reports.length} saved</p>
        </div>
        <button type="button" onClick={handleNew} className={cn(ui.btnPrimary, "shrink-0 text-xs")}>
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      {hasDraft && (
        <Panel
          variant="labs"
          className={cn(
            "cursor-pointer p-3",
            activeReportId === null && "ring-1 ring-[var(--labs)]/40"
          )}
          onClick={handleNew}
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">Unsaved draft</p>
          <p className="text-[10px] text-[var(--muted)]">
            {Object.keys(currentValues).length} markers · not saved yet
          </p>
        </Panel>
      )}

      <div
        className={cn(
          "flex gap-2 pb-1",
          layout === "sheet" ? "flex-col overflow-x-visible pb-0" : "overflow-x-auto lg:flex-col lg:overflow-x-visible lg:pb-0",
        )}
      >
        {sorted.map((report) => {
          const summary = summaries.get(report.id);
          const isActive = report.id === activeReportId;
          return (
            <Panel
              key={report.id}
              hover
              className={cn(
                "cursor-pointer p-3",
                layout === "sheet" ? "min-w-0" : "min-w-[200px] shrink-0 lg:min-w-0",
                isActive && "border-[var(--labs)]/40 bg-[var(--labs-dim)]/30 ring-1 ring-[var(--labs)]/30"
              )}
              onClick={() => handleSelect(report.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-[var(--foreground)]">
                    {report.name}
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {report.date} · {summary?.markerCount ?? report.values.length} markers
                  </p>
                </div>
                {summary && summary.score > 0 && (
                  <span className={cn("font-display text-lg font-bold", scoreColor(summary.score))}>
                    {summary.score}
                  </span>
                )}
              </div>

              {summary && summary.criticalCount > 0 && (
                <span className="mt-2 inline-block rounded-full border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--danger)]">
                  {summary.criticalCount} flag{summary.criticalCount > 1 ? "s" : ""}
                </span>
              )}

              <div className="mt-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                {reports.length >= 2 && (
                  <button
                    type="button"
                    title="Compare"
                    onClick={() => {
                      const other = reports.find((r) => r.id !== report.id);
                      if (other) {
                        setCompareReports(report.id, other.id);
                        setShowComparison(true);
                      }
                    }}
                    className={cn(ui.btnGhost, "h-7 w-7 p-0 text-[var(--muted)]")}
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title="Delete"
                  onClick={() => {
                    if (confirm("Delete this bloodwork log?")) deleteReport(report.id);
                  }}
                  className={cn(ui.btnGhost, "h-7 w-7 p-0 text-[var(--danger)]")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Panel>
          );
        })}
      </div>

      {reports.length === 0 && !hasDraft && (
        <p className="text-center text-xs text-[var(--muted)]">No panels yet — tap New to log bloodwork.</p>
      )}
    </aside>
  );
}