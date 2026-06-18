"use client";

import { useEffect, useState } from "react";
import { Search, Settings2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigation, NAV_ITEMS } from "@/context/NavigationContext";
import { useSettings } from "@/context/SettingsContext";
import { AppIcon } from "@/components/ui/AppIcon";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const ACCENT: Record<string, string> = {
  labs: "text-[var(--labs)]",
  protocol: "text-[var(--protocol)]",
  intel: "text-[var(--intel)]",
  neutral: "text-[var(--muted)]",
};

const FADE_DISTANCE = 56;

export function TopBar() {
  const { user, accountName } = useAuth();
  const { route, setCommandOpen, setRoute } = useNavigation();
  const { theme, reducedMotion } = useSettings();
  const current = NAV_ITEMS.find((n) => n.id === route);
  const showSubtitle = theme.showTopBarSubtitle && current?.description;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fade = reducedMotion
    ? scrollY > FADE_DISTANCE / 2 ? 0 : 1
    : Math.max(0, 1 - scrollY / FADE_DISTANCE);
  const scrolled = fade < 0.05;

  return (
    <header
      className={cn(
        "glass sticky top-0 z-30 shrink-0 border-b transition-[background,backdrop-filter,box-shadow] duration-200",
        scrolled && "border-[var(--border)]/80 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
      )}
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--bg-elevated) 92%, transparent)"
          : undefined,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6",
          scrolled ? "h-12 py-0" : "min-h-12 py-2 sm:min-h-[52px]"
        )}
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden pr-1 sm:gap-3 sm:pr-2">
          <div
            className="flex h-[var(--control-height-xs)] w-[var(--control-height-xs)] shrink-0 items-center justify-center rounded-[var(--radius-md)] lg:hidden"
            style={{ background: "var(--gradient-primary)", boxShadow: "0 2px 12px var(--labs-glow)" }}
            aria-hidden
          >
            <span className="font-display text-xs font-bold text-white">M</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                "block truncate font-display text-sm font-semibold leading-tight tracking-tight sm:text-base",
                current ? ACCENT[current.accent] : "text-[var(--foreground)]"
              )}
            >
              {current?.label ?? "Dashboard"}
            </h1>
            {showSubtitle && (
              <p
                className={cn(
                  "mt-0.5 hidden truncate text-xs leading-tight text-[var(--muted)] transition-all duration-200 ease-out md:block",
                  scrolled && "pointer-events-none"
                )}
                style={{
                  opacity: fade,
                  maxHeight: `${fade * 20}px`,
                  marginTop: fade > 0.05 ? 2 : 0,
                  transform: `translateY(${(1 - fade) * -6}px)`,
                }}
                aria-hidden={scrolled}
              >
                {current.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user && accountName && (
            <button
              type="button"
              onClick={() => setRoute("settings")}
              className={cn(
                ui.btnToolbar,
                "hidden max-w-[140px] truncate border-[var(--border)] bg-[var(--bg-surface)] font-normal normal-case sm:block"
              )}
              title={accountName}
            >
              {accountName}
            </button>
          )}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            aria-label="Open command palette"
            className={cn(ui.btnToolbar, "min-w-[var(--control-height-icon)] border-[var(--border)] bg-[var(--bg-surface)] font-normal normal-case sm:min-w-0")}
          >
            <AppIcon icon={Search} size="sm" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[10px] lg:inline">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setRoute("settings")}
            aria-label="Settings"
            className={ui.btnIcon}
          >
            <AppIcon icon={Settings2} size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
}