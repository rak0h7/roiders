import { describe, expect, it } from "vitest";
import { THEME_PRESETS } from "@/lib/themePresets";
import { contrastRatio, resolveThemeContrast } from "@/lib/themeContrast";
import { DEFAULT_THEME, normalizeTheme, presetToTheme } from "@/lib/themes";

describe("themeContrast", () => {
  it("meets readable contrast for every preset", () => {
    for (const preset of THEME_PRESETS) {
      const theme = normalizeTheme({ ...DEFAULT_THEME, ...presetToTheme(preset, DEFAULT_THEME) });
      const vars = resolveThemeContrast(theme);

      expect(contrastRatio(vars.foreground, theme.surfaceColor)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(vars.muted, theme.surfaceColor)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(vars.labs, theme.surfaceColor)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(vars.protocol, theme.surfaceColor)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(vars.textOnProtocol, theme.accentSecondary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(vars.textOnLabs, theme.accentPrimary)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("lightens halotestin cobalt for dark surfaces", () => {
    const theme = normalizeTheme({
      ...DEFAULT_THEME,
      ...presetToTheme(THEME_PRESETS.find((p) => p.id === "halotestin")!, DEFAULT_THEME),
    });
    const vars = resolveThemeContrast(theme);
    expect(contrastRatio(vars.protocol, theme.surfaceColor)).toBeGreaterThanOrEqual(3);
    expect(["#f8fafc", "#ffffff"]).toContain(vars.textOnProtocol);
  });

  it("switches to dark text on light surfaces", () => {
    const vars = resolveThemeContrast({
      accentPrimary: "#ff2e4a",
      accentSecondary: "#ff6b8a",
      accentTertiary: "#c084fc",
      baseColor: "#f8fafc",
      elevatedColor: "#f1f5f9",
      surfaceColor: "#e2e8f0",
    });
    expect(vars.foreground).toBe("#0c0e12");
    expect(contrastRatio(vars.foreground, "#e2e8f0")).toBeGreaterThanOrEqual(4.5);
  });
});