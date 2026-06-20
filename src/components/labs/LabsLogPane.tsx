"use client";

import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useLabFilePicker } from "@/components/labs/useLabFilePicker";
import { isMobileDevice } from "@/lib/device";
import { LAB_UPLOAD_ACCEPT } from "@/lib/labUpload";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { Panel } from "@/components/ui/Panel";
import { LabsActionBar } from "@/components/labs/LabsActionBar";
import { useLabsActions } from "@/components/labs/useLabsActions";
import { QuickJump } from "@/components/QuickJump";
import { UploadZone } from "@/components/UploadZone";
import { MarkerGrid } from "@/components/MarkerGrid";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { Droplet, FileEdit, ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function LabsLogEmpty() {
  const { setLogView } = useApp();
  const { fileRef, parsing, onInputChange, onDrop, pickAny } = useLabFilePicker();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept={LAB_UPLOAD_ACCEPT}
        className="hidden"
        onChange={onInputChange}
      />

      <div className={cn(ui.equalGrid, "md:grid-cols-2")}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <ChoiceCard
            variant="labs"
            icon={Droplet}
            iconAccent="labs"
            title="Upload blood test"
            description={
              isMobile
                ? "Pick screenshots or a PDF — values are extracted automatically."
                : "Drop a PDF, screenshots, or TXT/CSV."
            }
            onClick={pickAny}
            footer={
              <span className={cn(ui.chip, "border border-[var(--labs)]/30 bg-[var(--labs-dim)] text-[var(--labs)]")}>
                {parsing ? (
                  <>
                    <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                    Reading…
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-1 inline h-3 w-3" />
                    Upload
                  </>
                )}
              </span>
            }
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <ChoiceCard
            variant="protocol"
            icon={FileEdit}
            iconAccent="protocol"
            title="Enter manually"
            description="Type markers if you do not have a file."
            onClick={() => setLogView("entry")}
            footer={<span className={cn(ui.btnProtocolSm, "pointer-events-none")}>Go to entry</span>}
          />
        </motion.div>
      </div>

      <Panel className={ui.cardPad}>
        <p className="text-xs text-[var(--muted)]">
          Optimal targets only — for health on a minimal cycle. Flags are informational, not medical advice.
        </p>
      </Panel>
    </div>
  );
}

export function LabsLogPane() {
  const { logView, currentValues, activeReportId, startNewLabPanel } = useApp();
  const { saveAndOpenInsights, saveAndOpenFlags } = useLabsActions();
  const markerCount = Object.keys(currentValues).length;
  const showEntry = logView === "entry" || markerCount > 0 || activeReportId !== null;

  if (!showEntry) {
    return <LabsLogEmpty />;
  }

  return (
    <div className="space-y-4">
      <LabsActionBar
        onBack={
          markerCount > 0 || activeReportId
            ? () => startNewLabPanel()
            : logView === "entry"
              ? () => startNewLabPanel()
              : undefined
        }
        backLabel="New panel"
        showReviewFlags
        showSaveInsights
        onReviewFlags={saveAndOpenFlags}
        onSaveInsights={saveAndOpenInsights}
      />
      <QuickJump />
      <UploadZone />
      <MarkerGrid />
    </div>
  );
}