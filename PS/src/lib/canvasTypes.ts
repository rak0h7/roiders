export type TextBlockRole = "headline" | "subhead" | "body" | "label" | "cta" | "badge" | "footer";
export type TextAlign = "left" | "center" | "right";
export type LayoutPresetId =
  | "blank"
  | "announcement"
  | "quote"
  | "stat"
  | "title-card"
  | "roiders-club";
export type CanvasSizeId = "1:1" | "4:5" | "9:16" | "16:9";

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

export interface CanvasSize {
  id: CanvasSizeId;
  label: string;
  width: number;
  height: number;
}

export interface EditorDraft {
  blocks: TextBlock[];
  canvasSizeId: CanvasSizeId;
  layoutPresetId: LayoutPresetId;
  selectedBlockId: string | null;
}

export const CANVAS_SIZES: CanvasSize[] = [
  { id: "1:1", label: "Square 1:1", width: 1080, height: 1080 },
  { id: "4:5", label: "Portrait 4:5", width: 1080, height: 1350 },
  { id: "9:16", label: "Story 9:16", width: 1080, height: 1920 },
  { id: "16:9", label: "Banner 16:9", width: 1920, height: 1080 },
];

export function createBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}