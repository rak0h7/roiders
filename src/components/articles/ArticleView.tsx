"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MedicalDisclaimer } from "@/components/ui/MedicalDisclaimer";
import { BlogArticleBody, buildBlogToc } from "@/components/articles/BlogArticleBody";
import type { Article } from "@/lib/articleTypes";
import { getArticleCategory } from "@/lib/articleCatalog";
import { formatArticleDate } from "@/lib/articleFormat";
import { cn } from "@/lib/utils";

type Props = {
  article: Article;
  backHref?: string;
  embedded?: boolean;
};

export function ArticleView({ article, backHref = "/articles", embedded = false }: Props) {
  const category = getArticleCategory(article.category);
  const toc = buildBlogToc(article.sections);
  const published = formatArticleDate(article.publishedAt);
  const updated =
    article.updatedAt && article.updatedAt !== article.publishedAt
      ? formatArticleDate(article.updatedAt)
      : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All articles
      </Link>

      <header
        className={cn(
          "border-b border-[var(--border)] pb-8 sm:pb-10",
          embedded ? "mt-4" : "mt-8 sm:mt-10",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
          <span className="font-medium text-[var(--intel)]">{category.title}</span>
          {published && (
            <>
              <span aria-hidden className="text-[var(--muted-2)]">
                ·
              </span>
              <time dateTime={article.publishedAt}>{published}</time>
            </>
          )}
          {updated && (
            <>
              <span aria-hidden className="text-[var(--muted-2)]">
                ·
              </span>
              <span>Updated {updated}</span>
            </>
          )}
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-4xl sm:leading-[1.12]">
          {article.title}
        </h1>
        {article.tagline && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl sm:leading-relaxed">
            {article.tagline}
          </p>
        )}
      </header>

      <div className={cn(toc.length > 2 && "lg:grid lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_12.5rem] xl:gap-16")}>
        <div className="min-w-0 pt-8 sm:pt-10">
          <BlogArticleBody sections={article.sections} />
          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <MedicalDisclaimer variant="blog" />
          </div>
        </div>

        {toc.length > 2 && (
          <aside className="hidden lg:block">
            <nav
              className="sticky top-24 border-l border-[var(--border)] pl-4"
              aria-label="On this page"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)]">
                On this page
              </p>
              <ol className="mt-4 space-y-2.5">
                {toc.map((item) => (
                  <li key={item.slug}>
                    <a
                      href={`#${item.slug}`}
                      className="block text-sm leading-snug text-[var(--muted)] transition hover:text-[var(--foreground)]"
                    >
                      {item.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
}