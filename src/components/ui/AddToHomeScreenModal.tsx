"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MoreVertical, Share, Smartphone, X } from "lucide-react";
import { getMobilePlatform, type MobilePlatform } from "@/lib/device";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = { text: ReactNode };

function iosSteps(): Step[] {
  return [
    { text: <>Open <strong>roiders.club</strong> in <strong>Safari</strong> (required on iPhone).</> },
    {
      text: (
        <>
          Tap the <Share className="inline h-4 w-4 text-[var(--intel)]" aria-hidden />{" "}
          <strong>Share</strong> button at the bottom of Safari.
        </>
      ),
    },
    { text: <>Scroll the share sheet and tap <strong>Add to Home Screen</strong>.</> },
    { text: <>Tap <strong>Add</strong> — Roiders Club appears on your home screen like an app.</> },
  ];
}

function androidSteps(): Step[] {
  return [
    { text: <>Open <strong>roiders.club</strong> in <strong>Chrome</strong> (or your default browser).</> },
    {
      text: (
        <>
          Tap the <MoreVertical className="inline h-4 w-4 text-[var(--intel)]" aria-hidden />{" "}
          <strong>menu</strong> (top right), or use the <strong>Install app</strong> banner if shown.
        </>
      ),
    },
    { text: <>Choose <strong>Add to Home screen</strong> or <strong>Install app</strong>.</> },
    { text: <>Confirm — launch Roiders Club from your home screen in one tap.</> },
  ];
}

function PlatformSteps({ platform, steps }: { platform: MobilePlatform; steps: Step[] }) {
  const label = platform === "ios" ? "iPhone / iPad" : "Android";
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/60 p-4">
      <p className={cn(ui.overline, "mb-3 text-[var(--intel)]")}>{label}</p>
      <ol className="space-y-3 text-sm text-[var(--foreground)]">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--intel-dim)] text-xs font-bold text-[var(--intel)]">
              {i + 1}
            </span>
            <span className="leading-relaxed">{step.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AddToHomeScreenModal({ open, onClose }: Props) {
  const [platform, setPlatform] = useState<MobilePlatform>("other");

  useEffect(() => {
    if (open) setPlatform(getMobilePlatform());
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={cn(ui.card, ui.cardPad, "max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={ui.rowBetween}>
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--intel)]/30 bg-[var(--intel-dim)]">
            <Smartphone className="h-5 w-5 text-[var(--intel)]" />
          </div>
          <button type="button" onClick={onClose} className={ui.btnIcon} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className={cn(ui.sectionTitle, "mt-4")}>Add to Home Screen</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Install Roiders Club on your phone for quick access — works like a native app, no App Store
          download.
        </p>

        <div className="mt-5 space-y-4">
          {platform === "ios" && <PlatformSteps platform="ios" steps={iosSteps()} />}
          {platform === "android" && <PlatformSteps platform="android" steps={androidSteps()} />}
          {platform === "other" && (
            <>
              <PlatformSteps platform="ios" steps={iosSteps()} />
              <PlatformSteps platform="android" steps={androidSteps()} />
            </>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-[var(--muted)]">
          {platform === "ios"
            ? "iOS only supports Add to Home Screen from Safari — not Chrome or in-app browsers."
            : platform === "android"
              ? "Some Android browsers label this “Install app” instead of Add to Home screen."
              : "Pick the instructions that match your device."}
        </p>

        <button type="button" onClick={onClose} className={cn(ui.btnPrimary, "mt-6 w-full")}>
          Got it
        </button>
      </div>
    </div>
  );
}