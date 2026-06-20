"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ArticleCoverImage } from "@/components/articles/ArticleCoverImage";
import {
  ARTICLE_CATEGORIES,
  filterArticles,
  getArticleCategory,
  type ArticleCategoryFilter,
  type ArticleListEntry,
} from "@/lib/articleCatalog";
import type { Article } from "@/lib/articleTypes";
import { formatArticleDate } from "@/lib/articleFormat";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

function ArticleCard({ entry }: { entry: ArticleListEntry }) {
  const { article, categoryTitle } = entry;
  const category = getArticleCategory(article.category);
  const date = formatArticleDate(article.publishedAt);

  return (
    <article className="h-full">
      <Link
        href={`/articles/${article.id}`}
        className={cn(
          ui.card,
          ui.cardHover,
          "group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5",
        )}
      >
        <ArticleCoverImage article={article} category={category} />
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
            <span className="font-medium text-[var(--intel)]">{categoryTitle}</span>
            {date && (
              <>
                <span aria-hidden className="text-[var(--muted-2)]">
                  ·
                </span>
                <time dateTime={article.publishedAt}>{date}</time>
              </>
            )}
          </div>
          <h2 className="mt-2.5 font-display text-lg font-semibold leading-snug tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--intel)] sm:text-xl">
            {article.title}
          </h2>
          {article.tagline && (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
              {article.tagline}
            </p>
          )}
          <p className="mt-4 text-xs font-semibold text-[var(--intel)] opacity-80 transition group-hover:opacity-100">
            Read article →
          </p>
        </div>
      </Link>
    </article>
  );
}

type ArticlesIndexProps = {
  articles: Article[];
  /** When rendered inside AppShell, TopBar already shows the page title. */
  embedded?: boolean;
};

export function ArticlesIndex({ articles, embedded = false }: ArticlesIndexProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ArticleCategoryFilter>("all");

  const entries = useMemo(
    () => filterArticles(articles, query, activeCategory),
    [articles, query, activeCategory],
  );

  const browseMode = !query.trim() && activeCategory === "all";

  return (
    <div>
      <header
        className={cn(
          "max-w-3xl",
          embedded ? "pb-2" : "border-b border-[var(--border)] pb-8 sm:pb-10",
        )}
      >
        {!embedded && (
          <>
            <p className="text-sm font-medium text-[var(--intel)]">Roiders Club</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Articles
            </h1>
          </>
        )}
        <p className={cn("text-base leading-relaxed text-[var(--muted)]", !embedded && "mt-4")}>
          Reference writing on gear, training, diet, and health — educational only, not medical advice.
        </p>
      </header>

      <div className="mt-8 max-w-3xl space-y-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-2)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="h-11 w-full border-0 border-b border-[var(--border)] bg-transparent pl-7 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-2)] focus:border-[var(--intel)]/50 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "transition",
              activeCategory === "all"
                ? "font-medium text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            All
          </button>
          {ARTICLE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "transition",
                activeCategory === cat.id
                  ? "font-medium text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--muted)]">No articles match your search.</p>
      ) : browseMode ? (
        <div className="mt-10 space-y-12">
          {ARTICLE_CATEGORIES.map((cat) => {
            const catEntries = entries.filter((e) => e.article.category === cat.id);
            if (catEntries.length === 0) return null;
            return (
              <section key={cat.id}>
                <div className="mb-5 max-w-3xl border-b border-[var(--border)] pb-3">
                  <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">{cat.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{cat.description}</p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catEntries.map((entry) => (
                    <li key={entry.article.id} className="min-h-0">
                      <ArticleCard entry={entry} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <li key={entry.article.id} className="min-h-0">
              <ArticleCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}