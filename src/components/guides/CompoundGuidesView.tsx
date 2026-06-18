"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Droplets,
  Pill,
  Search,
  Sparkles,
  Syringe,
} from "lucide-react";
import { COMPOUND_PROFILES } from "@/data/compoundProfiles";
import { useCycleStore } from "@/store/cycleStore";
import { CompoundGuideArticle } from "./CompoundGuideArticle";
import {
  GUIDE_SECTIONS,
  buildGuideCatalog,
  filterGuideEntries,
  getDisplayProfileById,
  type GuideListEntry,
  type GuideSectionId,
} from "@/lib/guideCatalog";
import type { ProfileRoute } from "@/lib/compoundProfileTypes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const ROUTE_ICON: Record<ProfileRoute, typeof Syringe> = {
  injectable: Syringe,
  oral: Pill,
  topical: Droplets,
  concept: BookOpen,
};

function ProfileCard({
  entry,
  onClick,
  compact = false,
}: {
  entry: GuideListEntry;
  onClick: () => void;
  compact?: boolean;
}) {
  const { profile, sectionTitle } = entry;
  const Icon = ROUTE_ICON[profile.route];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(ui.card, ui.cardHover, "group w-full text-left", compact ? "p-3.5" : "p-4")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--protocol-dim)] text-[var(--protocol)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--protocol)]">
              {profile.title}
            </p>
            {compact && (
              <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                {sectionTitle}
              </span>
            )}
          </div>
          {profile.tagline && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">{profile.tagline}</p>
          )}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--muted)] opacity-0 transition group-hover:opacity-100" />
      </div>
    </button>
  );
}

function GuideSectionBlock({
  sectionId,
  entries,
  open,
  onToggle,
  onSelect,
}: {
  sectionId: GuideSectionId;
  entries: GuideListEntry[];
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
}) {
  const section = GUIDE_SECTIONS.find((s) => s.id === sectionId)!;

  if (!entries.length) return null;

  return (
    <section className={cn(ui.card, "overflow-hidden")}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[var(--bg-hover)] sm:px-5"
      >
        <span className="text-lg" aria-hidden>
          {section.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{section.title}</h3>
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
              {entries.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{section.description}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--muted)] transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="grid gap-3 border-t border-[var(--border)] p-4 sm:grid-cols-2 sm:p-5">
          {entries.map((entry) => (
            <ProfileCard key={entry.profile.id} entry={entry} onClick={() => onSelect(entry.profile.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

export function CompoundGuidesView() {
  const { selectedGuideId, setSelectedGuideId } = useCycleStore();
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<GuideSectionId | "all">("all");
  const [openSections, setOpenSections] = useState<Set<GuideSectionId>>(
    () => new Set<GuideSectionId>(["concepts", "injectables"])
  );

  const catalog = useMemo(() => buildGuideCatalog(), []);
  const filtered = useMemo(
    () => filterGuideEntries(catalog, query, activeSection),
    [catalog, query, activeSection]
  );

  const profile = selectedGuideId ? getDisplayProfileById(selectedGuideId) : null;
  const isSearching = query.trim().length > 0 || activeSection !== "all";

  const grouped = useMemo(() => {
    const map = new Map<GuideSectionId, GuideListEntry[]>();
    for (const section of GUIDE_SECTIONS) map.set(section.id, []);
    for (const entry of filtered) {
      map.get(entry.sectionId)?.push(entry);
    }
    return map;
  }, [filtered]);

  if (profile) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedGuideId(null)}
          className={cn(ui.btnGhost, "gap-1.5 text-xs")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to library
        </button>
        <CompoundGuideArticle profile={profile} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className={cn(ui.cardProtocol, ui.cardPad)}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--protocol)]/15 text-[var(--protocol)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={ui.pageTitle}>Compound Guide Library</h2>
            <p className={`${ui.pageSub} mt-1 max-w-2xl`}>
              Searchable profiles covering mechanisms, dosing, safety, and bloodwork — from classic AAS to peptides,
              metabolic agents, and ancillaries.
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {COMPOUND_PROFILES.length} profiles across {GUIDE_SECTIONS.length} categories
            </p>
          </div>
        </div>
      </div>

      <div className={cn(ui.card, ui.cardPad, "space-y-4")}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${COMPOUND_PROFILES.length} profiles…`}
            className={cn(ui.input, "pl-10")}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              activeSection === "all" ? ui.pillProtocolActive : ui.pillInactive
            )}
          >
            All
          </button>
          {GUIDE_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                activeSection === section.id ? ui.pillProtocolActive : ui.pillInactive
              )}
            >
              {section.icon} {section.title}
            </button>
          ))}
        </div>

        {!isSearching && (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenSections(new Set(GUIDE_SECTIONS.map((s) => s.id)))}
              className={cn(ui.btnGhost, "text-xs")}
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setOpenSections(new Set())}
              className={cn(ui.btnGhost, "text-xs")}
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

      {isSearching ? (
        <div className="space-y-3">
          <p className={cn(ui.overline, "px-1")}>
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
          {filtered.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((entry) => (
                <ProfileCard
                  key={entry.profile.id}
                  entry={entry}
                  compact
                  onClick={() => setSelectedGuideId(entry.profile.id)}
                />
              ))}
            </div>
          ) : (
            <div className={cn(ui.card, ui.cardPad, "text-center")}>
              <p className="text-sm text-[var(--muted)]">No profiles match your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {GUIDE_SECTIONS.map((section) => (
            <GuideSectionBlock
              key={section.id}
              sectionId={section.id}
              entries={grouped.get(section.id) ?? []}
              open={openSections.has(section.id)}
              onToggle={() =>
                setOpenSections((prev) => {
                  const next = new Set(prev);
                  if (next.has(section.id)) next.delete(section.id);
                  else next.add(section.id);
                  return next;
                })
              }
              onSelect={setSelectedGuideId}
            />
          ))}
        </div>
      )}
    </div>
  );
}