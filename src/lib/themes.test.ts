import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  buildSwatchesFromAccents,
  hexToHsl,
  hslToHex,
  normalizeTheme,
  presetToTheme,
  THEME_PRESETS,
} from "./themes";

describe("hslToHex / hexToHsl", () => {
  it("round-trips crimson primary", () => {
    const hex = hslToHex(350, 85, 55);
    const hsl = hexToHsl(hex);
    expect(hsl.h).toBeGreaterThanOrEqual(340);
    expect(hsl.s).toBeGreaterThan(70);
  });
});

describe("presetToTheme", () => {
  it("syncs accents and swatches for advanced presets", () => {
    const preset = THEME_PRESETS.find((p) => p.id === "cyberpunk-neon")!;
    const patch = presetToTheme(preset, DEFAULT_THEME);
    expect(patch.accentPrimary).toBe("#ff00ff");
    expect(patch.customSwatches?.[0]).toBe("#ff00ff");
    expect(patch.paletteHue).toBeTypeOf("number");
  });
});

describe("buildSwatchesFromAccents", () => {
  it("keeps surface colors from defaults when omitted", () => {
    const swatches = buildSwatchesFromAccents("#111111", "#222222", "#333333");
    expect(swatches).toEqual([
      "#111111",
      "#222222",
      "#333333",
      DEFAULT_THEME.baseColor,
      DEFAULT_THEME.surfaceColor,
      DEFAULT_THEME.elevatedColor,
    ]);
  });
});

describe("normalizeTheme", () => {
  it("fills missing swatches and clamps values", () => {
    const theme = normalizeTheme({
      accentPrimary: "#ff2e4a",
      customSwatches: ["#ff2e4a"],
      iconSize: 99,
      gradientIntensity: 500,
    });
    expect(theme.customSwatches).toHaveLength(6);
    expect(theme.iconSize).toBe(28);
    expect(theme.gradientIntensity).toBe(100);
  });
});