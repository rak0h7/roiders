import { describe, expect, it } from "vitest";
import { LAB_TREND_MARKERS } from "./labTrendMarkers";
import { MARKER_MAP } from "./markers";

describe("LAB_TREND_MARKERS", () => {
  it("references marker ids that exist in the catalog", () => {
    for (const marker of LAB_TREND_MARKERS) {
      expect(MARKER_MAP.has(marker.id), `missing marker: ${marker.id}`).toBe(true);
    }
  });
});