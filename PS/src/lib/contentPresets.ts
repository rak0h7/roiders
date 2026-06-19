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
    description: "Branded slide — badge, headline, body, footer",
    defaultCanvasSizeId: "9:16",
    branded: true,
  },
  {
    id: "announcement",
    label: "Announcement",
    description: "Headline, subhead, and CTA",
  },
  {
    id: "stat",
    label: "Stat highlight",
    description: "Big number with label",
  },
  {
    id: "dual-stat",
    label: "Dual stat",
    description: "Two markers side by side",
  },
  {
    id: "labs-result",
    label: "Labs result",
    description: "Badge, big value, marker context",
  },
  {
    id: "before-after",
    label: "Before / after",
    description: "Compare two time points",
  },
  {
    id: "cycle-update",
    label: "Cycle update",
    description: "Week badge, check-in summary",
    defaultCanvasSizeId: "9:16",
  },
  {
    id: "tip-card",
    label: "Quick tip",
    description: "Badge, headline, short advice",
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Title with bullet checklist",
  },
  {
    id: "listicle",
    label: "Listicle",
    description: "Numbered list with CTA",
  },
  {
    id: "question-hook",
    label: "Question hook",
    description: "Engagement question + CTA",
  },
  {
    id: "quote",
    label: "Quote",
    description: "Quote with attribution",
  },
  {
    id: "testimonial",
    label: "Testimonial",
    description: "Member quote with verified badge",
  },
  {
    id: "motivation",
    label: "Motivation",
    description: "Short punchy headline pair",
  },
  {
    id: "product-drop",
    label: "Product drop",
    description: "New badge, feature headline, CTA",
  },
  {
    id: "promo-code",
    label: "Promo code",
    description: "Limited offer with code + CTA",
    defaultCanvasSizeId: "1:1",
  },
  {
    id: "event",
    label: "Event",
    description: "Date, title, details, reminder CTA",
  },
  {
    id: "podcast-hook",
    label: "Podcast / audio",
    description: "Episode title with listen CTA",
    defaultCanvasSizeId: "16:9",
  },
  {
    id: "title-card",
    label: "Title card",
    description: "Centered title and subtitle",
  },
  {
    id: "blank",
    label: "Blank",
    description: "Single body text box",
  },
];

export function blocksFromPreset(presetId: LayoutPresetId, canvasSizeId: CanvasSizeId = "1:1"): TextBlock[] {
  const templates = getLayoutBlockTemplates(presetId, canvasSizeId);
  return templates.map((block) => ({ ...block, id: createBlockId() }));
}