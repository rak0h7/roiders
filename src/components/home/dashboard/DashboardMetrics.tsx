"use client";

import { motion } from "framer-motion";
import type { AppRoute } from "@/context/NavigationContext";
import type { DashboardData } from "./useDashboardData";
import { fade, Stat } from "./shared";
import { cn } from "@/lib/utils";

type DashboardMetricsProps = Pick<
  DashboardData,
  | "overallScore"
  | "reviewFlags"
  | "criticalFlags"
  | "reports"
  | "markerCount"
  | "compounds"
  | "cycleStats"
  | "gymHistory"
  | "gym30d"
  | "vol30d"
  | "weightUnit"
  | "personalRecords"
  | "topPRExercise"
> & {
  setRoute: (route: AppRoute) => void;
};

export function DashboardMetrics({
  overallScore,
  reviewFlags,
  criticalFlags,
  reports,
  markerCount,
  compounds,
  cycleStats,
  gymHistory,
  gym30d,
  vol30d,
  weightUnit,
  personalRecords,
  topPRExercise,
  setRoute,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {[
        { label: "Health score", value: overallScore?.score ?? "—", sub: overallScore?.status, route: "bloodwork-insights" as const },
        { label: "Lab flags", value: reviewFlags.length, sub: criticalFlags ? `${criticalFlags} critical` : "Review queue", route: "bloodwork-log" as const },
        { label: "Reports", value: reports.length, sub: "Previous logs", route: "bloodwork-insights" as const },
        { label: "Markers", value: markerCount, sub: "Current panel", route: "bloodwork-insights" as const },
        { label: "Compounds", value: compounds.length, sub: cycleStats ? `${cycleStats.totalDoses} doses` : "No stack", route: "cycle-planner" as const },
        { label: "Workouts", value: gymHistory.length, sub: `${gym30d.length} last 30d`, route: "gym-history" as const },
        { label: "Volume 30d", value: vol30d > 0 ? `${(vol30d / 1000).toFixed(0)}k` : "—", sub: weightUnit, route: "gym-progress" as const, hideMobile: true },
        { label: "PRs", value: personalRecords.length, sub: topPRExercise?.name?.split(" ")[0] ?? "Records", route: "gym-progress" as const, hideMobile: true },
      ].map((m, i) => (
        <motion.div
          key={m.label}
          custom={i}
          variants={fade}
          initial="hidden"
          animate="show"
          className={cn("min-w-0", m.hideMobile && "hidden md:block")}
        >
          <Stat label={m.label} value={m.value} sub={m.sub} onClick={() => setRoute(m.route)} />
        </motion.div>
      ))}
    </div>
  );
}