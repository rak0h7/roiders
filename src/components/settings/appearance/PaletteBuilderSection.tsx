"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import {
  DEFAULT_THEME,
  hexToHsl,
  hslToHex,
  type SavedPalette,
  type ThemeConfig,
} from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { ColorField, SettingsSection, Slider } from "./shared";

const SWATCH_LABELS = ["Accent A", "Accent B", "Accent C", "Base", "Surface", "Elevated"];

type UpdateTheme = (patch: Partial<ThemeConfig>) => void;

export function PaletteBuilderSection({
  theme,
  updateTheme,
  onToast,
}: {
  theme: ThemeConfig;
  updateTheme: UpdateTheme;
  onToast: (title: string, type?: "success" | "info") => void;
}) {
  const [paletteName, setPaletteName] = useState("My palette");
  const [pickerTarget, setPickerTarget] = useState(0);
  const pickerColor = hslToHex(theme.paletteHue, theme.paletteSaturation, theme.paletteLightness);

  const applyPickerToSwatch = (index: number) => {
    const next = [...theme.customSwatches];
    next[index] = pickerColor;
    if (index < 3) {
      const keys = ["accentPrimary", "accentSecondary", "accentTertiary"] as const;
      updateTheme({ [keys[index]]: pickerColor, customSwatches: next, preset: "custom" });
    } else {
      updateTheme({ customSwatches: next, preset: "custom" });
    }
    onToast(`Applied to ${SWATCH_LABELS[index]}`);
  };

  const applySwatchesToTheme = () => {
    updateTheme({
      accentPrimary: theme.customSwatches[0],
      accentSecondary: theme.customSwatches[1],
      accentTertiary: theme.customSwatches[2],
      baseColor: theme.customSwatches[3],
      elevatedColor: theme.customSwatches[5],
      surfaceColor: theme.customSwatches[4],
      preset: "custom",
    });
    onToast("Palette applied to theme");
  };

  const savePalette = () => {
    const entry: SavedPalette = {
      id: crypto.randomUUID(),
      name: paletteName.trim() || "Custom palette",
      colors: [...theme.customSwatches],
    };
    updateTheme({ savedPalettes: [...theme.savedPalettes, entry] });
    onToast(`"${entry.name}" saved`);
  };

  const loadSavedPalette = (palette: SavedPalette) => {
    const colors = [...palette.colors];
    while (colors.length < 6) {
      colors.push(theme.customSwatches[colors.length] ?? DEFAULT_THEME.customSwatches[colors.length]);
    }
    updateTheme({
      customSwatches: colors.slice(0, 6),
      accentPrimary: colors[0],
      accentSecondary: colors[1],
      accentTertiary: colors[2],
      baseColor: colors[3],
      surfaceColor: colors[4],
      elevatedColor: colors[5],
      preset: "custom",
    });
    onToast(`Loaded ${palette.name}`, "info");
  };

  return (
    <SettingsSection title="Custom color palette builder">
      <div className={cn(ui.cardInner, "grid gap-6 p-5 lg:grid-cols-[auto_1fr]")}>
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            aria-label="Color wheel — click to set hue"
            className="relative h-36 w-36 rounded-full border border-[var(--border)] shadow-[0_0_32px_var(--labs-glow)]"
            style={{
              background: `conic-gradient(
                hsl(0, ${theme.paletteSaturation}%, ${theme.paletteLightness}%),
                hsl(60, ${theme.paletteSaturation}%, ${theme.paletteLightness}%),
                hsl(120, ${theme.paletteSaturation}%, ${theme.paletteLightness}%),
                hsl(180, ${theme.paletteSaturation}%, ${theme.paletteLightness}%),
                hsl(240, ${theme.paletteSaturation}%, ${theme.paletteLightness}%),
                hsl(300, ${theme.paletteSaturation}%, ${theme.paletteLightness}%),
                hsl(360, ${theme.paletteSaturation}%, ${theme.paletteLightness}%)
              )`,
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
              updateTheme({ paletteHue: (angle + 360) % 360, preset: "custom" });
            }}
          >
            <span
              className="absolute inset-4 rounded-full border-2 border-white/80 shadow-inner"
              style={{ background: pickerColor }}
            />
          </button>
          <div
            className="h-10 w-full max-w-[9rem] rounded-[var(--radius-md)] border border-[var(--border)] font-mono text-xs flex items-center justify-center text-[var(--foreground)]"
            style={{ background: pickerColor }}
          >
            {pickerColor}
          </div>
        </div>

        <div className="space-y-4">
          <Slider label="Hue" value={theme.paletteHue} onChange={(v) => updateTheme({ paletteHue: v, preset: "custom" })} min={0} max={360} unit="°" />
          <Slider label="Saturation" value={theme.paletteSaturation} onChange={(v) => updateTheme({ paletteSaturation: v, preset: "custom" })} min={0} max={100} unit="%" />
          <Slider label="Lightness" value={theme.paletteLightness} onChange={(v) => updateTheme({ paletteLightness: v, preset: "custom" })} min={10} max={90} unit="%" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {theme.customSwatches.map((hex, i) => (
              <div key={i} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setPickerTarget(i)}
                  className={cn(
                    "h-12 w-full rounded-[var(--radius-md)] border transition",
                    pickerTarget === i ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30" : "border-[var(--border)]",
                  )}
                  style={{ background: hex }}
                  title={`Select ${SWATCH_LABELS[i]}`}
                />
                <p className="text-[10px] text-[var(--muted)]">{SWATCH_LABELS[i]}</p>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => {
                    const next = [...theme.customSwatches];
                    next[i] = e.target.value;
                    updateTheme({ customSwatches: next, preset: "custom" });
                  }}
                  className={cn(ui.input, "h-8 font-mono text-[10px]")}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => applyPickerToSwatch(pickerTarget)} className={ui.btnSecondary}>
              <Wand2 className={ui.icon} />
              Apply picker to swatch
            </button>
            <button type="button" onClick={applySwatchesToTheme} className={ui.btnPrimary}>
              Apply palette to theme
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-2 border-t border-[var(--border)] pt-4">
            <div className="min-w-[140px] flex-1">
              <label className={ui.label}>Save palette as</label>
              <input value={paletteName} onChange={(e) => setPaletteName(e.target.value)} className={cn(ui.input, "mt-1.5 h-9")} />
            </div>
            <button type="button" onClick={savePalette} className={ui.btnSecondary}>
              Save palette
            </button>
          </div>
          {theme.savedPalettes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {theme.savedPalettes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => loadSavedPalette(p)}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-left transition hover:border-[var(--accent)]/40"
                >
                  <div className="mb-1.5 flex gap-0.5">
                    {p.colors.slice(0, 4).map((c, i) => (
                      <span key={i} className="h-3 w-6 rounded-sm" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-[var(--foreground)]">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}

export function AccentColorsSection({
  theme,
  updateTheme,
}: {
  theme: ThemeConfig;
  updateTheme: UpdateTheme;
}) {
  const setColor = (key: "accentPrimary" | "accentSecondary" | "accentTertiary", value: string) => {
    const idx = { accentPrimary: 0, accentSecondary: 1, accentTertiary: 2 }[key];
    const next = [...theme.customSwatches];
    next[idx] = value;
    const hsl = hexToHsl(value);
    updateTheme({
      [key]: value,
      customSwatches: next,
      paletteHue: hsl.h,
      paletteSaturation: hsl.s,
      paletteLightness: hsl.l,
      preset: "custom",
    });
  };

  return (
    <>
      <SettingsSection title="Custom accent colors">
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              { key: "accentPrimary" as const, label: "Primary", desc: "Main accent & labs" },
              { key: "accentSecondary" as const, label: "Secondary", desc: "Gradient end & protocol" },
              { key: "accentTertiary" as const, label: "Tertiary", desc: "Intel & highlights" },
            ] as const
          ).map(({ key, label, desc }) => (
            <ColorField key={key} label={label} desc={desc} value={theme[key]} onChange={(v) => setColor(key, v)} />
          ))}
        </div>
      </SettingsSection>
      <SettingsSection title="Background & surfaces">
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              { key: "baseColor" as const, label: "Base", desc: "Page background" },
              { key: "elevatedColor" as const, label: "Elevated", desc: "Inputs & dropdowns" },
              { key: "surfaceColor" as const, label: "Surface", desc: "Cards & panels" },
            ] as const
          ).map(({ key, label, desc }) => (
            <ColorField
              key={key}
              label={label}
              desc={desc}
              value={theme[key]}
              onChange={(v) => {
                const idx = { baseColor: 3, surfaceColor: 4, elevatedColor: 5 }[key];
                const next = [...theme.customSwatches];
                next[idx] = v;
                updateTheme({ [key]: v, customSwatches: next, preset: "custom" });
              }}
            />
          ))}
        </div>
      </SettingsSection>
    </>
  );
}