"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Target, User, Zap } from "lucide-react";
import { useNutritionStore } from "@/store/nutritionStore";
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  calcCalorieTarget,
  calcMacroGoals,
  calcTdee,
  cmToFeetInches,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  DEFAULT_PROFILE,
  type NutritionActivity,
  type NutritionGoal,
  type NutritionProfile,
  type NutritionSex,
  type NutritionWeightUnit,
} from "@/lib/nutritionProfile";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const STEPS = ["stats", "activity", "goal", "review"] as const;
type Step = (typeof STEPS)[number];

const STEP_META: Record<Step, { title: string; sub: string; icon: typeof User }> = {
  stats: { title: "Your stats", sub: "We use these to estimate your daily energy needs.", icon: User },
  activity: { title: "Activity level", sub: "How much you move outside of logged workouts.", icon: Zap },
  goal: { title: "Your goal", sub: "Pick the direction you want your nutrition plan to support.", icon: Target },
  review: { title: "Daily targets", sub: "Review your calculated macros. You can fine-tune later in Goals.", icon: Check },
};

function initialFromProfile(profile: NutritionProfile | null) {
  const base = profile ?? DEFAULT_PROFILE;
  const { feet, inches } = cmToFeetInches(base.heightCm);
  const displayWeight =
    base.weightUnit === "lb"
      ? String(Math.round(kgToLb(base.weightKg)))
      : String(Math.round(base.weightKg * 10) / 10);

  return {
    age: String(base.age),
    sex: base.sex,
    weightUnit: base.weightUnit,
    weight: displayWeight,
    heightFt: String(feet),
    heightIn: String(inches),
    heightCm: String(base.heightCm),
    activity: base.activity,
    goal: base.goal,
  };
}

export function NutritionOnboarding() {
  const { profile: savedProfile, completeOnboarding } = useNutritionStore();
  const initial = useMemo(() => initialFromProfile(savedProfile), [savedProfile]);
  const [step, setStep] = useState<Step>("stats");
  const [age, setAge] = useState(initial.age);
  const [sex, setSex] = useState<NutritionSex>(initial.sex);
  const [weightUnit, setWeightUnit] = useState<NutritionWeightUnit>(initial.weightUnit);
  const [weight, setWeight] = useState(initial.weight);
  const [heightFt, setHeightFt] = useState(initial.heightFt);
  const [heightIn, setHeightIn] = useState(initial.heightIn);
  const [heightCm, setHeightCm] = useState(initial.heightCm);
  const [useMetricHeight, setUseMetricHeight] = useState(false);
  const [activity, setActivity] = useState<NutritionActivity>(initial.activity);
  const [goal, setGoal] = useState<NutritionGoal>(initial.goal);

  const stepIndex = STEPS.indexOf(step);

  const profile = useMemo((): NutritionProfile | null => {
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    if (!ageNum || ageNum < 14 || ageNum > 90 || !weightNum || weightNum <= 0) return null;

    const weightKg = weightUnit === "lb" ? lbToKg(weightNum) : weightNum;
    let heightCmVal: number;
    if (useMetricHeight) {
      heightCmVal = parseFloat(heightCm);
    } else {
      const ft = parseInt(heightFt, 10) || 0;
      const inches = parseInt(heightIn, 10) || 0;
      heightCmVal = feetInchesToCm(ft, inches);
    }
    if (!heightCmVal || heightCmVal < 120 || heightCmVal > 230) return null;

    return { age: ageNum, sex, weightKg, heightCm: heightCmVal, activity, goal, weightUnit };
  }, [age, sex, weight, weightUnit, heightFt, heightIn, heightCm, useMetricHeight, activity, goal]);

  const previewGoals = profile ? calcMacroGoals(profile) : null;
  const tdee = profile ? Math.round(calcTdee(profile)) : null;
  const calories = profile ? calcCalorieTarget(profile) : null;

  const canContinue =
    step === "stats" ? profile != null :
    step === "activity" ? true :
    step === "goal" ? true :
    profile != null;

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const finish = () => {
    if (!profile) return;
    completeOnboarding(profile);
  };

  return (
    <div className={cn(ui.cardIntel, ui.cardPad, "mx-auto max-w-2xl")}>
      <div className="mb-6">
        <p className={ui.overline}>Nutrition setup</p>
        <h2 className={cn(ui.pageTitle, "mt-1")}>Set up your plan</h2>
        <p className={ui.pageSub}>
          Tell us about yourself and your goal — we&apos;ll calculate personalized daily targets.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition",
              i <= stepIndex ? "bg-[var(--intel)]" : "bg-[var(--bg-elevated)]"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-4 flex items-center gap-2">
            {(() => {
              const Icon = STEP_META[step].icon;
              return (
                <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--intel-dim)] text-[var(--intel)]">
                  <Icon className="h-4 w-4" />
                </div>
              );
            })()}
            <div>
              <h3 className={ui.sectionTitle}>{STEP_META[step].title}</h3>
              <p className={ui.sectionSub}>{STEP_META[step].sub}</p>
            </div>
          </div>

          {step === "stats" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={ui.label}>Age</label>
                  <input
                    type="number"
                    min={14}
                    max={90}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={cn(ui.input, "mt-1.5")}
                  />
                </div>
                <div>
                  <label className={ui.label}>Sex</label>
                  <div className="mt-1.5 flex gap-2">
                    {(["male", "female"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSex(s)}
                        className={cn(
                          "flex-1 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-medium capitalize transition",
                          sex === s
                            ? "border-[var(--intel)] bg-[var(--intel-dim)] text-[var(--intel)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={ui.label}>Weight</label>
                  <div className="flex rounded-[var(--radius-sm)] border border-[var(--border)] p-0.5 text-[10px]">
                    {(["lb", "kg"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => {
                          const num = parseFloat(weight) || 0;
                          if (u === "kg" && weightUnit === "lb") setWeight(String(Math.round(lbToKg(num))));
                          if (u === "lb" && weightUnit === "kg") setWeight(String(Math.round(kgToLb(num))));
                          setWeightUnit(u);
                        }}
                        className={cn(
                          "rounded px-2 py-0.5 font-semibold uppercase",
                          weightUnit === u ? "bg-[var(--intel-dim)] text-[var(--intel)]" : "text-[var(--muted)]"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={cn(ui.input, "mt-1.5")}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={ui.label}>Height</label>
                  <button
                    type="button"
                    onClick={() => setUseMetricHeight((v) => !v)}
                    className={cn(ui.btnGhost, "text-[10px]")}
                  >
                    {useMetricHeight ? "Use ft / in" : "Use cm"}
                  </button>
                </div>
                {useMetricHeight ? (
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className={cn(ui.input, "mt-1.5")}
                    placeholder="cm"
                  />
                ) : (
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="number"
                      min={4}
                      max={7}
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      className={cn(ui.input, "flex-1")}
                      placeholder="ft"
                    />
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      className={cn(ui.input, "flex-1")}
                      placeholder="in"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "activity" && (
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActivity(opt.id)}
                  className={cn(
                    ui.cardInner,
                    "w-full p-3.5 text-left transition",
                    activity === opt.id && "border-[var(--intel)]/50 bg-[var(--intel-dim)]/40"
                  )}
                >
                  <p className="text-sm font-semibold text-[var(--foreground)]">{opt.label}</p>
                  <p className="text-xs text-[var(--muted)]">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === "goal" && (
            <div className="grid gap-2 sm:grid-cols-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGoal(opt.id)}
                  className={cn(
                    ui.cardInner,
                    "p-3.5 text-left transition",
                    goal === opt.id && "border-[var(--intel)]/50 bg-[var(--intel-dim)]/40"
                  )}
                >
                  <p className="text-sm font-semibold text-[var(--foreground)]">{opt.label}</p>
                  <p className="text-xs text-[var(--muted)]">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === "review" && previewGoals && profile && (
            <div className="space-y-4">
              <div className={cn(ui.cardInner, "grid gap-3 p-4 sm:grid-cols-3")}>
                <div>
                  <p className={ui.overline}>Maintenance</p>
                  <p className="font-display text-xl font-bold">{tdee} <span className="text-sm font-normal text-[var(--muted)]">kcal</span></p>
                </div>
                <div>
                  <p className={ui.overline}>Daily target</p>
                  <p className="font-display text-xl font-bold text-[var(--intel)]">{calories} <span className="text-sm font-normal text-[var(--muted)]">kcal</span></p>
                </div>
                <div>
                  <p className={ui.overline}>Goal</p>
                  <p className="text-sm font-semibold capitalize">{GOAL_OPTIONS.find((g) => g.id === goal)?.label}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Protein", value: previewGoals.protein, unit: "g" },
                  { label: "Carbs", value: previewGoals.carbs, unit: "g" },
                  { label: "Fat", value: previewGoals.fat, unit: "g" },
                  { label: "Fiber", value: previewGoals.fiber, unit: "g" },
                ].map((item) => (
                  <div key={item.label} className={cn(ui.cardInner, "px-3 py-2.5")}>
                    <p className="text-[11px] text-[var(--muted)]">{item.label}</p>
                    <p className="font-display text-lg font-semibold">{item.value}{item.unit}</p>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-[var(--muted)]">
                Based on Mifflin-St Jeor with activity multiplier. Adjust anytime under Nutrition Goals.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className={cn(ui.btnGhost, "disabled:opacity-40")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {step === "review" ? (
          <button type="button" onClick={finish} disabled={!profile} className={ui.btnProtocol}>
            <Check className="h-4 w-4" />
            Start tracking
          </button>
        ) : (
          <button type="button" onClick={goNext} disabled={!canContinue} className={ui.btnProtocol}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}