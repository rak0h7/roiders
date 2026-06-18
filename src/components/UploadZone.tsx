"use client";

import { useApp } from "@/context/AppContext";
import { useLabFilePicker } from "@/components/labs/useLabFilePicker";
import { isMobileDevice } from "@/lib/device";
import { LAB_UPLOAD_ACCEPT } from "@/lib/labUpload";
import { SAMPLE_LAB_TEXT } from "@/lib/parser";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Droplet, FileText, ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function UploadZone() {
  const { parseAndExtract } = useApp();
  const { fileRef, parsing, onInputChange, onDrop, pickPhotos, pickDocument } = useLabFilePicker();
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  return (
    <Panel
      variant="labs"
      className="p-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept={LAB_UPLOAD_ACCEPT}
        onChange={onInputChange}
      />

      <div className="mb-4 text-center">
        <Droplet
          className="mx-auto h-10 w-10 text-[var(--labs)]"
          style={{ filter: "drop-shadow(0 0 10px var(--labs-glow))" }}
        />
        <h3 className="mt-2 font-display text-lg font-semibold text-[var(--foreground)]">Drop Your Blood Test</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Upload a PDF, add screenshots from your camera roll, or paste results below — we&apos;ll extract marker values automatically
        </p>
      </div>

      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <button
          onClick={pickPhotos}
          disabled={parsing}
          className={cn(
            ui.btnToolbar,
            "border-[var(--labs)]/40 bg-[var(--labs-dim)] uppercase tracking-wider text-[var(--labs)] hover:border-[var(--labs)]/60",
            isMobile && "order-first"
          )}
        >
          {parsing ? <Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> : <ImageIcon className="mr-1 inline h-3 w-3" />}
          Photos
        </button>
        {[
          { label: "PDF", accept: ".pdf" },
          { label: "TXT", accept: ".txt" },
          { label: "CSV", accept: ".csv" },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => pickDocument(btn.accept)}
            disabled={parsing}
            className={cn(
              ui.btnToolbar,
              "border-[var(--labs)]/30 bg-[var(--labs-dim)] uppercase tracking-wider text-[var(--labs)] hover:border-[var(--labs)]/50"
            )}
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={() => setShowPaste(!showPaste)}
          disabled={parsing}
          className={cn(ui.btnToolbar, "uppercase tracking-wider")}
        >
          Paste Text
        </button>
      </div>

      {isMobile && (
        <p className="mb-4 text-center text-[11px] text-[var(--muted)]">
          Tap Photos to pick multiple screenshots from your camera roll
        </p>
      )}

      {(showPaste || pasteText) && (
        <div className="space-y-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Paste your lab results here. Example:\n› Testosterone, Total: 850 ng/dL\n› Estradiol: 42 pg/mL\n› ALT: 35 U/L`}
            className={cn(
              ui.input,
              "h-32 resize-none p-3 font-mono text-xs"
            )}
          />
          <div className="flex gap-2">
            <button
              onClick={() => parseAndExtract(pasteText || SAMPLE_LAB_TEXT)}
              className={cn(ui.btnPrimary, "gap-2 text-xs font-bold uppercase")}
            >
              <FileText className="h-3 w-3" />
              Parse Results
            </button>
            <button
              onClick={() => setPasteText(SAMPLE_LAB_TEXT)}
              className={cn(ui.btnGhost, "text-xs")}
            >
              Load Sample
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}