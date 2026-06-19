"use client";

import { Check } from "lucide-react";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { cn } from "@/lib/utils";

export function LayoutPresetPicker() {
  const { layoutPresetId, applyLayoutPreset } = usePsEditor();

  return (
    <div className="flex min-w-[14rem] flex-col gap-2">
      <div className="grid grid-cols-2 gap-1.5">
        {LAYOUT_PRESETS.map((preset) => {
          const active = layoutPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() => applyLayoutPreset(preset.id)}
              className={cn(
                "relative rounded-[var(--radius-sm)] border px-2 py-2 text-left transition",
                active
                  ? "border-[var(--accent)]/50 bg-[var(--labs-dim)]"
                  : "border-[var(--border)] bg-[var(--bg-surface)]/50 hover:border-[var(--border-strong)]",
              )}
            >
              <p className="truncate text-[11px] font-semibold text-[var(--foreground)]">{preset.label}</p>
              <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-[var(--muted)]">{preset.description}</p>
              {active && <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-[var(--accent)]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}