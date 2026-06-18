"use client";

import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Droplet, FileEdit } from "lucide-react";
import { useRef } from "react";

export function LandingView() {
  const { setLogView, handleFileUpload, rangeMode, setRangeMode, reports } = useApp();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      toast({ type: "success", title: "File uploaded", description: `Parsing ${file.name}…` });
    }
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
      toast({ type: "success", title: "File uploaded", description: `Parsing ${file.name}…` });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className={cn(ui.pageTitle, "text-xl")}>Log Your Bloodwork</h2>
        <p className={ui.pageSub}>
          {reports.length > 0
            ? `${reports.length} panel${reports.length > 1 ? "s" : ""} on file — add another or review in Analysis`
            : "Upload a lab report or enter values manually"}
        </p>
      </motion.div>

      <input ref={fileRef} type="file" accept=".pdf,.txt,.csv" className="hidden" onChange={handleFile} />

      <div className={cn(ui.equalGrid, "md:grid-cols-2")}>
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <ChoiceCard
            variant="labs"
            icon={Droplet}
            iconAccent="labs"
            title="Upload Blood Test"
            description="Drop a PDF, TXT, or CSV file and we'll extract markers automatically."
            onClick={() => fileRef.current?.click()}
            footer={
              <>
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className={cn(
                ui.chip,
                "shrink-0 border border-[var(--labs)]/20 bg-[var(--labs-dim)] text-[var(--labs)]"
              )}
            >
              {rangeMode === "lab" ? "Lab Range" : "Optimized"}
            </span>
            <p className="text-sm text-[var(--muted)]">
              {rangeMode === "lab"
                ? "Flags results outside official lab reference ranges."
                : "Flags results outside optimized performance ranges with severity tiers."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRangeMode(rangeMode === "lab" ? "optimized" : "lab")}
            className={cn(ui.btnSecondary, "shrink-0")}
          >
            Switch to {rangeMode === "lab" ? "Optimized" : "Lab Range"}
          </button>
        </div>
      </Panel>
    </div>
  );
}