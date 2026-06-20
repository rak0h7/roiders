"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArticlesIndex } from "@/components/articles/ArticlesIndex";
import { ArticleView } from "@/components/articles/ArticleView";
import { EmptyState } from "@/components/ui/EmptyState";
import { useArticlesBootstrap } from "@/context/ArticlesBootstrapContext";
import type { Article } from "@/lib/articleTypes";
import {
  ARTICLES_CACHE_CLEAR_EVENT,
  getCachedArticles,
  setCachedArticles,
} from "@/lib/articlesClientCache";
import { getArticleBySlug } from "@/lib/articleCatalog";
import { articleSlugFromPathname } from "@/lib/appRoutes";
import { ui } from "@/lib/ui";
import { BookOpen, Loader2 } from "lucide-react";

function initialArticlesState(bootstrap: Article[] | null): Article[] | null {
  if (bootstrap) return bootstrap;
  return getCachedArticles();
}

async function fetchArticlesFromApi(): Promise<Article[]> {
  const res = await fetch("/api/articles", { credentials: "same-origin" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load articles");
  return data.articles ?? [];
}

export function ArticlesView() {
  const pathname = usePathname();
  const slug = articleSlugFromPathname(pathname);
  const bootstrap = useArticlesBootstrap();
  const [articles, setArticles] = useState<Article[] | null>(() => initialArticlesState(bootstrap));
  const [error, setError] = useState<string | null>(null);

  const loadFromApi = useCallback(async () => {
    const next = await fetchArticlesFromApi();
    setCachedArticles(next);
    setArticles(next);
    setError(null);
    return next;
  }, []);

  useEffect(() => {
    if (bootstrap) {
      setCachedArticles(bootstrap);
      setArticles(bootstrap);
      return;
    }

    const cached = getCachedArticles();
    if (cached) {
      setArticles(cached);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchArticlesFromApi();
        if (!cancelled) {
          setCachedArticles(next);
          setArticles(next);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load articles");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrap]);

  useEffect(() => {
    const onCacheClear = () => {
      setArticles(null);
      setError(null);
      void loadFromApi().catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load articles");
      });
    };

    window.addEventListener(ARTICLES_CACHE_CLEAR_EVENT, onCacheClear);
    return () => window.removeEventListener(ARTICLES_CACHE_CLEAR_EVENT, onCacheClear);
  }, [loadFromApi]);

  if (error) {
    return (
      <EmptyState
        icon={BookOpen}
        variant="intel"
        title="Could not load articles"
        description={error}
      />
    );
  }

  if (!articles) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[var(--muted)]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading articles…
      </div>
    );
  }

  if (!slug) {
    return <ArticlesIndex articles={articles} embedded />;
  }

  const article = getArticleBySlug(articles, slug);
  if (!article) {
    return (
      <EmptyState
        icon={BookOpen}
        variant="intel"
        title="Article not found"
        description="That article may have been removed or the link is incorrect."
        action={
          <Link href="/articles" className={ui.btnSecondary}>
            Back to articles
          </Link>
        }
      />
    );
  }

  return <ArticleView article={article} backHref="/articles" embedded />;
}