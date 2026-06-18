"use client";

import {
  Activity,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  FlaskConical,
  Gauge,
  Info,
  Shield,
  Target,
} from "lucide-react";
import type { CompoundProfile, ProfileBlock } from "@/lib/compoundProfileTypes";
import {
  ROUTE_LABEL,
  SECTION_KIND_LABEL,
  classifySectionHeading,
  slugifyHeading,
  type GuideSectionKind,
} from "@/lib/guideCatalog";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const KIND_ICON: Record<GuideSectionKind, typeof Activity> = {
  mechanism: Activity,
  uses: Target,
  dosage: Gauge,
  safety: Shield,
  labs: FlaskConical,
  context: Info,
  general: BookOpen,
};

const KIND_ACCENT: Record<GuideSectionKind, string> = {
  mechanism: "text-[var(--protocol)] bg-[var(--protocol-dim)] border-[var(--protocol)]/25",
  uses: "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/25",
  dosage: "text-[var(--labs)] bg-[var(--labs-dim)] border-[var(--labs)]/25",
  safety: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  labs: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  context: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  general: "text-[var(--muted)] bg-[var(--bg-elevated)] border-[var(--border)]",
};

function MarkerCard({ heading, body }: { heading: string; body: string }) {
  return (
    <div className={cn(ui.cardInner, "p-3")}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground)]">{heading}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{body}</p>
    </div>
  );
}

function BlockContent({ block, depth = 0 }: { block: ProfileBlock; depth?: number }) {
  const isLabsGrid = block.heading === "Blood Markers Impacted" && block.blocks?.length;

  if (isLabsGrid) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {block.blocks!.map((sub, i) => (
          <MarkerCard key={`${sub.heading ?? "marker"}-${i}`} heading={sub.heading ?? "Marker"} body={sub.body ?? ""} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(depth > 0 && "border-l border-[var(--border)] pl-4")}>
      {block.body && (
        <p className="text-sm leading-relaxed text-[var(--muted)]">{block.body}</p>
      )}
      {block.list && (
        <ul className="mt-2 space-y-2">
          {block.list.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[var(--muted)]">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--protocol)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {block.blocks && !isLabsGrid && (
        <div className="mt-3 space-y-3">
          {block.blocks.map((sub, i) => (
            <div key={`${sub.heading ?? "sub"}-${i}`}>
              {sub.heading && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
                  {sub.heading}
                </p>
              )}
              <BlockContent block={sub} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({ block, index }: { block: ProfileBlock; index: number }) {
  if (!block.heading) {
    return (
      <div className={cn(ui.card, ui.cardPad)}>
        <BlockContent block={block} />
      </div>
    );
  }

  const kind = classifySectionHeading(block.heading);
  const Icon = KIND_ICON[kind];
  const slug = slugifyHeading(block.heading);

  return (
    <section id={slug || `section-${index}`} className={cn(ui.card, "overflow-hidden")}>
      <div className={cn("flex items-start gap-3 border-b border-[var(--border)] px-5 py-4", KIND_ACCENT[kind])}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border bg-[var(--bg-surface)]/80">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">
            {SECTION_KIND_LABEL[kind]}
          </p>
          <h3 className="mt-0.5 font-display text-base font-semibold tracking-tight text-[var(--foreground)]">
            {block.heading}
          </h3>
        </div>
      </div>
      <div className="px-5 py-4">
        <BlockContent block={block} />
      </div>
    </section>
  );
}

export function CompoundGuideArticle({ profile }: { profile: CompoundProfile }) {
  const toc = profile.sections
    .map((section, index) => ({
      heading: section.heading,
      slug: section.heading ? slugifyHeading(section.heading) : `section-${index}`,
      kind: section.heading ? classifySectionHeading(section.heading) : ("general" as const),
    }))
    .filter((item) => item.heading);

  return (
    <article className="space-y-5">
      <header className={cn(ui.cardProtocol, ui.cardPad)}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--protocol)]/30 bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--protocol)]">
            {ROUTE_LABEL[profile.route]}
          </span>
          {profile.aliases?.map((alias) => (
            <span
              key={alias}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--muted)]"
            >
              {alias}
            </span>
          ))}
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {profile.title}
        </h2>
        {profile.tagline && (
          <p className={`${ui.pageSub} mt-2 max-w-3xl text-[var(--foreground)]/80`}>{profile.tagline}</p>
        )}
      </header>

      {toc.length > 2 && (
        <nav className={cn(ui.card, ui.cardPad, "lg:sticky lg:top-4")} aria-label="On this page">
          <p className={cn(ui.overline, "mb-3")}>On this page</p>
          <div className="flex flex-wrap gap-2">
            {toc.map((item) => (
              <a
                key={item.slug}
                href={`#${item.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--protocol)]/30 hover:text-[var(--foreground)]"
              >
                {item.heading}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="space-y-4">
        {profile.sections.map((section, i) => (
          <SectionCard key={`${profile.id}-section-${i}`} block={section} index={i} />
        ))}
      </div>

      <footer className={cn(ui.cardInner, "flex items-start gap-2.5 px-4 py-3 text-xs text-[var(--muted)]")}>
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
        <p>
          Reference material for planning and education — not medical advice. Doses and responses vary; pair with
          labs and clinical judgment.
        </p>
      </footer>
    </article>
  );
}