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
          ui.toggle,
          checked ? "[background:var(--gradient-primary)]" : "bg-[var(--bg-hover)]",
          disabled && "opacity-50"
        )}
      >
        <span className={cn(ui.toggleKnob, checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}