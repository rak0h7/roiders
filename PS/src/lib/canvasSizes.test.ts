import { describe, expect, it } from "vitest";
import {
  createCustomCanvasSize,
  formatAspectRatio,
  getCanvasSize,
  isCustomCanvasSizeId,
  normalizeCanvasSizeId,
} from "./canvasSizes";

describe("custom canvas sizes", () => {
  it("creates and resolves custom sizes", () => {
    const custom = createCustomCanvasSize(1200, 628, "LinkedIn banner");
    expect(isCustomCanvasSizeId(custom.id)).toBe(true);
    const resolved = getCanvasSize(custom.id, [custom]);
    expect(resolved.width).toBe(1200);
    expect(resolved.height).toBe(628);
    expect(resolved.custom).toBe(true);
  });

  it("preserves custom ids during normalization", () => {
    const id = "custom-abc-1234";
    expect(normalizeCanvasSizeId(id)).toBe(id);
  });

  it("formats aspect ratios", () => {
    expect(formatAspectRatio(1920, 1080)).toBe("16:9");
    expect(formatAspectRatio(1080, 1080)).toBe("1:1");
  });
});