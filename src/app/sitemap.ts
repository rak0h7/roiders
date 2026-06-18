import type { MetadataRoute } from "next";
import { FEATURE_SLUGS } from "@/lib/featurePages";
import { getSiteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const featurePages: MetadataRoute.Sitemap = [
    { url: `${base}/features`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    ...FEATURE_SLUGS.map((slug) => ({
      url: `${base}/features/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...featurePages,
    { url: `${base}/auth/login`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/auth/signup`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}