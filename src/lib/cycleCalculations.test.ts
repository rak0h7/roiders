import { describe, expect, it } from "vitest";
import {
  calculateStats,
  doseCountForEntry,
  generatePKCards,
  generatePKData,
  generateStackedLoadData,
  generateTimelineMilestones,
  generateTimelineRows,
  generateWeekProtocol,
  weeklyDoseAmount,
  doseToMgEquivalent,
  weeklyMgLoad,
  weeklyMgLoadAtWeek,
} from "@/lib/cycleCalculations";
import { parseISO } from "date-fns";
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
    const w1 = data[0].total;
    const w2 = data[1].total;
    const w11 = data[10].total;
    expect(w1).toBe(weeklyMgLoadAtWeek(1, ascendedStack));
    expect(w2).toBe(w1);
    expect(w11).toBeGreaterThan(w2);
  });

  it("PK curves use mg-equivalent weekly input for IU compounds", () => {
    const gh: CycleCompound = {
      id: "gh-pk",
      compoundId: "gh",
      doseMg: 4,
      frequency: "daily",
      activeWeeks: [1, 12],
      route: "injectable",
    };
    const weeklyInput = weeklyMgLoad(gh);
    const data = generatePKData(12, [gh]);
    const w1 = data[1]["gh-pk"] as number;
    expect(w1).toBeCloseTo(weeklyInput, 1);
    expect(weeklyInput).toBeLessThan(10);
    expect(weeklyDoseAmount(gh)).toBe(28);
  });

  it("GH cards expose gradual saturation percent", () => {
    const gh: CycleCompound = {
      id: "gh-sat",
      compoundId: "gh",
      doseMg: 4,
      frequency: "daily",
      activeWeeks: [1, 16],
      route: "injectable",
    };
    const cards = generatePKCards(16, [gh]);
    const ghCard = cards.find((c) => c.id === "gh-sat");
    expect(ghCard?.saturationPct).not.toBeNull();
    expect(ghCard?.saturationPct).toBeGreaterThan(0);
  });

  it("PK cards expose saturation percent for classic compounds", () => {
    const cards = generatePKCards(20, ascendedStack);
    const testCard = cards.find((c) => c.id === "test");
    expect(testCard).toBeDefined();
    expect(testCard?.saturationPct).not.toBeNull();
    expect(testCard?.saturationPct).toBeGreaterThan(90);
    expect(testCard?.saturated).toBe(true);
  });

  it("PK reflects titration phases on a single entry", () => {
    const tren: CycleCompound = {
      id: "tren-ramp",
      compoundId: "tren-a",
      doseMg: 150,
      frequency: "eod",
      activeWeeks: [7, 12],
      route: "injectable",
      dosePhases: [
        { startWeek: 7, endWeek: 8, doseMg: 50 },
        { startWeek: 9, endWeek: 12, doseMg: 150 },
      ],
    };
    const data = generatePKData(12, [tren]);
    const w8 = data[8]["tren-ramp"] as number;
    const w12 = data[12]["tren-ramp"] as number;
    expect(w12).toBeGreaterThan(w8);
  });

  it("stacked load steps up at phase boundary", () => {
    const tren: CycleCompound = {
      id: "tren-ramp",
      compoundId: "tren-a",
      doseMg: 150,
      frequency: "eod",
      activeWeeks: [1, 8],
      route: "injectable",
      dosePhases: [
        { startWeek: 1, endWeek: 4, doseMg: 50 },
        { startWeek: 5, endWeek: 8, doseMg: 150 },
      ],
    };
    const data = generateStackedLoadData(8, [tren]);
    expect(data[3].total).toBeLessThan(data[4].total);
  });

  it("extends PK data for washout weeks", () => {
    const shortRun: CycleCompound = {
      id: "tren-wash",
      compoundId: "tren-a",
      doseMg: 100,
      frequency: "eod",
      activeWeeks: [1, 8],
      route: "injectable",
    };
    const data = generatePKData(8, [shortRun], { washoutWeeks: 4 });
    expect(data).toHaveLength(13);
    expect(data[12]["tren-wash"]).toBeLessThan(data[8]["tren-wash"] as number);
  });
});

describe("timeline helpers", () => {
  const bulkStack: CycleCompound[] = [
    { id: "test", compoundId: "test-e", doseMg: 500, frequency: "2x-weekly", activeWeeks: [1, 16], route: "injectable" },
    { id: "dbol", compoundId: "dbol", doseMg: 30, frequency: "daily", activeWeeks: [1, 4], route: "oral" },
    { id: "tren-low", compoundId: "tren-a", doseMg: 50, frequency: "eod", activeWeeks: [5, 8], route: "injectable" },
    { id: "tren-high", compoundId: "tren-a", doseMg: 100, frequency: "eod", activeWeeks: [9, 16], route: "injectable" },
  ];

  it("generates sorted timeline rows with week spans", () => {
    const rows = generateTimelineRows(bulkStack, 16);
    expect(rows).toHaveLength(4);
    expect(rows[0].category).toBe("anabolics");
    expect(rows.find((r) => r.entryId === "dbol")?.endWeek).toBe(4);
    expect(rows.filter((r) => r.label.startsWith("Tren A"))).toHaveLength(2);
  });

  it("lists active compounds per week in protocol", () => {
    const w3 = generateWeekProtocol(3, bulkStack);
    expect(w3.some((e) => e.name.startsWith("Test E"))).toBe(true);
    expect(w3.some((e) => e.name.startsWith("Dbol"))).toBe(true);
    const w10 = generateWeekProtocol(10, bulkStack);
    expect(w10.some((e) => e.name.startsWith("Tren A"))).toBe(true);
    expect(w10.some((e) => e.name.startsWith("Dbol"))).toBe(false);
  });

  it("includes cycle end and PCT milestones", () => {
    const milestones = generateTimelineMilestones(16, bulkStack, parseISO("2026-01-01"));
    expect(milestones.some((m) => m.type === "end" && m.week === 16)).toBe(true);
    expect(milestones.some((m) => m.type === "pct")).toBe(true);
  });
});