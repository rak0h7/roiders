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
              "relative rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition",
              preset.referenceImage ? "min-h-[5.5rem]" : "min-h-[3.25rem]",
              active
                ? "border-[var(--accent)]/50 bg-[var(--labs-dim)]"
                : "border-[var(--border)] bg-[var(--bg-surface)]/50 hover:border-[var(--border-strong)]",
            )}
          >
            {preset.referenceImage && (
              <div className="mb-2 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-base)]">
                <img
                  src={preset.referenceImage}
                  alt=""
                  width={preset.exportWidth}
                  height={preset.exportHeight}
                  className="aspect-[3/4] w-full object-cover object-top"
                />
              </div>
            )}
            <p className="pr-4 text-[11px] font-semibold leading-tight text-[var(--foreground)]">{preset.label}</p>
            <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-[var(--muted)]">{preset.description}</p>
            {preset.exportWidth && preset.exportHeight && (
              <p className="mt-0.5 font-mono text-[9px] text-[var(--muted-2)]">
                {preset.exportWidth}×{preset.exportHeight}px
              </p>
            )}
            {active && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-[var(--accent)]" />}
          </button>
        );
      })}
    </div>
  );
}