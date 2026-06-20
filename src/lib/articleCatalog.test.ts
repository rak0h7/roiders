import { describe, expect, it } from "vitest";
import { ARTICLES } from "@/data/articles";
import {
  buildArticleCatalog,
  filterArticles,
  getArticleBySlug,
  matchesArticleQuery,
} from "./articleCatalog";

describe("articleCatalog", () => {
  it("exports stable slugs for sitemap fixtures", () => {
    expect(ARTICLES.length).toBeGreaterThanOrEqual(11);
    expect(ARTICLES.some((a) => a.id === "pct-basics")).toBe(true);
    expect(ARTICLES.some((a) => a.id === "why-cut-what-to-expect")).toBe(true);
  });

  it("looks up articles by slug", () => {
    const article = getArticleBySlug(ARTICLES, "pct-basics");
    expect(article?.title).toContain("PCT");
    expect(article?.category).toBe("gear");
  });

  it("builds sorted catalog entries", () => {
    const entries = buildArticleCatalog(ARTICLES);
    expect(entries.length).toBe(ARTICLES.length);
    expect(entries.every((e) => e.categoryTitle.length > 0)).toBe(true);
  });

  it("filters by search query", () => {
    const entries = filterArticles(ARTICLES, "lipid", "all");
    expect(entries.some((e) => e.article.id === "lipid-panel-primer")).toBe(true);
    expect(matchesArticleQuery(getArticleBySlug(ARTICLES, "pct-basics")!, "post-cycle")).toBe(true);
  });

  it("filters by category", () => {
    const training = filterArticles(ARTICLES, "", "training");
    expect(training.every((e) => e.article.category === "training")).toBe(true);
    expect(training.length).toBeGreaterThan(0);

    const diet = filterArticles(ARTICLES, "", "diet");
    expect(diet.every((e) => e.article.category === "diet")).toBe(true);
    expect(diet.length).toBeGreaterThanOrEqual(8);
  });
});