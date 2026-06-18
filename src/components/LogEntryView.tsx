"use client";

import { useApp } from "@/context/AppContext";
import { LandingView } from "./LandingView";
import { MarkerGrid } from "./MarkerGrid";
import { QuickJump } from "./QuickJump";
import { UploadZone } from "./UploadZone";
import { LabsActionBar } from "./labs/LabsActionBar";
import { useLabsActions } from "./labs/useLabsActions";

export function LogEntryView() {
  const { logView, setLogView } = useApp();
  const { saveAndOpenInsights, saveAndOpenFlags } = useLabsActions();

  if (logView === "landing") return <LandingView />;

  return (
    <div className="space-y-4">
      <LabsActionBar
        onBack={() => setLogView("landing")}
        backLabel="Back"
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