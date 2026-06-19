import { createBlockId, type CanvasSizeId, type LayoutPresetId, type TextBlock } from "./canvasTypes";
import { getLayoutBlockTemplates } from "./layoutPlacement";

export interface LayoutPreset {
  id: LayoutPresetId;
  label: string;
  description: string;
  defaultCanvasSizeId?: CanvasSizeId;
  branded?: boolean;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "roiders-club",
    label: "roiders.club",
    description: "Branded social slide — badge, gradient headline, body, site footer",
    defaultCanvasSizeId: "9:16",
    branded: true,
  },
  {
    id: "blank",
    label: "Blank",
    description: "Single body text box",
  },
  {
    id: "announcement",
    label: "Announcement",
    description: "Headline, subhead, and CTA",
  },
  {
    id: "quote",
    label: "Quote",
    description: "Quote with attribution",
  },
  {
    id: "stat",
    label: "Stat highlight",
    description: "Big number with label",
  },
  {
    id: "title-card",
    label: "Title card",
    description: "Centered title and subtitle",
  },
];

export function blocksFromPreset(presetId: LayoutPresetId, canvasSizeId: CanvasSizeId = "1:1"): TextBlock[] {
  const templates = getLayoutBlockTemplates(presetId, canvasSizeId);
  return templates.map((block) => ({ ...block, id: createBlockId() }));
}