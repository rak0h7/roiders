"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";

export function ProjectThemeBridge() {
  const { view, activeProject, updateProjectTheme } = usePsProjects();
  const { theme, updateSettings } = useSettings();
  const syncedRef = useRef("");

  useEffect(() => {
    if (view.type !== "editor" || !activeProject) return;
    const serialized = JSON.stringify(activeProject.theme);
    if (syncedRef.current === serialized) return;
    syncedRef.current = serialized;
    updateSettings({ theme: activeProject.theme });
  }, [activeProject?.id, activeProject?.theme, view.type, updateSettings]);

  useEffect(() => {
    if (view.type !== "editor" || !activeProject) return;
    const serialized = JSON.stringify(theme);
    if (syncedRef.current === serialized) return;
    syncedRef.current = serialized;
    updateProjectTheme(activeProject.id, theme);
  }, [theme, view.type, activeProject?.id, updateProjectTheme]);

  return null;
}