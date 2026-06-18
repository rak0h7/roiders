"use client";

import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function AdminToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={ui.rowBetween}>
      <div>
        <p className="text-sm text-[var(--foreground)]">{label}</p>
        <p className={ui.sectionSub}>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border transition",
          checked
            ? "border-[var(--labs)]/50 bg-[var(--labs)]"
            : "border-[var(--border)] bg-[var(--bg-elevated)]",
          disabled && "opacity-50"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[1.375rem]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}