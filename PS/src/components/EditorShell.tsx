"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Cloud } from "lucide-react";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { ContentCanvas } from "./ContentCanvas";
import { ExportBar } from "./ExportBar";
import { EditorToolRail, type EditorPanel } from "./editor/EditorToolRail";
import { PostFilmstrip } from "./editor/PostFilmstrip";
import { MobileEditorSheet } from "./editor/MobileEditorSheet";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function EditorShell() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { layoutPresetId, canvasSize } = usePsEditor();
  const { activeProject, activePost, goToProjects, openProject } = usePsProjects();
  const [panel, setPanel] = useState<EditorPanel>("text");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const preset = LAYOUT_PRESETS.find((p) => p.id === layoutPresetId);

  const handlePanelChange = (next: EditorPanel) => {
    setPanel(next);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileSheetOpen(true);
    }
  };

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 px-3 py-2.5 backdrop-blur-sm sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => activeProject && openProject(activeProject.id)}
              className={ui.btnIcon}
              aria-label="Back to project"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <nav className="flex min-w-0 items-center gap-1 text-xs text-[var(--muted)]">
              <button type="button" onClick={goToProjects} className={cn(ui.btnGhost, "h-7 px-2")}>
                Projects
              </button>
              {activeProject && (
                <>
                  <ChevronRight className="h-3 w-3 opacity-50" />
                  <button
                    type="button"
                    onClick={() => openProject(activeProject.id)}
                    className={cn(ui.btnGhost, "h-7 max-w-[9rem] truncate px-2")}
                  >
                    {activeProject.name}
                  </button>
                </>
              )}
              {activePost && (
                <>
                  <ChevronRight className="h-3 w-3 opacity-50" />
                  <span className="truncate font-medium text-[var(--foreground)]">{activePost.name}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-xs text-[var(--muted)] sm:inline-flex">
              <Cloud className="h-3.5 w-3.5 text-[var(--protocol)]" />
              <Check className="h-3 w-3 text-[var(--protocol)]" />
              Saved
            </span>
            <ExportBar canvasRef={canvasRef} />
          </div>
        </div>
        <p className="mt-1.5 pl-10 text-[11px] text-[var(--muted)]">
          {preset?.label ?? "Layout"} · {canvasSize.label} · {canvasSize.width}×{canvasSize.height}px
        </p>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <EditorToolRail active={panel} onChange={handlePanelChange} />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--bg-base)]">
          <ContentCanvas ref={canvasRef} />
        </main>
      </div>

      <PostFilmstrip />

      {mobileSheetOpen && (
        <MobileEditorSheet panel={panel} onClose={() => setMobileSheetOpen(false)} />
      )}
    </div>
  );
}