import { describe, expect, it } from "vitest";
import { calcBmr, calcCalorieTarget, calcMacroGoals, type NutritionProfile } from "./nutritionProfile";

const baseProfile: NutritionProfile = {
  age: 30,
  sex: "male",
  heightCm: 180,
  weightKg: 82,
  activity: "moderate",
  goal: "maintain",
  weightUnit: "lb",
};

describe("nutritionProfile", () => {
  it("calculates BMR with Mifflin-St Jeor", () => {
    expect(calcBmr(baseProfile)).toBeGreaterThan(1600);
    expect(calcBmr(baseProfile)).toBeLessThan(2000);
  });

  it("applies deficit for fat loss goal", () => {
    const maintain = calcCalorieTarget({ ...baseProfile, goal: "maintain" });
    const lose = calcCalorieTarget({ ...baseProfile, goal: "lose" });
    expect(lose).toBeLessThan(maintain);
  });

  it("returns macro goals with protein scaled to weight", () => {
    const goals = calcMacroGoals({ ...baseProfile, goal: "lean_bulk" });
    expect(goals.protein).toBeGreaterThan(140);
    expect(goals.calories).toBeGreaterThan(goals.protein * 4);
    expect(goals.carbs).toBeGreaterThan(0);
  });
});