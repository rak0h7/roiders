"use client";

import { useCallback, useRef } from "react";
import { Circle, Grid3X3, Hexagon, LayoutGrid, Upload, Zap } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  FONT_FAMILY_OPTIONS,
  type ContentWidth,
  type FontFamilyId,
  type LayoutPresetId,
  type ThemeConfig,
} from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { SettingsSection, Slider, ToggleRow } from "./shared";

type UpdateTheme = (patch: Partial<ThemeConfig>) => void;

export function TypographySection({ theme, updateTheme }: { theme: ThemeConfig; updateTheme: UpdateTheme }) {
  return (
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
        <Slider label="Font weight" value={theme.fontWeight} onChange={(v) => updateTheme({ fontWeight: v })} min={400} max={800} step={100} />
        <Slider label="Letter spacing" value={theme.letterSpacing} onChange={(v) => updateTheme({ letterSpacing: v })} min={-20} max={40} unit="" display={(v) => `${(v / 100).toFixed(2)}em`} />
        <Slider label="Line height" value={Math.round(theme.lineHeight * 100)} onChange={(v) => updateTheme({ lineHeight: v / 100 })} min={110} max={200} display={(v) => (v / 100).toFixed(2)} />
        <Slider label="Font scale" value={theme.fontScale} onChange={(v) => updateTheme({ fontScale: v })} min={85} max={115} unit="%" />
      </div>
    </SettingsSection>
  );
}

export function IconLayoutSection({
  theme,
  updateTheme,
  onLayoutPreset,
}: {
  theme: ThemeConfig;
  updateTheme: UpdateTheme;
  onLayoutPreset: (id: LayoutPresetId) => void;
}) {
  return (
    <>
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
                "flex min-h-[var(--control-height)] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 py-3 text-xs font-semibold transition",
                theme.iconStyle === id
                  ? "border-[var(--accent)]/50 bg-[var(--labs-dim)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]",
              )}
            >
              <AppIcon icon={Icon} />
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Slider label="Icon size" value={theme.iconSize} onChange={(v) => updateTheme({ iconSize: v })} min={16} max={28} unit="px" />
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
              onClick={() => onLayoutPreset(id)}
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
                ui.segment,
                theme.contentWidth === id
                  ? ui.segmentActiveLabs
                  : ui.segmentInactive,
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingsSection>
    </>
  );
}

export function BackgroundEffectsSection({
  theme,
  updateTheme,
  onToast,
}: {
  theme: ThemeConfig;
  updateTheme: UpdateTheme;
  onToast: (title: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateTheme({ backgroundImage: reader.result });
          onToast("Background image uploaded");
        }
      };
      reader.readAsDataURL(file);
    },
    [updateTheme, onToast],
  );

  return (
    <>
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
              <button type="button" onClick={() => updateTheme({ backgroundImage: null })} className={ui.btnGhost}>
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
          <Slider label="Gradient angle" value={theme.gradientAngle} onChange={(v) => updateTheme({ gradientAngle: v })} min={0} max={360} unit="°" />
        </div>
      </SettingsSection>

      <SettingsSection title="Glass & gradient" className="space-y-5">
        <Slider label="Gradient intensity" value={theme.gradientIntensity} onChange={(v) => updateTheme({ gradientIntensity: v })} min={0} max={100} />
        <Slider label="Glass blur" value={theme.glassBlur} onChange={(v) => updateTheme({ glassBlur: v })} min={4} max={32} unit="px" />
        <Slider label="Glass opacity" value={theme.glassOpacity} onChange={(v) => updateTheme({ glassOpacity: v })} min={2} max={16} unit="%" />
        <Slider label="Corner radius" value={Math.round(theme.radiusScale * 100)} onChange={(v) => updateTheme({ radiusScale: v / 100 })} min={80} max={140} unit="%" />
        <Slider label="Panel shadow depth" value={theme.shadowDepth} onChange={(v) => updateTheme({ shadowDepth: v })} min={0} max={100} />
      </SettingsSection>

      <SettingsSection title="Animation & effects" className="space-y-5">
        <Slider label="Button hover intensity" value={theme.buttonHoverIntensity} onChange={(v) => updateTheme({ buttonHoverIntensity: v })} min={0} max={100} />
        <Slider label="Page transition speed" value={theme.pageTransitionSpeed} onChange={(v) => updateTheme({ pageTransitionSpeed: v })} min={0} max={100} display={(v) => (v < 35 ? "Slow" : v > 65 ? "Fast" : "Normal")} />
        <Slider label="Parallax strength" value={theme.parallaxStrength} onChange={(v) => updateTheme({ parallaxStrength: v })} min={0} max={100} />
        <ToggleRow label="Particle effects" desc="Accent motes drifting in the ambient background" checked={theme.particleEffects} onChange={(v) => updateTheme({ particleEffects: v })} />
      </SettingsSection>
    </>
  );
}

export function DisplaySection({
  theme,
  updateTheme,
  reducedMotion,
  compactSidebar,
  updateSettings,
}: {
  theme: ThemeConfig;
  updateTheme: UpdateTheme;
  reducedMotion: boolean;
  compactSidebar: boolean;
  updateSettings: (patch: { reducedMotion?: boolean; compactSidebar?: boolean }) => void;
}) {
  return (
    <SettingsSection title="Display & behavior" className="space-y-4">
      <ToggleRow label="Ambient background" desc="Show the accent gradient wash behind content" checked={theme.showAmbientBackground} onChange={(v) => updateTheme({ showAmbientBackground: v })} />
      <ToggleRow label="Animated background" desc="Slow drift on the ambient gradient" checked={theme.animatedBackground} onChange={(v) => updateTheme({ animatedBackground: v })} />
      <ToggleRow label="Top bar subtitles" desc="Show page descriptions under the title" checked={theme.showTopBarSubtitle} onChange={(v) => updateTheme({ showTopBarSubtitle: v })} />
      <ToggleRow label="Accent border glow" desc="Subtle colored borders on glass panels" checked={theme.borderGlow} onChange={(v) => updateTheme({ borderGlow: v })} />
      <ToggleRow label="Collapsed sidebar" desc="Start with the navigation rail minimized" checked={compactSidebar} onChange={(v) => updateSettings({ compactSidebar: v })} />
      <ToggleRow label="Compact density" desc="Tighter spacing across panels" checked={theme.density === "compact"} onChange={(v) => updateTheme({ density: v ? "compact" : "comfortable" })} />
      <ToggleRow label="Reduce motion" desc="Minimize animations for accessibility" checked={reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
    </SettingsSection>
  );
}

