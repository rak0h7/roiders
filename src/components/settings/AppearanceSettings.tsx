"use client";

import { Palette, Sparkles } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { DEFAULT_THEME, LAYOUT_PRESET_PATCHES, THEME_PRESETS } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { PreviewPanel } from "./appearance/PreviewPanel";
import { PresetSection } from "./appearance/PresetSection";
import {
  AccentColorsSection,
  TypographySection,
  IconLayoutSection,
  BackgroundEffectsSection,
  DisplaySection,
} from "./appearance/ThemeOptionSections";

export function AppearanceSettings() {
  const { theme, updateTheme, applyPreset, reducedMotion, compactSidebar, updateSettings } = useSettings();
  const { toast } = useToast();

  const notify = (title: string, type: "success" | "info" = "success") => toast({ type, title });

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
        title="Presets"
        activePreset={theme.preset}
        onSelect={(id) => {
          applyPreset(id);
          notify(`${THEME_PRESETS.find((p) => p.id === id)?.name} applied`);
        }}
      />

      <AccentColorsSection theme={theme} updateTheme={updateTheme} />
      <TypographySection theme={theme} updateTheme={updateTheme} />
      <IconLayoutSection
        theme={theme}
        updateTheme={updateTheme}
        onLayoutPreset={(id) => {
          updateTheme(LAYOUT_PRESET_PATCHES[id]);
          notify(`${id.charAt(0).toUpperCase()}${id.slice(1)} layout applied`);
        }}
      />
      <BackgroundEffectsSection theme={theme} updateTheme={updateTheme} onToast={notify} />
      <DisplaySection
        theme={theme}
        updateTheme={updateTheme}
        reducedMotion={reducedMotion}
        compactSidebar={compactSidebar}
        updateSettings={updateSettings}
      />

      <button
        type="button"
        onClick={() => {
          updateTheme(DEFAULT_THEME);
          notify("Appearance reset to Crimson default", "info");
        }}
        className={cn(ui.btnGhost, "w-full justify-center border border-[var(--border)] py-3")}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Reset appearance to defaults
      </button>
    </div>
  );
}