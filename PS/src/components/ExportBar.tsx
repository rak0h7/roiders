"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import { exportCanvasPng } from "@ps/lib/exportPng";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ExportBar({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const { canvasSize, layoutPresetId } = usePsEditor();
  const { toast } = useToast();
  const [scale, setScale] = useState<1 | 2>(2);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    const node = canvasRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      await exportCanvasPng(node, canvasSize, scale, `ps-export-${layoutPresetId}-${stamp}.png`);
      toast({ type: "success", title: "PNG exported" });
    } catch {
      toast({ type: "error", title: "Export failed", description: "Could not render PNG." });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] p-1">
        {([1, 2] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setScale(value)}
            className={cn(
              ui.segment,
              scale === value ? ui.segmentActiveLabs : ui.segmentInactive,
              "min-w-[3rem]",
            )}
          >
            {value}x
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={exporting}
        className={cn(ui.btnPrimary, "gap-2")}
      >
        <Download className="h-4 w-4" />
        {exporting ? "Exporting…" : "Export PNG"}
      </button>
    </div>
  );
}