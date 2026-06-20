"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type LabsPanelsContextValue = {
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
};

const LabsPanelsContext = createContext<LabsPanelsContextValue | null>(null);

export function LabsPanelsProvider({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const value = useMemo(
    () => ({ sheetOpen, openSheet, closeSheet }),
    [sheetOpen, openSheet, closeSheet],
  );
  return <LabsPanelsContext.Provider value={value}>{children}</LabsPanelsContext.Provider>;
}

export function useLabsPanels() {
  const ctx = useContext(LabsPanelsContext);
  if (!ctx) throw new Error("useLabsPanels must be used within LabsPanelsProvider");
  return ctx;
}