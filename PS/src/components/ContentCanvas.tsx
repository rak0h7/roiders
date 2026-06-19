"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { CanvasStage } from "./CanvasStage";

const VIEWPORT_PAD = 40;

export const ContentCanvas = forwardRef<HTMLDivElement>(function ContentCanvas(_, ref) {
  const { canvasSize, selectBlock } = usePsEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.25);

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const scale = Math.min(
      (width - VIEWPORT_PAD) / canvasSize.width,
      (height - VIEWPORT_PAD) / canvasSize.height,
    );
    setFitScale(Math.max(0.05, Math.min(scale, 1)));
  }, [canvasSize.width, canvasSize.height]);

  useEffect(() => {
    updateScale();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScale]);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--bg-base)]/40 p-3 sm:p-4"
      onClick={() => selectBlock(null)}
    >
      <div
        className="origin-center"
        style={{
          transform: `scale(${fitScale})`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <CanvasStage ref={ref} />
      </div>
    </div>
  );
});