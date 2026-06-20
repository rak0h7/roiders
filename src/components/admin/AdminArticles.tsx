"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { clearCachedArticles } from "@/lib/articlesClientCache";
import { ARTICLE_CATEGORIES } from "@/lib/articleCatalog";
import type { Article, ArticleBlock, ArticleCategory } from "@/lib/articleTypes";

import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DraftSection = {
  heading: string;
  body: string;
  listText: string;
};

const EMPTY_SECTION: DraftSection = { heading: "", body: "", listText: "" };

function sectionsToDraft(sections: ArticleBlock[]): DraftSection[] {
  if (!sections.length) return [{ ...EMPTY_SECTION }];
  return sections.map((section) => ({
    heading: section.heading ?? "",
    body: section.body ?? "",
    listText: (section.list ?? []).join("\n"),
  }));
}

function draftToSections(drafts: DraftSection[]): ArticleBlock[] {
  return drafts
    .map((draft) => {
      const list = draft.listText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const block: ArticleBlock = {};
      if (draft.heading.trim()) block.heading = draft.heading.trim();
      if (draft.body.trim()) block.body = draft.body.trim();
      if (list.length) block.list = list;
      return block;
    })
    .filter((block) => block.heading || block.body || block.list?.length);
}

function emptyDraft(): Article {
  return {
    id: "",
    title: "",
    tagline: "",
    category: "general",
    sections: [{ heading: "Introduction", body: "" }],
    publishedAt: new Date().toISOString().slice(0, 10),
  };
}

export function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("general");
  const [seriesOrder, setSeriesOrder] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [sections, setSections] = useState<DraftSection[]>([{ ...EMPTY_SECTION }]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/articles", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load articles");
      setArticles(data.articles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.tagline ?? "").toLowerCase().includes(q),
    );
  }, [articles, query]);

  const loadDraft = (article: Article) => {
    setIsNew(false);
    setSelectedId(article.id);
    setSlug(article.id);
    setTitle(article.title);
    setTagline(article.tagline ?? "");
    setCategory(article.category);
    setSeriesOrder(article.seriesOrder != null ? String(article.seriesOrder) : "");
    setPublishedAt(article.publishedAt ?? "");
    setCoverImage(article.coverImage ?? "");
    setCoverImageAlt(article.coverImageAlt ?? "");
    setSections(sectionsToDraft(article.sections));
  };

  const startNew = () => {
    const draft = emptyDraft();
    setIsNew(true);
    setSelectedId(null);
    loadDraft(draft);
    setSlug("");
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        id: slug.trim(),
        title: title.trim(),
        tagline: tagline.trim() || null,
        category,
        sections: draftToSections(sections),
        seriesOrder: seriesOrder ? Number(seriesOrder) : null,
        publishedAt: publishedAt || null,
        coverImage: coverImage.trim() || null,
        coverImageAlt: coverImageAlt.trim() || null,
      };

      const res = await fetch(
        isNew ? "/api/admin/articles" : `/api/admin/articles/${selectedId}`,
        {
          method: isNew ? "POST" : "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      clearCachedArticles();
      await load();
      if (data.article) loadDraft(data.article);
      setIsNew(false);
      setSelectedId(data.article?.id ?? slug.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId || isNew) return;
    if (!confirm(`Delete article "${title || selectedId}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${selectedId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      clearCachedArticles();
      setSelectedId(null);
      setIsNew(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const seedBundled = async () => {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      clearCachedArticles();
      setArticles(data.articles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const updateSection = (index: number, patch: Partial<DraftSection>) => {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={ui.pageTitle}>Articles</h2>
          <p className={ui.pageSub}>Create and edit reference articles — changes go live without redeploying.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void seedBundled()} className={ui.btnSecondary} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Import bundled
          </button>
          <button type="button" onClick={startNew} className={ui.btnSecondary}>
            <Plus className="h-4 w-4" />
            New article
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(240px,300px)_1fr]">
        <Panel className="p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className={cn(ui.inputCompact, "mb-3")}
          />
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : (
            <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
              {filtered.map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => loadDraft(article)}
                    className={cn(
                      "w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm transition",
                      selectedId === article.id && !isNew
                        ? "bg-[var(--intel-dim)] text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)]",
                    )}
                  >
                    <p className="font-medium">{article.title}</p>
                    <p className="text-[10px] text-[var(--muted-2)]">{article.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-4 sm:p-5">
          {!selectedId && !isNew ? (
            <p className="text-sm text-[var(--muted)]">Select an article to edit, or create a new one.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={ui.label}>Slug (URL id)</span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={!isNew}
                    className={cn(ui.input, "mt-1")}
                    placeholder="my-article-slug"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={ui.label}>Title</span>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className={cn(ui.input, "mt-1")} />
                </label>
                <label className="block sm:col-span-2">
                  <span className={ui.label}>Tagline</span>
                  <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={cn(ui.input, "mt-1")} />
                </label>
                <label className="block">
                  <span className={ui.label}>Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    className={cn(ui.input, "mt-1")}
                  >
                    {ARTICLE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={ui.label}>Series order</span>
                  <input
                    value={seriesOrder}
                    onChange={(e) => setSeriesOrder(e.target.value)}
                    className={cn(ui.input, "mt-1")}
                    placeholder="Optional"
                  />
                </label>
                <label className="block">
                  <span className={ui.label}>Published date</span>
                  <input
                    type="date"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className={cn(ui.input, "mt-1")}
                  />
                </label>
                <label className="block">
                  <span className={ui.label}>Cover image path</span>
                  <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className={cn(ui.input, "mt-1")}
                    placeholder="/articles/covers/example.jpg"
                  />
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className={ui.sectionTitle}>Sections</p>
                  <button
                    type="button"
                    onClick={() => setSections((prev) => [...prev, { ...EMPTY_SECTION }])}
                    className={ui.btnGhost}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add section
                  </button>
                </div>
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div key={index} className={cn(ui.cardInner, "space-y-2 p-3")}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--muted)]">Section {index + 1}</p>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSections((prev) => prev.filter((_, i) => i !== index))}
                            className={cn(ui.btnGhost, "h-7 px-2 text-[var(--danger)]")}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        value={section.heading}
                        onChange={(e) => updateSection(index, { heading: e.target.value })}
                        placeholder="Heading"
                        className={ui.inputCompact}
                      />
                      <textarea
                        value={section.body}
                        onChange={(e) => updateSection(index, { body: e.target.value })}
                        placeholder="Body paragraphs"
                        rows={4}
                        className={cn(ui.input, "h-auto min-h-[6rem] resize-y py-2")}
                      />
                      <textarea
                        value={section.listText}
                        onChange={(e) => updateSection(index, { listText: e.target.value })}
                        placeholder="Bullet list (one item per line)"
                        rows={3}
                        className={cn(ui.input, "h-auto min-h-[4.5rem] resize-y py-2 font-mono text-xs")}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
                <button type="button" onClick={() => void save()} className={ui.btnPrimary} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isNew ? "Create article" : "Save changes"}
                </button>
                {slug && (
                  <a
                    href={`/articles/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className={ui.btnSecondary}
                  >
                    Preview
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {!isNew && selectedId && (
                  <button type="button" onClick={() => void remove()} className={cn(ui.btnSecondary, "text-[var(--danger)]")} disabled={saving}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}