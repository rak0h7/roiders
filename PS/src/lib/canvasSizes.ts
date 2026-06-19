export interface CustomCanvasSize {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const QUICK_ASPECT_RATIOS = [
  { w: 1, h: 1, label: "1:1" },
  { w: 4, h: 5, label: "4:5" },
  { w: 9, h: 16, label: "9:16" },
  { w: 16, h: 9, label: "16:9" },
  { w: 2, h: 3, label: "2:3" },
  { w: 3, h: 4, label: "3:4" },
  { w: 3, h: 2, label: "3:2" },
  { w: 4, h: 3, label: "4:3" },
] as const;

export type CanvasSizeId =
  | "roiders-guide"
  | "1:1"
  | "4:5"
  | "9:16"
  | "16:9"
  | "2:3"
  | "3:4"
  | "3:2"
  | "4:3"
  | "og"
  | "2:1"
  | "3:1"
  | "4:1"
  | "21:9"
  | "ig-post"
  | "ig-portrait"
  | "ig-story"
  | "ig-reel"
  | "fb-post"
  | "fb-cover"
  | "fb-story"
  | "x-post"
  | "x-header"
  | "linkedin-post"
  | "linkedin-cover"
  | "linkedin-article"
  | "youtube-thumb"
  | "youtube-short"
  | "youtube-banner"
  | "tiktok"
  | "pinterest-pin"
  | "pinterest-square"
  | "threads-post"
  | "discord-banner"
  | "snapchat"
  | "twitch-offline";

export interface CanvasSize {
  id: string;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  custom?: boolean;
}

export interface CanvasSizeGroup {
  id: string;
  label: string;
  sizes: CanvasSize[];
}

function size(
  id: CanvasSizeId,
  label: string,
  shortLabel: string,
  width: number,
  height: number,
): CanvasSize {
  return { id, label, shortLabel, width, height };
}

export const CANVAS_SIZE_GROUPS: CanvasSizeGroup[] = [
  {
    id: "templates",
    label: "Template sizes",
    sizes: [
      size("roiders-guide", "Roiders guide", "Guide", 600, 800),
    ],
  },
  {
    id: "standard",
    label: "Standard ratios",
    sizes: [
      size("1:1", "Square 1:1", "1:1", 1080, 1080),
      size("4:5", "Portrait 4:5", "4:5", 1080, 1350),
      size("9:16", "Story 9:16", "9:16", 1080, 1920),
      size("16:9", "Landscape 16:9", "16:9", 1920, 1080),
      size("2:3", "Portrait 2:3", "2:3", 1080, 1620),
      size("3:4", "Portrait 3:4", "3:4", 1080, 1440),
      size("3:2", "Landscape 3:2", "3:2", 1620, 1080),
      size("4:3", "Landscape 4:3", "4:3", 1440, 1080),
      size("og", "Link preview 1.91:1", "OG", 1200, 630),
      size("2:1", "Wide 2:1", "2:1", 1920, 960),
      size("3:1", "Banner 3:1", "3:1", 1500, 500),
      size("4:1", "Cover 4:1", "4:1", 1584, 396),
      size("21:9", "Ultrawide 21:9", "21:9", 2520, 1080),
    ],
  },
  {
    id: "instagram",
    label: "Instagram",
    sizes: [
      size("ig-post", "Instagram post", "Post", 1080, 1080),
      size("ig-portrait", "Instagram portrait", "Portrait", 1080, 1350),
      size("ig-story", "Instagram story", "Story", 1080, 1920),
      size("ig-reel", "Instagram reel", "Reel", 1080, 1920),
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    sizes: [
      size("fb-post", "Facebook post", "Post", 1200, 630),
      size("fb-cover", "Facebook cover", "Cover", 820, 312),
      size("fb-story", "Facebook story", "Story", 1080, 1920),
    ],
  },
  {
    id: "x",
    label: "X / Twitter",
    sizes: [
      size("x-post", "X post", "Post", 1200, 675),
      size("x-header", "X header", "Header", 1500, 500),
    ],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    sizes: [
      size("linkedin-post", "LinkedIn post", "Post", 1200, 627),
      size("linkedin-cover", "LinkedIn cover", "Cover", 1584, 396),
      size("linkedin-article", "LinkedIn article", "Article", 1200, 644),
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    sizes: [
      size("youtube-thumb", "YouTube thumbnail", "Thumb", 1280, 720),
      size("youtube-short", "YouTube Short", "Short", 1080, 1920),
      size("youtube-banner", "YouTube channel art", "Banner", 2560, 1440),
    ],
  },
  {
    id: "shorts",
    label: "TikTok & vertical",
    sizes: [
      size("tiktok", "TikTok video", "TikTok", 1080, 1920),
      size("snapchat", "Snapchat story", "Snap", 1080, 1920),
    ],
  },
  {
    id: "pinterest",
    label: "Pinterest",
    sizes: [
      size("pinterest-pin", "Pinterest pin", "Pin", 1000, 1500),
      size("pinterest-square", "Pinterest square", "Square", 1000, 1000),
    ],
  },
  {
    id: "other",
    label: "Other platforms",
    sizes: [
      size("threads-post", "Threads post", "Threads", 1080, 1350),
      size("discord-banner", "Discord server banner", "Discord", 960, 540),
      size("twitch-offline", "Twitch offline screen", "Twitch", 1920, 1080),
    ],
  },
];

export const CANVAS_SIZES: CanvasSize[] = CANVAS_SIZE_GROUPS.flatMap((g) => g.sizes);

const CANVAS_SIZE_IDS = new Set<string>(CANVAS_SIZES.map((s) => s.id));

export const DEFAULT_CANVAS_SIZE_ID: CanvasSizeId = "9:16";

export function isCustomCanvasSizeId(id: string): boolean {
  return id.startsWith("custom-");
}

export function isCanvasSizeId(id: string): id is CanvasSizeId {
  return CANVAS_SIZE_IDS.has(id);
}

export function createCustomCanvasSizeId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function formatAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(width, height);
  return `${width / g}:${height / g}`;
}

export function createCustomCanvasSize(width: number, height: number, label: string): CustomCanvasSize {
  return {
    id: createCustomCanvasSizeId(),
    label,
    width,
    height,
  };
}

export function normalizeCanvasSizeId(id: string | undefined | null): string {
  if (id && isCanvasSizeId(id)) return id;
  if (id && isCustomCanvasSizeId(id)) return id;
  return DEFAULT_CANVAS_SIZE_ID;
}

export function getCanvasSize(
  id: string | undefined | null,
  customSizes: CustomCanvasSize[] = [],
): CanvasSize {
  const normalized = normalizeCanvasSizeId(id ?? undefined);
  const preset = CANVAS_SIZES.find((s) => s.id === normalized);
  if (preset) return preset;

  const custom = customSizes.find((s) => s.id === normalized);
  if (custom) {
    const ratio = formatAspectRatio(custom.width, custom.height);
    return {
      id: custom.id,
      label: custom.label,
      shortLabel: ratio,
      width: custom.width,
      height: custom.height,
      custom: true,
    };
  }

  if (isCustomCanvasSizeId(normalized)) {
    return {
      id: normalized,
      label: "Custom size",
      shortLabel: "Custom",
      width: 1080,
      height: 1920,
      custom: true,
    };
  }

  return CANVAS_SIZES.find((s) => s.id === DEFAULT_CANVAS_SIZE_ID) ?? CANVAS_SIZES[0];
}

export function buildCanvasSizeGroups(customSizes: CustomCanvasSize[]): CanvasSizeGroup[] {
  if (customSizes.length === 0) return CANVAS_SIZE_GROUPS;
  return [
    {
      id: "custom",
      label: "Custom sizes",
      sizes: customSizes.map((custom) => ({
        id: custom.id,
        label: custom.label,
        shortLabel: formatAspectRatio(custom.width, custom.height),
        width: custom.width,
        height: custom.height,
        custom: true,
      })),
    },
    ...CANVAS_SIZE_GROUPS,
  ];
}