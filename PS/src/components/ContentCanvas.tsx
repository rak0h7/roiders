"use client";

import { forwardRef } from "react";
import { useSettings } from "@/context/SettingsContext";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { TextBlockLayer } from "./TextBlockLayer";
import { RoidersClubChrome } from "./RoidersClubChrome";
import { CanvasThemeBackground } from "@ps/components/theme/CanvasThemeBackground";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { canvasContentInset } from "@ps/lib/brandedLayout";
import { cn } from "@/lib/utils";

export const ContentCanvas = forwardRef<HTMLDivElement>(function ContentCanvas(_, ref) {
  const { theme } = useSettings();
  const { canvasSize, layoutPresetId, selectBlock } = usePsEditor();
  const aspect = canvasSize.width / canvasSize.height;
  const isPortrait = aspect < 1;
  const branded = LAYOUT_PRESETS.find((p) => p.id === layoutPresetId)?.branded ?? false;
  const inset = canvasContentInset(branded);
  const maxCanvasHeight = "calc(100dvh - 11rem)";

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--bg-base)]/40 p-3 sm:p-4 lg:p-5">
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
          "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-base)]",
        )}
        style={
          isPortrait
            ? {
                aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
                height: `min(100%, ${maxCanvasHeight})`,
                width: "auto",
                maxWidth: "100%",
              }
            : {
                aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
                width: "100%",
                height: "auto",
                maxHeight: maxCanvasHeight,
              }
        }
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
        <div className="@container absolute z-10" style={inset}>
          <TextBlockLayer branded={branded} />
        </div>
      </div>
    </div>
  );
});