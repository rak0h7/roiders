import { NextResponse } from "next/server";
import { fetchPublishedArticles } from "@/lib/articles.server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const articles = await fetchPublishedArticles();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json(
      { articles },
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
      { error: e instanceof Error ? e.message : "Failed to load articles" },
      { status: 500 },
    );
  }
}