"use client";

import { Type } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { FONT_FAMILY_OPTIONS } from "@/lib/themes";
import { CompactSlider } from "@ps/components/theme/ThemeControls";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function TypographyPanel() {
  const { theme, updateTheme } = useSettings();
  const fontOption = FONT_FAMILY_OPTIONS.find((f) => f.id === theme.fontFamily) ?? FONT_FAMILY_OPTIONS[0];
  const fontLabel = fontOption.label;

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)]/30 p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)]">
          <Type className="h-3.5 w-3.5 text-[var(--accent)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[var(--foreground)]">Canvas typography</p>
          <p className="text-[10px] text-[var(--muted)]">Fonts on your post only — not this editor</p>
        </div>
      </div>

      <label className="block">
        <span className="text-[10px] font-medium text-[var(--muted)]">Font family</span>
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

      <CompactSlider
        label="Text scale"
        value={theme.fontScale}
        onChange={(v) => updateTheme({ fontScale: v })}
        min={85}
        max={115}
        unit="%"
      />
      <CompactSlider
        label="Font weight"
        value={theme.fontWeight}
        onChange={(v) => updateTheme({ fontWeight: v })}
        min={400}
        max={800}
        step={100}
      />

      <p
        className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2.5 py-2 text-sm"
        style={{
          fontFamily: fontOption.stack,
          fontWeight: theme.fontWeight,
          fontSize: `${Math.round(14 * (theme.fontScale / 100))}px`,
        }}
      >
        Preview — {fontLabel}
      </p>
    </div>
  );
}