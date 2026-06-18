import { describe, expect, it } from "vitest";
import { buildExportBundle, parseImportBundle } from "./export";

describe("export", () => {
  it("builds a v2 bundle with all modules", () => {
    const bundle = buildExportBundle({
      reports: [],
      weeks: 12,
      startDate: "2026-01-01",
      compounds: [],
    });
    expect(bundle.version).toBe("2.0");
    expect(bundle.bloodwork.reports).toEqual([]);
    expect(bundle.cycle.weeks).toBe(12);
  });

  it("parses valid import JSON", () => {
    const raw = JSON.stringify({
      bloodwork: { reports: [{ id: "1", name: "Panel", date: "01/01/2026", values: [] }] },
      cycle: { weeks: 8, startDate: "2026-01-01", compounds: [] },
    });
    const { bundle, error } = parseImportBundle(raw);
    expect(error).toBeNull();
    expect(bundle?.cycle.weeks).toBe(8);
  });
});