import { describe, expect, it } from "vitest";
import { resolveArticleBySlug, resolveDbArticleList } from "./articles.server";
import type { Article, ArticleBlock, ArticleCategory } from "./articleTypes";

const FALLBACK: Article[] = [
  {
    id: "bundled-only",
    title: "Bundled",
    category: "general",
    sections: [],
  },
];

type Row = {
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

function mapRow(row: Row): Article {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    sections: [],
  };
}

const DB_ROW: Row = {
  id: "db-article",
  title: "Database",
  tagline: null,
  category: "health",
  sections: [],
  cover_image: null,
  cover_image_alt: null,
  series_order: null,
  published_at: "2026-06-01T12:00:00.000Z",
  updated_at: "2026-06-19T12:00:00.000Z",
  created_at: "2026-06-01T12:00:00.000Z",
};

describe("resolveDbArticleList", () => {
  it("uses bundled fallback only when rows is null", () => {
    expect(resolveDbArticleList(null, FALLBACK, mapRow)).toEqual(FALLBACK);
  });

  it("returns an empty list when the table is empty", () => {
    expect(resolveDbArticleList([], FALLBACK, mapRow)).toEqual([]);
  });

  it("maps database rows when present", () => {
    expect(resolveDbArticleList([DB_ROW], FALLBACK, mapRow)).toEqual([
      { id: "db-article", title: "Database", category: "health", sections: [] },
    ]);
  });
});

describe("resolveArticleBySlug", () => {
  it("falls back to bundled articles when the DB layer is unavailable", () => {
    expect(resolveArticleBySlug(null, "bundled-only", FALLBACK, mapRow)).toEqual(FALLBACK[0]);
  });

  it("returns undefined when the DB is reachable but the slug is missing", () => {
    expect(resolveArticleBySlug(undefined, "missing", FALLBACK, mapRow)).toBeUndefined();
  });

  it("maps a database row when found", () => {
    expect(resolveArticleBySlug(DB_ROW, "db-article", FALLBACK, mapRow)).toEqual({
      id: "db-article",
      title: "Database",
      category: "health",
      sections: [],
    });
  });
});