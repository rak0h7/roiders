"use client";

import { MousePointerClick, Trash2 } from "lucide-react";
import { usePsEditor, type TextAlign, type TextBlockRole } from "@ps/providers/PsEditorProvider";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const ROLES: TextBlockRole[] = ["headline", "subhead", "body", "label", "badge", "footer", "cta"];
const ALIGNS: TextAlign[] = ["left", "center", "right"];

export function ContentPanel() {
  const { selectedBlock, updateBlock, deleteBlock } = usePsEditor();

  if (!selectedBlock) {
    return (
      <div className={cn(ui.cardInner, "flex flex-col items-center gap-2 p-5 text-center")}>
        <MousePointerClick className="h-7 w-7 text-[var(--muted)]" />
        <p className="text-sm text-[var(--muted)]">Select a layer above or click text on the canvas.</p>
      </div>
    );
  }

  return (
    <div className={cn(ui.cardInner, "space-y-4 p-4")}>
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <span className={ui.overline}>{selectedBlock.role}</span>
        <button
          type="button"
          onClick={() => deleteBlock(selectedBlock.id)}
          className={cn(ui.btnIconSm, "text-[var(--danger)]")}
          title="Delete block"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        <label className={ui.label}>Text</label>
        <textarea
          value={selectedBlock.text}
          onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
          rows={4}
          className={cn(ui.input, "mt-1.5 h-auto min-h-[5rem] resize-y py-2 text-sm")}
        />
      </div>

      <div>
        <label className={ui.label}>Role</label>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => updateBlock(selectedBlock.id, { role })}
              className={cn(
                ui.segment,
                "px-2.5 text-[10px]",
                selectedBlock.role === role ? ui.segmentActiveLabs : ui.segmentInactive,
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={ui.label}>Alignment</label>
        <div className="mt-1.5 flex gap-1">
          {ALIGNS.map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => updateBlock(selectedBlock.id, { align })}
              className={cn(
                ui.segment,
                "flex-1 capitalize",
                selectedBlock.align === align ? ui.segmentActiveLabs : ui.segmentInactive,
              )}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={ui.label}>Width — {selectedBlock.width}%</label>
        <input
          type="range"
          min={20}
          max={100}
          value={selectedBlock.width}
          onChange={(e) => updateBlock(selectedBlock.id, { width: Number(e.target.value) })}
          className="mt-1.5 w-full accent-[var(--accent)]"
        />
      </div>

      <div>
        <label className={ui.label}>Font size</label>
        <input
          type="number"
          min={10}
          max={120}
          value={selectedBlock.fontSize ?? ""}
          placeholder="Auto"
          onChange={(e) =>
            updateBlock(selectedBlock.id, {
              fontSize: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className={cn(ui.input, "mt-1.5 h-[var(--control-height-sm)] text-sm")}
        />
      </div>
    </div>
  );
}