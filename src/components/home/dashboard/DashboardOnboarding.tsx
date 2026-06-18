"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import type { AppRoute } from "@/context/NavigationContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DashboardOnboardingProps = {
  hasReports: boolean;
  hasCompounds: boolean;
  hasWorkouts: boolean;
  hasNutrition: boolean;
  setRoute: (route: AppRoute) => void;
};

export function DashboardOnboarding({
  hasReports,
  hasCompounds,
  hasWorkouts,
  hasNutrition,
  setRoute,
}: DashboardOnboardingProps) {
  const { moduleEnabled } = useSiteConfig();

  const steps = [
    moduleEnabled("labs") && {
      id: "labs",
      label: "Log your first blood panel",
      done: hasReports,
      route: "bloodwork-log" as const,
    },
    moduleEnabled("cycle") && {
      id: "cycle",
      label: "Build your cycle stack",
      done: hasCompounds,
      route: "cycle-planner" as const,
    },
    moduleEnabled("gym") && {
      id: "gym",
      label: "Log a training session",
      done: hasWorkouts,
      route: "gym-workout" as const,
    },
    moduleEnabled("nutrition") && {
      id: "nutrition",
      label: "Track today's macros",
      done: hasNutrition,
      route: "nutrition-diary" as const,
    },
  ].filter(Boolean) as { id: string; label: string; done: boolean; route: AppRoute }[];

  const doneCount = steps.filter((s) => s.done).length;
  if (!steps.length || doneCount === steps.length) return null;

  return (
    <div className={cn(ui.card, ui.cardPad)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className={ui.sectionTitle}>Getting started</h3>
          <p className={ui.sectionSub}>{doneCount} of {steps.length} complete</p>
        </div>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <div
            className="h-full rounded-full [background:var(--gradient-primary)]"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => !step.done && setRoute(step.route)}
              className={cn(
                ui.cardInner,
                "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition",
                !step.done && "hover:bg-[var(--bg-hover)]"
              )}
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-[var(--muted-2)]" />
              )}
              <span className={step.done ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"}>
                {step.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}