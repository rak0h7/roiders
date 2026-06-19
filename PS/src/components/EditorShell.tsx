"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Layers, Palette, Plus, Pencil } from "lucide-react";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { CanvasSizePicker } from "./CanvasSizePicker";
import { LayoutPresetPicker } from "./LayoutPresetPicker";
import { ContentCanvas } from "./ContentCanvas";
import { ContentPanel } from "./ContentPanel";
import { ThemePanel } from "./ThemePanel";
import { ExportBar } from "./ExportBar";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type SidebarTab = "content" | "theme";

export function EditorShell() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { addBlock, layoutPresetId, canvasSize } = usePsEditor();
  const { activeProject, activePost, goToProjects, openProject, renamePost } = usePsProjects();
  const [tab, setTab] = useState<SidebarTab>("content");
  const [renamingPost, setRenamingPost] = useState(false);
  const [postName, setPostName] = useState(activePost?.name ?? "");
  const preset = LAYOUT_PRESETS.find((p) => p.id === layoutPresetId);

  const submitPostRename = () => {
    if (!activeProject || !activePost) return;
    renamePost(activeProject.id, activePost.id, postName.trim() || activePost.name);
    setRenamingPost(false);
  };

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="mb-2 flex items-center gap-1 text-xs text-[var(--muted)]">
          <button type="button" onClick={goToProjects} className={cn(ui.btnGhost, "h-7 px-2")}>
            Projects
          </button>
          {activeProject && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <button
                type="button"
                onClick={() => openProject(activeProject.id)}
                className={cn(ui.btnGhost, "h-7 max-w-[10rem] truncate px-2")}
              >
                {activeProject.name}
              </button>
            </>
          )}
          {activePost && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              {renamingPost ? (
                <input
                  autoFocus
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  onBlur={submitPostRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitPostRename();
                    if (e.key === "Escape") {
                      setPostName(activePost.name);
                      setRenamingPost(false);
                    }
                  }}
                  className={cn(ui.inputCompact, "h-7 max-w-[12rem]")}
                />
              ) : (
                <span className="flex items-center gap-1 truncate font-medium text-[var(--foreground)]">
                  {activePost.name}
                  <button
                    type="button"
                    onClick={() => {
                      setPostName(activePost.name);
                      setRenamingPost(true);
                    }}
                    className={ui.btnIconMicro}
                    aria-label="Rename post"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => activeProject && openProject(activeProject.id)}
              className={ui.btnIcon}
              aria-label="Back to project"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className={ui.sectionTitle}>{activePost?.name ?? "Editor"}</h1>
              <p className={ui.sectionSub}>
                {activeProject?.name ?? "Project"} · Auto-saved
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={addBlock} className={cn(ui.btnSecondary, "gap-2")}>
              <Plus className="h-4 w-4" />
              Add text
            </button>
            <ExportBar canvasRef={canvasRef} />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,38vh)] lg:grid-cols-[minmax(0,1fr)_26rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <main className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--bg-base)]">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border)]/60 px-4 py-2 text-xs text-[var(--muted)]">
            <span>
              {preset?.label ?? "Canvas"} · {canvasSize.label}
            </span>
            <span>
              {canvasSize.width}×{canvasSize.height}px export
            </span>
          </div>
          <ContentCanvas ref={canvasRef} />
        </main>

        <aside className="flex min-h-0 flex-col overflow-hidden border-t border-[var(--border)] lg:border-l lg:border-t-0">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--border)] p-3 sm:p-4">
              <p className={cn(ui.overline, "mb-2.5")}>Canvas size</p>
              <CanvasSizePicker />
            </div>
            <div className="border-b border-[var(--border)] p-3 sm:p-4">
              <p className={cn(ui.overline, "mb-2.5")}>Layout</p>
              <LayoutPresetPicker />
            </div>

            <div className="sticky top-0 z-10 flex shrink-0 gap-1 border-b border-[var(--border)] bg-[var(--bg-elevated)]/95 p-2 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setTab("content")}
                className={cn(
                  ui.navBarBtn,
                  "flex-1 gap-2",
                  tab === "content" ? ui.navBarBtnActive : ui.navBarBtnInactive,
                )}
              >
                <Layers className="h-4 w-4" />
                Content
              </button>
              <button
                type="button"
                onClick={() => setTab("theme")}
                className={cn(
                  ui.navBarBtn,
                  "flex-1 gap-2",
                  tab === "theme" ? ui.navBarBtnActive : ui.navBarBtnInactive,
                )}
              >
                <Palette className="h-4 w-4" />
                Theme
              </button>
            </div>

            <div className="p-3 sm:p-4">
              {tab === "content" ? <ContentPanel /> : <ThemePanel />}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}