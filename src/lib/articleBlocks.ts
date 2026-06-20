import type { ArticleBlock } from "@/lib/articleTypes";

export function isLabsMarkerGrid(block: ArticleBlock): boolean {
  return block.heading === "Blood Markers Impacted" && Boolean(block.blocks?.length);
}