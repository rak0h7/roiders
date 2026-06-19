"use client";

import { useState } from "react";
import { Copy, FileImage, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@ps/lib/formatRelative";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { getCanvasSize } from "@ps/lib/canvasSizes";
import type { Post } from "@ps/lib/projectTypes";

interface PostCardProps {
  post: Post;
  onOpen: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function PostCard({ post, onOpen, onDuplicate, onRename, onDelete }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(post.name);

  const layout = LAYOUT_PRESETS.find((p) => p.id === post.draft.layoutPresetId);
  const canvas = getCanvasSize(post.draft.canvasSizeId);
  const updated = formatRelativeTime(post.updatedAt);

  const submitRename = () => {
    onRename(name.trim() || post.name);
    setRenaming(false);
  };

  return (
    <div className={cn(ui.card, ui.cardHover, "group relative flex flex-col")}>
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col p-5 text-left">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--protocol)]/25 bg-[var(--protocol-dim)]">
          <FileImage className="h-5 w-5 text-[var(--protocol)]" />
        </div>
        {renaming ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") {
                setName(post.name);
                setRenaming(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className={cn(ui.inputCompact, "mb-1")}
          />
        ) : (
          <h3 className="truncate font-semibold text-[var(--foreground)]">{post.name}</h3>
        )}
        <p className="mt-1 text-xs text-[var(--muted)]">
          {layout?.label ?? "Layout"} · {canvas.label}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--muted-2)]">Updated {updated}</p>
      </button>

      <div className="absolute right-3 top-3">
        <button
          type="button"
          className={cn(ui.btnIconSm, menuOpen && "border-[var(--border-strong)]")}
          aria-label="Post actions"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-1 min-w-[9rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-lg">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs hover:bg-[var(--bg-hover)]"
                onClick={() => {
                  setMenuOpen(false);
                  setRenaming(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs hover:bg-[var(--bg-hover)]"
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate();
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs text-red-400 hover:bg-[var(--bg-hover)]"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}