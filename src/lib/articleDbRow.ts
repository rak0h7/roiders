import type { Article, ArticleBlock, ArticleCategory } from "@/lib/articleTypes";

export type ArticleDbRow = {
  id: string;
  title: string;
  tagline: string | null;
  category: ArticleCategory;
  sections: ArticleBlock[];
  cover_image: string | null;
  cover_image_alt: string | null;
  series_order: number | null;
  published_at: string | null;
  updated_at: string;
};

export type ArticleWriteRowInput = {
  id: string;
  title: string;
  tagline?: string | null;
  category: ArticleCategory;
  sections: ArticleBlock[];
  coverImage?: string | null;
  coverImageAlt?: string | null;
  seriesOrder?: number | null;
  publishedAt?: string | null;
};

/** Normalize date-only or ISO strings to timestamptz for Postgres. */
export function normalizePublishedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T12:00:00.000Z`;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function articleToDbRow(input: ArticleWriteRowInput): ArticleDbRow {
  return {
    id: input.id,
    title: input.title,
    tagline: input.tagline ?? null,
    category: input.category,
    sections: input.sections,
    cover_image: input.coverImage ?? null,
    cover_image_alt: input.coverImageAlt ?? null,
    series_order: input.seriesOrder ?? null,
    published_at: normalizePublishedAt(input.publishedAt),
    updated_at: new Date().toISOString(),
  };
}

export function bundledArticleToWriteInput(article: Article): ArticleWriteRowInput {
  return {
    id: article.id,
    title: article.title,
    tagline: article.tagline ?? null,
    category: article.category,
    sections: article.sections,
    coverImage: article.coverImage ?? null,
    coverImageAlt: article.coverImageAlt ?? null,
    seriesOrder: article.seriesOrder ?? null,
    publishedAt: article.publishedAt ?? null,
  };
}