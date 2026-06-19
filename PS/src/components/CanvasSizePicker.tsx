"use client";

import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { CANVAS_SIZES } from "@ps/lib/canvasTypes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const SHORT_LABELS: Record<string, string> = {
  "1:1": "1:1",
  "4:5": "4:5",
  "9:16": "9:16",
  "16:9": "16:9",
};

export function CanvasSizePicker() {
  const { canvasSizeId, setCanvasSizeId } = usePsEditor();

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)]/50 p-1">
      {CANVAS_SIZES.map((size) => (
        <button
          key={size.id}
          type="button"
          title={size.label}
          onClick={() => setCanvasSizeId(size.id)}
          className={cn(
            ui.navBarBtn,
            "min-w-[2.75rem] px-2.5",
            canvasSizeId === size.id ? ui.navBarBtnActive : ui.navBarBtnInactive,
          )}
        >
          {SHORT_LABELS[size.id] ?? size.id}
        </button>
      ))}
    </div>
  );
}