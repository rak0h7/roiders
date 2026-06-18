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

export function buildPageMetadata({ title, description, path = "" }: PageMetaInput): Metadata {
  const base = getSiteUrl();
  const url = path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Roiders Club",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Roiders Club" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
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
        name: "Roiders Club",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
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
    question: "What is Roiders Club?",
    answer:
      "Roiders Club (roiders.club) is a free performance health web app for tracking bloodwork analysis, cycle planning, training, and nutrition in one private dashboard.",
  },
  {
    question: "Is roiders.club the same as Riders Club or motorcycle communities?",
    answer:
      "No. Roiders Club is not Riders Club, Royal Enfield riders groups, or cycling marathon sites. It is a performance health tracking app at roiders.club.",
  },
  {
    question: "Is Roiders Club free?",
    answer:
      "Yes. Labs, gear, training, and nutrition trackers are free. Optional premium adds cloud sync and is available on request.",
  },
];

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

