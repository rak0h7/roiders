"use client";

import { useCallback, useRef, useState } from "react";
import { Palette, RotateCcw, Upload } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import {
  DEFAULT_THEME,
  FONT_FAMILY_OPTIONS,
  THEME_PRESETS,
  hexToHsl,
} from "@/lib/themes";
import { ThemePresetGrid } from "@ps/components/theme/ThemePresetGrid";
import { ThemePreviewCard } from "@ps/components/theme/ThemePreviewCard";
import {
  ColorSwatch,
  CompactSlider,
  CompactToggle,
  OptionPills,
  ThemeSection,
} from "@ps/components/theme/ThemeControls";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ThemePanel() {
  const { theme, updateTheme, applyPreset, resetSettings } = useSettings();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (id: string) => setOpenSection((s) => (s === id ? null : id));

  const setAccent = useCallback(
    (key: "accentPrimary" | "accentSecondary" | "accentTertiary", value: string) => {
      const idx = { accentPrimary: 0, accentSecondary: 1, accentTertiary: 2 }[key];
      const swatches = [...theme.customSwatches];
      swatches[idx] = value;
      const hsl = hexToHsl(value);
      updateTheme({
        [key]: value,
        customSwatches: swatches,
        paletteHue: hsl.h,
        paletteSaturation: hsl.s,
        paletteLightness: hsl.l,
        preset: "custom",
      });
    },
    [theme.customSwatches, updateTheme],
  );

  const activeName =
    theme.preset === "custom"
      ? "Custom"
      : (THEME_PRESETS.find((p) => p.id === theme.preset)?.name ?? "Theme");

  const accentSummary = `${theme.accentPrimary} · ${theme.accentSecondary}`;
  const surfaceSummary = `${theme.baseColor} base`;
  const typeSummary = `${FONT_FAMILY_OPTIONS.find((f) => f.id === theme.fontFamily)?.label ?? "Syne"} · ${theme.fontScale}%`;
  const glassSummary = `${theme.gradientIntensity}% gradient · ${theme.glassBlur}px blur`;
  const bgSummary = theme.showAmbientBackground
    ? `${theme.backgroundPattern === "none" ? "ambient" : theme.backgroundPattern}`
    : "flat";
  const fxSummary = theme.particleEffects ? `particles · ${theme.parallaxStrength}%` : "minimal";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--accent)]/25 bg-[var(--labs-dim)]">
          <Palette className="h-4 w-4 text-[var(--accent)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">Theme</p>
          <p className="text-[10px] text-[var(--muted)]">Applies to canvas & editor</p>
        </div>
        <button
          type="button"
          title="Reset all settings"
          onClick={() => {
            resetSettings();
            toast({ type: "info", title: "Theme reset to Crimson" });
          }}
          className={cn(ui.btnIconSm, "shrink-0")}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <ThemePreviewCard theme={theme} name={activeName} />

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className={ui.overline}>Presets</p>
        </div>
        <ThemePresetGrid
          activePreset={theme.preset}
          onSelect={(id) => {
            applyPreset(id);
            toast({ type: "success", title: THEME_PRESETS.find((p) => p.id === id)?.name ?? "Applied" });
          }}
        />
      </div>

      <div className="space-y-2">
        <p className={ui.overline}>Customize</p>

        <ThemeSection title="Accents" summary={accentSummary} open={openSection === "accents"} onToggle={() => toggle("accents")}>
          <div className="space-y-3">
            <ColorSwatch label="Primary" value={theme.accentPrimary} onChange={(v) => setAccent("accentPrimary", v)} />
            <ColorSwatch label="Secondary" value={theme.accentSecondary} onChange={(v) => setAccent("accentSecondary", v)} />
            <ColorSwatch label="Tertiary" value={theme.accentTertiary} onChange={(v) => setAccent("accentTertiary", v)} />
          </div>
        </ThemeSection>

        <ThemeSection title="Surfaces" summary={surfaceSummary} open={openSection === "surfaces"} onToggle={() => toggle("surfaces")}>
          <div className="space-y-3">
            {(
              [
                { key: "baseColor" as const, label: "Base" },
                { key: "elevatedColor" as const, label: "Elevated" },
                { key: "surfaceColor" as const, label: "Surface" },
              ] as const
            ).map(({ key, label }) => (
              <ColorSwatch
                key={key}
                label={label}
                value={theme[key]}
                onChange={(v) => {
                  const idx = { baseColor: 3, surfaceColor: 4, elevatedColor: 5 }[key];
                  const swatches = [...theme.customSwatches];
                  swatches[idx] = v;
                  updateTheme({ [key]: v, customSwatches: swatches, preset: "custom" });
                }}
              />
            ))}
          </div>
        </ThemeSection>

        <ThemeSection title="Typography" summary={typeSummary} open={openSection === "type"} onToggle={() => toggle("type")}>
          <div className="space-y-3">
            <label className="block">
              <span className="text-[10px] font-medium text-[var(--muted)]">Font</span>
              <select
                value={theme.fontFamily}
                onChange={(e) => updateTheme({ fontFamily: e.target.value as typeof theme.fontFamily })}
                className={cn(ui.inputCompact, "mt-1 w-full")}
              >
                {FONT_FAMILY_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <CompactSlider label="Scale" value={theme.fontScale} onChange={(v) => updateTheme({ fontScale: v })} min={85} max={115} unit="%" />
            <CompactSlider label="Weight" value={theme.fontWeight} onChange={(v) => updateTheme({ fontWeight: v })} min={400} max={800} step={100} />
          </div>
        </ThemeSection>

        <ThemeSection title="Glass & shape" summary={glassSummary} open={openSection === "glass"} onToggle={() => toggle("glass")}>
          <div className="space-y-3">
            <CompactSlider label="Gradient" value={theme.gradientIntensity} onChange={(v) => updateTheme({ gradientIntensity: v })} min={0} max={100} unit="%" />
            <CompactSlider label="Glass blur" value={theme.glassBlur} onChange={(v) => updateTheme({ glassBlur: v })} min={4} max={32} unit="px" />
            <CompactSlider label="Radius" value={Math.round(theme.radiusScale * 100)} onChange={(v) => updateTheme({ radiusScale: v / 100 })} min={80} max={140} unit="%" />
            <CompactToggle label="Border glow" checked={theme.borderGlow} onChange={(v) => updateTheme({ borderGlow: v })} />
          </div>
        </ThemeSection>

        <ThemeSection title="Background" summary={bgSummary} open={openSection === "bg"} onToggle={() => toggle("bg")}>
          <div className="space-y-3">
            <CompactToggle label="Ambient gradient" checked={theme.showAmbientBackground} onChange={(v) => updateTheme({ showAmbientBackground: v })} />
            <CompactToggle label="Animated drift" checked={theme.animatedBackground} onChange={(v) => updateTheme({ animatedBackground: v })} />
            <div>
              <span className="text-[10px] font-medium text-[var(--muted)]">Pattern</span>
              <div className="mt-1.5">
                <OptionPills
                  options={["none", "grid", "dots", "scanlines", "hex"] as const}
                  value={theme.backgroundPattern}
                  onChange={(id) => updateTheme({ backgroundPattern: id })}
                />
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    updateTheme({ backgroundImage: reader.result });
                    toast({ type: "success", title: "Background image set" });
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => fileRef.current?.click()} className={cn(ui.btnSecondary, "h-8 gap-1.5 px-3 text-xs")}>
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
              {theme.backgroundImage && (
                <button
                  type="button"
                  onClick={() => updateTheme({ backgroundImage: null })}
                  className={cn(ui.btnGhost, "h-8 px-3 text-xs")}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </ThemeSection>

        <ThemeSection title="Effects" summary={fxSummary} open={openSection === "fx"} onToggle={() => toggle("fx")}>
          <div className="space-y-3">
            <CompactToggle label="Particles" checked={theme.particleEffects} onChange={(v) => updateTheme({ particleEffects: v })} />
            <CompactSlider label="Parallax" value={theme.parallaxStrength} onChange={(v) => updateTheme({ parallaxStrength: v })} min={0} max={100} unit="%" />
          </div>
        </ThemeSection>
      </div>

      <button
        type="button"
        onClick={() => {
          updateTheme(DEFAULT_THEME);
          toast({ type: "info", title: "Colors reset to Crimson default" });
        }}
        className={cn(ui.btnGhost, "w-full justify-center border border-[var(--border)] py-2 text-xs")}
      >
        Reset colors only
      </button>
    </div>
  );
}