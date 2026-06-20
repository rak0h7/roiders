import { notFound } from "next/navigation";
import { AuthenticatedAppShell } from "@/components/app/AuthenticatedAppShell";
import { ArticlesIndex } from "@/components/articles/ArticlesIndex";
import { ArticlesPageShell } from "@/components/articles/ArticlesPageShell";
import { ArticlesBootstrapProvider } from "@/context/ArticlesBootstrapContext";
import { fetchPublishedArticles } from "@/lib/articles.server";
import { isArticlesModuleEnabled } from "@/lib/articleCatalog";
import { buildPageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { fetchSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await fetchSiteSettings();
  return buildPageMetadata({
    title: "Articles",
    description:
      "Reference articles on gear, training, diet, and health monitoring — educational content from Roiders Club.",
    path: "/articles",
  });
}

export default async function ArticlesPage() {
  const settings = await fetchSiteSettings();
  if (!isArticlesModuleEnabled(settings)) notFound();

  const articles = await fetchPublishedArticles();
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

  return (
    <ArticlesPageShell siteName={settings.site_name} isAuthenticated={false} layout="index">
      <ArticlesIndex articles={articles} />
    </ArticlesPageShell>
  );
}