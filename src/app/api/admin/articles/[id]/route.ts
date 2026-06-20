import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { normalizePublishedAt } from "@/lib/articleDbRow";
import { deleteArticleAdmin, fetchArticleBySlug, upsertArticleAdmin } from "@/lib/articles.server";
import { validateArticlePatch } from "@/lib/articleValidation";
import { revalidateArticlePages } from "@/lib/revalidateArticles";

type Props = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    const article = await fetchArticleBySlug(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ article });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load article" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    const existing = await fetchArticleBySlug(id);
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const body = await request.json();
    const { data: patch, error: validationError } = validateArticlePatch(body);
    if (validationError || !patch) {
      return NextResponse.json({ error: validationError ?? "Invalid patch" }, { status: 400 });
    }

    if (patch.id && patch.id !== id) {
      return NextResponse.json({ error: "Slug changes are not supported — create a new article instead" }, { status: 400 });
    }

    const article = await upsertArticleAdmin({
      id: existing.id,
      title: patch.title ?? existing.title,
      tagline: patch.tagline !== undefined ? patch.tagline : (existing.tagline ?? null),
      category: patch.category ?? existing.category,
      sections: patch.sections ?? existing.sections,
      coverImage: patch.coverImage !== undefined ? patch.coverImage : (existing.coverImage ?? null),
      coverImageAlt:
        patch.coverImageAlt !== undefined ? patch.coverImageAlt : (existing.coverImageAlt ?? null),
      seriesOrder: patch.seriesOrder !== undefined ? patch.seriesOrder : (existing.seriesOrder ?? null),
      publishedAt:
        patch.publishedAt !== undefined
          ? patch.publishedAt
          : normalizePublishedAt(existing.publishedAt),
    });

    revalidateArticlePages(article.id);
    return NextResponse.json({ article });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update article" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    await deleteArticleAdmin(id);
    revalidateArticlePages(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete article" },
      { status: 500 },
    );
  }
}