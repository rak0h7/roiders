"use client";

import { motion } from "framer-motion";
import {
  Check,
  Circle,
  Grid3X3,
  Hexagon,
  ImagePlus,
  LayoutGrid,
  Palette,
  Sparkles,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import {
  ADVANCED_PRESET_IDS,
  BASE_PRESET_IDS,
  DEFAULT_THEME,
  FONT_FAMILY_OPTIONS,
  LAYOUT_PRESET_PATCHES,
  THEME_PRESETS,
  hexToHsl,
  hslToHex,
  type ContentWidth,
  type FontFamilyId,
  type IconStyleId,
  type LayoutPresetId,
  type SavedPalette,
  type ThemePresetId,
} from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const SWATCH_LABELS = ["Accent A", "Accent B", "Accent C", "Base", "Surface", "Elevated"];

export function AppearanceSettings() {
  const { theme, updateTheme, applyPreset, reducedMotion, compactSidebar, updateSettings } = useSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paletteName, setPaletteName] = useState("My palette");
  const [pickerTarget, setPickerTarget] = useState(0);

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

  const pickerColor = hslToHex(theme.paletteHue, theme.paletteSaturation, theme.paletteLightness);

  const applyPickerToSwatch = (index: number) => {
    const next = [...theme.customSwatches];
    next[index] = pickerColor;
    updateTheme({ customSwatches: next, preset: "custom" });
    if (index < 3) {
      const keys = ["accentPrimary", "accentSecondary", "accentTertiary"] as const;
      updateTheme({ [keys[index]]: pickerColor, customSwatches: next, preset: "custom" });
    }
    toast({ type: "success", title: `Applied to ${SWATCH_LABELS[index]}` });
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
    toast({ type: "success", title: "Palette applied to theme" });
  };

  const savePalette = () => {
    const entry: SavedPalette = {
      id: crypto.randomUUID(),
      name: paletteName.trim() || "Custom palette",
      colors: [...theme.customSwatches],
    };
    updateTheme({ savedPalettes: [...theme.savedPalettes, entry] });
    toast({ type: "success", title: `"${entry.name}" saved` });
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
    toast({ type: "info", title: `Loaded ${palette.name}` });
  };

  const handleBgUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateTheme({ backgroundImage: reader.result });
          toast({ type: "success", title: "Background image uploaded" });
        }
      };
      reader.readAsDataURL(file);
    },
    [updateTheme, toast],
  );

  const applyLayoutPreset = (id: LayoutPresetId) => {
    updateTheme(LAYOUT_PRESET_PATCHES[id]);
    toast({ type: "success", title: `${id.charAt(0).toUpperCase()}${id.slice(1)} layout applied` });
  };

  return (
    <div className={`${ui.card} ${ui.cardPad} space-y-8`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--labs-dim)]">
          <Palette className={cn(ui.icon, "text-[var(--accent)]")} />
        </div>
        <div>
          <h3 className={ui.sectionTitle}>Appearance & Accent Designer</h3>
          <p className={ui.sectionSub}>
            Customize gradients, glass effects, typography, motion, and accent colors across the entire app.
          </p>
        </div>
      </div>

      <PreviewPanel theme={theme} />

      <PresetSection
        title="Theme presets"
        presetIds={BASE_PRESET_IDS}
        activePreset={theme.preset}
        onSelect={(id) => {
          applyPreset(id);
          toast({ type: "success", title: `${THEME_PRESETS.find((p) => p.id === id)?.name} applied` });
        }}
      />

      <PresetSection
        title="Advanced theme presets"
        presetIds={ADVANCED_PRESET_IDS}
        activePreset={theme.preset}
        onSelect={(id) => {
          applyPreset(id);
          toast({ type: "success", title: `${THEME_PRESETS.find((p) => p.id === id)?.name} applied` });
        }}
      />

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
            <Slider
              label="Hue"
              value={theme.paletteHue}
              onChange={(v) => updateTheme({ paletteHue: v, preset: "custom" })}
              min={0}
              max={360}
              unit="°"
            />
            <Slider
              label="Saturation"
              value={theme.paletteSaturation}
              onChange={(v) => updateTheme({ paletteSaturation: v, preset: "custom" })}
              min={0}
              max={100}
              unit="%"
            />
            <Slider
              label="Lightness"
              value={theme.paletteLightness}
              onChange={(v) => updateTheme({ paletteLightness: v, preset: "custom" })}
              min={10}
              max={90}
              unit="%"
            />
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
              <button
                type="button"
                onClick={() => applyPickerToSwatch(pickerTarget)}
                className={ui.btnSecondary}
              >
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
                <input
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  className={cn(ui.input, "mt-1.5 h-9")}
                />
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

      <SettingsSection title="Custom accent colors">
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              { key: "accentPrimary" as const, label: "Primary", desc: "Main accent & labs" },
              { key: "accentSecondary" as const, label: "Secondary", desc: "Gradient end & protocol" },
              { key: "accentTertiary" as const, label: "Tertiary", desc: "Intel & highlights" },
            ] as const
          ).map(({ key, label, desc }) => (
            <ColorField
              key={key}
              label={label}
              desc={desc}
              value={theme[key]}
              onChange={(v) => setColor(key, v)}
            />
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

      <SettingsSection title="Typography">
        <div className={cn(ui.cardInner, "space-y-5 p-5")}>
          <div>
            <label className={ui.label}>Font family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value as FontFamilyId })}
              className={cn(ui.input, "mt-2")}
            >
              {FONT_FAMILY_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <Slider
            label="Font weight"
            value={theme.fontWeight}
            onChange={(v) => updateTheme({ fontWeight: v })}
            min={400}
            max={800}
            step={100}
          />
          <Slider
            label="Letter spacing"
            value={theme.letterSpacing}
            onChange={(v) => updateTheme({ letterSpacing: v })}
            min={-20}
            max={40}
            unit=""
            display={(v) => `${(v / 100).toFixed(2)}em`}
          />
          <Slider
            label="Line height"
            value={Math.round(theme.lineHeight * 100)}
            onChange={(v) => updateTheme({ lineHeight: v / 100 })}
            min={110}
            max={200}
            display={(v) => (v / 100).toFixed(2)}
          />
          <Slider
            label="Font scale"
            value={theme.fontScale}
            onChange={(v) => updateTheme({ fontScale: v })}
            min={85}
            max={115}
            unit="%"
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Icon style & density">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { id: "outline" as const, label: "Outline", icon: Circle },
              { id: "filled" as const, label: "Filled", icon: Hexagon },
              { id: "minimal" as const, label: "Minimal", icon: Grid3X3 },
              { id: "bold" as const, label: "Bold", icon: Zap },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => updateTheme({ iconStyle: id })}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-3 py-3 text-xs font-semibold transition",
                theme.iconStyle === id
                  ? "border-[var(--accent)]/50 bg-[var(--labs-dim)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]",
              )}
            >
              <Icon
                className={cn(
                  theme.iconStyle === id && id === "filled" ? "fill-current" : "",
                  theme.iconStyle === id && id === "bold" ? "stroke-[2.5]" : "",
                  theme.iconStyle === id && id === "minimal" ? "opacity-70" : "",
                )}
                style={{ width: theme.iconSize, height: theme.iconSize }}
              />
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Slider
            label="Icon size"
            value={theme.iconSize}
            onChange={(v) => updateTheme({ iconSize: v })}
            min={16}
            max={28}
            unit="px"
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Layout presets">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { id: "compact" as const, label: "Compact", desc: "Tight rails & narrow content" },
              { id: "spacious" as const, label: "Spacious", desc: "Breathing room & wide canvas" },
              { id: "dashboard" as const, label: "Dashboard", desc: "Full-width data density" },
              { id: "minimal" as const, label: "Minimal", desc: "Subtle glass & soft accents" },
            ] as const
          ).map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => applyLayoutPreset(id)}
              className={cn(
                "rounded-[var(--radius-md)] border p-3 text-left transition",
                theme.layoutPreset === id
                  ? "border-[var(--accent)]/50 bg-[var(--labs-dim)] glow-accent"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]",
              )}
            >
              <LayoutGrid className="mb-2 h-4 w-4 text-[var(--accent)]" />
              <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">{desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { id: "narrow" as const, label: "Narrow" },
              { id: "default" as const, label: "Default" },
              { id: "wide" as const, label: "Wide" },
              { id: "full" as const, label: "Full" },
            ] satisfies { id: ContentWidth; label: string }[]
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => updateTheme({ contentWidth: id })}
              className={cn(
                "rounded-[var(--radius-md)] border px-3 py-2.5 text-xs font-semibold transition",
                theme.contentWidth === id
                  ? "border-[var(--accent)]/50 bg-[var(--labs-dim)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Background customization">
        <div className={cn(ui.cardInner, "space-y-5 p-5")}>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBgUpload(file);
              }}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} className={ui.btnSecondary}>
              <Upload className="h-4 w-4" />
              Upload background
            </button>
            {theme.backgroundImage && (
              <button
                type="button"
                onClick={() => updateTheme({ backgroundImage: null })}
                className={ui.btnGhost}
              >
                Remove image
              </button>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs text-[var(--muted)]">Pattern overlay</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  { id: "none" as const, label: "None" },
                  { id: "grid" as const, label: "Grid" },
                  { id: "dots" as const, label: "Dots" },
                  { id: "scanlines" as const, label: "Scanlines" },
                  { id: "hex" as const, label: "Hex" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateTheme({ backgroundPattern: id })}
                  className={cn(
                    "rounded-[var(--radius-md)] border px-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition",
                    theme.backgroundPattern === id
                      ? "border-[var(--accent)]/50 bg-[var(--labs-dim)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label="Gradient angle"
            value={theme.gradientAngle}
            onChange={(v) => updateTheme({ gradientAngle: v })}
            min={0}
            max={360}
            unit="°"
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Glass & gradient" className="space-y-5">
        <Slider label="Gradient intensity" value={theme.gradientIntensity} onChange={(v) => updateTheme({ gradientIntensity: v })} min={0} max={100} />
        <Slider label="Glass blur" value={theme.glassBlur} onChange={(v) => updateTheme({ glassBlur: v })} min={4} max={32} unit="px" />
        <Slider label="Glass opacity" value={theme.glassOpacity} onChange={(v) => updateTheme({ glassOpacity: v })} min={2} max={16} unit="%" />
        <Slider
          label="Corner radius"
          value={Math.round(theme.radiusScale * 100)}
          onChange={(v) => updateTheme({ radiusScale: v / 100 })}
          min={80}
          max={140}
          unit="%"
        />
        <Slider label="Panel shadow depth" value={theme.shadowDepth} onChange={(v) => updateTheme({ shadowDepth: v })} min={0} max={100} />
      </SettingsSection>

      <SettingsSection title="Animation & effects" className="space-y-5">
        <Slider
          label="Button hover intensity"
          value={theme.buttonHoverIntensity}
          onChange={(v) => updateTheme({ buttonHoverIntensity: v })}
          min={0}
          max={100}
        />
        <Slider
          label="Page transition speed"
          value={theme.pageTransitionSpeed}
          onChange={(v) => updateTheme({ pageTransitionSpeed: v })}
          min={0}
          max={100}
          display={(v) => (v < 35 ? "Slow" : v > 65 ? "Fast" : "Normal")}
        />
        <Slider
          label="Parallax strength"
          value={theme.parallaxStrength}
          onChange={(v) => updateTheme({ parallaxStrength: v })}
          min={0}
          max={100}
        />
        <ToggleRow
          label="Particle effects"
          desc="Accent motes drifting in the ambient background"
          checked={theme.particleEffects}
          onChange={(v) => updateTheme({ particleEffects: v })}
        />
      </SettingsSection>

      <SettingsSection title="Display & behavior" className="space-y-4">
        <ToggleRow label="Ambient background" desc="Show the accent gradient wash behind content" checked={theme.showAmbientBackground} onChange={(v) => updateTheme({ showAmbientBackground: v })} />
        <ToggleRow label="Animated background" desc="Slow drift on the ambient gradient" checked={theme.animatedBackground} onChange={(v) => updateTheme({ animatedBackground: v })} />
        <ToggleRow label="Top bar subtitles" desc="Show page descriptions under the title" checked={theme.showTopBarSubtitle} onChange={(v) => updateTheme({ showTopBarSubtitle: v })} />
        <ToggleRow label="Accent border glow" desc="Subtle colored borders on glass panels" checked={theme.borderGlow} onChange={(v) => updateTheme({ borderGlow: v })} />
        <ToggleRow label="Collapsed sidebar" desc="Start with the navigation rail minimized" checked={compactSidebar} onChange={(v) => updateSettings({ compactSidebar: v })} />
        <ToggleRow label="Compact density" desc="Tighter spacing across panels" checked={theme.density === "compact"} onChange={(v) => updateTheme({ density: v ? "compact" : "comfortable" })} />
        <ToggleRow label="Reduce motion" desc="Minimize animations for accessibility" checked={reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
      </SettingsSection>

      <button
        type="button"
        onClick={() => {
          updateTheme({
            ...DEFAULT_THEME,
            savedPalettes: theme.savedPalettes,
          });
          toast({ type: "info", title: "Appearance reset to Crimson default" });
        }}
        className={cn(ui.btnGhost, "w-full justify-center border border-[var(--border)] py-3")}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Reset appearance to defaults
      </button>
    </div>
  );
}

function PreviewPanel({ theme }: { theme: ReturnType<typeof useSettings>["theme"] }) {
  return (
    <div
      className="glass-panel relative overflow-hidden rounded-[var(--radius-xl)] p-6"
      style={{
        letterSpacing: `${theme.letterSpacing / 100}em`,
        lineHeight: theme.lineHeight,
      }}
    >
      <div
        className="absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, var(--labs-glow), transparent)" }}
      />
      {theme.backgroundImage && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <p className={ui.overline}>Live preview</p>
      <p className="font-display mt-2 text-2xl font-bold text-gradient" style={{ fontWeight: theme.fontWeight }}>
        Roiders Club
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {FONT_FAMILY_OPTIONS.find((f) => f.id === theme.fontFamily)?.label ?? "Syne"} · {theme.layoutPreset} ·{" "}
        {theme.iconStyle} icons
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" className={ui.btnPrimary}>
          Primary action
        </button>
        <button type="button" className={ui.btnSecondary}>
          Secondary
        </button>
        <span className={cn(ui.pillActive, "pointer-events-none")}>Active pill</span>
        <ImagePlus style={{ width: theme.iconSize, height: theme.iconSize }} className="text-[var(--accent)]" strokeWidth={theme.iconStyle === "bold" ? 2.5 : 1.75} />
      </div>
      <div className="mt-4 flex gap-1">
        {theme.customSwatches.slice(0, 4).map((c, i) => (
          <span key={i} className="h-2 flex-1 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="border-t border-[var(--border)] pt-8">
      <p className={cn(ui.overline, "mb-4")}>{title}</p>
      <div className={className}>{children}</div>
    </section>
  );
}

function PresetSection({
  title,
  presetIds,
  activePreset,
  onSelect,
}: {
  title: string;
  presetIds: ThemePresetId[];
  activePreset: ThemePresetId;
  onSelect: (id: ThemePresetId) => void;
}) {
  const presets = THEME_PRESETS.filter((p) => presetIds.includes(p.id));
  return (
    <section className="border-t border-[var(--border)] pt-8">
      <p className={cn(ui.overline, "mb-4")}>{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {presets.map((preset) => {
          const active = activePreset === preset.id;
          return (
            <motion.button
              key={preset.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(preset.id)}
              className={cn(
                "relative overflow-hidden rounded-[var(--radius-md)] border p-3 text-left transition",
                active ? "border-[var(--accent)]/50 glow-accent" : "border-[var(--border)] hover:border-[var(--border-strong)]",
              )}
            >
              <div
                className="mb-3 h-8 rounded-full"
                style={{ background: `linear-gradient(90deg, ${preset.primary}, ${preset.secondary}, ${preset.tertiary})` }}
              />
              <p className="text-sm font-medium text-[var(--foreground)]">{preset.name}</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">{preset.description}</p>
              {active && <Check className="absolute right-2 top-2 h-4 w-4 text-[var(--accent)]" />}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function ColorField({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={cn(ui.cardInner, "p-4")}>
      <label className={ui.label}>{label}</label>
      <p className="mb-3 text-[10px] text-[var(--muted-2)]">{desc}</p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(ui.input, "h-9 font-mono text-xs")}
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  unit = "",
  step = 1,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  display?: (v: number) => string;
}) {
  const shown = display ? display(value) : `${value}${unit}`;
  return (
    <div>
      <div className={ui.rowBetween}>
        <span className="text-sm text-[var(--foreground)]">{label}</span>
        <span className="font-mono text-xs text-[var(--muted)]">{shown}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-hover)] accent-[var(--accent)]"
      />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={ui.rowBetween}>
      <div>
        <p className="text-sm text-[var(--foreground)]">{label}</p>
        <p className={ui.sectionSub}>{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "[background:var(--gradient-primary)]" : "bg-[var(--bg-hover)]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}