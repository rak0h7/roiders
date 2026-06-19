"use client";

import { useState } from "react";
import { Copy, FileImage, Pencil, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@ps/lib/formatRelative";
import { ActionsMenu } from "@ps/components/ui/ActionsMenu";
import { ConfirmDialog } from "@ps/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { useSettings } from "@/context/SettingsContext";
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
  const { customCanvasSizes } = useSettings();
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(post.name);

  const layout = LAYOUT_PRESETS.find((p) => p.id === post.draft.layoutPresetId);
  const canvas = getCanvasSize(post.draft.canvasSizeId, customCanvasSizes);
  const aspect = canvas.width / canvas.height;
  const updated = formatRelativeTime(post.updatedAt);

  const submitRename = () => {
    onRename(name.trim() || post.name);
    setRenaming(false);
  };

  return (
    <>
      <div className={cn(ui.card, ui.cardHover, "group relative flex flex-col")}>
        <button type="button" onClick={onOpen} className="flex flex-1 items-start gap-4 p-5 text-left">
          <span
            className="mt-0.5 block shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg-base)] shadow-inner"
            style={{
              width: aspect >= 1 ? 48 : Math.round(48 * aspect),
              height: aspect >= 1 ? Math.round(48 / aspect) : 48,
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--protocol)]/25 bg-[var(--protocol-dim)] lg:hidden">
              <FileImage className="h-4 w-4 text-[var(--protocol)]" />
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
              {layout?.label ?? "Layout"} · {canvas.shortLabel}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted-2)]">Updated {updated}</p>
          </div>
        </button>

        <div className="absolute right-3 top-3">
          <ActionsMenu
            ariaLabel="Post actions"
            items={[
              {
                id: "rename",
                label: "Rename",
                icon: <Pencil className="h-3.5 w-3.5" />,
                onClick: () => setRenaming(true),
              },
              {
                id: "duplicate",
                label: "Duplicate",
                icon: <Copy className="h-3.5 w-3.5" />,
                onClick: onDuplicate,
              },
              {
                id: "delete",
                label: "Delete",
                icon: <Trash2 className="h-3.5 w-3.5" />,
                destructive: true,
                onClick: () => setConfirmDelete(true),
              },
            ]}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete post?"
        description={`"${post.name}" will be permanently removed from this project.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}