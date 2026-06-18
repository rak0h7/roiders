"use client";

import { useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useNavigation } from "@/context/NavigationContext";
import { useToast } from "@/context/ToastContext";

export function useLabsActions() {
  const { currentValues, saveReport, setMainTab, setLogView } = useApp();
  const { setRoute } = useNavigation();
  const { toast } = useToast();

  const markerCount = Object.keys(currentValues).length;

  const saveAndOpenInsights = useCallback(() => {
    if (markerCount === 0) {
      toast({
        type: "warning",
        title: "No markers to save",
        description: "Enter at least one marker value first.",
      });
      return;
    }
    saveReport();
    setMainTab("insights");
    setRoute("bloodwork-insights");
    toast({
      type: "success",
      title: "Report saved",
      description: "Opening insights…",
    });
  }, [markerCount, saveReport, setMainTab, setRoute, toast]);

  const saveAndOpenFlags = useCallback(() => {
    if (markerCount === 0) {
      toast({
        type: "warning",
        title: "No markers to review",
        description: "Enter at least one marker value first.",
      });
      return;
    }
    saveReport();
    setLogView("flags");
    toast({ type: "success", title: "Report saved" });
  }, [markerCount, saveReport, setLogView, toast]);

  const openInsights = useCallback(() => {
    setMainTab("insights");
    setRoute("bloodwork-insights");
  }, [setMainTab, setRoute]);

  return { saveAndOpenInsights, saveAndOpenFlags, openInsights, markerCount };
}