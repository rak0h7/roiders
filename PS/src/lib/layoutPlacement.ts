import type { CanvasSizeId, LayoutPresetId, TextBlock, TextAlign, TextBlockRole } from "./canvasTypes";

type BlockTemplate = Omit<TextBlock, "id">;

type PlacementMap = Partial<Record<CanvasSizeId, BlockTemplate[]>> & { default: BlockTemplate[] };

function block(
  partial: Omit<BlockTemplate, "role" | "align" | "text"> & {
    role: TextBlockRole;
    text: string;
    align?: TextAlign;
  },
): BlockTemplate {
  return {
    align: "left",
    ...partial,
  };
}

const PLACEMENTS: Record<LayoutPresetId, PlacementMap> = {
  blank: {
    default: [block({ x: 10, y: 40, width: 80, text: "Your text here", role: "body", align: "left" })],
    "9:16": [block({ x: 8, y: 44, width: 84, text: "Your text here", role: "body", align: "left" })],
    "16:9": [block({ x: 18, y: 38, width: 64, text: "Your text here", role: "body", align: "left" })],
  },
  announcement: {
    default: [
      block({ x: 10, y: 28, width: 80, text: "Big news", role: "headline", align: "center" }),
      block({ x: 12, y: 48, width: 76, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 30, y: 68, width: 40, text: "Learn more", role: "cta", align: "center" }),
    ],
    "9:16": [
      block({ x: 8, y: 16, width: 84, text: "Big news", role: "headline", align: "center" }),
      block({ x: 10, y: 34, width: 80, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 28, y: 50, width: 44, text: "Learn more", role: "cta", align: "center" }),
    ],
    "4:5": [
      block({ x: 8, y: 20, width: 84, text: "Big news", role: "headline", align: "center" }),
      block({ x: 10, y: 38, width: 80, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 28, y: 56, width: 44, text: "Learn more", role: "cta", align: "center" }),
    ],
    "16:9": [
      block({ x: 18, y: 24, width: 64, text: "Big news", role: "headline", align: "center" }),
      block({ x: 20, y: 42, width: 60, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 34, y: 58, width: 32, text: "Learn more", role: "cta", align: "center" }),
    ],
  },
  quote: {
    default: [
      block({
        x: 12,
        y: 32,
        width: 76,
        text: "\"The best results come from consistent tracking and honest data.\"",
        role: "body",
        align: "center",
        fontSize: 22,
      }),
      block({ x: 12, y: 72, width: 76, text: "— Roiders Club", role: "label", align: "center" }),
    ],
    "9:16": [
      block({
        x: 10,
        y: 28,
        width: 80,
        text: "\"The best results come from consistent tracking and honest data.\"",
        role: "body",
        align: "center",
        fontSize: 24,
      }),
      block({ x: 10, y: 78, width: 80, text: "— Roiders Club", role: "label", align: "center" }),
    ],
    "16:9": [
      block({
        x: 16,
        y: 30,
        width: 68,
        text: "\"The best results come from consistent tracking and honest data.\"",
        role: "body",
        align: "center",
        fontSize: 20,
      }),
      block({ x: 16, y: 66, width: 68, text: "— Roiders Club", role: "label", align: "center" }),
    ],
  },
  stat: {
    default: [
      block({ x: 10, y: 34, width: 80, text: "94%", role: "headline", align: "center", fontSize: 64 }),
      block({ x: 15, y: 58, width: 70, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
    "9:16": [
      block({ x: 8, y: 30, width: 84, text: "94%", role: "headline", align: "center", fontSize: 72 }),
      block({ x: 12, y: 52, width: 76, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
    "4:5": [
      block({ x: 8, y: 32, width: 84, text: "94%", role: "headline", align: "center", fontSize: 68 }),
      block({ x: 12, y: 54, width: 76, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
    "16:9": [
      block({ x: 18, y: 28, width: 64, text: "94%", role: "headline", align: "center", fontSize: 56 }),
      block({ x: 22, y: 54, width: 56, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
  },
  "title-card": {
    default: [
      block({ x: 10, y: 38, width: 80, text: "Roiders Club", role: "headline", align: "center" }),
      block({ x: 15, y: 56, width: 70, text: "Track. Optimize. Ascend.", role: "subhead", align: "center" }),
    ],
    "9:16": [
      block({ x: 8, y: 40, width: 84, text: "Roiders Club", role: "headline", align: "center" }),
      block({ x: 12, y: 54, width: 76, text: "Track. Optimize. Ascend.", role: "subhead", align: "center" }),
    ],
    "16:9": [
      block({ x: 18, y: 34, width: 64, text: "Roiders Club", role: "headline", align: "center" }),
      block({ x: 22, y: 52, width: 56, text: "Track. Optimize. Ascend.", role: "subhead", align: "center" }),
    ],
  },
  "roiders-club": {
    default: [
      block({ x: 52, y: 0, width: 44, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 14, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 26, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 36,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 74, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "9:16": [
      block({ x: 48, y: 0, width: 48, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 10, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 22, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 32,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 82, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "4:5": [
      block({ x: 50, y: 0, width: 46, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 12, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 24, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 34,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 78, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "1:1": [
      block({ x: 50, y: 2, width: 46, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 14, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 26, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 36,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 74, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "16:9": [
      block({ x: 66, y: 4, width: 30, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 16, width: 58, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 30, width: 58, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 44,
        width: 58,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 66, width: 58, text: "roiders.club", role: "footer", align: "left" }),
    ],
  },
};

export function getLayoutBlockTemplates(
  presetId: LayoutPresetId,
  canvasSizeId: CanvasSizeId,
): BlockTemplate[] {
  const map = PLACEMENTS[presetId] ?? PLACEMENTS.blank;
  return map[canvasSizeId] ?? map.default;
}

export function repositionBlocksForCanvas(
  blocks: TextBlock[],
  presetId: LayoutPresetId,
  canvasSizeId: CanvasSizeId,
): TextBlock[] {
  const templates = getLayoutBlockTemplates(presetId, canvasSizeId);
  return blocks.map((block, index) => {
    const template = templates[index] ?? templates.find((t) => t.role === block.role);
    if (!template) return block;
    return {
      ...block,
      x: template.x,
      y: template.y,
      width: template.width,
      align: template.align,
      fontSize: template.fontSize ?? block.fontSize,
    };
  });
}