import type { MetadataRoute } from "next";
import { fetchPublishedArticles } from "@/lib/articles.server";
import { FEATURE_SLUGS } from "@/lib/featurePages";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const lastModified = new Date();
  const articles = await fetchPublishedArticles();

  const featurePages: MetadataRoute.Sitemap = [
    { url: `${base}/features`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    ...FEATURE_SLUGS.map((slug) => ({
      url: `${base}/features/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];

  const articlePages: MetadataRoute.Sitemap = [
    { url: `${base}/articles`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((article) => ({
      url: `${base}/articles/${article.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...featurePages,
    ...articlePages,
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}