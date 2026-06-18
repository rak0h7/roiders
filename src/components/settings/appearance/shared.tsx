"use client";

import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function SettingsSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="border-t border-[var(--border)] pt-8">
      <p className={cn(ui.overline, "mb-4")}>{title}</p>
      <div className={className}>{children}</div>
    </section>
  );
}

export function ColorField({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={cn(ui.cardInner, "p-4")}>
      <label className={ui.label}>{label}</label>
      <p className="mb-3 text-xs text-[var(--muted-2)]">{desc}</p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[var(--control-height)] w-14 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(ui.inputCompact, "font-mono")}
        />
      </div>
    </div>
  );
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  unit = "",
  step = 1,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  display?: (v: number) => string;
}) {
  const shown = display ? display(value) : `${value}${unit}`;
  return (
    <div>
      <div className={ui.rowBetween}>
        <span className="text-sm text-[var(--foreground)]">{label}</span>
        <span className="font-mono text-xs text-[var(--muted)]">{shown}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-hover)] accent-[var(--accent)]"
      />
    </div>
  );
}

export function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={ui.rowBetween}>
      <div>
        <p className="text-sm text-[var(--foreground)]">{label}</p>
        <p className={ui.sectionSub}>{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(ui.toggle, checked ? "[background:var(--gradient-primary)]" : "bg-[var(--bg-hover)]")}
      >
        <span className={cn(ui.toggleKnob, checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}