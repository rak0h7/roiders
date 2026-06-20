import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { fetchAllArticlesAdmin, seedBundledArticles, upsertArticleAdmin } from "@/lib/articles.server";
import { validateArticleWrite } from "@/lib/articleValidation";
import { revalidateArticlePages } from "@/lib/revalidateArticles";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const articles = await fetchAllArticlesAdmin();
    return NextResponse.json({ articles });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load articles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const action = typeof body?.action === "string" ? body.action : "create";

    if (action === "seed") {
      const count = await seedBundledArticles();
      const articles = await fetchAllArticlesAdmin();
      revalidateArticlePages();
      return NextResponse.json({ ok: true, seeded: count, articles });
    }

    const { data, error: validationError } = validateArticleWrite(body);
    if (validationError || !data) {
      return NextResponse.json({ error: validationError ?? "Invalid article" }, { status: 400 });
    }

    const article = await upsertArticleAdmin(data);
    revalidateArticlePages(article.id);
    return NextResponse.json({ article });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save article" },
      { status: 500 },
    );
  }
}