import { describe, expect, it } from "vitest";
import type { ReviewFlag } from "./types";
import { buildCategoryMarkerRows, resolveFlagForMarker, summarizeCategoryRows } from "./categoryBreakdown";

describe("resolveFlagForMarker", () => {
  it("finds cycle-watch flags for missing markers", () => {
    const flags: ReviewFlag[] = [
      {
        markerId: "cycle-watch-prolactin",
        name: "Prolactin — not on panel",
        date: "2026-01-01",
        severity: "yellow",
        deviation: "Tren on stack",
        noDosing: true,
        source: "cycle",
      },
    ];
    const map = new Map(flags.map((f) => [f.markerId, f]));
    expect(resolveFlagForMarker("prolactin", map)?.source).toBe("cycle");
  });

  it("resolves current estradiol cycle-watch flag ids", () => {
    const flags: ReviewFlag[] = [
      {
        markerId: "cycle-watch-estradiol",
        name: "Estradiol — not on panel",
        date: "2026-01-01",
        severity: "yellow",
        deviation: "No AI logged",
        noDosing: true,
        source: "cycle",
      },
    ];
    const map = new Map(flags.map((f) => [f.markerId, f]));
    expect(resolveFlagForMarker("estradiol", map)?.deviation).toBe("No AI logged");
  });

  it("resolves legacy estradiol control flag ids", () => {
    const flags: ReviewFlag[] = [
      {
        markerId: "cycle-watch-estradiol-control",
        name: "Estradiol — not on panel",
        date: "2026-01-01",
        severity: "yellow",
        deviation: "No AI logged",
        noDosing: true,
        source: "cycle",
      },
    ];
    const map = new Map(flags.map((f) => [f.markerId, f]));
    expect(resolveFlagForMarker("estradiol", map)?.deviation).toBe("No AI logged");
  });
});

describe("categoryBreakdown", () => {
  it("sorts flagged markers before normal ones", () => {
    const rows = buildCategoryMarkerRows(
      "hormonal",
      {
        "total-testosterone": { markerId: "total-testosterone", value: 1200, unit: "ng/dL" },
        prolactin: { markerId: "prolactin", value: 8, unit: "ng/mL" },
      },
      []
    );

    const summary = summarizeCategoryRows(rows);
    expect(summary.flagged).toBeGreaterThan(0);
    expect(summary.normal).toBeGreaterThan(0);
    expect(rows[0].severity).not.toBe("normal");
  });

  it("includes missing markers with reference ranges", () => {
    const rows = buildCategoryMarkerRows("liver", {}, []);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.optimalRange.length > 0)).toBe(true);
    expect(rows.every((r) => !r.logged)).toBe(true);
  });

  it("surfaces stack-linked warnings for missing markers", () => {
    const rows = buildCategoryMarkerRows(
      "hormonal",
      {},
      [
        {
          markerId: "cycle-watch-prolactin",
          name: "Prolactin — not on panel",
          date: "2026-01-01",
          severity: "yellow",
          deviation: "19-nor on stack",
          noDosing: true,
          source: "cycle",
          relatedCompounds: ["tren-e"],
        },
      ]
    );
    const prolactin = rows.find((r) => r.markerId === "prolactin");
    expect(prolactin?.severity).toBe("yellow");
    expect(prolactin?.source).toBe("cycle");
    expect(prolactin?.logged).toBe(false);
  });
});