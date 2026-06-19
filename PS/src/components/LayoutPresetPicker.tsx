"use client";

import { Check } from "lucide-react";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { cn } from "@/lib/utils";

export function LayoutPresetPicker() {
  const { layoutPresetId, applyLayoutPreset } = usePsEditor();

  return (
    <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-0.5">
      {LAYOUT_PRESETS.map((preset) => {
        const active = layoutPresetId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            title={preset.description}
            onClick={() => applyLayoutPreset(preset.id)}
            className={cn(
              "relative min-h-[3.25rem] rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition",
              active
                ? "border-[var(--accent)]/50 bg-[var(--labs-dim)]"
                : "border-[var(--border)] bg-[var(--bg-surface)]/50 hover:border-[var(--border-strong)]",
            )}
          >
            <p className="pr-4 text-[11px] font-semibold leading-tight text-[var(--foreground)]">{preset.label}</p>
            <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-[var(--muted)]">{preset.description}</p>
            {active && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-[var(--accent)]" />}
          </button>
        );
      })}
    </div>
  );
}