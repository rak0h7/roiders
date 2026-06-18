"use client";

import { DEFAULT_GOALS } from "@/lib/nutritionTypes";
import { NUTRIENT_DEFINITIONS } from "@/data/nutrients";
import { GOAL_OPTIONS, ACTIVITY_OPTIONS } from "@/lib/nutritionProfile";
import { useNutritionStore } from "@/store/nutritionStore";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const GOAL_KEYS = [
  "calories", "protein", "fat", "carbs", "fiber",
  "calcium", "iron", "potassium", "sodium",
  "vitaminD", "vitaminC", "magnesium", "zinc",
] as const;

export function NutritionGoals() {
  const { goals, profile, setGoal, resetGoals, restartOnboarding } = useNutritionStore();

  return (
    <div className="space-y-5">
      <div className={ui.rowBetween}>
        <div>
          <h2 className={ui.pageTitle}>Daily targets</h2>
          <p className={ui.pageSub}>Set macro and micronutrient goals for progress tracking.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={restartOnboarding} className={cn(ui.btnSecondary, "text-xs")}>
            Recalculate from stats
          </button>
          <button type="button" onClick={resetGoals} className={cn(ui.btnGhost, "text-xs")}>
            Reset defaults
          </button>
        </div>
      </div>

      {profile && (
        <div className={cn(ui.cardInner, "flex flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-xs text-[var(--muted)]")}>
          <span>{profile.age}y · {profile.sex}</span>
          <span>{Math.round(profile.weightKg * (profile.weightUnit === "lb" ? 2.20462 : 1))} {profile.weightUnit}</span>
          <span>{ACTIVITY_OPTIONS.find((a) => a.id === profile.activity)?.label}</span>
          <span>Goal: {GOAL_OPTIONS.find((g) => g.id === profile.goal)?.label}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GOAL_KEYS.map((key) => {
          const def = NUTRIENT_DEFINITIONS.find((n) => n.id === key);
          const label = def?.name ?? key;
          const unit = def?.unit ?? "";
          const value = goals[key] ?? DEFAULT_GOALS[key] ?? 0;

          return (
            <div key={key}>
              <label className={ui.label}>
                {label} {unit && `(${unit})`}
              </label>
              <input
                type="number"
                min={0}
                step={key === "calories" ? 50 : key === "protein" || key === "carbs" || key === "fat" ? 1 : 0.1}
                value={value}
                onChange={(e) => setGoal(key, Math.max(0, parseFloat(e.target.value) || 0))}
                className={cn(ui.input, "mt-1.5")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}