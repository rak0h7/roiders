"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import {
  createCustomCanvasSize,
  formatAspectRatio,
  QUICK_ASPECT_RATIOS,
} from "@ps/lib/canvasSizes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function CustomCanvasForm() {
  const { addCustomCanvasSize } = useSettings();
  const { setCanvasSizeId } = usePsEditor();
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1920);
  const [label, setLabel] = useState("");

  const applyRatio = (w: number, h: number) => {
    const base = Math.max(width, height, 1080);
    if (w >= h) {
      setWidth(base);
      setHeight(Math.round((base * h) / w));
    } else {
      setHeight(base);
      setWidth(Math.round((base * w) / h));
    }
  };

  const handleApply = () => {
    const w = Math.min(8000, Math.max(100, Math.round(width)));
    const h = Math.min(8000, Math.max(100, Math.round(height)));
    const size = createCustomCanvasSize(
      w,
      h,
      label.trim() || `${w}×${h} (${formatAspectRatio(w, h)})`,
    );
    addCustomCanvasSize(size);
    setCanvasSizeId(size.id);
    setLabel("");
  };

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/20 p-3">
      <div>
        <p className={ui.overline}>Custom size</p>
        <p className="mt-1 text-[10px] text-[var(--muted)]">Set any width × height for export.</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {QUICK_ASPECT_RATIOS.map(({ w, h, label: ratioLabel }) => (
          <button
            key={ratioLabel}
            type="button"
            onClick={() => applyRatio(w, h)}
            className={cn(
              "rounded-[var(--radius-sm)] border px-2 py-1 text-[10px] transition",
              "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
            )}
          >
            {ratioLabel}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] font-medium text-[var(--muted)]">Width (px)</span>
          <input
            type="number"
            min={100}
            max={8000}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className={cn(ui.inputCompact, "mt-1 w-full font-mono")}
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-medium text-[var(--muted)]">Height (px)</span>
          <input
            type="number"
            min={100}
            max={8000}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className={cn(ui.inputCompact, "mt-1 w-full font-mono")}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[10px] font-medium text-[var(--muted)]">Label (optional)</span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={`${width}×${height}`}
          className={cn(ui.inputCompact, "mt-1 w-full")}
        />
      </label>

      <p className="font-mono text-[10px] text-[var(--muted)]">
        {formatAspectRatio(width, height)} · {Math.round(width)}×{Math.round(height)}px
      </p>

      <button type="button" onClick={handleApply} className={cn(ui.btnSecondary, "h-8 w-full gap-1.5 text-xs")}>
        <Plus className="h-3.5 w-3.5" />
        Apply custom size
      </button>
    </div>
  );
}