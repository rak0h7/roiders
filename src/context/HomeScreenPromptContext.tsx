"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AddToHomeScreenModal } from "@/components/ui/AddToHomeScreenModal";
import {
  canShowHomeScreenPrompt,
  clearHomeScreenPromptPending,
  shouldAutoShowHomeScreenPrompt,
} from "@/lib/homeScreenPrompt";

type HomeScreenPromptContextValue = {
  openHomeScreenPrompt: () => void;
  canShowHomeScreenPrompt: boolean;
};

const HomeScreenPromptContext = createContext<HomeScreenPromptContextValue | null>(null);

export function HomeScreenPromptProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    setEligible(canShowHomeScreenPrompt());
  }, []);

  useEffect(() => {
    if (!eligible) return;
    if (shouldAutoShowHomeScreenPrompt()) {
      setOpen(true);
    }
  }, [eligible]);

  const close = useCallback(() => {
    clearHomeScreenPromptPending();
    setOpen(false);
  }, []);

  const openHomeScreenPrompt = useCallback(() => {
    if (!canShowHomeScreenPrompt()) return;
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openHomeScreenPrompt, canShowHomeScreenPrompt: eligible }),
    [openHomeScreenPrompt, eligible],
  );

  return (
    <HomeScreenPromptContext.Provider value={value}>
      {children}
      {eligible && <AddToHomeScreenModal open={open} onClose={close} />}
    </HomeScreenPromptContext.Provider>
  );
}

export function useHomeScreenPrompt(): HomeScreenPromptContextValue {
  const ctx = useContext(HomeScreenPromptContext);
  if (!ctx) {
    return { openHomeScreenPrompt: () => {}, canShowHomeScreenPrompt: false };
  }
  return ctx;
}