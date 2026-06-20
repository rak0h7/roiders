import type { Article } from "@/lib/articleTypes";

export const ARTICLES_CACHE_CLEAR_EVENT = "roiders:articles-cache-clear";

let cachedArticles: Article[] | null = null;

export function getCachedArticles(): Article[] | null {
  return cachedArticles;
}

export function setCachedArticles(articles: Article[]): void {
  cachedArticles = articles;
}

export function clearCachedArticles(): void {
  cachedArticles = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ARTICLES_CACHE_CLEAR_EVENT));
  }
}