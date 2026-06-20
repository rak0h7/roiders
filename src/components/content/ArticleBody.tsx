"use client";

import { ChevronRight } from "lucide-react";
import type { ArticleBlock } from "@/lib/articleTypes";
import { isLabsMarkerGrid } from "@/lib/articleBlocks";
import { buildArticleToc } from "@/lib/articleToc";
import {
  SECTION_KIND_LABEL,
  classifySectionHeading,
  slugifyHeading,
  type GuideSectionKind,
} from "@/lib/guideCatalog";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import {
  Activity,
  BookOpen,
  FlaskConical,
  Gauge,
  Info,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";

export type ArticleBodyVariant = "blog" | "guide";

const KIND_ICON: Record<GuideSectionKind, LucideIcon> = {
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

function BlogList({ items }: { items: string[] }) {
  return (
    <ul className="my-5 space-y-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-5 text-[1.05rem] leading-[1.75] text-[var(--foreground)]/85 before:absolute before:left-0 before:top-[0.65em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--intel)]/70"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function BlogParagraph({ children }: { children: string }) {
  return <p className="text-[1.05rem] leading-[1.8] text-[var(--foreground)]/85">{children}</p>;
}

function GuideList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[var(--muted)]">
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--protocol)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function sectionSlug(block: ArticleBlock, index: number): string {
  return block.heading ? slugifyHeading(block.heading) || `section-${index}` : `section-${index}`;
}

export function ArticleBlockContent({
  block,
  variant,
  depth = 0,
}: {
  block: ArticleBlock;
  variant: ArticleBodyVariant;
  depth?: number;
}) {
  if (variant === "guide" && isLabsMarkerGrid(block)) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {block.blocks!.map((sub, i) => (
          <MarkerCard key={`${sub.heading ?? "marker"}-${i}`} heading={sub.heading ?? "Marker"} body={sub.body ?? ""} />
        ))}
      </div>
    );
  }

  const nestedBlocks = block.blocks && !isLabsMarkerGrid(block) ? block.blocks : null;

  if (variant === "blog") {
    return (
      <>
        {block.body && <BlogParagraph>{block.body}</BlogParagraph>}
        {block.list && <BlogList items={block.list} />}
        {nestedBlocks?.map((sub, i) => (
          <div key={`${sub.heading ?? "sub"}-${i}`} className="mt-6 border-l-2 border-[var(--border)] pl-5">
            {sub.heading && (
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{sub.heading}</h3>
            )}
            <ArticleBlockContent block={sub} variant="blog" depth={depth + 1} />
          </div>
        ))}
      </>
    );
  }

  return (
    <div className={cn(depth > 0 && "border-l border-[var(--border)] pl-4")}>
      {block.body && <p className="text-sm leading-relaxed text-[var(--muted)]">{block.body}</p>}
      {block.list && <GuideList items={block.list} />}
      {nestedBlocks && (
        <div className="mt-3 space-y-3">
          {nestedBlocks.map((sub, i) => (
            <div key={`${sub.heading ?? "sub"}-${i}`}>
              {sub.heading && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
                  {sub.heading}
                </p>
              )}
              <ArticleBlockContent block={sub} variant="guide" depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogSection({ block, index }: { block: ArticleBlock; index: number }) {
  const slug = sectionSlug(block, index);

  if (!block.heading) {
    return (
      <div className="space-y-5">
        <ArticleBlockContent block={block} variant="blog" />
      </div>
    );
  }

  return (
    <section id={slug} className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.35rem]">
        {block.heading}
      </h2>
      <div className="mt-4">
        <ArticleBlockContent block={block} variant="blog" />
      </div>
    </section>
  );
}

function GuideSectionCard({ block, index }: { block: ArticleBlock; index: number }) {
  if (!block.heading) {
    return (
      <div className={cn(ui.card, ui.cardPad)}>
        <ArticleBlockContent block={block} variant="guide" />
      </div>
    );
  }

  const kind = classifySectionHeading(block.heading);
  const Icon = KIND_ICON[kind];
  const slug = sectionSlug(block, index);

  return (
    <section id={slug} className={cn(ui.card, "overflow-hidden")}>
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
        <ArticleBlockContent block={block} variant="guide" />
      </div>
    </section>
  );
}

export function ArticleSections({
  sections,
  variant,
}: {
  sections: ArticleBlock[];
  variant: ArticleBodyVariant;
}) {
  if (variant === "blog") {
    return (
      <div className="article-prose space-y-10 sm:space-y-12">
        {sections.map((section, i) => (
          <BlogSection key={`section-${i}`} block={section} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <GuideSectionCard key={`section-${i}`} block={section} index={i} />
      ))}
    </div>
  );
}

/** @deprecated Use ArticleBlockContent with variant="guide" */
export function BlockContent({ block, depth = 0 }: { block: ArticleBlock; depth?: number }) {
  return <ArticleBlockContent block={block} variant="guide" depth={depth} />;
}

/** @deprecated Use ArticleSections with variant="guide" */
export function SectionCard({ block, index }: { block: ArticleBlock; index: number }) {
  return <GuideSectionCard block={block} index={index} />;
}

export function buildSectionToc(sections: ArticleBlock[]) {
  return buildArticleToc(sections, { includeKind: true });
}

export function buildBlogToc(sections: ArticleBlock[]) {
  return buildArticleToc(sections);
}