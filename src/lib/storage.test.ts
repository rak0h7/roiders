import { describe, expect, it } from "vitest";
import type { BloodworkReport } from "./types";
import { hasUnsavedLabEdits, hydrateLabsState, pickLatestReport, reportToValuesRecord } from "./storage";

function report(id: string, createdAt: string, markerCount = 1): BloodworkReport {
  return {
    id,
    name: id,
    date: "01/01/2026",
    createdAt,
    values: Array.from({ length: markerCount }, (_, i) => ({
      markerId: `marker-${i}`,
      value: 1,
      unit: "ng/dL",
    })),
  };
}

describe("hydrateLabsState", () => {
  it("picks the latest report when no active id is set", () => {
    const reports = [
      report("old", "2026-01-01T00:00:00.000Z", 2),
      report("latest", "2026-06-01T00:00:00.000Z", 5),
    ];

    const hydrated = hydrateLabsState(reports, null);

    expect(hydrated.activeReportId).toBe("latest");
    expect(Object.keys(hydrated.currentValues)).toHaveLength(5);
  });

  it("keeps the active report when it still exists", () => {
    const reports = [
      report("old", "2026-01-01T00:00:00.000Z", 2),
      report("latest", "2026-06-01T00:00:00.000Z", 5),
    ];

    const hydrated = hydrateLabsState(reports, "old");

    expect(hydrated.activeReportId).toBe("old");
    expect(Object.keys(hydrated.currentValues)).toHaveLength(2);
  });

  it("returns empty state when there are no reports", () => {
    const hydrated = hydrateLabsState([], null);
    expect(hydrated.activeReportId).toBeNull();
    expect(hydrated.currentValues).toEqual({});
  });
});

describe("hasUnsavedLabEdits", () => {
  it("detects edits that differ from the saved active report", () => {
    const reports = [report("active", "2026-06-01T00:00:00.000Z", 1)];
    const saved = reportToValuesRecord(reports[0]);
    const edited = { ...saved, "marker-0": { ...saved["marker-0"], value: 99 } };

    expect(hasUnsavedLabEdits(saved, reports, "active")).toBe(false);
    expect(hasUnsavedLabEdits(edited, reports, "active")).toBe(true);
  });

  it("treats values without an active report as unsaved", () => {
    const values = { alt: { markerId: "alt", value: 42, unit: "U/L" } };
    expect(hasUnsavedLabEdits(values, [], null)).toBe(true);
  });
});

describe("pickLatestReport", () => {
  it("sorts by createdAt descending", () => {
    const reports = [
      report("a", "2026-02-01T00:00:00.000Z"),
      report("b", "2026-05-01T00:00:00.000Z"),
    ];
    expect(pickLatestReport(reports)?.id).toBe("b");
  });
});