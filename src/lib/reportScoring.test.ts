import { describe, expect, it } from "vitest";
import { calculateCategoryScores, calculateOverallScore } from "./scoring";
import { reportValuesToMap, scoreBloodworkReport } from "./reportScoring";
import type { BloodworkReport } from "./types";

const sampleReport: BloodworkReport = {
  id: "r1",
  name: "June panel",
  date: "20/06/2026",
  createdAt: "2026-06-20T12:00:00.000Z",
  values: [
    { markerId: "total-testosterone", value: 650, unit: "ng/dL" },
    { markerId: "hematocrit", value: 44, unit: "%" },
  ],
};

describe("scoreBloodworkReport", () => {
  it("matches calculateCategoryScores for the same values", () => {
    const map = reportValuesToMap(sampleReport);
    const expected = calculateOverallScore(calculateCategoryScores(map));
    const summary = scoreBloodworkReport(sampleReport);
    expect(summary.score).toBe(expected.score);
    expect(summary.markerCount).toBe(2);
  });

  it("counts flags for out-of-range values", () => {
    const highHct: BloodworkReport = {
      ...sampleReport,
      values: [{ markerId: "hematocrit", value: 53, unit: "%" }],
    };
    const summary = scoreBloodworkReport(highHct);
    expect(summary.flagCount).toBeGreaterThan(0);
  });
});