"use client";

import { CanvasSizePicker } from "@ps/components/CanvasSizePicker";
import { LayoutPresetPicker } from "@ps/components/LayoutPresetPicker";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function DesignPanel() {
  return (
    <div className="space-y-5">
      <div>
        <p className={cn(ui.overline, "mb-2")}>Canvas size</p>
        <p className="mb-2.5 text-xs text-[var(--muted)]">Pick a platform format for export.</p>
        <CanvasSizePicker />
      </div>
      <div>
        <p className={cn(ui.overline, "mb-2")}>Layout template</p>
        <p className="mb-2.5 text-xs text-[var(--muted)]">Swap structure — your text is kept where possible.</p>
        <LayoutPresetPicker />
      </div>
    </div>
  );
}