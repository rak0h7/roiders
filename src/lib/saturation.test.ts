import { describe, expect, it } from "vitest";
import {
  daysToFullSaturation,
  findSaturationWeek,
  getSaturationProfile,
  percentOfSaturation,
  theoreticalSteadyState,
  weeksToFullSaturation,
} from "@/lib/saturation";

describe("saturation timing", () => {
  it("uses ~4.5 half-lives for full saturation", () => {
    expect(daysToFullSaturation(2)).toBe(9);
    expect(weeksToFullSaturation(6)).toBeCloseTo(3.86, 1);
  });

  it("returns test-e profile with 4–6 week saturation window", () => {
    const profile = getSaturationProfile("test-e");
    expect(profile.halfLifeDisplay).toBe("~5–7 days");
    expect(profile.timeToSaturation).toBe("4–6 weeks");
  });

  it("marks GH as non-classic saturation", () => {
    const profile = getSaturationProfile("gh");
    expect(profile.model).toBe("gh");
    expect(profile.timeToSaturation).toBe("Weeks–months");
  });
});

describe("saturation simulation", () => {
  it("reaches threshold near 4–5 half-lives for test-e", () => {
    const weeklyInput = 250;
    const halfLife = 4.5;
    const result = findSaturationWeek(1, 12, weeklyInput, halfLife, 20);
    expect(result.saturated).toBe(true);
    expect(result.saturationWeek).toBeGreaterThanOrEqual(3);
    expect(result.saturationWeek).toBeLessThanOrEqual(6);
  });

  it("computes percent of steady state", () => {
    const ss = theoreticalSteadyState(200, 4.5);
    expect(percentOfSaturation(ss * 0.97, ss)).toBe(97);
    expect(percentOfSaturation(ss, ss)).toBe(100);
  });
});