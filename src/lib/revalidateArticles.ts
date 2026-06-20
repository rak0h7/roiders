import { revalidatePath } from "next/cache";

/** Bust SSR caches for public article pages after admin writes. */
export function revalidateArticlePages(articleId?: string) {
  revalidatePath("/articles");
  revalidatePath("/sitemap.xml");
  if (articleId) {
    revalidatePath(`/articles/${articleId}`);
  }
}