"use client";

import { forwardRef } from "react";
import { useSettings } from "@/context/SettingsContext";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { TextBlockLayer } from "./TextBlockLayer";
import { RoidersClubChrome } from "./RoidersClubChrome";
import { CanvasThemeBackground } from "@ps/components/theme/CanvasThemeBackground";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { cn } from "@/lib/utils";

export const ContentCanvas = forwardRef<HTMLDivElement>(function ContentCanvas(_, ref) {
  const { theme } = useSettings();
  const { canvasSize, layoutPresetId, selectBlock } = usePsEditor();
  const aspect = canvasSize.width / canvasSize.height;
  const isPortrait = aspect < 1;
  const branded = LAYOUT_PRESETS.find((p) => p.id === layoutPresetId)?.branded ?? false;

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-6">
      <div
        ref={ref}
        className={cn(
          "relative z-10 shrink-0 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
          "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-base)]",
        )}
        style={{
          aspectRatio: String(aspect),
          ...(isPortrait
            ? {
                height: "min(calc(100vh - 11rem), 100%)",
                width: "auto",
                maxWidth: "100%",
              }
            : {
                width: "min(100%, 52rem)",
                height: "auto",
                maxHeight: "calc(100vh - 11rem)",
              }),
        }}
        onClick={() => selectBlock(null)}
      >
        <CanvasThemeBackground theme={theme} />
        {branded && <RoidersClubChrome />}
        {!branded && (
          <div
            className="pointer-events-none absolute -right-8 -top-8 z-[1] h-40 w-40 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, var(--labs-glow), transparent)" }}
          />
        )}
        <div
          className={cn(
            "@container absolute inset-0 z-10",
            branded ? "px-[7%] pb-[10%] pt-[14%]" : "px-[7%] py-[7%]",
          )}
        >
          <TextBlockLayer branded={branded} />
        </div>
      </div>
    </div>
  );
});