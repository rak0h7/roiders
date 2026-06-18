"use client";

import { ArrowLeft, BookOpen, Droplets, Pill, Sparkles, Syringe } from "lucide-react";
import {
  COMPOUND_PROFILES,
  getProfileById,
  listConceptProfiles,
  listGuideProfilesByCategory,
  listInjectableProfiles,
  listOralProfiles,
} from "@/data/compoundProfiles";
import { useCycleStore } from "@/store/cycleStore";
import { CompoundGuideArticle } from "./CompoundGuideArticle";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

function ProfileCard({
  title, tagline, route, onClick,
}: {
  title: string; tagline?: string; route: string; onClick: () => void;
}) {
  const Icon =
    route === "injectable" ? Syringe : route === "oral" ? Pill : route === "topical" ? Droplets : BookOpen;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(ui.card, ui.cardHover, "group w-full p-4 text-left")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--protocol-dim)] text-[var(--protocol)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--protocol)]">
            {title}
          </p>
          {tagline && <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{tagline}</p>}
        </div>
      </div>
    </button>
  );
}

function Section({
  title, profiles, onSelect,
}: {
  title: string;
  profiles: typeof COMPOUND_PROFILES;
  onSelect: (id: string) => void;
}) {
  if (!profiles.length) return null;
  return (
    <section>
      <p className={cn(ui.overline, "mb-3")}>{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {profiles.map((p) => (
          <ProfileCard
            key={p.id}
            title={p.title}
            tagline={p.tagline}
            route={p.route}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function CompoundGuidesView() {
  const { selectedGuideId, setSelectedGuideId } = useCycleStore();
  const profile = selectedGuideId ? getProfileById(selectedGuideId) : null;

  if (profile) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedGuideId(null)}
          className={cn(ui.btnGhost, "gap-1.5 text-xs")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All profiles
        </button>
        <CompoundGuideArticle profile={profile} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={cn(ui.cardProtocol, ui.cardPad)}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--protocol)]/15 text-[var(--protocol)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className={ui.pageTitle}>Compound Guide Library</h2>
            <p className={`${ui.pageSub} mt-1 max-w-2xl`}>
              Mechanisms, uses, dosages, and side effects for peptides, metabolic agents, nootropics, hair compounds, ancillaries, and classic AAS profiles.
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">{COMPOUND_PROFILES.length} compound profiles</p>
          </div>
        </div>
      </div>

      <Section title="Core concepts" profiles={listConceptProfiles()} onSelect={setSelectedGuideId} />
      <Section title="Anabolic injectables" profiles={listInjectableProfiles()} onSelect={setSelectedGuideId} />
      <Section title="Anabolic orals" profiles={listOralProfiles()} onSelect={setSelectedGuideId} />
      <Section title="Peptides & GH" profiles={listGuideProfilesByCategory("peptides")} onSelect={setSelectedGuideId} />
      <Section title="Fat loss & metabolic" profiles={listGuideProfilesByCategory("fat-loss")} onSelect={setSelectedGuideId} />
      <Section title="Cognitive & nootropics" profiles={listGuideProfilesByCategory("cognitive")} onSelect={setSelectedGuideId} />
      <Section title="Hair & topicals" profiles={listGuideProfilesByCategory("hair")} onSelect={setSelectedGuideId} />
      <Section title="Support & ancillaries" profiles={listGuideProfilesByCategory("support")} onSelect={setSelectedGuideId} />
      <Section title="Recreational" profiles={listGuideProfilesByCategory("recreational")} onSelect={setSelectedGuideId} />
    </div>
  );
}