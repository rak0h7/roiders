"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Cancel" onClick={onCancel} />
      <div className={cn(ui.card, ui.cardPad, "relative z-10 w-full max-w-sm space-y-4")}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border",
              destructive
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-[var(--accent)]/30 bg-[var(--labs-dim)] text-[var(--accent)]",
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className={ui.sectionTitle}>{title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={ui.btnSecondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={destructive ? cn(ui.btnSecondary, "border-red-500/40 text-red-400") : ui.btnPrimary}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}