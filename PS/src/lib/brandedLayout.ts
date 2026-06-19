/** Shared inset values for the roiders.club branded canvas (percent of canvas). */
export const BRANDED_PAD = {
  x: 10,
  top: 11,
  bottom: 18,
} as const;

export const BRANDED_CHROME = {
  headerTop: 6.5,
} as const;

/** Standard safe area for non-branded layouts (percent of canvas). */
export const CANVAS_PAD = {
  x: 10,
  y: 10,
} as const;

export function canvasContentInset(branded: boolean): {
  top: string;
  right: string;
  bottom: string;
  left: string;
} {
  if (branded) {
    return {
      top: `${BRANDED_PAD.top}%`,
      right: `${BRANDED_PAD.x}%`,
      bottom: `${BRANDED_PAD.bottom}%`,
      left: `${BRANDED_PAD.x}%`,
    };
  }
  return {
    top: `${CANVAS_PAD.y}%`,
    right: `${CANVAS_PAD.x}%`,
    bottom: `${CANVAS_PAD.y}%`,
    left: `${CANVAS_PAD.x}%`,
  };
}