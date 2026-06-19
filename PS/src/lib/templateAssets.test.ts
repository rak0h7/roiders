import { describe, expect, it } from "vitest";
import { blocksFromPreset } from "./contentPresets";
import { getCanvasSize } from "./canvasSizes";
import { ROIDERS_GUIDE_TEMPLATE } from "./templateAssets";

describe("roiders-guide template", () => {
  it("exports at original reference dimensions", () => {
    expect(ROIDERS_GUIDE_TEMPLATE.exportWidth).toBe(600);
    expect(ROIDERS_GUIDE_TEMPLATE.exportHeight).toBe(800);
    const size = getCanvasSize("roiders-guide");
    expect(size.width).toBe(600);
    expect(size.height).toBe(800);
  });

  it("includes hero, topic, body, and footer blocks", () => {
    const blocks = blocksFromPreset("roiders-guide", "roiders-guide");
    expect(blocks.some((b) => b.text === "Roiders.Club" && b.role === "headline")).toBe(true);
    expect(blocks.some((b) => b.text === "HOW TO RUN TREN" && b.role === "headline")).toBe(true);
    expect(blocks.some((b) => b.role === "footer" && b.text === "roiders.club")).toBe(true);
  });
});