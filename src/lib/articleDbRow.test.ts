import { describe, expect, it } from "vitest";
import {
  articleToDbRow,
  bundledArticleToWriteInput,
  normalizePublishedAt,
} from "./articleDbRow";
import type { Article } from "./articleTypes";

const SAMPLE: Article = {
  id: "sample-article",
  title: "Sample",
  category: "general",
  sections: [{ heading: "Intro", body: "Hello" }],
  publishedAt: "2026-06-01",
};

describe("normalizePublishedAt", () => {
  it("converts date-only strings to noon UTC", () => {
    expect(normalizePublishedAt("2026-06-01")).toBe("2026-06-01T12:00:00.000Z");
  });

  it("passes through ISO timestamps", () => {
    expect(normalizePublishedAt("2026-06-01T08:30:00.000Z")).toBe("2026-06-01T08:30:00.000Z");
  });

  it("returns null for empty values", () => {
    expect(normalizePublishedAt(null)).toBeNull();
    expect(normalizePublishedAt("")).toBeNull();
  });
});

describe("articleToDbRow", () => {
  it("maps app fields to database columns", () => {
    const row = articleToDbRow(bundledArticleToWriteInput(SAMPLE));
    expect(row.id).toBe("sample-article");
    expect(row.cover_image).toBeNull();
    expect(row.published_at).toBe("2026-06-01T12:00:00.000Z");
    expect(row.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("bundledArticleToWriteInput", () => {
  it("fills optional article fields with null", () => {
    const input = bundledArticleToWriteInput(SAMPLE);
    expect(input.tagline).toBeNull();
    expect(input.coverImage).toBeNull();
    expect(input.seriesOrder).toBeNull();
  });
});