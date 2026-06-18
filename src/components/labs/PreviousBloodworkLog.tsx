"use client";

import { useApp } from "@/context/AppContext";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { FileText, Trash2, GitCompare } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";
import { LabTrendChart } from "@/components/labs/LabTrendChart";

interface PreviousBloodworkLogProps {
  embedded?: boolean;
}

export function PreviousBloodworkLog({ embedded = false }: PreviousBloodworkLogProps) {
  const {
    reports,
    activeReportId,
    loadReport,
    deleteReport,
    setCompareReports,
    setShowComparison,
  } = useApp();

  if (reports.length === 0) {
    if (embedded) return null;
    return (
      <Panel className="p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-[var(--muted-2)]" />
        <p className="mt-3 text-[var(--muted)]">No previous bloodwork logged yet.</p>
        <p className="mt-1 text-xs text-[var(--muted-2)]">Upload a report or enter values manually to start tracking.</p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className={embedded ? ui.sectionTitle : ui.pageTitle}>Previous bloodwork</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {reports.length} log{reports.length > 1 ? "s" : ""} saved — switch panels or compare trends over time.
        </p>
      </div>

      {reports.length >= 2 && <LabTrendChart reports={reports} />}

      <div className="space-y-2">
        {reports.map((report) => {
          const isActive = report.id === activeReportId;
          return (
            <Panel
              key={report.id}
              hover
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 p-4",
                isActive && "border-[var(--labs)]/35 bg-[var(--labs-dim)]/30"
              )}
            >
              <div>
                <p className="font-display font-semibold text-[var(--foreground)]">{report.name}</p>
                <p className="text-[10px] text-[var(--muted)]">
                  {report.date} · {report.values.length} markers
                  {isActive ? " · viewing now" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => loadReport(report.id)}
                    className={cn(ui.btnToolbar, "uppercase hover:border-[var(--labs)]/40 hover:text-[var(--labs)]")}
                  >
                    View
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (reports.length >= 2) {
                      const other = reports.find((r) => r.id !== report.id);
                      if (other) {
                        setCompareReports(report.id, other.id);
                        setShowComparison(true);
                      }
                    }
                  }}
                  disabled={reports.length < 2}
                  className={cn(
                    ui.btnToolbar,
                    "border-[var(--intel)]/30 bg-[var(--intel-dim)] uppercase text-[var(--intel)] hover:border-[var(--intel)]/50",
                    reports.length < 2 && "cursor-not-allowed opacity-40"
                  )}
                >
                  <AppIcon icon={GitCompare} size="sm" /> Compare
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this bloodwork log?")) deleteReport(report.id);
                  }}
                  className={cn(
                    ui.btnToolbar,
                    "border-[var(--danger)]/30 uppercase text-[var(--danger)] hover:bg-[var(--danger)]/10"
                  )}
                >
                  <AppIcon icon={Trash2} size="sm" />
                </button>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}