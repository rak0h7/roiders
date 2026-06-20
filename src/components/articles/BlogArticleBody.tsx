"use client";

import type { ArticleBlock } from "@/lib/articleTypes";
import { ArticleSections } from "@/components/content/ArticleBody";

export { buildBlogToc } from "@/components/content/ArticleBody";

export function BlogArticleBody({ sections }: { sections: ArticleBlock[] }) {
  return <ArticleSections sections={sections} variant="blog" />;
}