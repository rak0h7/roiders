import type { LayoutPresetId, TextBlock, TextAlign, TextBlockRole } from "./canvasTypes";
import { resolvePlacementKey, type PlacementKey } from "./canvasPlacement";
import { spaceBlocksVertically } from "./blockSpacing";

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

/** Base blocks plus optional per-aspect overrides (falls back to default). */
function fit(
  base: BlockTemplate[],
  overrides?: Partial<Record<PlacementKey, BlockTemplate[]>>,
): PlacementMap {
  return { default: base, ...overrides };
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
  "roiders-guide": {
    default: [
      block({ x: 0, y: 2, width: 100, text: "Roiders.Club", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 12,
        width: 100,
        text: "ONE PRIVATE COMMAND CENTER FOR EVERYTHING YOU TRACK ON CYCLE.",
        role: "label",
        align: "center",
      }),
      block({ x: 0, y: 22, width: 100, text: "HOW TO RUN TREN", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 32,
        width: 92,
        text: "Your guide content goes here.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 78, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "4:5": [
      block({ x: 0, y: 2, width: 100, text: "Roiders.Club", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 12,
        width: 100,
        text: "ONE PRIVATE COMMAND CENTER FOR EVERYTHING YOU TRACK ON CYCLE.",
        role: "label",
        align: "center",
      }),
      block({ x: 0, y: 22, width: 100, text: "HOW TO RUN TREN", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 32,
        width: 92,
        text: "Your guide content goes here.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 78, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "9:16": [
      block({ x: 0, y: 6, width: 100, text: "Roiders.Club", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 16,
        width: 100,
        text: "ONE PRIVATE COMMAND CENTER FOR EVERYTHING YOU TRACK ON CYCLE.",
        role: "label",
        align: "center",
      }),
      block({ x: 0, y: 28, width: 100, text: "HOW TO RUN TREN", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 40,
        width: 92,
        text: "Your guide content goes here.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 82, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "1:1": [
      block({ x: 0, y: 4, width: 100, text: "Roiders.Club", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 14,
        width: 100,
        text: "ONE PRIVATE COMMAND CENTER FOR EVERYTHING YOU TRACK ON CYCLE.",
        role: "label",
        align: "center",
      }),
      block({ x: 0, y: 24, width: 100, text: "HOW TO RUN TREN", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 34,
        width: 92,
        text: "Your guide content goes here.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 72, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "16:9": [
      block({ x: 0, y: 8, width: 100, text: "Roiders.Club", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 22,
        width: 100,
        text: "ONE PRIVATE COMMAND CENTER FOR EVERYTHING YOU TRACK ON CYCLE.",
        role: "label",
        align: "center",
      }),
      block({ x: 0, y: 34, width: 100, text: "HOW TO RUN TREN", role: "headline", align: "center" }),
      block({
        x: 0,
        y: 46,
        width: 70,
        text: "Your guide content goes here.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 72, width: 100, text: "roiders.club", role: "footer", align: "left" }),
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
      block({ x: 0, y: 14, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 48, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 58,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 82, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    "4:5": [
      block({ x: 50, y: 0, width: 50, text: "Performance health", role: "badge", align: "right" }),
      block({ x: 0, y: 14, width: 100, text: "Roiders Club", role: "headline", align: "left" }),
      block({ x: 0, y: 46, width: 100, text: "Labs · Gear · Training · Nutrition", role: "subhead", align: "left" }),
      block({
        x: 0,
        y: 56,
        width: 100,
        text: "One private command center for everything you track on cycle.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 78, width: 100, text: "roiders.club", role: "footer", align: "left" }),
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
  "tip-card": fit(
    [
      block({ x: 0, y: 8, width: 40, text: "Quick tip", role: "badge", align: "left" }),
      block({ x: 0, y: 22, width: 100, text: "Log labs on the same day each week", role: "headline", align: "left" }),
      block({
        x: 0,
        y: 38,
        width: 100,
        text: "Consistent timing makes trend lines meaningful and removes noise from your protocol review.",
        role: "body",
        align: "left",
      }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 10, width: 42, text: "Quick tip", role: "badge", align: "left" }),
        block({ x: 0, y: 22, width: 100, text: "Log labs on the same day each week", role: "headline", align: "left" }),
        block({
          x: 0,
          y: 36,
          width: 100,
          text: "Consistent timing makes trend lines meaningful and removes noise from your protocol review.",
          role: "body",
          align: "left",
        }),
      ],
    },
  ),
  "product-drop": fit(
    [
      block({ x: 0, y: 10, width: 36, text: "New", role: "badge", align: "left" }),
      block({ x: 0, y: 24, width: 100, text: "Nutrition module is live", role: "headline", align: "left" }),
      block({ x: 0, y: 40, width: 100, text: "Track macros, meals, and targets in one place.", role: "subhead", align: "left" }),
      block({ x: 0, y: 58, width: 44, text: "Explore now", role: "cta", align: "left" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 14, width: 36, text: "New", role: "badge", align: "left" }),
        block({ x: 0, y: 26, width: 100, text: "Nutrition module is live", role: "headline", align: "left" }),
        block({ x: 0, y: 40, width: 100, text: "Track macros, meals, and targets in one place.", role: "subhead", align: "left" }),
        block({ x: 0, y: 54, width: 44, text: "Explore now", role: "cta", align: "left" }),
      ],
    },
  ),
  testimonial: fit(
    [
      block({
        x: 0,
        y: 28,
        width: 100,
        text: "\"Finally have one dashboard for labs, training, and cycle notes. Game changer.\"",
        role: "body",
        align: "center",
        fontSize: 20,
      }),
      block({ x: 0, y: 62, width: 100, text: "— Member, 8 months in", role: "label", align: "center" }),
      block({ x: 32, y: 72, width: 36, text: "Verified", role: "badge", align: "center" }),
    ],
    {
      "9:16": [
        block({
          x: 0,
          y: 30,
          width: 100,
          text: "\"Finally have one dashboard for labs, training, and cycle notes. Game changer.\"",
          role: "body",
          align: "center",
          fontSize: 22,
        }),
        block({ x: 0, y: 58, width: 100, text: "— Member, 8 months in", role: "label", align: "center" }),
        block({ x: 32, y: 68, width: 36, text: "Verified", role: "badge", align: "center" }),
      ],
    },
  ),
  event: fit(
    [
      block({ x: 0, y: 12, width: 100, text: "March 15 · 8PM EST", role: "label", align: "center" }),
      block({ x: 0, y: 26, width: 100, text: "Live protocol Q&A", role: "headline", align: "center" }),
      block({ x: 0, y: 42, width: 100, text: "Bring your labs, training logs, and questions.", role: "body", align: "center" }),
      block({ x: 30, y: 58, width: 40, text: "Set reminder", role: "cta", align: "center" }),
    ],
    {
      "16:9": [
        block({ x: 0, y: 16, width: 100, text: "March 15 · 8PM EST", role: "label", align: "center" }),
        block({ x: 0, y: 30, width: 100, text: "Live protocol Q&A", role: "headline", align: "center" }),
        block({ x: 0, y: 46, width: 100, text: "Bring your labs, training logs, and questions.", role: "body", align: "center" }),
        block({ x: 34, y: 62, width: 32, text: "Set reminder", role: "cta", align: "center" }),
      ],
    },
  ),
  "dual-stat": fit(
    [
      block({ x: 0, y: 24, width: 46, text: "Total testosterone", role: "label", align: "center" }),
      block({ x: 0, y: 34, width: 46, text: "742", role: "headline", align: "center", fontSize: 48 }),
      block({ x: 54, y: 24, width: 46, text: "Free testosterone", role: "label", align: "center" }),
      block({ x: 54, y: 34, width: 46, text: "18.2", role: "headline", align: "center", fontSize: 48 }),
      block({ x: 0, y: 56, width: 100, text: "Both markers in range after week 6", role: "subhead", align: "center" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 20, width: 100, text: "Total testosterone", role: "label", align: "center" }),
        block({ x: 0, y: 28, width: 100, text: "742", role: "headline", align: "center", fontSize: 56 }),
        block({ x: 0, y: 44, width: 100, text: "Free testosterone", role: "label", align: "center" }),
        block({ x: 0, y: 52, width: 100, text: "18.2", role: "headline", align: "center", fontSize: 56 }),
        block({ x: 0, y: 68, width: 100, text: "Both markers in range after week 6", role: "subhead", align: "center" }),
      ],
    },
  ),
  checklist: fit(
    [
      block({ x: 0, y: 14, width: 100, text: "Pre-lab checklist", role: "headline", align: "left" }),
      block({
        x: 0,
        y: 30,
        width: 100,
        text: "☐ Fast 10–12 hours\n☐ Same time of day as last draw\n☐ Log compounds 48h prior\n☐ Upload PDF same day",
        role: "body",
        align: "left",
      }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 16, width: 100, text: "Pre-lab checklist", role: "headline", align: "left" }),
        block({
          x: 0,
          y: 28,
          width: 100,
          text: "☐ Fast 10–12 hours\n☐ Same time of day as last draw\n☐ Log compounds 48h prior\n☐ Upload PDF same day",
          role: "body",
          align: "left",
        }),
      ],
    },
  ),
  "question-hook": fit(
    [
      block({ x: 0, y: 22, width: 100, text: "Are you tracking estradiol with your blast?", role: "headline", align: "center" }),
      block({ x: 0, y: 42, width: 100, text: "Most people guess. You don't have to.", role: "subhead", align: "center" }),
      block({ x: 28, y: 58, width: 44, text: "See how", role: "cta", align: "center" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 24, width: 100, text: "Are you tracking estradiol with your blast?", role: "headline", align: "center" }),
        block({ x: 0, y: 42, width: 100, text: "Most people guess. You don't have to.", role: "subhead", align: "center" }),
        block({ x: 28, y: 56, width: 44, text: "See how", role: "cta", align: "center" }),
      ],
    },
  ),
  "labs-result": fit(
    [
      block({ x: 0, y: 8, width: 32, text: "Labs", role: "badge", align: "left" }),
      block({ x: 0, y: 22, width: 100, text: "88", role: "headline", align: "left", fontSize: 56 }),
      block({ x: 0, y: 40, width: 100, text: "HDL cholesterol · mg/dL", role: "subhead", align: "left" }),
      block({ x: 0, y: 52, width: 100, text: "Up 12% since last panel. Staying in target band.", role: "body", align: "left" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 10, width: 32, text: "Labs", role: "badge", align: "left" }),
        block({ x: 0, y: 22, width: 100, text: "88", role: "headline", align: "left", fontSize: 64 }),
        block({ x: 0, y: 38, width: 100, text: "HDL cholesterol · mg/dL", role: "subhead", align: "left" }),
        block({ x: 0, y: 50, width: 100, text: "Up 12% since last panel. Staying in target band.", role: "body", align: "left" }),
      ],
    },
  ),
  "cycle-update": fit(
    [
      block({ x: 0, y: 6, width: 40, text: "Week 8", role: "badge", align: "left" }),
      block({ x: 0, y: 20, width: 100, text: "Mid-cycle check-in", role: "headline", align: "left" }),
      block({
        x: 0,
        y: 34,
        width: 100,
        text: "Weight +2.4 lb · Strength PRs on bench & squat · Sleep avg 7.1h",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 68, width: 100, text: "roiders.club", role: "footer", align: "left" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 8, width: 40, text: "Week 8", role: "badge", align: "left" }),
        block({ x: 0, y: 20, width: 100, text: "Mid-cycle check-in", role: "headline", align: "left" }),
        block({
          x: 0,
          y: 34,
          width: 100,
          text: "Weight +2.4 lb · Strength PRs on bench & squat · Sleep avg 7.1h",
          role: "body",
          align: "left",
        }),
        block({ x: 0, y: 72, width: 100, text: "roiders.club", role: "footer", align: "left" }),
      ],
    },
  ),
  motivation: fit(
    [
      block({ x: 0, y: 32, width: 100, text: "Data beats motivation.", role: "headline", align: "center" }),
      block({ x: 0, y: 50, width: 100, text: "Track it. Read it. Adjust it.", role: "subhead", align: "center" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 38, width: 100, text: "Data beats motivation.", role: "headline", align: "center" }),
        block({ x: 0, y: 52, width: 100, text: "Track it. Read it. Adjust it.", role: "subhead", align: "center" }),
      ],
    },
  ),
  "before-after": fit(
    [
      block({ x: 0, y: 22, width: 46, text: "Week 1", role: "label", align: "center" }),
      block({ x: 0, y: 32, width: 46, text: "198", role: "headline", align: "center", fontSize: 44 }),
      block({ x: 0, y: 44, width: 46, text: "lbs", role: "subhead", align: "center" }),
      block({ x: 54, y: 22, width: 46, text: "Week 12", role: "label", align: "center" }),
      block({ x: 54, y: 32, width: 46, text: "212", role: "headline", align: "center", fontSize: 44 }),
      block({ x: 54, y: 44, width: 46, text: "lbs lean", role: "subhead", align: "center" }),
      block({ x: 0, y: 60, width: 100, text: "+14 lb quality gain · same waist measurement", role: "body", align: "center" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 18, width: 100, text: "Week 1", role: "label", align: "center" }),
        block({ x: 0, y: 26, width: 100, text: "198 lbs", role: "headline", align: "center", fontSize: 48 }),
        block({ x: 0, y: 40, width: 100, text: "Week 12", role: "label", align: "center" }),
        block({ x: 0, y: 48, width: 100, text: "212 lbs lean", role: "headline", align: "center", fontSize: 48 }),
        block({ x: 0, y: 64, width: 100, text: "+14 lb quality gain · same waist measurement", role: "body", align: "center" }),
      ],
    },
  ),
  listicle: fit(
    [
      block({ x: 0, y: 12, width: 100, text: "3 signs your AI is too high", role: "headline", align: "left" }),
      block({
        x: 0,
        y: 28,
        width: 100,
        text: "1. Puffy look that won't diet off\n2. Libido drops before strength does\n3. HDL trending down two panels in a row",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 62, width: 44, text: "Read the guide", role: "cta", align: "left" }),
    ],
    {
      "9:16": [
        block({ x: 0, y: 14, width: 100, text: "3 signs your AI is too high", role: "headline", align: "left" }),
        block({
          x: 0,
          y: 28,
          width: 100,
          text: "1. Puffy look that won't diet off\n2. Libido drops before strength does\n3. HDL trending down two panels in a row",
          role: "body",
          align: "left",
        }),
        block({ x: 0, y: 58, width: 44, text: "Read the guide", role: "cta", align: "left" }),
      ],
    },
  ),
  "promo-code": fit(
    [
      block({ x: 0, y: 14, width: 52, text: "Limited offer", role: "badge", align: "left" }),
      block({ x: 0, y: 28, width: 100, text: "ASCEND30", role: "headline", align: "center", fontSize: 40 }),
      block({ x: 0, y: 46, width: 100, text: "30 days full access · new members", role: "subhead", align: "center" }),
      block({ x: 28, y: 60, width: 44, text: "Claim now", role: "cta", align: "center" }),
    ],
    {
      "1:1": [
        block({ x: 0, y: 16, width: 52, text: "Limited offer", role: "badge", align: "left" }),
        block({ x: 0, y: 30, width: 100, text: "ASCEND30", role: "headline", align: "center", fontSize: 44 }),
        block({ x: 0, y: 48, width: 100, text: "30 days full access · new members", role: "subhead", align: "center" }),
        block({ x: 28, y: 62, width: 44, text: "Claim now", role: "cta", align: "center" }),
      ],
    },
  ),
  "podcast-hook": fit(
    [
      block({ x: 0, y: 10, width: 100, text: "New episode", role: "label", align: "left" }),
      block({ x: 0, y: 22, width: 100, text: "Reading your labs like a coach", role: "headline", align: "left" }),
      block({
        x: 0,
        y: 38,
        width: 100,
        text: "What to flag, what to ignore, and when to adjust your protocol.",
        role: "body",
        align: "left",
      }),
      block({ x: 0, y: 58, width: 40, text: "Listen", role: "cta", align: "left" }),
    ],
    {
      "16:9": [
        block({ x: 0, y: 14, width: 58, text: "New episode", role: "label", align: "left" }),
        block({ x: 0, y: 26, width: 58, text: "Reading your labs like a coach", role: "headline", align: "left" }),
        block({
          x: 0,
          y: 42,
          width: 58,
          text: "What to flag, what to ignore, and when to adjust your protocol.",
          role: "body",
          align: "left",
        }),
        block({ x: 0, y: 62, width: 36, text: "Listen", role: "cta", align: "left" }),
      ],
    },
  ),
};

export function getLayoutBlockTemplates(
  presetId: LayoutPresetId,
  canvasSizeId: string,
): BlockTemplate[] {
  const map = PLACEMENTS[presetId] ?? PLACEMENTS.blank;
  const key = resolvePlacementKey(canvasSizeId);
  return map[key] ?? map.default;
}

export function repositionBlocksForCanvas(
  blocks: TextBlock[],
  presetId: LayoutPresetId,
  canvasSizeId: string,
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

export function layoutBlocksForCanvas(
  blocks: TextBlock[],
  presetId: LayoutPresetId,
  canvasSizeId: string,
): TextBlock[] {
  return spaceBlocksVertically(repositionBlocksForCanvas(blocks, presetId, canvasSizeId));
}