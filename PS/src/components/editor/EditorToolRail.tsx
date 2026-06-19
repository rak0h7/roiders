"use client";

import { LayoutTemplate, Palette, Type } from "lucide-react";
import { ContentPanel } from "@ps/components/ContentPanel";
import { ThemePanel } from "@ps/components/ThemePanel";
import { DesignPanel } from "./DesignPanel";
import { BlockListPanel } from "./BlockListPanel";
import { TypographyPanel } from "./TypographyPanel";
import { cn } from "@/lib/utils";

export type EditorPanel = "design" | "text" | "theme";

const PANELS: { id: EditorPanel; label: string; icon: typeof Type }[] = [
  { id: "design", label: "Design", icon: LayoutTemplate },
  { id: "text", label: "Text", icon: Type },
  { id: "theme", label: "Canvas", icon: Palette },
];

interface EditorToolRailProps {
  active: EditorPanel;
  onChange: (panel: EditorPanel) => void;
}

export function EditorToolRail({ active, onChange }: EditorToolRailProps) {
  return (
    <div className="flex min-h-0 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)]/60">
      <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-[var(--border)] py-3">
        {PANELS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => onChange(id)}
            className={cn(
              "flex w-11 flex-col items-center gap-1 rounded-[var(--radius-md)] py-2 text-[10px] font-medium transition",
              active === id
                ? "bg-[var(--labs-dim)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden w-72 min-w-0 overflow-y-auto p-4 lg:block xl:w-80">
        {active === "design" && <DesignPanel />}
        {active === "text" && (
          <div className="space-y-5">
            <TypographyPanel />
            <BlockListPanel />
            <ContentPanel />
          </div>
        )}
        {active === "theme" && <ThemePanel />}
      </div>
    </div>
  );
}