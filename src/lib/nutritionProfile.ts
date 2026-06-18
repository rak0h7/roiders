import { DEFAULT_GOALS } from "@/lib/nutritionTypes";

export type NutritionSex = "male" | "female";
export type NutritionActivity = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type NutritionGoal = "lose" | "maintain" | "lean_bulk" | "bulk";
export type NutritionWeightUnit = "lb" | "kg";

export interface NutritionProfile {
  age: number;
  sex: NutritionSex;
  heightCm: number;
  weightKg: number;
  activity: NutritionActivity;
  goal: NutritionGoal;
  weightUnit: NutritionWeightUnit;
}

export const ACTIVITY_OPTIONS: { id: NutritionActivity; label: string; desc: string; factor: number }[] = [
  { id: "sedentary", label: "Sedentary", desc: "Desk job, little exercise", factor: 1.2 },
  { id: "light", label: "Lightly active", desc: "1–3 workouts per week", factor: 1.375 },
  { id: "moderate", label: "Moderately active", desc: "3–5 workouts per week", factor: 1.55 },
  { id: "active", label: "Very active", desc: "6–7 workouts per week", factor: 1.725 },
  { id: "very_active", label: "Athlete", desc: "Physical job + daily training", factor: 1.9 },
];

export const GOAL_OPTIONS: { id: NutritionGoal; label: string; desc: string; calorieAdj: number }[] = [
  { id: "lose", label: "Lose fat", desc: "Moderate deficit for steady fat loss", calorieAdj: -500 },
  { id: "maintain", label: "Maintain", desc: "Hold current weight and composition", calorieAdj: 0 },
  { id: "lean_bulk", label: "Lean gain", desc: "Small surplus for muscle with minimal fat", calorieAdj: 250 },
  { id: "bulk", label: "Bulk", desc: "Larger surplus for size and strength", calorieAdj: 500 },
];

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}

export function kgToLb(kg: number): number {
  return kg * 2.20462;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalIn = cm / 2.54;
  const feet = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return { feet, inches };
}

export function calcBmr(profile: Pick<NutritionProfile, "sex" | "weightKg" | "heightCm" | "age">): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === "male" ? base + 5 : base - 161;
}

export function calcTdee(profile: NutritionProfile): number {
  const factor = ACTIVITY_OPTIONS.find((a) => a.id === profile.activity)?.factor ?? 1.55;
  return calcBmr(profile) * factor;
}

export function calcCalorieTarget(profile: NutritionProfile): number {
  const tdee = calcTdee(profile);
  const adj = GOAL_OPTIONS.find((g) => g.id === profile.goal)?.calorieAdj ?? 0;
  const floor = profile.sex === "female" ? 1400 : 1600;
  return Math.max(floor, Math.round(tdee + adj));
}

export function calcMacroGoals(profile: NutritionProfile): Record<string, number> {
  const calories = calcCalorieTarget(profile);
  const proteinPerKg =
    profile.goal === "lose" ? 2.2 : profile.goal === "lean_bulk" ? 2.0 : profile.goal === "bulk" ? 1.8 : 1.6;
  const protein = Math.round(profile.weightKg * proteinPerKg);
  const fatPct = profile.goal === "lose" ? 0.28 : 0.25;
  const fat = Math.round((calories * fatPct) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return {
    ...DEFAULT_GOALS,
    calories,
    protein,
    fat,
    carbs,
    fiber: profile.goal === "lose" ? 35 : 30,
  };
}

export const DEFAULT_PROFILE: NutritionProfile = {
  age: 30,
  sex: "male",
  heightCm: 175,
  weightKg: 80,
  activity: "moderate",
  goal: "maintain",
  weightUnit: "lb",
};