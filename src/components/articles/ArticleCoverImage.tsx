import Image from "next/image";
import type { Article } from "@/lib/articleTypes";
import type { ArticleCategoryDef } from "@/lib/articleCatalog";
import { getArticleCoverAlt, getArticleCoverStyle } from "@/lib/articleCovers";
import { cn } from "@/lib/utils";

type Props = {
  article: Article;
  category: ArticleCategoryDef;
  className?: string;
};

export function ArticleCoverImage({ article, category, className }: Props) {
  const style = getArticleCoverStyle(article);
  const alt = getArticleCoverAlt(article);

  if (article.coverImage) {
    return (
      <div className={cn("relative aspect-[5/3] w-full overflow-hidden bg-[var(--bg-elevated)]", className)}>
        <Image
          src={article.coverImage}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)]/80 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative aspect-[5/3] w-full overflow-hidden bg-[var(--bg-elevated)]", className)}
      aria-hidden
    >
      <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.03]" style={{ background: style.gradient }} />
      <div
        className="absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: `var(${style.accentVar})` }}
      />
      <div
        className="absolute -bottom-12 -left-6 h-36 w-36 rounded-full opacity-25 blur-3xl"
        style={{ background: `var(${style.accentVar})`, boxShadow: `0 0 60px ${style.glow}` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--bg-surface)]/90 to-transparent" />
      <span className="absolute bottom-4 left-4 text-4xl opacity-35 sm:text-5xl">{category.icon}</span>
      {article.seriesOrder != null && (
        <span
          className="absolute right-3 top-3 rounded-full border border-[var(--border)] bg-[var(--bg-base)]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--foreground)] backdrop-blur-sm"
          style={{ color: `var(${style.accentVar})` }}
        >
          Part {article.seriesOrder}
        </span>
      )}
    </div>
  );
}