import { describe, expect, it } from "vitest";
import { buildMarkerRangeBar } from "./markerRangeBar";

describe("buildMarkerRangeBar", () => {
  it("places in-range testosterone in optimal zone", () => {
    const layout = buildMarkerRangeBar("total-testosterone", 650, "ng/dL");
    expect(layout).not.toBeNull();
    expect(layout!.severity).toBe("normal");
    expect(layout!.valuePercent).toBeGreaterThan(0.2);
    expect(layout!.valuePercent).toBeLessThan(0.8);
    expect(layout!.segments.some((s) => s.kind === "optimal")).toBe(true);
  });

  it("flags high hematocrit above caution", () => {
    const layout = buildMarkerRangeBar("hematocrit", 53, "%");
    expect(layout).not.toBeNull();
    expect(["yellow", "high", "stop"]).toContain(layout!.severity);
  });

  it("handles upper-only markers", () => {
    const layout = buildMarkerRangeBar("hcg", 1.5, "mIU/mL");
    expect(layout).not.toBeNull();
    expect(layout!.segments[0]?.kind).toBe("optimal");
  });

  it("returns null for unknown marker", () => {
    expect(buildMarkerRangeBar("not-a-marker", 1, "ng/dL")).toBeNull();
  });
});