import { describe, expect, it } from "vitest";
import { isLabsMarkerGrid } from "./articleBlocks";

describe("isLabsMarkerGrid", () => {
  it("detects the compound guide marker grid section", () => {
    expect(
      isLabsMarkerGrid({
        heading: "Blood Markers Impacted",
        blocks: [{ heading: "ALT", body: "Liver enzyme" }],
      }),
    ).toBe(true);
  });

  it("returns false for other headings or empty nested blocks", () => {
    expect(isLabsMarkerGrid({ heading: "Safety", blocks: [] })).toBe(false);
    expect(isLabsMarkerGrid({ heading: "Blood Markers Impacted" })).toBe(false);
  });
});