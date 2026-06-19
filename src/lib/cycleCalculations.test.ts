import { describe, expect, it } from "vitest";
import {
  calculateStats,
  doseCountForEntry,
  generatePKCards,
  generatePKData,
  generateStackedLoadData,
  weeklyDoseAmount,
  doseToMgEquivalent,
  weeklyMgLoad,
  weeklyMgLoadAtWeek,
} from "@/lib/cycleCalculations";
import type { CycleCompound } from "@/lib/cycleTypes";

const ascendedStack: CycleCompound[] = [
  { id: "test", compoundId: "test-e", doseMg: 36, frequency: "daily", activeWeeks: [1, 20], route: "injectable" },
  { id: "tren-peak", compoundId: "tren-a", doseMg: 150, frequency: "eod", activeWeeks: [11, 18], route: "injectable" },
  { id: "tudca", compoundId: "tudca", doseMg: 500, frequency: "daily", activeWeeks: [1, 20], route: "oral" },
];

describe("weekly dose math", () => {
  it("computes test-e daily as ~252 mg/wk", () => {
    expect(weeklyDoseAmount(ascendedStack[0])).toBe(252);
  });

  it("computes tren-a 150mg EOD as 525 mg/wk", () => {
    expect(weeklyDoseAmount(ascendedStack[1])).toBe(525);
  });

  it("applies pk multiplier for tren weekly load", () => {
    expect(weeklyMgLoad(ascendedStack[1])).toBe(787.5);
  });

  it("includes mcg compounds in weekly load", () => {
    const clen: CycleCompound = {
      id: "clen-1",
      compoundId: "clen",
      doseMg: 40,
      frequency: "daily",
      activeWeeks: [1, 4],
      route: "oral",
    };
    expect(doseToMgEquivalent(40, "mcg")).toBe(0.04);
    expect(weeklyMgLoad(clen)).toBeCloseTo(0.084, 3);
  });

  it("includes IU compounds in weekly load", () => {
    const gh: CycleCompound = {
      id: "gh-1",
      compoundId: "gh",
      doseMg: 2,
      frequency: "daily",
      activeWeeks: [1, 12],
      route: "injectable",
    };
    expect(weeklyMgLoad(gh)).toBeCloseTo(0.93, 2);
  });
});

describe("calculateStats", () => {
  it("does not double-count BID oral doses", () => {
    const oral: CycleCompound = {
      id: "dbol",
      compoundId: "dbol",
      doseMg: 30,
      frequency: "bid",
      activeWeeks: [1, 4],
      route: "oral",
    };
    expect(doseCountForEntry(oral)).toBe(56);
    const stats = calculateStats([oral], 12);
    expect(stats.oralDoses).toBe(56);
  });

  it("averages mg load across active weeks only", () => {
    const stats = calculateStats(ascendedStack, 20);
    expect(stats.avgMgPerWeek).toBeGreaterThan(200);
    expect(stats.peakMgPerWeek).toBeGreaterThan(stats.avgMgPerWeek);
  });
});

describe("simulation series", () => {
  it("builds independent PK curves per stack entry", () => {
    const ramp: CycleCompound[] = [
      { id: "tren-low", compoundId: "tren-a", doseMg: 50, frequency: "eod", activeWeeks: [7, 8], route: "injectable" },
      { id: "tren-high", compoundId: "tren-a", doseMg: 150, frequency: "eod", activeWeeks: [11, 12], route: "injectable" },
    ];
    const data = generatePKData(20, ramp);
    const w12 = data[12];
    expect(w12["tren-low"]).toBe(0);
    expect(w12["tren-high"]).toBeGreaterThan(0);
  });

  it("stacked load has no artificial oscillation", () => {
    const data = generateStackedLoadData(20, ascendedStack);
    const w1 = data[1].total;
    const w2 = data[2].total;
    const w11 = data[11].total;
    expect(w1).toBe(weeklyMgLoadAtWeek(1, ascendedStack));
    expect(w2).toBe(w1);
    expect(w11).toBeGreaterThan(w2);
  });

  it("PK cards expose saturation percent for classic compounds", () => {
    const cards = generatePKCards(20, ascendedStack);
    const testCard = cards.find((c) => c.id === "test");
    expect(testCard).toBeDefined();
    expect(testCard?.saturationPct).not.toBeNull();
    expect(testCard?.saturationPct).toBeGreaterThan(90);
    expect(testCard?.saturated).toBe(true);
  });
});