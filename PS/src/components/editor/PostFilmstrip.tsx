"use client";

import { FilePlus } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";
import { getCanvasSize } from "@ps/lib/canvasSizes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function PostFilmstrip() {
  const { customCanvasSizes } = useSettings();
  const { activeProject, activePost, openEditor, createPost } = usePsProjects();

  if (!activeProject) return null;

  return (
    <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-elevated)]/80 px-3 py-2 backdrop-blur-sm sm:px-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Posts
        </span>
        {activeProject.posts.map((post) => {
          const active = activePost?.id === post.id;
          const canvas = getCanvasSize(post.draft.canvasSizeId, customCanvasSizes);
          const aspect = canvas.width / canvas.height;
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => openEditor(activeProject.id, post.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] border px-2.5 py-1.5 transition",
                active
                  ? "border-[var(--accent)]/50 bg-[var(--labs-dim)]"
                  : "border-[var(--border)] bg-[var(--bg-surface)]/50 hover:border-[var(--border-strong)]",
              )}
            >
              <span
                className="block shrink-0 rounded-sm border border-[var(--border)] bg-[var(--bg-base)]"
                style={{
                  width: aspect >= 1 ? 28 : Math.round(28 * aspect),
                  height: aspect >= 1 ? Math.round(28 / aspect) : 28,
                }}
              />
              <span className="max-w-[8rem] truncate text-xs font-medium text-[var(--foreground)]">
                {post.name}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => createPost(activeProject.id)}
          className={cn(ui.btnGhost, "h-8 shrink-0 gap-1 border border-dashed border-[var(--border)] px-2.5 text-xs")}
        >
          <FilePlus className="h-3.5 w-3.5" />
          New post
        </button>
      </div>
    </div>
  );
}