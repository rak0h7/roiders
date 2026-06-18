"use client";

import { useNavigation } from "@/context/NavigationContext";
import { useGymStore } from "@/store/gymStore";
import { useDashboardData } from "./dashboard/useDashboardData";
import { DashboardHero } from "./dashboard/DashboardHero";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardModulePanels } from "./dashboard/DashboardModulePanels";
import { DashboardActivityRow } from "./dashboard/DashboardActivityRow";
import { DashboardQuickNav } from "./dashboard/DashboardQuickNav";
import { DashboardHighlights } from "./dashboard/DashboardHighlights";
import { DashboardOnboarding } from "./dashboard/DashboardOnboarding";

export function UnifiedDashboard() {
  const { setRoute } = useNavigation();
  const { startEmptyWorkout } = useGymStore();
  const data = useDashboardData();

  return (
    <div className="space-y-5 sm:space-y-8">
      <DashboardOnboarding
        hasReports={data.reports.length > 0}
        hasCompounds={data.compounds.length > 0}
        hasWorkouts={data.gymHistory.length > 0}
        nutritionOnboardingComplete={data.nutritionOnboardingComplete}
        hasNutritionLogs={data.daysLogged > 0}
        setRoute={setRoute}
      />
      <DashboardHero
        accountName={data.accountName}
        siteStatus={data.siteStatus}
        modulesActive={data.modulesActive}
        activeWorkout={data.activeWorkout}
        setRoute={setRoute}
        startEmptyWorkout={startEmptyWorkout}
      />
      <DashboardMetrics
        overallScore={data.overallScore}
        reviewFlags={data.reviewFlags}
        criticalFlags={data.criticalFlags}
        reports={data.reports}
        markerCount={data.markerCount}
        compounds={data.compounds}
        cycleStats={data.cycleStats}
        gymHistory={data.gymHistory}
        gym30d={data.gym30d}
        vol30d={data.vol30d}
        weightUnit={data.weightUnit}
        personalRecords={data.personalRecords}
        topPRExercise={data.topPRExercise}
        todayLog={data.todayLog}
        todayMacros={data.todayMacros}
        goals={data.goals}
        setRoute={setRoute}
      />
      <DashboardModulePanels
        reports={data.reports}
        criticalFlags={data.criticalFlags}
        reviewFlags={data.reviewFlags}
        assessedCategories={data.assessedCategories}
        compounds={data.compounds}
        weeks={data.weeks}
        startDate={data.startDate}
        cycleStats={data.cycleStats}
        topRisk={data.topRisk}
        gymHistory={data.gymHistory}
        gym30d={data.gym30d}
        activeWorkout={data.activeWorkout}
        weeklyVolume={data.weeklyVolume}
        topPR={data.topPR}
        topPRExercise={data.topPRExercise}
        gymRoutines={data.gymRoutines}
        todayLog={data.todayLog}
        todayMacros={data.todayMacros}
        daysLogged={data.daysLogged}
        goals={data.goals}
        setRoute={setRoute}
        startEmptyWorkout={startEmptyWorkout}
      />
      <DashboardActivityRow
        activity={data.activity}
        crossAlerts={data.crossAlerts}
        setRoute={setRoute}
      />
      <DashboardQuickNav setRoute={setRoute} />
      <DashboardHighlights
        topPR={data.topPR}
        topPRExercise={data.topPRExercise}
        reports={data.reports}
        topRisk={data.topRisk}
        compounds={data.compounds}
        weightUnit={data.weightUnit}
      />
    </div>
  );
}