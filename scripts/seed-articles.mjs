#!/usr/bin/env node
/**
 * Upsert bundled articles from src/data/articles.ts into public.articles.
 * Run after db:migrate: npm run db:seed-articles
 *
 * Requires ONE of:
 *   SUPABASE_SERVICE_ROLE_KEY (Supabase JS client)
 *   DATABASE_URL / SUPABASE_DB_PASSWORD (direct Postgres, same as db:migrate)
 */
import { loadEnv } from "./load-env.mjs";

loadEnv();
import { createClient } from "@supabase/supabase-js";
import {
  assertProjectEnvConsistency,
  connectPg,
  printProjectBanner,
  resolveDatabaseUrls,
} from "./db-utils.mjs";
import { articleToDbRow, bundledArticleToWriteInput } from "../src/lib/articleDbRow.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
assertProjectEnvConsistency({
  url,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: serviceKey || undefined,
});

printProjectBanner({
  url,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: serviceKey || undefined,
});

const { ARTICLES } = await import("../src/data/articles.ts");
const rows = ARTICLES.map((article) => articleToDbRow(bundledArticleToWriteInput(article)));

const UPSERT_SQL = `
  insert into public.articles (
    id, title, tagline, category, sections, cover_image, cover_image_alt, series_order, published_at, updated_at
  ) values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::timestamptz, $10::timestamptz)
  on conflict (id) do update set
    title = excluded.title,
    tagline = excluded.tagline,
    category = excluded.category,
    sections = excluded.sections,
    cover_image = excluded.cover_image,
    cover_image_alt = excluded.cover_image_alt,
    series_order = excluded.series_order,
    published_at = excluded.published_at,
    updated_at = excluded.updated_at
`;

async function seedViaSupabase() {
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.from("articles").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Failed to seed articles:", error.message);
    process.exit(1);
  }
  return rows.length;
}

async function seedViaPg(client) {
  await client.query("BEGIN");
  try {
    for (const row of rows) {
      await client.query(UPSERT_SQL, [
        row.id,
        row.title,
        row.tagline,
        row.category,
        JSON.stringify(row.sections),
        row.cover_image,
        row.cover_image_alt,
        row.series_order,
        row.published_at,
        row.updated_at,
      ]);
    }
    try {
      await client.query("notify pgrst, 'reload schema';");
    } catch {
      /* optional */
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to seed articles:", err.message);
    process.exit(1);
  }
  return rows.length;
}

let ok;
if (serviceKey) {
  console.log("Seeding articles via Supabase service role...");
  ok = await seedViaSupabase();
} else {
  const pgUrls = resolveDatabaseUrls();
  if (pgUrls.length === 0) {
    console.error("\nNo database credentials — articles were NOT seeded.");
    console.error("Add one of these to .env.local:\n");
    console.error("  SUPABASE_SERVICE_ROLE_KEY=...  (Dashboard → Project Settings → API)");
    console.error("  DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres");
    console.error("  SUPABASE_DB_PASSWORD=...        (Dashboard → Project Settings → Database)\n");
    console.error("Or seed on production: Admin → Articles → Import bundled\n");
    process.exit(1);
  }
  console.log("Seeding articles via direct Postgres connection...");
  const client = await connectPg(pgUrls);
  try {
    ok = await seedViaPg(client);
  } finally {
    await client.end();
  }
}

console.log(`Seeded ${ok} articles into public.articles`);