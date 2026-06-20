"use client";

import { useApp } from "@/context/AppContext";
import { ExtractionReview } from "@/components/ExtractionReview";
import { ReviewFlags } from "@/components/ReviewFlags";
import { LabsReportSidebar } from "@/components/labs/LabsReportSidebar";
import { LabsReportDetail } from "@/components/labs/LabsReportDetail";
import { LabsLogPane } from "@/components/labs/LabsLogPane";
import { LabsPanelsProvider } from "@/components/labs/LabsPanelsContext";
import { LabsPanelsSheet, LabsPanelsToolbarButton } from "@/components/labs/LabsPanelsSheet";

type LabsWorkspaceProps = {
  mode: "log" | "analysis";
};

function LabsWorkspaceInner({ mode }: LabsWorkspaceProps) {
  const { logView, reports } = useApp();

  const rightPane = () => {
    if (mode === "log") {
      if (logView === "extraction") return <ExtractionReview />;
      if (logView === "flags") return <ReviewFlags />;
      return <LabsLogPane />;
    }
    return <LabsReportDetail />;
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
        <LabsPanelsToolbarButton count={reports.length} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr] lg:gap-6">
        <div className="hidden lg:block">
          <LabsReportSidebar />
        </div>
        <div className="min-w-0">{rightPane()}</div>
      </div>
      <LabsPanelsSheet />
    </>
  );
}

export function LabsWorkspace({ mode }: LabsWorkspaceProps) {
  return (
    <LabsPanelsProvider>
      <LabsWorkspaceInner mode={mode} />
    </LabsPanelsProvider>
  );
}