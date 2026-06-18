"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Droplet, Dumbbell, Play } from "lucide-react";
import type { AppRoute } from "@/context/NavigationContext";
import type { DashboardData } from "./useDashboardData";
import { greeting } from "./shared";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DashboardHeroProps = Pick<
  DashboardData,
  "accountName" | "siteStatus" | "modulesActive" | "activeWorkout"
> & {
  setRoute: (route: AppRoute) => void;
  startEmptyWorkout: () => void;
};

export function DashboardHero({
  accountName,
  siteStatus,
  modulesActive,
  activeWorkout,
  setRoute,
  startEmptyWorkout,
}: DashboardHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(ui.glassAccent, "relative overflow-hidden p-4 sm:p-[calc(1.5rem*var(--space-unit))]")}
    >
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl" style={{ background: "var(--labs-glow)" }} />
      <div className="absolute -bottom-8 left-1/3 h-32 w-32 rounded-full blur-3xl opacity-60" style={{ background: "var(--protocol-glow)" }} />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className={ui.overline}>{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="font-display mt-1 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            {greeting()}
            {accountName ? (
              <>, <span className="text-gradient">{accountName}</span></>
            ) : (
              <> — <span className="text-gradient">Roiders Club</span></>
            )}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)]/80 px-3 py-1 text-xs">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", siteStatus.dot)} />
              <span className={cn("truncate", siteStatus.color)}>{siteStatus.label}</span>
            </span>
            <span className="text-xs text-[var(--muted)]">
              {modulesActive}/4 modules active
            </span>
          </div>
        </div>

        {activeWorkout ? (
          <button
            onClick={() => setRoute("gym-workout")}
            className={cn(ui.btnProtocol, "w-full shrink-0 sm:w-auto")}
          >
            <Play className="mr-2 h-4 w-4" />
            Resume workout
          </button>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <button onClick={() => setRoute("bloodwork-log")} className={cn(ui.btnPrimary, "w-full sm:w-auto")}>
              <Droplet className="mr-2 h-4 w-4" />
              Log labs
            </button>
            <button
              onClick={() => { startEmptyWorkout(); setRoute("gym-workout"); }}
              className={cn(ui.btnSecondary, "w-full sm:w-auto")}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              Train
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}