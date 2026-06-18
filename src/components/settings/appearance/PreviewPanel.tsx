"use client";

import { ImagePlus } from "lucide-react";
import { FONT_FAMILY_OPTIONS, type ThemeConfig } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function PreviewPanel({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      className="glass-panel relative overflow-hidden rounded-[var(--radius-xl)] p-6"
      style={{
        letterSpacing: `${theme.letterSpacing / 100}em`,
        lineHeight: theme.lineHeight,
      }}
    >
      <div
        className="absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, var(--labs-glow), transparent)" }}
      />
      {theme.backgroundImage && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <p className={ui.overline}>Live preview</p>
      <p className="font-display mt-2 text-2xl font-bold text-gradient" style={{ fontWeight: theme.fontWeight }}>
        Roiders Club
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {FONT_FAMILY_OPTIONS.find((f) => f.id === theme.fontFamily)?.label ?? "Syne"} · {theme.layoutPreset} ·{" "}
        {theme.iconStyle} icons
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" className={ui.btnPrimary}>
          Primary action
        </button>
        <button type="button" className={ui.btnSecondary}>
          Secondary
        </button>
        <span className={cn(ui.pillActive, "pointer-events-none")}>Active pill</span>
        <ImagePlus
          style={{ width: theme.iconSize, height: theme.iconSize }}
          className="text-[var(--accent)]"
          strokeWidth={theme.iconStyle === "bold" ? 2.5 : 1.75}
        />
      </div>
      <div className="mt-4 flex gap-1">
        {theme.customSwatches.slice(0, 4).map((c, i) => (
          <span key={i} className="h-2 flex-1 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}