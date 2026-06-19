"use client";

import { FONT_FAMILY_OPTIONS, type ThemeConfig } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ThemePreviewCard({ theme, name }: { theme: ThemeConfig; name: string }) {
  const fontLabel = FONT_FAMILY_OPTIONS.find((f) => f.id === theme.fontFamily)?.label ?? "Syne";

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)]/50 p-3">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, var(--labs-glow), transparent)" }}
      />
      {theme.backgroundImage && (
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <p className={cn(ui.overline, "relative")}>Active theme</p>
      <p className="relative mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{name}</p>
      <p className="relative mt-0.5 text-[10px] text-[var(--muted)]">
        {fontLabel} · {theme.backgroundPattern !== "none" ? theme.backgroundPattern : "clean"} bg
      </p>
      <div className="relative mt-2.5 flex gap-1">
        {[theme.accentPrimary, theme.accentSecondary, theme.accentTertiary].map((c, i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: c }} />
        ))}
      </div>
      <div className="relative mt-2.5 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[var(--labs-dim)] px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">
          Primary
        </span>
        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[9px] text-[var(--muted)]">
          Secondary
        </span>
      </div>
    </div>
  );
}