"use client";

import { FolderOpen, MoreHorizontal, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@ps/lib/formatRelative";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import type { Project } from "@ps/lib/projectTypes";
import { useState } from "react";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const postCount = project.posts.length;
  const lastUpdated = formatRelativeTime(project.updatedAt);

  return (
    <div className={cn(ui.card, ui.cardHover, "group relative flex flex-col")}>
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col p-5 text-left"
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/25 bg-[var(--labs-dim)]">
          <FolderOpen className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <h3 className="truncate font-semibold text-[var(--foreground)]">{project.name}</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {postCount} {postCount === 1 ? "post" : "posts"} · Updated {lastUpdated}
        </p>
      </button>

      <div className="absolute right-3 top-3">
        <button
          type="button"
          className={cn(ui.btnIconSm, menuOpen && "border-[var(--border-strong)]")}
          aria-label="Project actions"
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
            <div className="absolute right-0 z-20 mt-1 min-w-[8rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-lg">
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