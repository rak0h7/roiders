"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { THEME_PRESETS, type ThemeConfig, type ThemePresetId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function PresetSection({
  title,
  presetIds,
  activePreset,
  onSelect,
}: {
  title: string;
  presetIds: ThemePresetId[];
  activePreset: ThemeConfig["preset"];
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