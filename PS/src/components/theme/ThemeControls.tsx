"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ThemeSection({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)]/30">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-[var(--bg-hover)]/40"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[var(--muted)] transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-[var(--foreground)]">{title}</span>
          {!open && summary && (
            <p className="truncate text-[10px] text-[var(--muted)]">{summary}</p>
          )}
        </div>
      </button>
      {open && <div className="space-y-3 border-t border-[var(--border)]/80 px-3 py-3">{children}</div>}
    </div>
  );
}

export function CompactSlider({
  label,
  value,
  onChange,
  min,
  max,
  unit = "",
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
  step?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[var(--muted)]">{label}</span>
        <span className="font-mono text-[10px] tabular-nums text-[var(--foreground)]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-hover)] accent-[var(--accent)]"
      />
    </div>
  );
}

export function CompactToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-[var(--foreground)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(ui.toggle, "scale-90", checked ? "[background:var(--gradient-primary)]" : "bg-[var(--bg-hover)]")}
      >
        <span className={cn(ui.toggleKnob, checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

export function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium text-[var(--muted)]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(ui.inputCompact, "font-mono text-[10px]")}
        />
      </div>
    </label>
  );
}

export function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-[var(--radius-sm)] border px-2 py-1 text-[10px] capitalize transition",
            value === id
              ? "border-[var(--accent)]/40 bg-[var(--labs-dim)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
        >
          {id}
        </button>
      ))}
    </div>
  );
}