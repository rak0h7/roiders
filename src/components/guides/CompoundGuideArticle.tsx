"use client";

import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { ArticleSections, buildSectionToc } from "@/components/content/ArticleBody";
import type { CompoundProfile } from "@/lib/compoundProfileTypes";
import { ROUTE_LABEL } from "@/lib/guideCatalog";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function CompoundGuideArticle({ profile }: { profile: CompoundProfile }) {
  const toc = buildSectionToc(profile.sections);

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

      <ArticleSections sections={profile.sections} variant="guide" />

      <MedicalDisclaimer variant="protocol" />
    </article>
  );
}