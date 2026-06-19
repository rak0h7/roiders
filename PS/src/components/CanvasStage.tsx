"use client";

import { forwardRef } from "react";
import { useSettings } from "@/context/SettingsContext";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { TextBlockLayer } from "./TextBlockLayer";
import { RoidersClubChrome } from "./RoidersClubChrome";
import { CanvasThemeBackground } from "@ps/components/theme/CanvasThemeBackground";
import { LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { canvasContentInset } from "@ps/lib/brandedLayout";

/** Artboard at true export pixel dimensions — preview scales this; export captures it 1:1. */
export const CanvasStage = forwardRef<HTMLDivElement>(function CanvasStage(_, ref) {
  const { theme } = useSettings();
  const { canvasSize, layoutPresetId } = usePsEditor();
  const branded = LAYOUT_PRESETS.find((p) => p.id === layoutPresetId)?.branded ?? false;
  const inset = canvasContentInset(branded);

  return (
    <div
      ref={ref}
      data-canvas-stage
      className="relative shrink-0 overflow-hidden bg-[var(--bg-base)]"
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
      }}
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
  );
});