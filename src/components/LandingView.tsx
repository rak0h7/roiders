"use client";

import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useLabFilePicker } from "@/components/labs/useLabFilePicker";
import { isMobileDevice } from "@/lib/device";
import { LAB_UPLOAD_ACCEPT } from "@/lib/labUpload";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Droplet, FileEdit, ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function LandingView() {
  const { setLogView, reports } = useApp();
  const { fileRef, parsing, onInputChange, onDrop, pickAny } = useLabFilePicker();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className={cn(ui.pageTitle, "text-xl")}>Log Your Bloodwork</h2>
        <p className={ui.pageSub}>
          {reports.length > 0
            ? `${reports.length} panel${reports.length > 1 ? "s" : ""} on file — add another or review in Analysis`
            : "Upload a lab report, add screenshots, or enter values manually"}
        </p>
      </motion.div>

      <input
        ref={fileRef}
        type="file"
        accept={LAB_UPLOAD_ACCEPT}
        className="hidden"
        onChange={onInputChange}
      />

      <div className={cn(ui.equalGrid, "md:grid-cols-2")}>
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <ChoiceCard
            variant="labs"
            icon={Droplet}
            iconAccent="labs"
            title="Upload Blood Test"
            description={
              isMobile
                ? "Pick screenshots from your camera roll or drop a PDF — we'll read the values automatically."
                : "Drop a PDF, add lab screenshots, or upload TXT/CSV and we'll extract markers automatically."
            }
            onClick={pickAny}
            footer={
              <>
                <span
                  className={cn(
                    ui.chip,
                    "border border-[var(--labs)]/30 bg-[var(--labs-dim)] text-[var(--labs)]"
                  )}
                >
                  {parsing ? (
                    <>
                      <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                      Reading…
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-1 inline h-3 w-3" />
                      Photos
                    </>
                  )}
                </span>
                {["PDF", "TXT", "CSV"].map((t) => (
                  <span
                    key={t}
                    className={cn(
                      ui.chip,
                      "border border-[var(--labs)]/20 bg-[var(--labs-dim)] text-[var(--labs)]"
                    )}
                  >
                    {t}
                  </span>
                ))}
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="h-full"
        >
          <ChoiceCard
            variant="protocol"
            icon={FileEdit}
            iconAccent="protocol"
            title="Enter Results Manually"
            description="Type in your markers if you don't have a report file."
            onClick={() => setLogView("entry")}
            footer={
              <span className={cn(ui.btnProtocolSm, "pointer-events-none")}>Go to Entry</span>
            }
          />
        </motion.div>
      </div>

      <Panel className={ui.cardPad}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={cn(
              ui.chip,
              "shrink-0 border border-[var(--labs)]/20 bg-[var(--labs-dim)] text-[var(--labs)]"
            )}
          >
            Optimal
          </span>
          <p className="text-sm text-[var(--muted)]">
            Flags results outside optimal ranges for minimal-cycle health. Deviations are monitored via caution and strict thresholds.
          </p>
        </div>
      </Panel>
    </div>
  );
}