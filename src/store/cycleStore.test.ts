import { describe, expect, it } from "vitest";
import type { CycleCompound } from "@/lib/cycleTypes";
import { clampCompoundsToWeeks, ensureCompoundIds } from "@/store/cycleStore";

describe("ensureCompoundIds", () => {
  it("assigns stable ids when missing", () => {
    const compounds = [
      {
        compoundId: "test-e",
        doseMg: 250,
        frequency: "weekly" as const,
        activeWeeks: [1, 12] as [number, number],
        route: "injectable" as const,
      },
    ];
    const result = ensureCompoundIds(compounds as CycleCompound[]);
    expect(result[0].id).toBeTruthy();
    expect(result[0].id).toContain("test-e");
  });
});

describe("clampCompoundsToWeeks", () => {
  it("truncates active weeks when cycle duration shrinks", () => {
    const compounds: CycleCompound[] = [
      {
        id: "test-1",
        compoundId: "test-e",
        doseMg: 250,
        frequency: "weekly",
        activeWeeks: [1, 16],
        route: "injectable",
      },
      {
        id: "tren-1",
        compoundId: "tren-a",
        doseMg: 50,
        frequency: "eod",
        activeWeeks: [10, 18],
        route: "injectable",
      },
    ];
    const clamped = clampCompoundsToWeeks(compounds, 12);
    expect(clamped[0].activeWeeks).toEqual([1, 12]);
    expect(clamped[1].activeWeeks).toEqual([10, 12]);
  });

  it("truncates dose phases when cycle duration shrinks", () => {
    const compounds: CycleCompound[] = [
      {
        id: "test-1",
        compoundId: "test-e",
        doseMg: 500,
        frequency: "weekly",
        activeWeeks: [1, 16],
        route: "injectable",
        dosePhases: [
          { startWeek: 1, endWeek: 8, doseMg: 250 },
          { startWeek: 9, endWeek: 16, doseMg: 500 },
        ],
      },
    ];
    const clamped = clampCompoundsToWeeks(compounds, 10);
    expect(clamped[0].dosePhases).toEqual([
      { startWeek: 1, endWeek: 8, doseMg: 250 },
      { startWeek: 9, endWeek: 10, doseMg: 500 },
    ]);
  });
});