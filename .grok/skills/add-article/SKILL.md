---
name: add-article
description: Add a general reference article to src/data/articles.ts with category, sections, and slug. Use when adding gear, training, diet, or health articles, or when the user runs /add-article.
---

# Add Article

Articles are static TypeScript entries — not DB-backed. They render at `/articles/[slug]` (public + in-app sidebar link).

## Files

| File | Purpose |
|------|---------|
| `src/data/articles.ts` | Article content array |
| `src/lib/articleTypes.ts` | `Article`, `ArticleBlock`, `ArticleCategory` |
| `src/lib/articleCatalog.ts` | Search, filter, slugs (auto from `ARTICLES`) |

## Add an article

1. Open `src/data/articles.ts`.
2. Append an object to `ARTICLES`:

```ts
{
  id: "your-slug",           // URL: /articles/your-slug
  title: "Article Title",
  tagline: "One-line summary for cards and meta",
  category: "gear",          // gear | training | diet | health | general
  publishedAt: "2026-06-19",
  updatedAt: "2026-06-19",
  sections: [
    { heading: "Section title", body: "Paragraph copy." },
    { heading: "Bullets", list: ["Point one", "Point two"] },
  ],
},
```

3. Use kebab-case `id` (unique, stable — sitemap uses it).
4. Diet articles are **educational only** — no food logging or macro tracking features.

## Section headings

Reuse guide-style headings where useful (`What to watch on labs`, `Practical guidelines`) — `ContentArticleBody` classifies them for icons.

## Verify

```bash
npm run test -- src/lib/articleCatalog.test.ts
npm run typecheck
```

Visit `/articles/your-slug` locally after `npm run dev`.

## Do not

- Add nutrition tracking UI
- Create per-article `app/` routes (catch-all `[slug]` handles new slugs automatically)
- Put compound-specific profiles here (use compound guides in `compoundProfiles.ts`)