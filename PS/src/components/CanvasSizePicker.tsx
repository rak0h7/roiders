"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { CANVAS_SIZE_GROUPS, type CanvasSize } from "@ps/lib/canvasSizes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

function aspectHint(size: CanvasSize): string {
  return `${size.width}×${size.height}`;
}

export function CanvasSizePicker() {
  const { canvasSizeId, setCanvasSizeId } = usePsEditor();
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>("standard");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CANVAS_SIZE_GROUPS;
    return CANVAS_SIZE_GROUPS.map((group) => ({
      ...group,
      sizes: group.sizes.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.shortLabel.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      ),
    })).filter((g) => g.sizes.length > 0);
  }, [query]);

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search canvas sizes…"
          className={cn(ui.inputCompact, "w-full pl-8 text-xs")}
        />
      </div>

      <div className="max-h-44 space-y-2 overflow-y-auto pr-0.5 lg:max-h-52">
        {groups.map((group) => {
          const expanded = query.length > 0 || openGroup === group.id;
          return (
            <div key={group.id} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)]/30">
              <button
                type="button"
                onClick={() => setOpenGroup((g) => (g === group.id ? null : group.id))}
                className="flex w-full items-center justify-between px-2.5 py-2 text-left hover:bg-[var(--bg-hover)]/40"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {group.label}
                </span>
                <span className="text-[10px] text-[var(--muted-2)]">{group.sizes.length}</span>
              </button>
              {expanded && (
                <div className="grid grid-cols-2 gap-1.5 border-t border-[var(--border)] p-2">
                  {group.sizes.map((size) => {
                    const active = canvasSizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        title={aspectHint(size)}
                        onClick={() => setCanvasSizeId(size.id)}
                        className={cn(
                          "relative rounded-[var(--radius-sm)] border px-2 py-1.5 text-left transition",
                          active
                            ? "border-[var(--accent)]/50 bg-[var(--labs-dim)]"
                            : "border-[var(--border)] bg-[var(--bg-elevated)]/40 hover:border-[var(--border-strong)]",
                        )}
                      >
                        <p className="truncate pr-4 text-[10px] font-semibold text-[var(--foreground)]">{size.label}</p>
                        <p className="font-mono text-[9px] text-[var(--muted)]">{aspectHint(size)}</p>
                        {active && <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-[var(--accent)]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}