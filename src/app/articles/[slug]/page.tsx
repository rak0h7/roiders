import { notFound } from "next/navigation";
import { AuthenticatedAppShell } from "@/components/app/AuthenticatedAppShell";
import { ArticleView } from "@/components/articles/ArticleView";
import { ArticlesPageShell } from "@/components/articles/ArticlesPageShell";
import { ArticlesBootstrapProvider } from "@/context/ArticlesBootstrapContext";
import { getArticleBySlug, isArticlesModuleEnabled } from "@/lib/articleCatalog";
import { fetchArticleBySlug, fetchPublishedArticles } from "@/lib/articles.server";
import { articlePageJsonLd, buildPageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { fetchSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await fetchPublishedArticles();
  return articles.map((article) => ({ slug: article.id }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return {};

  return buildPageMetadata({
    title: article.title,
    description: article.tagline ?? `Reference article: ${article.title}`,
    path: `/articles/${slug}`,
  });
}

export default async function ArticleSlugPage({ params }: Props) {
  const settings = await fetchSiteSettings();
  if (!isArticlesModuleEnabled(settings)) notFound();

  const { slug } = await params;
  const articles = await fetchPublishedArticles();
  const article = getArticleBySlug(articles, slug);
  if (!article) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <ArticlesBootstrapProvider articles={articles}>
        <AuthenticatedAppShell />
      </ArticlesBootstrapProvider>
    );
  }

  const jsonLd = articlePageJsonLd(article);

  return (
    <ArticlesPageShell siteName={settings.site_name} isAuthenticated={false} layout="article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleView article={article} />
    </ArticlesPageShell>
  );
}