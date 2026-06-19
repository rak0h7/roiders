export type { CanvasSizeId, CanvasSize } from "./canvasSizes";
export { CANVAS_SIZES, CANVAS_SIZE_GROUPS, getCanvasSize } from "./canvasSizes";

export type TextBlockRole = "headline" | "subhead" | "body" | "label" | "cta" | "badge" | "footer";
export type TextAlign = "left" | "center" | "right";
export type LayoutPresetId =
  | "blank"
  | "announcement"
  | "quote"
  | "stat"
  | "title-card"
  | "roiders-club"
  | "roiders-guide"
  | "tip-card"
  | "product-drop"
  | "testimonial"
  | "event"
  | "dual-stat"
  | "checklist"
  | "question-hook"
  | "labs-result"
  | "cycle-update"
  | "motivation"
  | "before-after"
  | "listicle"
  | "promo-code"
  | "podcast-hook";

export interface TextBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  text: string;
  role: TextBlockRole;
  align: TextAlign;
  fontSize?: number;
}

export interface EditorDraft {
  blocks: TextBlock[];
  canvasSizeId: string;
  layoutPresetId: LayoutPresetId;
  selectedBlockId: string | null;
  /** Bumped when vertical auto-spacing has been applied to this draft. */
  spacingVersion?: number;
}

export function createBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}