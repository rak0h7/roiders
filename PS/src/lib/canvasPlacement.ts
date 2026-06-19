import type { CanvasSizeId } from "./canvasSizes";
import { getCanvasSize } from "./canvasSizes";

/** Layout block templates are keyed by these aspect families. */
export type PlacementKey = "1:1" | "4:5" | "9:16" | "16:9";

export function resolvePlacementKey(canvasSizeId: CanvasSizeId): PlacementKey {
  const { width, height } = getCanvasSize(canvasSizeId);
  const ratio = width / height;

  if (ratio >= 1.2) return "16:9";
  if (ratio >= 0.92) return "1:1";
  if (ratio >= 0.68) return "4:5";
  return "9:16";
}