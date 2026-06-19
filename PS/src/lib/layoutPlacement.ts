import type { LayoutPresetId, TextBlock, TextAlign, TextBlockRole } from "./canvasTypes";
import type { CanvasSizeId } from "./canvasSizes";
import { resolvePlacementKey, type PlacementKey } from "./canvasPlacement";

type BlockTemplate = Omit<TextBlock, "id">;

type PlacementMap = Partial<Record<PlacementKey, BlockTemplate[]>> & { default: BlockTemplate[] };

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
    default: [block({ x: 0, y: 42, width: 100, text: "Your text here", role: "body", align: "left" })],
    "9:16": [block({ x: 0, y: 44, width: 100, text: "Your text here", role: "body", align: "left" })],
    "16:9": [block({ x: 0, y: 38, width: 100, text: "Your text here", role: "body", align: "left" })],
  },
  announcement: {
    default: [
      block({ x: 0, y: 26, width: 100, text: "Big news", role: "headline", align: "center" }),
      block({ x: 0, y: 44, width: 100, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 28, y: 62, width: 44, text: "Learn more", role: "cta", align: "center" }),
    ],
    "9:16": [
      block({ x: 0, y: 18, width: 100, text: "Big news", role: "headline", align: "center" }),
      block({ x: 0, y: 36, width: 100, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 28, y: 52, width: 44, text: "Learn more", role: "cta", align: "center" }),
    ],
    "4:5": [
      block({ x: 0, y: 22, width: 100, text: "Big news", role: "headline", align: "center" }),
      block({ x: 0, y: 40, width: 100, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 28, y: 58, width: 44, text: "Learn more", role: "cta", align: "center" }),
    ],
    "16:9": [
      block({ x: 0, y: 24, width: 100, text: "Big news", role: "headline", align: "center" }),
      block({ x: 0, y: 42, width: 100, text: "A short supporting line for your update.", role: "subhead", align: "center" }),
      block({ x: 34, y: 60, width: 32, text: "Learn more", role: "cta", align: "center" }),
    ],
  },
  quote: {
    default: [
      block({
        x: 0,
        y: 30,
        width: 100,
        text: "\"The best results come from consistent tracking and honest data.\"",
        role: "body",
        align: "center",
        fontSize: 22,
      }),
      block({ x: 0, y: 70, width: 100, text: "— Roiders Club", role: "label", align: "center" }),
    ],
    "9:16": [
      block({
        x: 0,
        y: 28,
        width: 100,
        text: "\"The best results come from consistent tracking and honest data.\"",
        role: "body",
        align: "center",
        fontSize: 24,
      }),
      block({ x: 0, y: 74, width: 100, text: "— Roiders Club", role: "label", align: "center" }),
    ],
    "16:9": [
      block({
        x: 0,
        y: 30,
        width: 100,
        text: "\"The best results come from consistent tracking and honest data.\"",
        role: "body",
        align: "center",
        fontSize: 20,
      }),
      block({ x: 0, y: 66, width: 100, text: "— Roiders Club", role: "label", align: "center" }),
    ],
  },
  stat: {
    default: [
      block({ x: 0, y: 32, width: 100, text: "94%", role: "headline", align: "center", fontSize: 64 }),
      block({ x: 0, y: 56, width: 100, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
    "9:16": [
      block({ x: 0, y: 28, width: 100, text: "94%", role: "headline", align: "center", fontSize: 72 }),
      block({ x: 0, y: 50, width: 100, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
    "4:5": [
      block({ x: 0, y: 30, width: 100, text: "94%", role: "headline", align: "center", fontSize: 68 }),
      block({ x: 0, y: 52, width: 100, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
    "16:9": [
      block({ x: 0, y: 28, width: 100, text: "94%", role: "headline", align: "center", fontSize: 56 }),
      block({ x: 0, y: 54, width: 100, text: "Marker in optimal range", role: "subhead", align: "center" }),
    ],
  },
  "title-card": {
    default: [
      block({ x: 0, y: 38, width: 100, text: "Roiders Club", role: "headline", align: "center" }),
      block({ x: 0, y: 56, width: 100, text: "Track. Optimize. Ascend.", role: "subhead", align: "center" }),
    ],
    "9:16": [
      block({ x: 0, y: 40, width: 100, text: "Roiders Club", role: "headline", align: "center" }),
      block({ x: 0, y: 54, width: 100, text: "Track. Optimize. Ascend.", role: "subhead", align: "center" }),
    ],
    "16:9": [
      block({ x: 0, y: 34, width: 100, text: "Roiders Club", role: "headline", align: "center" }),
      block({ x: 0, y: 52, width: 100, text: "Track. Optimize. Ascend.", role: "subhead", align: "center" }),
    ],
  },
  "roiders-club": {
    default: [
      block({ x: 50, y: 0, width: 50, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 18, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 32, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 44,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 72, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "9:16": [
      block({ x: 50, y: 0, width: 50, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 18, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 32, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 44,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 72, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "4:5": [
      block({ x: 50, y: 0, width: 50, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 18, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 32, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 44,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 72, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "1:1": [
      block({ x: 50, y: 0, width: 50, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 18, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 32, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 44,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 70, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "16:9": [
      block({ x: 58, y: 0, width: 42, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 18, width: 56, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 34, width: 56, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 48,
        width: 56,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 72, width: 56, text: "roiders.club", role: "footer", align: "left" }),
    ],
  },
};

export function getLayoutBlockTemplates(
  presetId: LayoutPresetId,
  canvasSizeId: CanvasSizeId,
): BlockTemplate[] {
  const map = PLACEMENTS[presetId] ?? PLACEMENTS.blank;
  const key = resolvePlacementKey(canvasSizeId);
  return map[key] ?? map.default;
}

export function repositionBlocksForCanvas(
  blocks: TextBlock[],
  presetId: LayoutPresetId,
  canvasSizeId: CanvasSizeId,
): TextBlock[] {
  const templates = getLayoutBlockTemplates(presetId, canvasSizeId);
  const used = new Set<number>();

  return blocks.map((block) => {
    let templateIndex = templates.findIndex((t, i) => !used.has(i) && t.role === block.role);
    if (templateIndex < 0) {
      templateIndex = templates.findIndex((_, i) => !used.has(i));
    }
    if (templateIndex < 0) return block;

    used.add(templateIndex);
    const template = templates[templateIndex];
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