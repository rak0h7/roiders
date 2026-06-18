"use client";

import { Smartphone } from "lucide-react";
import { useHomeScreenPrompt } from "@/context/HomeScreenPromptContext";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function MiscSettings() {
  const { openHomeScreenPrompt, canShowHomeScreenPrompt } = useHomeScreenPrompt();

  if (!canShowHomeScreenPrompt) return null;

  return (
    <div className={cn(ui.card, ui.cardPad)}>
      <div className="flex items-start gap-3">
        <div className="flex h-[var(--control-height)] w-[var(--control-height)] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--intel)]/30 bg-[var(--intel-dim)]">
          <AppIcon icon={Smartphone} className="text-[var(--intel)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={ui.sectionTitle}>Mobile</h3>
          <p className={ui.sectionSub}>
            Add Roiders Club to your home screen for one-tap access — iOS and Android steps inside.
          </p>
          <button
            type="button"
            onClick={openHomeScreenPrompt}
            className={cn(ui.btnSecondary, "mt-4 text-xs")}
          >
            Add to Home Screen
          </button>
        </div>
      </div>
    </div>
  );
}