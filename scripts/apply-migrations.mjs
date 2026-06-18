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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "migrate-pending.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const databaseUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.log("DATABASE_URL is not set. Run this SQL in the Supabase SQL Editor:\n");
  console.log("https://supabase.com/dashboard/project/tfcplpxcorcqbjqbukem/sql/new\n");
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