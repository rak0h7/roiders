/**
 * Run AFTER migrate-pending.sql. Promotes the owner account and verifies schema.
 *   npm run db:bootstrap
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./load-env.mjs";
import {
  assertProjectEnvConsistency,
  checkSchema,
  checkSchemaViaPg,
  connectPg,
  getSiteNameViaPg,
  printProjectBanner,
  promoteOwnerViaPg,
  resolveDatabaseUrls,
} from "./db-utils.mjs";

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
const adminFp = process.env.ADMIN_FINGERPRINT ?? process.env.NEXT_PUBLIC_ADMIN_FINGERPRINT;

if (!url) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const projectRef = assertProjectEnvConsistency({
  url,
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  serviceKey,
});

printProjectBanner({
  url,
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  serviceKey,
});

let checks;
let siteName;

if (serviceKey) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    checks = await checkSchema(admin);
  } catch (err) {
    if (!String(err.message).includes("Invalid API key")) throw err;
    console.warn("Service key rejected by API — falling back to DATABASE_URL.");
    checks = null;
  }

  if (checks) {
    console.log("Schema status:", {
      username: checks.username,
      is_admin: checks.is_admin,
      site_settings: checks.site_settings,
    });

    if (!checks.username || !checks.is_admin || !checks.site_settings) {
      console.error("\nMigration is NOT applied on this project.");
      console.error(`Run: npm run db:migrate`);
      console.error(
        `Or paste supabase/migrate-pending.sql: https://supabase.com/dashboard/project/${projectRef}/sql/new`,
      );
      process.exit(1);
    }

    if (adminFp) {
      const { data: owner, error: findErr } = await admin
        .from("profiles")
        .select("id, username")
        .eq("key_fingerprint", adminFp)
        .maybeSingle();

      if (findErr) {
        console.error("Owner lookup failed:", findErr.message);
        process.exit(1);
      }

      if (owner) {
        const { error: promoteErr } = await admin
          .from("profiles")
          .update({
            is_admin: true,
            username: owner.username ?? "admin",
            display_name: "Admin",
            updated_at: new Date().toISOString(),
          })
          .eq("id", owner.id);

        if (promoteErr) {
          console.error("Owner promote failed:", promoteErr.message);
          process.exit(1);
        }
        console.log("Owner promoted:", owner.id);
      } else {
        console.warn("No profile found for ADMIN_FINGERPRINT — run npm run create-admin");
      }
    } else {
      console.warn("ADMIN_FINGERPRINT not set — skip owner promotion");
    }

    const { data: settings } = await admin
      .from("site_settings")
      .select("site_name")
      .eq("id", 1)
      .maybeSingle();
    siteName = settings?.site_name;
  }
}

if (!checks) {
  const pgUrls = resolveDatabaseUrls();
  if (pgUrls.length === 0) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL/SUPABASE_DB_PASSWORD.");
    console.error("Add service_role key from Dashboard → Project Settings → API");
    process.exit(1);
  }

  console.log("Bootstrapping via direct Postgres connection...");
  const client = await connectPg(pgUrls);
  try {
    checks = await checkSchemaViaPg(client);
    console.log("Schema status:", checks);

    if (!checks.username || !checks.is_admin || !checks.site_settings) {
      console.error("\nMigration is NOT applied. Run: npm run db:migrate");
      process.exit(1);
    }

    if (adminFp) {
      const ownerId = await promoteOwnerViaPg(client, adminFp);
      if (ownerId) console.log("Owner promoted:", ownerId);
      else console.warn("No profile found for ADMIN_FINGERPRINT — run npm run create-admin");
    }

    siteName = await getSiteNameViaPg(client);
  } finally {
    await client.end();
  }
}

console.log("Site settings:", siteName ?? "(missing row)");
console.log("Bootstrap complete.");