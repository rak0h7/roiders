/**
 * Run AFTER migrate-pending.sql. Promotes the owner account and verifies schema.
 *   npm run db:bootstrap
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminFp = process.env.ADMIN_FINGERPRINT ?? process.env.NEXT_PUBLIC_ADMIN_FINGERPRINT;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Copy .env.example to .env.local and add your Supabase keys.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function columnExists(table, column) {
  const { error } = await admin.from(table).select(column).limit(0);
  return !error?.message?.includes("does not exist");
}

const checks = {
  username: await columnExists("profiles", "username"),
  is_admin: await columnExists("profiles", "is_admin"),
  site_settings: !(await admin.from("site_settings").select("id").limit(1)).error,
};

console.log("Schema status:", checks);

if (!checks.username || !checks.is_admin || !checks.site_settings) {
  console.error("\nSchema incomplete. Run supabase/migrate-pending.sql in the Supabase SQL Editor first:");
  console.error("https://supabase.com/dashboard/project/tfcplpxcorcqbjqbukem/sql/new");
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

const { data: settings } = await admin.from("site_settings").select("site_name").eq("id", 1).maybeSingle();
console.log("Site settings:", settings?.site_name ?? "(missing row)");
console.log("Bootstrap complete.");