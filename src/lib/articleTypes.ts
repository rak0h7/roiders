export type ArticleCategory = "gear" | "training" | "diet" | "health" | "general";

export interface ArticleBlock {
  heading?: string;
  body?: string;
  list?: string[];
  blocks?: ArticleBlock[];
}

export interface Article {
  id: string;
  title: string;
  tagline?: string;
  category: ArticleCategory;
  sections: ArticleBlock[];
  /** Optional static cover image path (e.g. /articles/covers/slug.jpg). Falls back to generated art. */
  coverImage?: string;
  coverImageAlt?: string;
  /** Optional series position for numbered cover badges (e.g. cutting guide 1–7). */
  seriesOrder?: number;
  publishedAt?: string;
  updatedAt?: string;
}