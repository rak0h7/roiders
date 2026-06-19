"use client";

import type { ThemeConfig } from "@/lib/themes";
import { cn } from "@/lib/utils";

const PATTERN_STYLES: Record<ThemeConfig["backgroundPattern"], string | null> = {
  none: null,
  grid: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
  dots: `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)`,
  scanlines: `repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)`,
  hex: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 1px, transparent 1px)`,
};

const PATTERN_SIZE: Record<ThemeConfig["backgroundPattern"], string> = {
  none: "auto",
  grid: "28px 28px",
  dots: "18px 18px",
  scanlines: "auto",
  hex: "24px 24px",
};

export function CanvasThemeBackground({ theme }: { theme: ThemeConfig }) {
  const pattern = PATTERN_STYLES[theme.backgroundPattern];

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[var(--bg-base)]" />
      {theme.showAmbientBackground && (
        <div
          className={cn(
            "absolute inset-[-12%]",
            theme.animatedBackground && "ambient-bg",
          )}
          style={{ background: "var(--gradient-ambient)" }}
        />
      )}
      {theme.particleEffects && theme.showAmbientBackground && (
        <div
          className="absolute inset-[-12%] opacity-100"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 20%, rgba(255, 255, 255, 0.35), transparent),
              radial-gradient(1px 1px at 80% 40%, var(--labs-glow), transparent),
              radial-gradient(1.5px 1.5px at 45% 75%, var(--intel-glow), transparent),
              radial-gradient(1px 1px at 65% 15%, var(--protocol-glow), transparent)
            `,
            backgroundSize: "200% 200%",
            animation: theme.animatedBackground ? "particle-drift 24s linear infinite" : undefined,
            opacity: `calc(0.35 + var(--parallax-strength, 0.4) * 0.4)`,
          }}
        />
      )}
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
      {pattern && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: pattern,
            backgroundSize: PATTERN_SIZE[theme.backgroundPattern],
          }}
        />
      )}
    </div>
  );
}