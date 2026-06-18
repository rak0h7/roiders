"use client";

import { format } from "date-fns";
import { AlertTriangle, Calendar, Trophy } from "lucide-react";
import type { DashboardData } from "./useDashboardData";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DashboardHighlightsProps = Pick<
  DashboardData,
  "topPR" | "topPRExercise" | "reports" | "topRisk" | "compounds" | "weightUnit"
>;

export function DashboardHighlights({
  topPR,
  topPRExercise,
  reports,
  topRisk,
  compounds,
  weightUnit,
}: DashboardHighlightsProps) {
  if (!topPR && !reports[0] && !topRisk) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {topPR && topPRExercise && (
        <div className={cn(ui.cardInner, "flex items-center gap-3 p-4")}>
          <Trophy className="h-5 w-5 text-[var(--warning)]" />
          <div>
            <p className={ui.overline}>Top PR</p>
            <p className="text-sm font-semibold">{topPRExercise.name}</p>
            <p className="text-xs text-[var(--muted)]">{topPR.weight}×{topPR.reps} · est. {topPR.estimated1RM} {weightUnit}</p>
          </div>
        </div>
      )}
      {reports[0] && (
        <div className={cn(ui.cardInner, "flex items-center gap-3 p-4")}>
          <Calendar className="h-5 w-5 text-[var(--labs)]" />
          <div>
            <p className={ui.overline}>Latest panel</p>
            <p className="text-sm font-semibold">{reports[0].name || "Bloodwork"}</p>
            <p className="text-xs text-[var(--muted)]">{format(new Date(reports[0].date), "MMM d, yyyy")}</p>
          </div>
        </div>
      )}
      {topRisk && compounds.length > 0 && (
        <div className={cn(ui.cardInner, "flex items-center gap-3 p-4")}>
          <AlertTriangle className="h-5 w-5" style={{ color: topRisk.color }} />
          <div>
            <p className={ui.overline}>Cycle risk focus</p>
            <p className="text-sm font-semibold">{topRisk.axis}</p>
            <p className="text-xs text-[var(--muted)]">Score {topRisk.score} — review simulation</p>
          </div>
        </div>
      )}
    </div>
  );
}