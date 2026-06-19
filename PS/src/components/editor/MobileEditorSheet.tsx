"use client";

import { X } from "lucide-react";
import { ContentPanel } from "@ps/components/ContentPanel";
import { ThemePanel } from "@ps/components/ThemePanel";
import type { EditorPanel } from "./EditorToolRail";
import { DesignPanel } from "./DesignPanel";
import { BlockListPanel } from "./BlockListPanel";
import { TypographyPanel } from "./TypographyPanel";
import { ui } from "@/lib/ui";

const TITLES: Record<EditorPanel, string> = {
  design: "Design",
  text: "Text",
  theme: "Canvas theme",
};

interface MobileEditorSheetProps {
  panel: EditorPanel;
  onClose: () => void;
}

export function MobileEditorSheet({ panel, onClose }: MobileEditorSheetProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 max-h-[55vh] overflow-hidden rounded-t-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl lg:hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className={ui.sectionTitle}>{TITLES[panel]}</h2>
        <button type="button" onClick={onClose} className={ui.btnIconSm} aria-label="Close panel">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(55vh - 3.5rem)" }}>
        {panel === "design" && <DesignPanel />}
        {panel === "text" && (
          <div className="space-y-5">
            <TypographyPanel />
            <BlockListPanel />
            <ContentPanel />
          </div>
        )}
        {panel === "theme" && <ThemePanel />}
      </div>
    </div>
  );
}