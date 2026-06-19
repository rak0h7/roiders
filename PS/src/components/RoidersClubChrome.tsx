"use client";

/** Branded slide overlay — complements CanvasThemeBackground, does not replace theme colors. */
export function RoidersClubChrome() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(ellipse 110% 70% at 8% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 50%),
            radial-gradient(ellipse 90% 60% at 92% 100%, color-mix(in srgb, var(--protocol) 14%, transparent), transparent 48%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black, transparent)",
        }}
      />
      <div className="absolute inset-x-[7%] top-[4%] z-10 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/50 bg-[var(--bg-surface)]/70 font-display text-[11px] font-extrabold text-[var(--accent)] sm:h-9 sm:w-9 sm:text-xs">
          RC
        </span>
        <span className="text-[11px] font-semibold tracking-wide text-[var(--muted)] sm:text-xs">
          Roiders Club
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[28%] items-end justify-center pb-[5%]">
        <div
          className="absolute left-[10%] h-24 w-24 rounded-full opacity-40 blur-3xl sm:h-28 sm:w-28"
          style={{ background: "var(--labs)" }}
        />
        <div
          className="absolute right-[14%] bottom-[18%] h-20 w-20 rounded-full opacity-30 blur-3xl sm:h-24 sm:w-24"
          style={{ background: "var(--protocol)" }}
        />
        <div
          className="absolute left-[44%] bottom-[28%] h-16 w-16 rounded-full opacity-25 blur-2xl sm:h-20 sm:w-20"
          style={{ background: "var(--intel)" }}
        />
      </div>
    </div>
  );
}