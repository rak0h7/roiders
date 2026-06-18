"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCycleStore } from "@/store/cycleStore";
import { useGymStore } from "@/store/gymStore";
import { useNutritionStore } from "@/store/nutritionStore";
import { macroSummary, sumNutrients, todayStr } from "@/lib/nutritionCalculations";
import { getExerciseById } from "@/data/exercises";
import { generateCrossAlerts } from "@/lib/crossIntelligence";
import { calculateStats, calculateRiskProfile } from "@/lib/cycleCalculations";
import { formatDuration, volumeByWeek } from "@/lib/gymCalculations";
import type { AppRoute } from "@/context/NavigationContext";

export type ModuleId = "labs" | "protocol" | "training" | "nutrition";

export interface ActivityItem {
  id: string;
  module: ModuleId;
  title: string;
  subtitle: string;
  at: string;
  route: AppRoute;
}

export type DashboardData = ReturnType<typeof useDashboardData>;

export function useDashboardData() {
  const { accountName } = useAuth();
  const { reports, overallScore, reviewFlags, currentValues, categoryScores } = useApp();
  const { compounds, getEffectiveWeeks, startDate } = useCycleStore();
  const {
    history: gymHistory, personalRecords, activeWorkout, customExercises,
    routines: gymRoutines, weightUnit,
  } = useGymStore();
  const { logs, goals, getLog } = useNutritionStore();

  const [thirtyDayCutoff] = useState(() => Date.now() - 30 * 86_400_000);

  const weeks = getEffectiveWeeks();
  const cycleStats = compounds.length > 0 ? calculateStats(compounds, weeks) : null;
  const riskProfile = compounds.length > 0 ? calculateRiskProfile(compounds) : [];
  const topRisk = riskProfile.reduce((a, b) => (b.score > a.score ? b : a), riskProfile[0]);
  const criticalFlags = reviewFlags.filter((f) => f.severity === "stop" || f.severity === "high").length;
  const markerCount = Object.keys(currentValues).length;

  const gym30d = useMemo(
    () => gymHistory.filter((w) => new Date(w.completedAt).getTime() >= thirtyDayCutoff),
    [gymHistory, thirtyDayCutoff],
  );

  const today = todayStr();
  const todayLog = getLog(today);
  const todayMacros = macroSummary(sumNutrients(todayLog, true));
  const daysLogged = Object.keys(logs).filter((d) => (logs[d]?.length ?? 0) > 0).length;

  const crossAlerts = generateCrossAlerts(
    currentValues,
    reviewFlags,
    compounds,
    { goals, todayLog, daysLogged },
    gym30d.length,
  );

  const vol30d = gym30d.reduce((s, w) => s + w.totalVolume, 0);
  const weeklyVolume = useMemo(() => volumeByWeek(gymHistory).slice(-6), [gymHistory]);

  const activity = useMemo(() => {
    const items: ActivityItem[] = [];
    for (const r of reports.slice(0, 4)) {
      items.push({
        id: `lab-${r.id}`,
        module: "labs",
        title: r.name || "Bloodwork panel",
        subtitle: `${Object.keys(r.values).length} markers`,
        at: r.date,
        route: "bloodwork-history",
      });
    }
    for (const w of gymHistory.slice(0, 4)) {
      items.push({
        id: `gym-${w.id}`,
        module: "training",
        title: w.name,
        subtitle: `${w.totalSets} sets · ${formatDuration(w.durationMinutes)}`,
        at: w.completedAt,
        route: "gym-history",
      });
    }
    if (compounds.length > 0) {
      items.push({
        id: "cycle-active",
        module: "protocol",
        title: `${compounds.length}-compound stack`,
        subtitle: `${weeks} weeks from ${startDate}`,
        at: startDate,
        route: "cycle-dashboard",
      });
    }
    if (todayLog.length > 0) {
      items.push({
        id: "nutrition-today",
        module: "nutrition",
        title: "Today's food log",
        subtitle: `${todayMacros.calories} kcal · ${todayMacros.protein}g protein`,
        at: today,
        route: "nutrition-diary",
      });
    }
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 6);
  }, [reports, gymHistory, compounds.length, weeks, startDate, todayLog.length, todayMacros.calories, todayMacros.protein, today]);

  const modulesActive = [
    reports.length > 0 || markerCount > 0,
    compounds.length > 0,
    gymHistory.length > 0 || !!activeWorkout,
    daysLogged > 0,
  ].filter(Boolean).length;

  const siteStatus = useMemo(() => {
    if (criticalFlags > 0 || crossAlerts.some((a) => a.severity === "critical"))
      return { label: "Attention required", color: "text-[var(--danger)]", dot: "bg-[var(--danger)]" };
    if (reviewFlags.length > 0 || crossAlerts.length > 0)
      return { label: "Review recommended", color: "text-[var(--warning)]", dot: "bg-[var(--warning)]" };
    if (modulesActive >= 3)
      return { label: "All systems tracking", color: "text-[var(--success)]", dot: "bg-[var(--success)]" };
    if (modulesActive === 1)
      return { label: "Getting started — add more data", color: "text-[var(--intel)]", dot: "bg-[var(--intel)]" };
    return { label: "Welcome — set up your first module", color: "text-[var(--muted)]", dot: "bg-[var(--muted)]" };
  }, [criticalFlags, crossAlerts, reviewFlags.length, modulesActive]);

  const assessedCategories = categoryScores.filter((c) => c.assessed > 0);
  const topPR = personalRecords.length > 0
    ? [...personalRecords].sort((a, b) => b.estimated1RM - a.estimated1RM)[0]
    : null;
  const topPRExercise = topPR ? getExerciseById(topPR.exerciseId, customExercises) : null;

  return {
    accountName,
    reports,
    overallScore,
    reviewFlags,
    compounds,
    weeks,
    startDate,
    cycleStats,
    topRisk,
    criticalFlags,
    markerCount,
    gymHistory,
    gym30d,
    vol30d,
    weeklyVolume,
    activeWorkout,
    personalRecords,
    topPR,
    topPRExercise,
    customExercises,
    gymRoutines,
    weightUnit,
    todayLog,
    todayMacros,
    daysLogged,
    goals,
    crossAlerts,
    activity,
    modulesActive,
    siteStatus,
    assessedCategories,
  };
}