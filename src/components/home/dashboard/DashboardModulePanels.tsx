"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  AlertTriangle, Beaker, Blocks, ClipboardList, Dumbbell, FlaskConical, UtensilsCrossed,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { AppRoute } from "@/context/NavigationContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { getChartTheme } from "@/lib/charts";
import { pctOfGoal } from "@/lib/nutritionCalculations";
import type { DashboardData } from "./useDashboardData";
import { fade, ModuleHeader, Stat } from "./shared";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DashboardModulePanelsProps = Pick<
  DashboardData,
  | "reports"
  | "criticalFlags"
  | "reviewFlags"
  | "assessedCategories"
  | "compounds"
  | "weeks"
  | "startDate"
  | "cycleStats"
  | "topRisk"
  | "gymHistory"
  | "gym30d"
  | "activeWorkout"
  | "weeklyVolume"
  | "topPR"
  | "topPRExercise"
  | "gymRoutines"
  | "todayLog"
  | "todayMacros"
  | "daysLogged"
  | "goals"
> & {
  setRoute: (route: AppRoute) => void;
  startEmptyWorkout: () => void;
};

export function DashboardModulePanels({
  reports,
  criticalFlags,
  reviewFlags,
  assessedCategories,
  compounds,
  weeks,
  startDate,
  cycleStats,
  topRisk,
  gymHistory,
  gym30d,
  activeWorkout,
  weeklyVolume,
  topPR,
  topPRExercise,
  gymRoutines,
  todayLog,
  todayMacros,
  daysLogged,
  goals,
  setRoute,
  startEmptyWorkout,
}: DashboardModulePanelsProps) {
  const chartTheme = getChartTheme();
  const { moduleEnabled } = useSiteConfig();

  const panels = [
    moduleEnabled("labs") && "labs",
    moduleEnabled("cycle") && "cycle",
    moduleEnabled("gym") && "gym",
    moduleEnabled("nutrition") && "nutrition",
  ].filter(Boolean);

  if (!panels.length) return null;

  const gridCols =
    panels.length === 1 ? "lg:grid-cols-1" :
    panels.length === 2 ? "lg:grid-cols-2" :
    panels.length === 3 ? "lg:grid-cols-3" : "xl:grid-cols-4";

  return (
    <div className={cn("grid items-stretch gap-4 lg:grid-cols-2", gridCols)}>
      {/* Labs */}
      {moduleEnabled("labs") && (
      <motion.div custom={0} variants={fade} initial="hidden" animate="show" className={cn(ui.cardLabs, ui.cardPad, "flex h-full flex-col gap-4")}>
        <ModuleHeader
          title="Labs"
          status={reports.length > 0 ? `${reports.length} panel${reports.length > 1 ? "s" : ""} on file` : "No panels logged"}
          statusColor={criticalFlags > 0 ? "text-[var(--danger)]" : reports.length > 0 ? "text-[var(--success)]" : "text-[var(--muted)]"}
          route="bloodwork-insights"
          routeLabel="Analysis"
          icon={FlaskConical}
          accentClass="bg-[var(--labs-dim)] text-[var(--labs)]"
        />
        {assessedCategories.length > 0 ? (
          <div className="space-y-2.5">
            {assessedCategories.slice(0, 4).map((cat) => (
              <div key={cat.category}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-[var(--muted)]">{cat.label}</span>
                  <span className={cn(
                    cat.score != null && cat.score >= 90 ? ui.statSuccess :
                    cat.score != null && cat.score >= 75 ? ui.statWarning : ui.statDanger
                  )}>{cat.score ?? "—"}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--labs)] to-[var(--labs)]/50"
                    style={{ width: `${cat.score ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className={cn(ui.cardInner, "flex min-h-[10rem] flex-1 flex-col items-center justify-center py-8 text-center")}>
            <FlaskConical className="app-icon mb-2 text-[var(--labs)]" />
            <p className="text-sm text-[var(--muted)]">{reports.length} panel{reports.length > 1 ? "s" : ""} on file</p>
            <button onClick={() => setRoute("bloodwork-insights")} className={cn(ui.btnPrimary, "mt-4 text-xs")}>
              View analysis
            </button>
          </div>
        ) : (
          <div className={cn(ui.cardInner, "flex min-h-[10rem] flex-1 flex-col items-center justify-center py-8 text-center")}>
            <FlaskConical className="app-icon mb-2 text-[var(--labs)]" />
            <p className="text-sm text-[var(--muted)]">Upload panel</p>
            <button onClick={() => setRoute("bloodwork-log")} className={cn(ui.btnPrimary, "mt-4 text-xs")}>
              Log labs
            </button>
          </div>
        )}
        {reviewFlags.length > 0 && (
          <div className="rounded-[var(--radius-md)] border border-[var(--warning)]/25 bg-[var(--warning)]/5 px-3 py-2 text-xs text-[var(--muted)]">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-[var(--warning)]" />
            {reviewFlags.length} marker{reviewFlags.length > 1 ? "s" : ""} flagged for review
          </div>
        )}
      </motion.div>
      )}

      {/* Gear */}
      {moduleEnabled("cycle") && (
      <motion.div custom={1} variants={fade} initial="hidden" animate="show" className={cn(ui.cardProtocol, ui.cardPad, "flex h-full flex-col gap-4")}>
        <ModuleHeader
          title="Gear"
          status={compounds.length > 0 ? `${weeks}-week cycle active` : "No stack configured"}
          statusColor={compounds.length > 0 ? "text-[var(--success)]" : "text-[var(--muted)]"}
          route="cycle-dashboard"
          routeLabel="Simulation"
          icon={Beaker}
          accentClass="bg-[var(--protocol-dim)] text-[var(--protocol)]"
        />
        {compounds.length > 0 ? (
          <>
            <div className="grid grid-cols-2 items-stretch gap-2">
              <Stat label="Duration" value={`${weeks}w`} />
              <Stat label="Injections" value={cycleStats?.injections ?? 0} />
              <Stat label="Start" value={format(new Date(startDate), "MMM d")} />
              <Stat label="Top risk" value={topRisk?.axis ?? "—"} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {compounds.slice(0, 5).map((c) => (
                <span key={c.compoundId} className={cn(ui.tag, "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--muted)]")}>
                  {c.compoundId}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className={cn(ui.cardInner, "flex min-h-[10rem] flex-1 flex-col items-center justify-center py-8 text-center")}>
            <Blocks className="app-icon mb-2 text-[var(--protocol)]" />
            <p className="text-sm text-[var(--muted)]">Build your compound stack</p>
            <button onClick={() => setRoute("cycle-planner")} className={cn(ui.btnProtocol, "mt-4 text-xs")}>
              Open builder
            </button>
          </div>
        )}
      </motion.div>
      )}

      {/* Training */}
      {moduleEnabled("gym") && (
      <motion.div custom={2} variants={fade} initial="hidden" animate="show" className={cn(ui.card, ui.cardPad, "flex h-full flex-col gap-4 border-[var(--protocol)]/20")}>
        <ModuleHeader
          title="Training"
          status={
            activeWorkout
              ? `In progress — ${activeWorkout.name}`
              : gymHistory.length > 0
                ? `${gym30d.length} session${gym30d.length !== 1 ? "s" : ""} this month`
                : "No workouts logged"
          }
          statusColor={activeWorkout ? "text-[var(--warning)]" : gymHistory.length > 0 ? "text-[var(--success)]" : "text-[var(--muted)]"}
          route="gym-workout"
          routeLabel="Train"
          icon={Dumbbell}
          accentClass="bg-[var(--protocol-dim)] text-[var(--protocol)]"
        />
        {gymHistory.length > 0 || activeWorkout ? (
          <>
            {weeklyVolume.length > 0 && (
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis
                      dataKey="week"
                      tickFormatter={(v) => format(new Date(v), "M/d")}
                      tick={{ fill: chartTheme.axis, fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip contentStyle={chartTheme.tooltip} />
                    <Bar dataKey="volume" fill="var(--protocol)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="grid grid-cols-2 items-stretch gap-2">
              <Stat label="Last session" value={gymHistory[0] ? format(new Date(gymHistory[0].completedAt), "MMM d") : "—"} />
              <Stat label="Best PR" value={topPR ? `${topPR.weight}×${topPR.reps}` : "—"} sub={topPRExercise?.name} />
            </div>
            {gymRoutines.length > 0 && (
              <p className="text-[11px] text-[var(--muted)]">
                <ClipboardList className="mr-1 inline h-3 w-3" />
                {gymRoutines.length} custom program{gymRoutines.length > 1 ? "s" : ""}
              </p>
            )}
          </>
        ) : (
          <div className={cn(ui.cardInner, "flex min-h-[10rem] flex-1 flex-col items-center justify-center py-8 text-center")}>
            <Dumbbell className="app-icon mb-2 text-[var(--protocol)]" />
            <p className="text-sm text-[var(--muted)]">Log sets, reps, and track PRs</p>
            <button
              onClick={() => { startEmptyWorkout(); setRoute("gym-workout"); }}
              className={cn(ui.btnProtocol, "mt-4 text-xs")}
            >
              Start workout
            </button>
          </div>
        )}
      </motion.div>
      )}

      {/* Nutrition */}
      {moduleEnabled("nutrition") && (
      <motion.div custom={3} variants={fade} initial="hidden" animate="show" className={cn(ui.cardIntel, ui.cardPad, "flex h-full flex-col gap-4")}>
        <ModuleHeader
          title="Nutrition"
          status={
            todayLog.length > 0
              ? `${todayMacros.calories} kcal logged today`
              : daysLogged > 0
                ? `${daysLogged} day${daysLogged !== 1 ? "s" : ""} tracked`
                : "No food logged"
          }
          statusColor={todayLog.length > 0 ? "text-[var(--success)]" : daysLogged > 0 ? "text-[var(--intel)]" : "text-[var(--muted)]"}
          route="nutrition-diary"
          routeLabel="Diary"
          icon={UtensilsCrossed}
          accentClass="bg-[var(--intel-dim)] text-[var(--intel)]"
        />
        {todayLog.length > 0 || daysLogged > 0 ? (
          <>
            <div className="grid grid-cols-2 items-stretch gap-2">
              <Stat label="Protein" value={todayLog.length > 0 ? `${todayMacros.protein}g` : "—"} sub={goals.protein ? `${pctOfGoal(todayMacros.protein, goals.protein)}% goal` : undefined} />
              <Stat label="Carbs" value={todayLog.length > 0 ? `${todayMacros.carbs}g` : "—"} />
              <Stat label="Fat" value={todayLog.length > 0 ? `${todayMacros.fat}g` : "—"} />
              <Stat label="Days logged" value={daysLogged} />
            </div>
            {todayLog.length > 0 && goals.calories && (
              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-[var(--muted)]">Calories</span>
                  <span className="font-medium">{todayMacros.calories} / {goals.calories}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full bg-[var(--intel)]"
                    style={{ width: `${pctOfGoal(todayMacros.calories, goals.calories)}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={cn(ui.cardInner, "flex min-h-[10rem] flex-1 flex-col items-center justify-center py-8 text-center")}>
            <UtensilsCrossed className="app-icon mb-2 text-[var(--intel)]" />
            <p className="text-sm text-[var(--muted)]">Track macros and micronutrients</p>
            <button onClick={() => setRoute("nutrition-search")} className={cn(ui.btnSecondary, "mt-4 text-xs")}>
              Log first meal
            </button>
          </div>
        )}
      </motion.div>
      )}
    </div>
  );
}