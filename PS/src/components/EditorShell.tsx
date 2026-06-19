"use client";

import { useRef, useState } from "react";
import { Layers, Palette, Plus, Sparkles } from "lucide-react";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
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
  const [tab, setTab] = useState<SidebarTab>("content");
  const preset = LAYOUT_PRESETS.find((p) => p.id === layoutPresetId);

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--labs-dim)]">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <h1 className={ui.sectionTitle}>PS Content Maker</h1>
              <p className={ui.sectionSub}>Roiders Club themed compositions</p>
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