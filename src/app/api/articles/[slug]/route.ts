import { NextResponse, type NextRequest } from "next/server";
import { fetchArticleBySlug } from "@/lib/articles.server";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    const article = await fetchArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json(
      { article },
      {
        headers: {
          "Cache-Control": user
            ? "private, no-store"
            : "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load article" },
      { status: 500 },
    );
  }
}