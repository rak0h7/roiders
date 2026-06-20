import type { ArticleBlock } from "@/lib/articleTypes";
import { classifySectionHeading, slugifyHeading, type GuideSectionKind } from "@/lib/guideCatalog";

export type ArticleTocEntry = {
  heading: string;
  slug: string;
  kind?: GuideSectionKind;
};

export function buildArticleToc(
  sections: ArticleBlock[],
  options?: { includeKind?: boolean },
): ArticleTocEntry[] {
  return sections
    .map((section, index) => {
      if (!section.heading) return null;
      const entry: ArticleTocEntry = {
        heading: section.heading,
        slug: slugifyHeading(section.heading) || `section-${index}`,
      };
      if (options?.includeKind) {
        entry.kind = classifySectionHeading(section.heading);
      }
      return entry;
    })
    .filter((item): item is ArticleTocEntry => item !== null);
}