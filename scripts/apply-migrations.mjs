/**
 * Applies pending Supabase schema migrations when DATABASE_URL is set.
 * Otherwise prints the SQL file to run manually in the Supabase SQL Editor.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/apply-migrations.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "migrate-pending.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const password = process.env.SUPABASE_DB_PASSWORD ?? process.env.POSTGRES_PASSWORD;
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  process.env.POSTGRES_URL ??
  (password && projectRef
    ? `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    : null);

if (!databaseUrl) {
  console.log("No database connection. Run this SQL in the Supabase SQL Editor:\n");
  console.log("https://supabase.com/dashboard/project/tfcplpxcorcqbjqbukem/sql/new\n");
  console.log("Then: node scripts/post-migrate-bootstrap.mjs\n");
  console.log(sql);
  process.exit(0);
}

let pg;
try {
  pg = await import("pg");
} catch {
  console.error("Install pg to run migrations locally: npm install --save-dev pg");
  process.exit(1);
}

const client = new pg.default.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(sql);
  console.log("Migrations applied successfully.");
} finally {
  await client.end();
}