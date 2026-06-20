import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const DEFAULT_SITE_DESCRIPTION =
  "Roiders Club is a free performance health tracker at roiders.club — bloodwork analysis, cycle planning, workout logging, and macro tracking in one private dashboard. Not motorcycle Riders Club sites.";

export const SITE_KEYWORDS = [
  "Roiders Club",
  "roiders.club",
  "bloodwork tracker",
  "lab analysis",
  "cycle planner",
  "performance health",
  "TRT tracking",
  "macro tracker",
];

export function resolveSiteDescription(description: string, tagline?: string): string {
  const trimmed = description.trim();
  if (trimmed) return trimmed;
  const tag = tagline?.trim();
  if (tag) return `${DEFAULT_SITE_DESCRIPTION.split("—")[0].trim()} — ${tag}`;
  return DEFAULT_SITE_DESCRIPTION;
}

type PageMetaInput = {
  title: string;
  description: string;
  path?: string;
};

export const PRIVATE_PAGE_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

export function buildPageMetadata({ title, description, path = "" }: PageMetaInput): Metadata {
  const base = getSiteUrl();
  const url = path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Roiders Club",
      type: "website",
      images: [{ url: `${base}/og.png`, width: 1200, height: 630, alt: "Roiders Club" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${base}/og.png`],
    },
  };
}

export function webSiteJsonLd(description: string) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: "Roiders Club",
        description,
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "Roiders Club",
        url,
        description,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/#software`,
        name: "Roiders Club",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        featureList: ["Labs bloodwork tracking", "Gear cycle planning", "Training workout log"],
        publisher: { "@id": `${url}/#organization` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        url,
        description,
      },
    ],
  };
}

export type FaqItem = { question: string; answer: string };

export const PUBLIC_FAQ: FaqItem[] = [
  {
    question: "What is roiders.club?",
    answer:
      "A free performance health web app for bloodwork analysis, cycle planning, and training — all in one private dashboard.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. Labs, gear, and training trackers are free. Optional premium adds cloud sync and is available on request.",
  },
];

export function featurePageJsonLd(page: {
  slug: string;
  h1: string;
  metaDescription: string;
  highlights: string[];
  title: string;
}) {
  const base = getSiteUrl();
  const url = `${base}/features/${page.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: page.h1,
        description: page.metaDescription,
        isPartOf: { "@id": `${base}/#website` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/#feature`,
        name: `Roiders Club — ${page.title}`,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        featureList: page.highlights,
        publisher: { "@id": `${base}/#organization` },
        url: base,
        description: page.metaDescription,
      },
    ],
  };
}

export function articlePageJsonLd(article: {
  id: string;
  title: string;
  tagline?: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  const base = getSiteUrl();
  const url = `${base}/articles/${article.id}`;
  const description = article.tagline ?? article.title;
  const dateModified = article.updatedAt ?? article.publishedAt;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}/#article`,
        headline: article.title,
        description,
        url,
        datePublished: article.publishedAt,
        dateModified,
        isPartOf: { "@id": `${base}/#website` },
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: article.title,
        description,
        isPartOf: { "@id": `${base}/#website` },
      },
    ],
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

