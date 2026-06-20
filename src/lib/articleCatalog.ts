import type { Article, ArticleBlock, ArticleCategory } from "@/lib/articleTypes";

export type ArticleCategoryFilter = ArticleCategory | "all";

export interface ArticleCategoryDef {
  id: ArticleCategory;
  title: string;
  description: string;
  icon: string;
}

export interface ArticleListEntry {
  article: Article;
  categoryTitle: string;
}

export const ARTICLE_CATEGORIES: ArticleCategoryDef[] = [
  {
    id: "gear",
    title: "Gear & protocol",
    description: "Cycle planning, PCT, ancillaries, and on-cycle decision-making.",
    icon: "💉",
  },
  {
    id: "training",
    title: "Training",
    description: "Volume, intensity, and recovery while running a protocol.",
    icon: "🏋️",
  },
  {
    id: "diet",
    title: "Diet & body comp",
    description: "Fat loss and nutrition principles — reference only, not food logging.",
    icon: "🥗",
  },
  {
    id: "health",
    title: "Health & labs",
    description: "Reading panels, monitoring risk, and when to escalate.",
    icon: "🩺",
  },
  {
    id: "general",
    title: "General",
    description: "Mindset, logistics, and cross-cutting performance topics.",
    icon: "📖",
  },
];

const CATEGORY_BY_ID = Object.fromEntries(ARTICLE_CATEGORIES.map((c) => [c.id, c])) as Record<
  ArticleCategory,
  ArticleCategoryDef
>;

function flattenBlocks(blocks: ArticleBlock[]): string {
  return blocks
    .map((b) => [b.heading, b.body, ...(b.list ?? []), ...(b.blocks ? [flattenBlocks(b.blocks)] : [])].join(" "))
    .join(" ");
}

export function getArticleCategory(category: ArticleCategory): ArticleCategoryDef {
  return CATEGORY_BY_ID[category];
}

export function getArticleBySlug(articles: Article[], slug: string): Article | undefined {
  return articles.find((a) => a.id === slug);
}

export function buildArticleCatalog(articles: Article[]): ArticleListEntry[] {
  return [...articles]
    .sort((a, b) => {
      const aDate = a.publishedAt ?? "";
      const bDate = b.publishedAt ?? "";
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      const aSeries = a.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const bSeries = b.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      if (aSeries !== bSeries) return aSeries - bSeries;
      return a.title.localeCompare(b.title);
    })
    .map((article) => ({
      article,
      categoryTitle: getArticleCategory(article.category).title,
    }));
}

export function matchesArticleQuery(article: Article, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    article.title,
    article.tagline ?? "",
    article.category,
    getArticleCategory(article.category).title,
    flattenBlocks(article.sections),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function filterArticles(
  articles: Article[],
  query: string,
  category: ArticleCategoryFilter,
): ArticleListEntry[] {
  const entries = buildArticleCatalog(articles);
  return entries.filter(({ article }) => {
    if (category !== "all" && article.category !== category) return false;
    return matchesArticleQuery(article, query);
  });
}

export function isArticlesModuleEnabled(
  settings: Pick<{ module_articles_enabled?: boolean }, "module_articles_enabled">,
): boolean {
  return settings.module_articles_enabled !== false;
}