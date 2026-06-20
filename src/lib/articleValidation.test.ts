import { describe, expect, it } from "vitest";
import { validateArticlePatch, validateArticleWrite } from "./articleValidation";

const validArticle = {
  id: "test-article",
  title: "Test Article",
  tagline: "A tagline",
  category: "diet" as const,
  sections: [{ heading: "Intro", body: "Body copy." }],
  publishedAt: "2026-06-20",
};

describe("articleValidation", () => {
  it("accepts valid article writes", () => {
    const result = validateArticleWrite(validArticle);
    expect(result.error).toBeUndefined();
    expect(result.data?.id).toBe("test-article");
  });

  it("rejects invalid slugs", () => {
    const result = validateArticleWrite({ ...validArticle, id: "Bad Slug" });
    expect(result.error).toContain("kebab-case");
  });

  it("rejects empty sections", () => {
    const result = validateArticleWrite({ ...validArticle, sections: [] });
    expect(result.error).toContain("at least one");
  });

  it("accepts partial patches", () => {
    const result = validateArticlePatch({ title: "Updated title" });
    expect(result.error).toBeUndefined();
    expect(result.data?.title).toBe("Updated title");
  });
});