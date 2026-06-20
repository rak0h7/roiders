import { describe, expect, it } from "vitest";
import { MARKER_MAP } from "./markers";
import { buildReviewFlags, evaluateSeverity } from "./ranges";
import type { MarkerDefinition } from "./types";

describe("evaluateSeverity", () => {
  it("stores free testosterone optimal range in pg/mL scale", () => {
    const marker = MARKER_MAP.get("free-testosterone")!;
    expect(marker.range.optimalMin).toBe(67);
    expect(marker.range.optimalMax).toBe(125);
  });

  it("scores in-range free testosterone as normal", () => {
    const marker = MARKER_MAP.get("free-testosterone")!;
    const result = evaluateSeverity(marker, 100, "pg/mL");
    expect(result.severity).toBe("normal");
  });

  it("uses caution band copy for upperOnly markers above cautionMax", () => {
    const marker: MarkerDefinition = {
      id: "test-upper",
      name: "Test Upper",
      category: "hormonal",
      defaultUnit: "U/L",
      units: ["U/L"],
      aliases: [],
      range: {
        labMax: 10,
        optimalMax: 5,
        cautionMax: 8,
        strictThreshold: 15,
        upperOnly: true,
      },
    };

    const result = evaluateSeverity(marker, 9, "U/L");
    expect(result.severity).toBe("high");
    expect(result.deviation).toContain("above caution band");
    expect(result.deviation).not.toContain("strict app threshold");
  });
});

describe("buildReviewFlags", () => {
  it("sorts flags by severity with stop first", () => {
    const values = [
      { markerId: "lh", value: 0.5, unit: "mIU/mL" },
      { markerId: "hematocrit", value: 54, unit: "%" },
    ];

    const flags = buildReviewFlags(values, "19/06/2026");
    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].severity).toBe("stop");
  });
});