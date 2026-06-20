import type { Article, ArticleCategory } from "@/lib/articleTypes";

export interface ArticleCoverStyle {
  gradient: string;
  glow: string;
  accentVar: string;
}

const CATEGORY_COVER: Record<ArticleCategory, ArticleCoverStyle> = {
  gear: {
    gradient:
      "linear-gradient(135deg, color-mix(in srgb, var(--protocol) 42%, transparent) 0%, color-mix(in srgb, var(--labs) 18%, var(--bg-elevated)) 55%, var(--bg-surface) 100%)",
    glow: "var(--protocol-glow)",
    accentVar: "--protocol",
  },
  training: {
    gradient:
      "linear-gradient(135deg, color-mix(in srgb, var(--protocol) 35%, transparent) 0%, color-mix(in srgb, var(--labs) 22%, var(--bg-elevated)) 60%, var(--bg-surface) 100%)",
    glow: "var(--protocol-glow)",
    accentVar: "--protocol",
  },
  diet: {
    gradient:
      "linear-gradient(135deg, color-mix(in srgb, var(--intel) 40%, transparent) 0%, color-mix(in srgb, var(--protocol) 14%, var(--bg-elevated)) 55%, var(--bg-surface) 100%)",
    glow: "var(--intel-glow)",
    accentVar: "--intel",
  },
  health: {
    gradient:
      "linear-gradient(135deg, color-mix(in srgb, var(--labs) 38%, transparent) 0%, color-mix(in srgb, var(--intel) 16%, var(--bg-elevated)) 58%, var(--bg-surface) 100%)",
    glow: "var(--labs-glow)",
    accentVar: "--labs",
  },
  general: {
    gradient:
      "linear-gradient(135deg, color-mix(in srgb, var(--intel) 28%, transparent) 0%, color-mix(in srgb, var(--accent) 12%, var(--bg-elevated)) 55%, var(--bg-surface) 100%)",
    glow: "var(--intel-glow)",
    accentVar: "--intel",
  },
};

/** Slight hue shift per article id so cards in the same category don't look identical. */
function articleHueOffset(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return hash;
}

export function getArticleCoverStyle(article: Pick<Article, "id" | "category">): ArticleCoverStyle {
  const base = CATEGORY_COVER[article.category];
  const offset = articleHueOffset(article.id);
  return {
    ...base,
    gradient: `${base.gradient}, linear-gradient(${120 + (offset % 40)}deg, transparent 40%, color-mix(in srgb, var(${base.accentVar}) 8%, transparent) 100%)`,
  };
}

export function getArticleCoverAlt(article: Pick<Article, "title" | "coverImageAlt">): string {
  return article.coverImageAlt ?? `Cover art for ${article.title}`;
}