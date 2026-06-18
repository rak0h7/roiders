/**
 * Applies pending Supabase schema migrations.
 *
 * Requires ONE of:
 *   DATABASE_URL / SUPABASE_DB_URL
 *   SUPABASE_DB_PASSWORD (uses direct + pooler connection strings)
 *   SUPABASE_ACCESS_TOKEN (Supabase Management API)
 *
 * Usage:
 *   npm run db:migrate
 *   npm run db:migrate -- --print-sql   # manual SQL editor fallback only
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "./load-env.mjs";
import {
  assertProjectEnvConsistency,
  buildDatabaseUrls,
  connectPg,
  printProjectBanner,
  runSqlViaManagementApi,
} from "./db-utils.mjs";

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "migrate-pending.sql");
const sql = fs.readFileSync(sqlPath, "utf8");
const printOnly = process.argv.includes("--print-sql");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = assertProjectEnvConsistency({
  url,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
const password = process.env.SUPABASE_DB_PASSWORD ?? process.env.POSTGRES_PASSWORD;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const databaseUrl =
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? process.env.POSTGRES_URL ?? null;

printProjectBanner({
  url,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

const pgUrls = buildDatabaseUrls({ projectRef, password, databaseUrl });
const canUsePg = pgUrls.length > 0;
const canUseApi = Boolean(accessToken && projectRef);

if (!canUsePg && !canUseApi) {
  console.error("\nNo database credentials — migration was NOT applied.");
  console.error("npm run db:migrate only prints SQL unless you add credentials to .env.local:\n");
  console.error("  Option A (recommended): SUPABASE_DB_PASSWORD=your-db-password");
  console.error("    Dashboard → Project Settings → Database → Database password");
  console.error("  Option B: DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres");
  console.error("  Option C: SUPABASE_ACCESS_TOKEN=...  (from `npx supabase login`)\n");
  console.error(`Then run: npm run db:migrate\n`);
  console.error("Manual fallback — paste supabase/migrate-pending.sql in the SQL Editor:");
  console.error(
    `https://supabase.com/dashboard/project/${projectRef ?? "YOUR_PROJECT_REF"}/sql/new\n`,
  );
  console.error("IMPORTANT: confirm the dashboard project ref matches the Ref printed above.\n");

  if (printOnly) {
    console.log(sql);
    process.exit(0);
  }

  process.exit(1);
}

const reloadCacheSql = "notify pgrst, 'reload schema';";

if (canUseApi) {
  console.log("Applying migration via Supabase Management API...");
  await runSqlViaManagementApi({ projectRef, accessToken, sql });
  try {
    await runSqlViaManagementApi({ projectRef, accessToken, sql: reloadCacheSql });
  } catch {
    /* optional */
  }
  console.log("Migrations applied successfully (Management API).");
  console.log("Next: npm run db:bootstrap");
  process.exit(0);
}

console.log("Applying migration via direct Postgres connection...");
let client;
try {
  client = await connectPg(pgUrls);
} catch (err) {
  console.error(
    "\nCould not connect with your DATABASE_URL / SUPABASE_DB_PASSWORD.",
  );
  console.error(
    `Confirm credentials are for project ${projectRef} (Dashboard → Settings → Database).\n`,
  );
  throw err;
}
try {
  await client.query(sql);
  try {
    await client.query(reloadCacheSql);
  } catch {
    /* optional */
  }
  console.log("Migrations applied successfully.");
  console.log("Next: npm run db:bootstrap");
} finally {
  await client.end();
}