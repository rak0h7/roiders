import { THEME_PRESET_DEFINITIONS, THEME_PRESETS } from "@/lib/themePresets";
import { resolveThemeContrast } from "@/lib/themeContrast";

export type ThemePresetId = (typeof THEME_PRESET_DEFINITIONS)[number]["id"] | "custom";

export type ContentWidth = "narrow" | "default" | "wide" | "full";
export type FontFamilyId = "dm-sans" | "inter" | "satoshi" | "orbitron" | "syne" | "jetbrains";
export type IconStyleId = "outline" | "filled" | "minimal" | "bold";
export type BackgroundPatternId = "none" | "grid" | "dots" | "scanlines" | "hex";
export type LayoutPresetId = "compact" | "spacious" | "dashboard" | "minimal";

export interface SavedPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface ThemeConfig {
  preset: ThemePresetId;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  baseColor: string;
  elevatedColor: string;
  surfaceColor: string;
  gradientIntensity: number;
  glassBlur: number;
  glassOpacity: number;
  shadowDepth: number;
  fontScale: number;
  borderGlow: boolean;
  animatedBackground: boolean;
  showAmbientBackground: boolean;
  showTopBarSubtitle: boolean;
  density: "comfortable" | "compact";
  radiusScale: number;
  contentWidth: ContentWidth;
  paletteHue: number;
  paletteSaturation: number;
  paletteLightness: number;
  customSwatches: string[];
  savedPalettes: SavedPalette[];
  fontFamily: FontFamilyId;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  iconStyle: IconStyleId;
  iconSize: number;
  buttonHoverIntensity: number;
  pageTransitionSpeed: number;
  parallaxStrength: number;
  particleEffects: boolean;
  backgroundImage: string | null;
  backgroundPattern: BackgroundPatternId;
  gradientAngle: number;
  layoutPreset: LayoutPresetId;
}

export const DEFAULT_THEME: ThemeConfig = {
  preset: "crimson",
  accentPrimary: "#ff2e4a",
  accentSecondary: "#ff6b8a",
  accentTertiary: "#c084fc",
  baseColor: "#07080c",
  elevatedColor: "#0c0e14",
  surfaceColor: "#11141c",
  gradientIntensity: 65,
  glassBlur: 16,
  glassOpacity: 6,
  shadowDepth: 50,
  fontScale: 100,
  borderGlow: true,
  animatedBackground: true,
  showAmbientBackground: true,
  showTopBarSubtitle: true,
  density: "comfortable",
  radiusScale: 1,
  contentWidth: "default",
  paletteHue: 350,
  paletteSaturation: 85,
  paletteLightness: 55,
  customSwatches: ["#ff2e4a", "#ff6b8a", "#c084fc", "#07080c", "#11141c", "#0c0e14"],
  savedPalettes: [],
  fontFamily: "syne",
  fontWeight: 600,
  letterSpacing: 0,
  lineHeight: 1.5,
  iconStyle: "outline",
  iconSize: 20,
  buttonHoverIntensity: 65,
  pageTransitionSpeed: 50,
  parallaxStrength: 40,
  particleEffects: true,
  backgroundImage: null,
  backgroundPattern: "none",
  gradientAngle: 135,
  layoutPreset: "spacious",
};

export const CONTENT_WIDTH_CLASS: Record<ContentWidth, string> = {
  narrow: "max-w-4xl",
  default: "max-w-7xl",
  wide: "max-w-[90rem]",
  full: "max-w-none",
};

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  tertiary: string;
}

export { THEME_PRESETS, THEME_PRESET_DEFINITIONS };

export const FONT_FAMILY_OPTIONS: { id: FontFamilyId; label: string; stack: string }[] = [
  { id: "dm-sans", label: "DM Sans", stack: "var(--font-dm-sans), system-ui, sans-serif" },
  { id: "inter", label: "Inter", stack: "var(--font-inter), var(--font-dm-sans), system-ui, sans-serif" },
  { id: "satoshi", label: "Satoshi (DM Sans)", stack: "var(--font-dm-sans), system-ui, sans-serif" },
  { id: "orbitron", label: "Orbitron", stack: "var(--font-orbitron), var(--font-syne), sans-serif" },
  { id: "syne", label: "Syne", stack: "var(--font-syne), system-ui, sans-serif" },
  { id: "jetbrains", label: "JetBrains Mono", stack: "var(--font-geist-mono), monospace" },
];

export const LAYOUT_PRESET_PATCHES: Record<
  LayoutPresetId,
  Partial<ThemeConfig>
> = {
  compact: {
    layoutPreset: "compact",
    density: "compact",
    contentWidth: "narrow",
    fontScale: 94,
    radiusScale: 0.92,
  },
  spacious: {
    layoutPreset: "spacious",
    density: "comfortable",
    contentWidth: "wide",
    fontScale: 102,
    radiusScale: 1.05,
  },
  dashboard: {
    layoutPreset: "dashboard",
    density: "compact",
    contentWidth: "full",
    fontScale: 98,
    shadowDepth: 60,
  },
  minimal: {
    layoutPreset: "minimal",
    density: "comfortable",
    contentWidth: "default",
    fontScale: 100,
    gradientIntensity: 35,
    glassBlur: 10,
    glassOpacity: 4,
    borderGlow: false,
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lighten(hex: string, amount = 0.12): string {
  const [r, g, b] = hexToRgb(hex);
  const lift = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`;
}

/** Single cohesive mesh — every stop fades into --bg-base so layers never band or crease. */
function buildAmbientGradient(p: string, s: string, t: string, intensity: number): string {
  const base = "var(--bg-base)";
  return [
    `radial-gradient(ellipse 160% 130% at 5% -8%, ${rgba(p, 0.16 + intensity * 0.12)} 0%, ${rgba(p, 0.05 + intensity * 0.04)} 38%, ${base} 72%)`,
    `radial-gradient(ellipse 150% 125% at 98% 108%, ${rgba(s, 0.13 + intensity * 0.1)} 0%, ${rgba(s, 0.04 + intensity * 0.03)} 40%, ${base} 74%)`,
    `radial-gradient(ellipse 120% 100% at 50% 58%, ${rgba(t, 0.07 + intensity * 0.07)} 0%, ${rgba(t, 0.025 + intensity * 0.02)} 48%, ${base} 78%)`,
    base,
  ].join(", ");
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function applyThemeToDocument(theme: ThemeConfig): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const intensity = theme.gradientIntensity / 100;
  const scale = theme.radiusScale;

  const { accentPrimary: p, accentSecondary: s, accentTertiary: t } = theme;
  const contrast = resolveThemeContrast(theme);

  root.style.setProperty("--bg-base", theme.baseColor);
  root.style.setProperty("--bg-elevated", theme.elevatedColor);
  root.style.setProperty("--bg-surface", theme.surfaceColor);
  root.style.setProperty("--bg-hover", lighten(theme.elevatedColor, 0.18));

  root.style.setProperty("--foreground", contrast.foreground);
  root.style.setProperty("--muted", contrast.muted);
  root.style.setProperty("--muted-2", contrast.muted2);
  root.style.setProperty("--border", contrast.border);
  root.style.setProperty("--border-strong", contrast.borderStrong);
  root.style.setProperty("--text-on-labs", contrast.textOnLabs);
  root.style.setProperty("--text-on-protocol", contrast.textOnProtocol);
  root.style.setProperty("--text-on-intel", contrast.textOnIntel);
  root.style.setProperty("--text-on-warning", contrast.textOnWarning);
  root.style.setProperty("--text-on-success", contrast.textOnSuccess);

  root.style.setProperty("--accent", contrast.accent);
  root.style.setProperty("--accent-soft", contrast.accentSoft);
  root.style.setProperty("--accent-tertiary", contrast.accentTertiary);

  root.style.setProperty("--labs", contrast.labs);
  root.style.setProperty("--labs-dim", rgba(p, 0.1 + intensity * 0.06));
  root.style.setProperty("--labs-glow", rgba(p, 0.15 + intensity * 0.25));

  root.style.setProperty("--protocol", contrast.protocol);
  root.style.setProperty("--protocol-dim", rgba(s, 0.1 + intensity * 0.05));
  root.style.setProperty("--protocol-glow", rgba(s, 0.12 + intensity * 0.2));

  root.style.setProperty("--intel", contrast.intel);
  root.style.setProperty("--intel-dim", rgba(t, 0.1 + intensity * 0.05));
  root.style.setProperty("--intel-glow", rgba(t, 0.12 + intensity * 0.18));

  root.style.setProperty(
    "--gradient-primary",
    `linear-gradient(${theme.gradientAngle}deg, ${p} 0%, ${s} 50%, ${p} 100%)`,
  );
  root.style.setProperty("--gradient-ambient", buildAmbientGradient(p, s, t, intensity));
  root.style.setProperty("--gradient-glass", `linear-gradient(145deg, ${rgba(p, 0.08)} 0%, ${rgba(s, 0.04)} 40%, transparent 100%)`);

  root.style.setProperty("--glass-blur", `${theme.glassBlur}px`);
  root.style.setProperty("--glass-bg", rgba("#ffffff", theme.glassOpacity / 100));
  root.style.setProperty("--glass-border", theme.borderGlow ? rgba(p, 0.18) : "rgba(255,255,255,0.07)");

  root.style.setProperty("--radius-sm", `${Math.round(8 * scale)}px`);
  root.style.setProperty("--radius-md", `${Math.round(14 * scale)}px`);
  root.style.setProperty("--radius-lg", `${Math.round(20 * scale)}px`);
  root.style.setProperty("--radius-xl", `${Math.round(28 * scale)}px`);

  const densityScale = theme.density === "compact" ? 0.88 : 1;
  root.style.setProperty("--space-unit", theme.density === "compact" ? "0.85" : "1");
  root.style.setProperty("--control-height", `${Math.round(40 * densityScale)}px`);
  root.style.setProperty("--control-height-sm", `${Math.round(36 * densityScale)}px`);
  root.style.setProperty("--control-height-xs", `${Math.round(32 * densityScale)}px`);
  root.style.setProperty("--control-height-icon", `${Math.round(36 * densityScale)}px`);
  root.style.setProperty("--control-height-micro", `${Math.round(28 * densityScale)}px`);
  root.style.setProperty("--font-scale", String(theme.fontScale / 100));
  root.style.setProperty("--shadow-depth", String(theme.shadowDepth / 100));
  root.style.setProperty("--letter-spacing", `${theme.letterSpacing / 100}em`);
  root.style.setProperty("--line-height", String(theme.lineHeight));
  root.style.setProperty("--icon-size", `${theme.iconSize}px`);
  root.style.setProperty("--btn-hover-intensity", String(theme.buttonHoverIntensity / 100));
  root.style.setProperty("--page-transition-speed", String(theme.pageTransitionSpeed / 100));
  root.style.setProperty("--parallax-strength", String(theme.parallaxStrength / 100));

  const fontStack =
    FONT_FAMILY_OPTIONS.find((f) => f.id === theme.fontFamily)?.stack ??
    FONT_FAMILY_OPTIONS[0].stack;
  const displayStack =
    theme.fontFamily === "orbitron" || theme.fontFamily === "jetbrains"
      ? fontStack
      : "var(--font-syne), system-ui, sans-serif";
  root.style.setProperty("--font-sans-active", fontStack);
  root.style.setProperty("--font-display-active", displayStack);
  root.style.fontWeight = String(theme.fontWeight);

  root.dataset.density = theme.density;
  root.dataset.animatedBg = theme.animatedBackground ? "true" : "false";
  root.dataset.borderGlow = theme.borderGlow ? "true" : "false";
  root.dataset.showAmbientBg = theme.showAmbientBackground ? "true" : "false";
  root.dataset.contentWidth = theme.contentWidth;
  root.dataset.iconStyle = theme.iconStyle;
  root.dataset.bgPattern = theme.backgroundPattern;
  root.dataset.particles = theme.particleEffects ? "true" : "false";
  root.dataset.layoutPreset = theme.layoutPreset;
  root.dataset.customBg = theme.backgroundImage ? "true" : "false";

  if (theme.backgroundImage) {
    root.style.setProperty(
      "--bg-custom-image",
      `url("${theme.backgroundImage.replace(/"/g, "%22")}")`,
    );
  } else {
    root.style.removeProperty("--bg-custom-image");
  }
}

export function buildSwatchesFromAccents(
  primary: string,
  secondary: string,
  tertiary: string,
  surfaces?: Partial<Pick<ThemeConfig, "baseColor" | "surfaceColor" | "elevatedColor">>,
): string[] {
  return [
    primary,
    secondary,
    tertiary,
    surfaces?.baseColor ?? DEFAULT_THEME.baseColor,
    surfaces?.surfaceColor ?? DEFAULT_THEME.surfaceColor,
    surfaces?.elevatedColor ?? DEFAULT_THEME.elevatedColor,
  ];
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function normalizeTheme(raw: Partial<ThemeConfig> | undefined): ThemeConfig {
  const merged = { ...DEFAULT_THEME, ...raw };

  const swatches = Array.isArray(raw?.customSwatches) ? [...raw.customSwatches] : [...DEFAULT_THEME.customSwatches];
  while (swatches.length < 6) {
    swatches.push(DEFAULT_THEME.customSwatches[swatches.length] ?? DEFAULT_THEME.surfaceColor);
  }

  const hsl = hexToHsl(merged.accentPrimary);

  return {
    ...merged,
    customSwatches: swatches.slice(0, 6),
    savedPalettes: Array.isArray(raw?.savedPalettes) ? raw.savedPalettes : [],
    paletteHue: typeof raw?.paletteHue === "number" ? raw.paletteHue : hsl.h,
    paletteSaturation: typeof raw?.paletteSaturation === "number" ? raw.paletteSaturation : hsl.s,
    paletteLightness: typeof raw?.paletteLightness === "number" ? raw.paletteLightness : hsl.l,
    gradientIntensity: clamp(merged.gradientIntensity, 0, 100),
    glassBlur: clamp(merged.glassBlur, 4, 32),
    glassOpacity: clamp(merged.glassOpacity, 2, 16),
    shadowDepth: clamp(merged.shadowDepth, 0, 100),
    fontScale: clamp(merged.fontScale, 85, 115),
    radiusScale: clamp(merged.radiusScale, 0.8, 1.4),
    iconSize: clamp(merged.iconSize, 16, 28),
    buttonHoverIntensity: clamp(merged.buttonHoverIntensity, 0, 100),
    pageTransitionSpeed: clamp(merged.pageTransitionSpeed, 0, 100),
    parallaxStrength: clamp(merged.parallaxStrength, 0, 100),
    gradientAngle: clamp(merged.gradientAngle, 0, 360),
    fontWeight: clamp(merged.fontWeight, 400, 800),
    letterSpacing: clamp(merged.letterSpacing, -20, 40),
    lineHeight: clamp(merged.lineHeight, 1.1, 2),
  };
}

export function presetToTheme(
  preset: ThemePreset,
  current?: Pick<ThemeConfig, "baseColor" | "surfaceColor" | "elevatedColor">,
): Partial<ThemeConfig> {
  const definition = THEME_PRESET_DEFINITIONS.find((p) => p.id === preset.id);
  const surfaces = definition?.surfaces ?? current;
  const hsl = hexToHsl(preset.primary);
  return {
    preset: preset.id,
    accentPrimary: preset.primary,
    accentSecondary: preset.secondary,
    accentTertiary: preset.tertiary,
    customSwatches: buildSwatchesFromAccents(preset.primary, preset.secondary, preset.tertiary, surfaces ?? current),
    paletteHue: hsl.h,
    paletteSaturation: hsl.s,
    paletteLightness: hsl.l,
    ...definition?.surfaces,
    ...definition?.settings,
  };
}