import { describe, expect, it } from "vitest";
import type { CycleCompound } from "@/lib/cycleTypes";
import {
  buildLinearRampPhases,
  doseForWeek,
  migrateToPhases,
  normalizeCompoundPhases,
  splitPhaseAtWeek,
} from "@/lib/dosePhases";

const baseEntry: CycleCompound = {
  id: "tren-1",
  compoundId: "tren-a",
  doseMg: 50,
  frequency: "eod",
  activeWeeks: [5, 16],
  route: "injectable",
};

describe("dosePhases", () => {
  it("migrates legacy flat entry to single phase", () => {
    const phases = migrateToPhases(baseEntry);
    expect(phases).toHaveLength(1);
    expect(phases[0]).toEqual({ startWeek: 5, endWeek: 16, doseMg: 50 });
  });

  it("resolves dose per week from phases", () => {
    const cc: CycleCompound = {
      ...baseEntry,
      dosePhases: [
        { startWeek: 5, endWeek: 8, doseMg: 50 },
        { startWeek: 9, endWeek: 16, doseMg: 150 },
      ],
    };
    expect(doseForWeek(cc, 7)).toBe(50);
    expect(doseForWeek(cc, 11)).toBe(150);
    expect(doseForWeek(cc, 4)).toBe(0);
  });

  it("splits phase at week for titration", () => {
    const phases = splitPhaseAtWeek(
      [{ startWeek: 1, endWeek: 12, doseMg: 250 }],
      5,
      500,
    );
    expect(phases).toEqual([
      { startWeek: 1, endWeek: 4, doseMg: 250 },
      { startWeek: 5, endWeek: 12, doseMg: 500 },
    ]);
  });

  it("builds linear ramp phases", () => {
    const phases = buildLinearRampPhases(1, 8, 100, 400, 4);
    expect(phases[0].doseMg).toBe(100);
    expect(phases[phases.length - 1].doseMg).toBe(400);
    expect(phases[0].startWeek).toBe(1);
    expect(phases[phases.length - 1].endWeek).toBe(8);
  });

  it("normalizes active weeks from phases", () => {
    const normalized = normalizeCompoundPhases(
      {
        ...baseEntry,
        dosePhases: [
          { startWeek: 3, endWeek: 6, doseMg: 40 },
          { startWeek: 7, endWeek: 10, doseMg: 80 },
        ],
      },
      12,
    );
    expect(normalized.activeWeeks).toEqual([3, 10]);
    expect(normalized.doseMg).toBe(80);
  });
});