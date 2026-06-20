"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { LabsReportSidebar } from "@/components/labs/LabsReportSidebar";
import { useLabsPanels } from "@/components/labs/LabsPanelsContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function LabsPanelsSheet() {
  const { sheetOpen, closeSheet } = useLabsPanels();

  return (
    <AnimatePresence>
      {sheetOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close panels"
            className="fixed inset-0 z-50 bg-black/55 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSheet}
          />
          <motion.aside
            className="fixed inset-x-0 bottom-0 z-50 max-h-[min(78vh,640px)] overflow-hidden rounded-t-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[0_-16px_48px_rgba(0,0,0,0.45)] lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h2 className="font-display text-sm font-semibold text-[var(--foreground)]">Bloodwork panels</h2>
              <button type="button" onClick={closeSheet} className={ui.btnIconSm} aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4">
              <LabsReportSidebar layout="sheet" onSelectReport={() => closeSheet()} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function LabsPanelsToolbarButton({ count }: { count: number }) {
  const { openSheet } = useLabsPanels();
  return (
    <button type="button" onClick={openSheet} className={cn(ui.btnSecondary, "text-xs lg:hidden")}>
      Panels ({count})
    </button>
  );
}