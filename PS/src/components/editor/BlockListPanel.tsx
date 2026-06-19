"use client";

import { Plus } from "lucide-react";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const ROLE_LABELS: Record<string, string> = {
  headline: "Headline",
  subhead: "Subhead",
  body: "Body",
  label: "Label",
  badge: "Badge",
  footer: "Footer",
  cta: "CTA",
};

export function BlockListPanel() {
  const { blocks, selectedBlockId, selectBlock, addBlock } = usePsEditor();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className={ui.overline}>Text layers</p>
        <button type="button" onClick={addBlock} className={cn(ui.btnGhost, "h-7 gap-1 px-2 text-xs")}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">Select a layer to edit. Drag on canvas to move.</p>
      <ul className="space-y-1.5">
        {blocks.map((block, index) => {
          const active = block.id === selectedBlockId;
          return (
            <li key={block.id}>
              <button
                type="button"
                onClick={() => selectBlock(block.id)}
                className={cn(
                  "flex w-full flex-col rounded-[var(--radius-md)] border px-3 py-2 text-left transition",
                  active
                    ? "border-[var(--accent)]/50 bg-[var(--labs-dim)]"
                    : "border-[var(--border)] bg-[var(--bg-surface)]/40 hover:border-[var(--border-strong)]",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {index + 1}. {ROLE_LABELS[block.role] ?? block.role}
                </span>
                <span className="mt-0.5 truncate text-sm text-[var(--foreground)]">
                  {block.text || "(empty)"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {blocks.length === 0 && (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
          No text yet — add a block or pick a layout template.
        </p>
      )}
    </div>
  );
}