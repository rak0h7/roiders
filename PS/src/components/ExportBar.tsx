"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { exportCanvasPng } from "@ps/lib/exportPng";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ExportBar({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const { canvasSize, layoutPresetId, selectBlock } = usePsEditor();
  const { toast } = useToast();
  const [pixelRatio, setPixelRatio] = useState<1 | 2>(1);
  const [exporting, setExporting] = useState(false);

  const outputLabel = `${canvasSize.width * pixelRatio}×${canvasSize.height * pixelRatio}`;

  const handleExport = async () => {
    const node = canvasRef.current;
    if (!node) return;
    setExporting(true);
    selectBlock(null);
    try {
      await waitBrief();
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      await exportCanvasPng(
        node,
        canvasSize,
        pixelRatio,
        `ps-${layoutPresetId}-${canvasSize.width}x${canvasSize.height}${pixelRatio > 1 ? `@${pixelRatio}x` : ""}-${stamp}.png`,
      );
      toast({
        type: "success",
        title: "Exported",
        description: `${outputLabel}px PNG saved.`,
      });
    } catch {
      toast({ type: "error", title: "Export failed", description: "Could not render PNG." });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="hidden items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] p-1 sm:flex"
        title="Output resolution multiplier"
      >
        {([1, 2] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPixelRatio(value)}
            className={cn(
              ui.segment,
              pixelRatio === value ? ui.segmentActiveLabs : ui.segmentInactive,
              "min-w-[3rem]",
            )}
          >
            {value}×
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={exporting}
        className={cn(ui.btnPrimary, "gap-2")}
        title={`Export at ${canvasSize.width}×${canvasSize.height}px`}
      >
        <Download className="h-4 w-4" />
        <span className="flex flex-col items-start leading-tight">
          <span>{exporting ? "Exporting…" : "Export to size"}</span>
          <span className="text-[10px] font-normal opacity-80">
            {canvasSize.shortLabel} · {outputLabel}px
          </span>
        </span>
      </button>
    </div>
  );
}

function waitBrief(): Promise<void> {
  return new Promise((r) => setTimeout(r, 50));
}