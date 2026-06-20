import { ARTICLES } from "@/data/articles";
import { articleToDbRow, bundledArticleToWriteInput } from "@/lib/articleDbRow";
import type { Article, ArticleBlock, ArticleCategory } from "@/lib/articleTypes";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey } from "@/lib/supabase/env";

const ARTICLE_COLUMNS =
  "id, title, tagline, category, sections, cover_image, cover_image_alt, series_order, published_at, updated_at, created_at";

type ArticleRow = {
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
  created_at: string;
};

function toIsoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

export function mapArticleRow(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline ?? undefined,
    category: row.category,
    sections: row.sections ?? [],
    coverImage: row.cover_image ?? undefined,
    coverImageAlt: row.cover_image_alt ?? undefined,
    seriesOrder: row.series_order ?? undefined,
    publishedAt: toIsoDate(row.published_at),
    updatedAt: toIsoDate(row.updated_at),
  };
}

export function mapArticleToRow(input: Parameters<typeof articleToDbRow>[0]) {
  return articleToDbRow(input);
}

function isMissingArticlesTable(message: string): boolean {
  return message.includes("Could not find the table");
}

async function fetchArticleRows(): Promise<ArticleRow[] | null> {
  if (!hasServiceRoleKey()) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error) {
      if (isMissingArticlesTable(error.message)) return null;
      throw new Error(error.message);
    }
    return (data ?? []) as ArticleRow[];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (isMissingArticlesTable(message)) return null;
    throw e;
  }
}

async function fetchArticleRowById(slug: string): Promise<ArticleRow | null | undefined> {
  if (!hasServiceRoleKey()) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("id", slug)
      .maybeSingle();

    if (error) {
      if (isMissingArticlesTable(error.message)) return null;
      throw new Error(error.message);
    }
    if (!data) return undefined;
    return data as ArticleRow;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (isMissingArticlesTable(message)) return null;
    throw e;
  }
}

/** DB unavailable (`null`) → bundled fallback; empty table (`[]`) → no articles. */
export function resolveDbArticleList(
  rows: ArticleRow[] | null,
  fallback: Article[],
  mapRow: (row: ArticleRow) => Article = mapArticleRow,
): Article[] {
  if (rows === null) return [...fallback];
  return rows.map(mapRow);
}

export function resolveArticleBySlug(
  row: ArticleRow | null | undefined,
  slug: string,
  fallback: Article[],
  mapRow: (row: ArticleRow) => Article = mapArticleRow,
): Article | undefined {
  if (row === null) return fallback.find((article) => article.id === slug);
  if (row === undefined) return undefined;
  return mapRow(row);
}

export async function fetchPublishedArticles(): Promise<Article[]> {
  const rows = await fetchArticleRows();
  return resolveDbArticleList(rows, ARTICLES);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | undefined> {
  const row = await fetchArticleRowById(slug);
  return resolveArticleBySlug(row, slug, ARTICLES);
}

export async function fetchAllArticlesAdmin(): Promise<Article[]> {
  const rows = await fetchArticleRows();
  return resolveDbArticleList(rows, ARTICLES);
}

export async function upsertArticleAdmin(input: Parameters<typeof articleToDbRow>[0]): Promise<Article> {
  const admin = createAdminClient();
  const row = articleToDbRow(input);
  const { data, error } = await admin
    .from("articles")
    .upsert(row, { onConflict: "id" })
    .select(ARTICLE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return mapArticleRow(data as ArticleRow);
}

export async function deleteArticleAdmin(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function seedBundledArticles(): Promise<number> {
  const rows = ARTICLES.map((article) => articleToDbRow(bundledArticleToWriteInput(article)));
  const admin = createAdminClient();
  const { error } = await admin.from("articles").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);
  return rows.length;
}