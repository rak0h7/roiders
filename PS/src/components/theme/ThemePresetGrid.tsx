"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { THEME_PRESETS, type ThemeConfig, type ThemePresetId } from "@/lib/themes";
import { THEME_GROUPS, type ThemeGroupId } from "@ps/lib/themeGroups";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ThemePresetGrid({
  activePreset,
  onSelect,
}: {
  activePreset: ThemeConfig["preset"];
  onSelect: (id: ThemePresetId) => void;
}) {
  const [group, setGroup] = useState<ThemeGroupId>("all");
  const [query, setQuery] = useState("");

  const presets = useMemo(() => {
    let list = group === "all" ? [...THEME_PRESETS] : THEME_PRESETS.filter((p) => {
      const ids = THEME_GROUPS.find((g) => g.id === group)?.presets ?? [];
      return ids.includes(p.id as ThemePresetId);
    });
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [group, query]);

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search themes…"
          className={cn(ui.inputCompact, "w-full pl-8 text-xs")}
        />
      </div>

      <div className="flex flex-wrap gap-1">
        <FilterChip active={group === "all"} onClick={() => setGroup("all")} label="All" count={THEME_PRESETS.length} />
        {THEME_GROUPS.map((g) => (
          <FilterChip
            key={g.id}
            active={group === g.id}
            onClick={() => setGroup(g.id)}
            label={g.label}
            count={g.presets.length}
          />
        ))}
      </div>

      <p className="text-[10px] text-[var(--muted)]">
        {presets.length} shown · plain → wild
      </p>

      <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-0.5">
        {presets.length === 0 ? (
          <p className="col-span-2 py-6 text-center text-xs text-[var(--muted)]">No themes match your search.</p>
        ) : (
          presets.map((preset) => {
            const active = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.description}
                onClick={() => onSelect(preset.id as ThemePresetId)}
                className={cn(
                  "group relative overflow-hidden rounded-[var(--radius-md)] border p-2.5 text-left transition",
                  active
                    ? "border-[var(--accent)]/55 bg-[var(--labs-dim)]/80 ring-1 ring-[var(--accent)]/20"
                    : "border-[var(--border)] bg-[var(--bg-elevated)]/40 hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]/30",
                )}
              >
                <div
                  className="mb-2 h-7 rounded-[var(--radius-sm)] shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 50%, ${preset.tertiary} 100%)`,
                  }}
                />
                <p className="truncate text-[11px] font-semibold text-[var(--foreground)]">{preset.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-[var(--muted)]">{preset.description}</p>
                {active && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]/15">
                    <Check className="h-3 w-3 text-[var(--accent)]" />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition",
        active
          ? "border-[var(--accent)]/40 bg-[var(--labs-dim)] text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
      )}
    >
      {label}
      {count != null && (
        <span className={cn("font-mono text-[9px]", active ? "text-[var(--accent)]/80" : "text-[var(--muted)]")}>
          {count}
        </span>
      )}
    </button>
  );
}