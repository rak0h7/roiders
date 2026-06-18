import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

/** Indexable marketing and legal pages — server-rendered, no auth required. */
export const PUBLIC_ALLOW_PATHS = [
  "/",
  "/about",
  "/features/",
  "/auth/login",
  "/auth/signup",
  "/terms",
  "/privacy",
] as const;

/** Private app, admin, and API surfaces — never index. */
export const PRIVATE_DISALLOW_PATHS = [
  "/admin",
  "/api/",
  "/welcome",
  "/maintenance",
  "/labs/",
  "/cycle/",
  "/gym/",
  "/nutrition/",
  "/settings",
] as const;

/** Major search and social preview crawlers. */
export const SEARCH_CRAWLER_USER_AGENTS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "Applebot",
  "facebot",
  "Twitterbot",
  "LinkedInBot",
  "Pinterestbot",
  "Slackbot",
  "TelegramBot",
  "WhatsApp",
  "Discordbot",
  "SemrushBot",
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
] as const;

/** LLM, AI search, and training crawlers — explicitly welcomed on public pages. */
export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "GoogleOther",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "cohere-ai",
  "Cohere-ai",
  "Diffbot",
  "Meta-ExternalAgent",
  "meta-externalagent",
  "Meta-ExternalFetcher",
  "FacebookBot",
  "Amazonbot",
  "YouBot",
  "DuckAssistBot",
  "Bytespider",
  "CCBot",
  "ImagesiftBot",
  "omgili",
  "Timpibot",
  "Webzio-Extended",
  "AI2Bot",
  "FriendlyCrawler",
  "iaskspider",
  "MistralAI-User",
  "NovaAct",
  "Quora-Bot",
  "img2dataset",
] as const;

type CrawlRule = {
  allow: string[];
  disallow: string[];
};

function crawlRules(): CrawlRule {
  return {
    allow: [...PUBLIC_ALLOW_PATHS],
    disallow: [...PRIVATE_DISALLOW_PATHS],
  };
}

export function buildRobotsMetadata(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const rules = crawlRules();

  return {
    rules: [
      { userAgent: "*", ...rules },
      { userAgent: [...SEARCH_CRAWLER_USER_AGENTS], ...rules },
      { userAgent: [...AI_CRAWLER_USER_AGENTS], ...rules },
    ],
    host: new URL(base).host,
    sitemap: `${base}/sitemap.xml`,
  };
}