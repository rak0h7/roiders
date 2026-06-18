"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { AddToHomeScreenModal } from "@/components/ui/AddToHomeScreenModal";
import { AppIcon } from "@/components/ui/AppIcon";
import { isMobileDevice } from "@/lib/device";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function MiscSettings() {
  const [showMobile, setShowMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setShowMobile(isMobileDevice());
  }, []);

  if (!showMobile) return null;

  return (
    <>
      <div className={cn(ui.card, ui.cardPad)}>
        <div className="flex items-start gap-3">
          <div className="flex h-[var(--control-height)] w-[var(--control-height)] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--intel)]/30 bg-[var(--intel-dim)]">
            <AppIcon icon={Smartphone} className="text-[var(--intel)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={ui.sectionTitle}>Misc</h3>
            <p className={ui.sectionSub}>Install the app on your home screen for one-tap access.</p>
            <button type="button" onClick={() => setOpen(true)} className={cn(ui.btnSecondary, "mt-4 text-xs")}>
              Add to Home Screen
            </button>
          </div>
        </div>
      </div>
      <AddToHomeScreenModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}