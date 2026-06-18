/** Shared helpers for Supabase migration / bootstrap scripts. */
// projectRefFromUrl mirrors src/lib/supabase/projectRef.ts

export function projectRefFromUrl(url) {
  return (url ?? "").match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

export function projectRefFromHost(host) {
  if (!host) return null;
  return host.match(/^db\.([^.]+)\.supabase\.co$/)?.[1] ?? null;
}

export function projectRefFromJwt(jwt) {
  if (!jwt) return null;
  try {
    const payload = jwt.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return json.ref ?? null;
  } catch {
    return null;
  }
}

export function getProjectMismatch({ url, anonKey, serviceKey }) {
  const urlRef = projectRefFromUrl(url);
  const anonRef = projectRefFromJwt(anonKey);
  const serviceRef = projectRefFromJwt(serviceKey);
  const keyRef = serviceRef ?? anonRef;
  const mismatches = [];

  if (anonRef && urlRef && anonRef !== urlRef) {
    mismatches.push(`anon key → ${anonRef}, URL → ${urlRef}`);
  }
  if (serviceRef && urlRef && serviceRef !== urlRef) {
    mismatches.push(`service role key → ${serviceRef}, URL → ${urlRef}`);
  }
  if (anonRef && serviceRef && anonRef !== serviceRef) {
    mismatches.push(`anon key → ${anonRef}, service role key → ${serviceRef}`);
  }

  return { urlRef, keyRef, mismatches };
}

export function assertProjectEnvConsistency({ url, anonKey, serviceKey }) {
  const { urlRef, keyRef, mismatches } = getProjectMismatch({ url, anonKey, serviceKey });
  if (mismatches.length === 0) return urlRef;

  console.error("Supabase env mismatch — fix .env.local before continuing:\n");
  for (const line of mismatches) console.error(`  • ${line}`);
  console.error("\nAll of these must reference the same project ref.");
  console.error(`Set NEXT_PUBLIC_SUPABASE_URL=https://${keyRef ?? "YOUR_REF"}.supabase.co`);
  console.error("Keys from: Dashboard → Project Settings → API\n");
  process.exit(1);
}

export function printProjectBanner({ url, anonKey, serviceKey }) {
  const { urlRef } = getProjectMismatch({ url, anonKey, serviceKey });

  console.log("Supabase project");
  console.log(`  URL:     ${url ?? "(missing)"}`);
  console.log(`  Ref:     ${urlRef ?? "(unknown)"}`);
  console.log(
    `  SQL:     https://supabase.com/dashboard/project/${urlRef ?? "YOUR_PROJECT_REF"}/sql/new`,
  );
}

export function resolveDatabaseUrls(env = process.env) {
  const password = env.SUPABASE_DB_PASSWORD ?? env.POSTGRES_PASSWORD;
  const projectRef =
    projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL) ??
    projectRefFromHost(env.POSTGRES_HOST);
  const onVercel = Boolean(env.VERCEL);
  const urls = [];

  if (password && projectRef) {
    const enc = encodeURIComponent(password);
    const poolers = [
      `postgresql://postgres.${projectRef}:${enc}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${projectRef}:${enc}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${projectRef}:${enc}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
    ];
    const direct = `postgresql://postgres:${enc}@db.${projectRef}.supabase.co:5432/postgres`;
    if (onVercel) urls.push(...poolers, direct);
    else urls.push(direct, ...poolers);
  }

  for (const candidate of [
    env.DATABASE_URL,
    env.SUPABASE_DB_URL,
    env.POSTGRES_URL,
    env.POSTGRES_URL_NON_POOLING,
  ]) {
    if (candidate?.trim() && !urls.includes(candidate)) urls.push(candidate);
  }

  const host = env.POSTGRES_HOST;
  if (host && password && !urls.some((u) => u.includes(host))) {
    const enc = encodeURIComponent(password);
    const user = env.POSTGRES_USER ?? "postgres";
    const database = env.POSTGRES_DATABASE ?? "postgres";
    urls.push(`postgresql://${user}:${enc}@${host}:5432/${database}`);
  }

  return urls;
}

export async function checkSchemaViaPg(client) {
  const { rows } = await client.query(`
    select
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'profiles' and column_name = 'username'
      ) as username,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_admin'
      ) as is_admin,
      exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'site_settings'
      ) as site_settings
  `);
  return {
    username: rows[0].username,
    is_admin: rows[0].is_admin,
    site_settings: rows[0].site_settings,
  };
}

export async function promoteOwnerViaPg(client, adminFp) {
  const { rows } = await client.query(
    `update public.profiles
     set is_admin = true,
         username = coalesce(username, 'admin'),
         display_name = 'Admin',
         updated_at = now()
     where key_fingerprint = $1
     returning id`,
    [adminFp],
  );
  return rows[0]?.id ?? null;
}

export async function getSiteNameViaPg(client) {
  const { rows } = await client.query(
    `select site_name from public.site_settings where id = 1`,
  );
  return rows[0]?.site_name ?? null;
}

export async function checkSchema(admin) {
  async function columnExists(table, column) {
    const { error } = await admin.from(table).select(column).limit(0);
    if (!error) return true;
    const msg = error.message ?? "";
    if (msg.includes("does not exist")) return false;
    if (msg.includes("Could not find the table")) return false;
    throw new Error(`${table}.${column}: ${msg}`);
  }

  const siteSettings = await admin.from("site_settings").select("id").limit(1);
  const siteSettingsMissing =
    siteSettings.error?.message?.includes("Could not find the table") ||
    siteSettings.error?.code === "PGRST205";

  return {
    username: await columnExists("profiles", "username"),
    is_admin: await columnExists("profiles", "is_admin"),
    site_settings: !siteSettings.error || !siteSettingsMissing,
    site_settings_error: siteSettings.error?.message,
  };
}

export async function connectPg(urls) {
  let pg;
  try {
    pg = await import("pg");
  } catch {
    throw new Error("Install pg: npm install --save-dev pg");
  }

  const errors = [];
  for (const connectionString of urls) {
    const client = new pg.default.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      // Prefer IPv4 — some networks cannot reach Supabase direct host over IPv6
      ...(connectionString.includes("@db.") ? { family: 4 } : {}),
    });
    try {
      await client.connect();
      return client;
    } catch (err) {
      errors.push(`${connectionString.replace(/:[^:@]+@/, ":***@")}: ${err.message}`);
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }

  throw new Error(`Could not connect to Postgres:\n${errors.join("\n")}`);
}

export async function runSqlViaManagementApi({ projectRef, accessToken, sql }) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${body}`);
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}