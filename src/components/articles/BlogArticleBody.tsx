"use client";

import type { ArticleBlock } from "@/lib/articleTypes";
import { buildArticleToc } from "@/lib/articleToc";
import { slugifyHeading } from "@/lib/guideCatalog";
import { cn } from "@/lib/utils";

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
  return (
    <p className="text-[1.05rem] leading-[1.8] text-[var(--foreground)]/85">{children}</p>
  );
}

function BlogSection({ block, index }: { block: ArticleBlock; index: number }) {
  const slug = block.heading ? slugifyHeading(block.heading) : `section-${index}`;

  if (!block.heading) {
    return (
      <div className="space-y-5">
        {block.body && <BlogParagraph>{block.body}</BlogParagraph>}
        {block.list && <BlogList items={block.list} />}
      </div>
    );
  }

  return (
    <section id={slug} className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.35rem]">
        {block.heading}
      </h2>
      {block.body && <div className="mt-4"><BlogParagraph>{block.body}</BlogParagraph></div>}
      {block.list && <BlogList items={block.list} />}
      {block.blocks?.map((sub, i) => (
        <div key={`${sub.heading ?? "sub"}-${i}`} className="mt-6 border-l-2 border-[var(--border)] pl-5">
          {sub.heading && (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{sub.heading}</h3>
          )}
          {sub.body && <div className="mt-2"><BlogParagraph>{sub.body}</BlogParagraph></div>}
          {sub.list && <BlogList items={sub.list} />}
        </div>
      ))}
    </section>
  );
}

export function BlogArticleBody({ sections }: { sections: ArticleBlock[] }) {
  return (
    <div className="article-prose space-y-10 sm:space-y-12">
      {sections.map((section, i) => (
        <BlogSection key={`section-${i}`} block={section} index={i} />
      ))}
    </div>
  );
}

export function buildBlogToc(sections: ArticleBlock[]) {
  return buildArticleToc(sections);
}