interface ThemeContrastInput {
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  baseColor: string;
  elevatedColor: string;
  surfaceColor: string;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
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

function hslToHex(h: number, s: number, l: number): string {
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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function textOnAccent(accent: string): string {
  const candidates = ["#f8fafc", "#0a0c10", "#ffffff", "#000000"];
  let best = "#f8fafc";
  let bestRatio = 0;
  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate, accent);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return best;
}

function adjustAccentForBackground(accent: string, background: string, minRatio: number): string {
  const { h, s, l } = hexToHsl(accent);

  for (let step = 1; step <= 45; step++) {
    const lighter = hslToHex(h, s, Math.min(92, l + step * 2));
    if (contrastRatio(lighter, background) >= minRatio) return lighter;

    const darker = hslToHex(h, s, Math.max(8, l - step * 2));
    if (contrastRatio(darker, background) >= minRatio) return darker;
  }

  return relativeLuminance(background) > 0.45 ? "#0a0c10" : "#f8fafc";
}

export function ensureReadableAccent(
  accent: string,
  backgrounds: string[],
  minRatio = 3,
): string {
  let color = accent;
  for (const bg of backgrounds) {
    if (contrastRatio(color, bg) < minRatio) {
      color = adjustAccentForBackground(color, bg, minRatio);
    }
  }
  return color;
}

export function surfaceTextTokens(surface: string): {
  foreground: string;
  muted: string;
  muted2: string;
  border: string;
  borderStrong: string;
} {
  const lum = relativeLuminance(surface);

  if (lum > 0.58) {
    return {
      foreground: "#0c0e12",
      muted: "#475569",
      muted2: "#64748b",
      border: "rgba(0, 0, 0, 0.08)",
      borderStrong: "rgba(0, 0, 0, 0.15)",
    };
  }

  if (lum > 0.38) {
    return {
      foreground: "#111827",
      muted: "#4b5563",
      muted2: "#6b7280",
      border: "rgba(0, 0, 0, 0.1)",
      borderStrong: "rgba(0, 0, 0, 0.18)",
    };
  }

  return {
    foreground: "#f2f4f8",
    muted: "#9aa3b2",
    muted2: "#6b7280",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.15)",
  };
}

export interface ThemeContrastVars {
  foreground: string;
  muted: string;
  muted2: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  accentTertiary: string;
  labs: string;
  protocol: string;
  intel: string;
  textOnLabs: string;
  textOnProtocol: string;
  textOnIntel: string;
  textOnWarning: string;
  textOnSuccess: string;
}

const SEMANTIC = {
  danger: "#f87171",
  warning: "#fbbf24",
  success: "#34d399",
} as const;

export function resolveThemeContrast(theme: ThemeContrastInput): ThemeContrastVars {
  const backgrounds = [theme.surfaceColor, theme.baseColor, theme.elevatedColor];
  const text = surfaceTextTokens(theme.surfaceColor);

  const accent = ensureReadableAccent(theme.accentPrimary, backgrounds, 3);
  const accentSoft = ensureReadableAccent(theme.accentSecondary, backgrounds, 3);
  const accentTertiary = ensureReadableAccent(theme.accentTertiary, backgrounds, 3);

  return {
    ...text,
    accent,
    accentSoft,
    accentTertiary,
    labs: accent,
    protocol: accentSoft,
    intel: accentTertiary,
    textOnLabs: textOnAccent(theme.accentPrimary),
    textOnProtocol: textOnAccent(theme.accentSecondary),
    textOnIntel: textOnAccent(theme.accentTertiary),
    textOnWarning: textOnAccent(SEMANTIC.warning),
    textOnSuccess: textOnAccent(SEMANTIC.success),
  };
}