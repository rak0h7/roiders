import type { Article, ArticleBlock, ArticleCategory } from "@/lib/articleTypes";

const CATEGORIES: ArticleCategory[] = ["gear", "training", "diet", "health", "general"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ArticleWriteInput = {
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

export type ArticlePatchInput = Partial<ArticleWriteInput>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateBlock(block: unknown, path: string): string | null {
  if (!isObject(block)) return `${path}: must be an object`;
  if (block.heading !== undefined && typeof block.heading !== "string") {
    return `${path}.heading must be a string`;
  }
  if (block.body !== undefined && typeof block.body !== "string") {
    return `${path}.body must be a string`;
  }
  if (block.list !== undefined) {
    if (!Array.isArray(block.list) || block.list.some((item) => typeof item !== "string")) {
      return `${path}.list must be an array of strings`;
    }
  }
  if (block.blocks !== undefined) {
    if (!Array.isArray(block.blocks)) return `${path}.blocks must be an array`;
    for (let i = 0; i < block.blocks.length; i++) {
      const err = validateBlock(block.blocks[i], `${path}.blocks[${i}]`);
      if (err) return err;
    }
  }
  const hasContent =
    (typeof block.heading === "string" && block.heading.length > 0) ||
    (typeof block.body === "string" && block.body.length > 0) ||
    (Array.isArray(block.list) && block.list.length > 0) ||
    (Array.isArray(block.blocks) && block.blocks.length > 0);
  if (!hasContent) return `${path}: section must have heading, body, list, or nested blocks`;
  return null;
}

function validateSections(sections: unknown): string | null {
  if (!Array.isArray(sections)) return "sections must be an array";
  if (sections.length === 0) return "sections must include at least one block";
  for (let i = 0; i < sections.length; i++) {
    const err = validateBlock(sections[i], `sections[${i}]`);
    if (err) return err;
  }
  return null;
}

function validateSlug(id: unknown): string | null {
  if (typeof id !== "string" || !id.trim()) return "id is required";
  const slug = id.trim();
  if (!SLUG_RE.test(slug)) return "id must be kebab-case (lowercase letters, numbers, hyphens)";
  if (slug.length > 120) return "id is too long";
  return null;
}

function validateTitle(title: unknown): string | null {
  if (typeof title !== "string" || !title.trim()) return "title is required";
  if (title.trim().length > 240) return "title is too long";
  return null;
}

function validateCategory(category: unknown): string | null {
  if (typeof category !== "string" || !CATEGORIES.includes(category as ArticleCategory)) {
    return `category must be one of: ${CATEGORIES.join(", ")}`;
  }
  return null;
}

function validateIsoDate(field: string, value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return `${field} must be an ISO date string`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `${field} must be a valid date`;
  return null;
}

export function validateArticleWrite(body: unknown): { data?: ArticleWriteInput; error?: string } {
  if (!isObject(body)) return { error: "Invalid request body" };

  const idErr = validateSlug(body.id);
  if (idErr) return { error: idErr };
  const titleErr = validateTitle(body.title);
  if (titleErr) return { error: titleErr };
  const categoryErr = validateCategory(body.category);
  if (categoryErr) return { error: categoryErr };
  const sectionsErr = validateSections(body.sections);
  if (sectionsErr) return { error: sectionsErr };

  const publishedErr = validateIsoDate("publishedAt", body.publishedAt);
  if (publishedErr) return { error: publishedErr };

  if (body.seriesOrder !== undefined && body.seriesOrder !== null) {
    const n = Number(body.seriesOrder);
    if (!Number.isInteger(n) || n < 1 || n > 999) {
      return { error: "seriesOrder must be an integer between 1 and 999" };
    }
  }

  return {
    data: {
      id: (body.id as string).trim(),
      title: (body.title as string).trim(),
      tagline: typeof body.tagline === "string" ? body.tagline.trim() || null : null,
      category: body.category as ArticleCategory,
      sections: body.sections as ArticleBlock[],
      coverImage: typeof body.coverImage === "string" ? body.coverImage.trim() || null : null,
      coverImageAlt: typeof body.coverImageAlt === "string" ? body.coverImageAlt.trim() || null : null,
      seriesOrder:
        body.seriesOrder === undefined || body.seriesOrder === null
          ? null
          : Number(body.seriesOrder),
      publishedAt:
        typeof body.publishedAt === "string" && body.publishedAt
          ? new Date(body.publishedAt).toISOString()
          : null,
    },
  };
}

export function validateArticlePatch(body: unknown): { data?: ArticlePatchInput; error?: string } {
  if (!isObject(body)) return { error: "Invalid request body" };
  if (Object.keys(body).length === 0) return { error: "No fields to update" };

  const patch: ArticlePatchInput = {};

  if (body.id !== undefined) {
    const idErr = validateSlug(body.id);
    if (idErr) return { error: idErr };
    patch.id = (body.id as string).trim();
  }
  if (body.title !== undefined) {
    const titleErr = validateTitle(body.title);
    if (titleErr) return { error: titleErr };
    patch.title = (body.title as string).trim();
  }
  if (body.category !== undefined) {
    const categoryErr = validateCategory(body.category);
    if (categoryErr) return { error: categoryErr };
    patch.category = body.category as ArticleCategory;
  }
  if (body.sections !== undefined) {
    const sectionsErr = validateSections(body.sections);
    if (sectionsErr) return { error: sectionsErr };
    patch.sections = body.sections as ArticleBlock[];
  }
  if (body.tagline !== undefined) {
    patch.tagline = typeof body.tagline === "string" ? body.tagline.trim() || null : null;
  }
  if (body.coverImage !== undefined) {
    patch.coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() || null : null;
  }
  if (body.coverImageAlt !== undefined) {
    patch.coverImageAlt =
      typeof body.coverImageAlt === "string" ? body.coverImageAlt.trim() || null : null;
  }
  if (body.seriesOrder !== undefined) {
    if (body.seriesOrder === null) {
      patch.seriesOrder = null;
    } else {
      const n = Number(body.seriesOrder);
      if (!Number.isInteger(n) || n < 1 || n > 999) {
        return { error: "seriesOrder must be an integer between 1 and 999" };
      }
      patch.seriesOrder = n;
    }
  }
  if (body.publishedAt !== undefined) {
    const publishedErr = validateIsoDate("publishedAt", body.publishedAt);
    if (publishedErr) return { error: publishedErr };
    patch.publishedAt =
      typeof body.publishedAt === "string" && body.publishedAt
        ? new Date(body.publishedAt).toISOString()
        : null;
  }

  return { data: patch };
}

export function articleToWriteInput(article: Article): ArticleWriteInput {
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