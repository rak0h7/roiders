/**
 * Creates the Ascended Chad demo admin with full seeded module data.
 *   npm run seed-ascended-chad
 */
import { randomBytes, randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./load-env.mjs";
import { connectPg, resolveDatabaseUrls } from "./db-utils.mjs";
import {
  fingerprintAccessKey,
  generateAccessKey,
  hashAccessKey,
  internalEmail,
} from "./shared/access-key-crypto.mjs";
import {
  buildUserModules,
  DISPLAY_NAME,
  USERNAME,
} from "./seed-data/ascended-chad-data.mjs";

loadEnv();

const rotateKey = process.argv.includes("--rotate-key");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!url) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

async function upsertModules(admin, userId, modules) {
  const rows = [
    { user_id: userId, module: "labs", data: modules.labs, updated_at: modules.updated_at },
    { user_id: userId, module: "cycle", data: modules.cycle, updated_at: modules.updated_at },
    { user_id: userId, module: "gym", data: modules.gym, updated_at: modules.updated_at },
    { user_id: userId, module: "nutrition", data: modules.nutrition, updated_at: modules.updated_at },
    { user_id: userId, module: "settings", data: modules.settings, updated_at: modules.updated_at },
  ];

  const { error } = await admin.from("user_modules").upsert(rows, {
    onConflict: "user_id,module",
  });
  if (error) throw new Error(error.message);
}

async function createViaApi({ keyFingerprint, accessKeyHash, sessionSecret, userId, email, modules }) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", USERNAME)
    .maybeSingle();

  if (existing?.id) {
    const profilePatch = {
      is_admin: true,
      display_name: DISPLAY_NAME,
      premium_sync_enabled: true,
      updated_at: new Date().toISOString(),
    };
    if (rotateKey) {
      profilePatch.key_fingerprint = keyFingerprint;
      profilePatch.access_key_hash = accessKeyHash;
      const { error: pwError } = await admin.auth.admin.updateUserById(existing.id, {
        password: sessionSecret,
      });
      if (pwError) throw new Error(pwError.message);
      await admin.from("auth_secrets").upsert({
        user_id: existing.id,
        session_secret: sessionSecret,
      });
    }
    await admin.from("profiles").update({ is_admin: false }).neq("id", existing.id);
    await admin.from("profiles").update(profilePatch).eq("id", existing.id);
    await upsertModules(admin, existing.id, modules);
    return { userId: existing.id, recreated: false, rotated: rotateKey };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    id: userId,
    email,
    password: sessionSecret,
    email_confirm: true,
    user_metadata: { auth_type: "access_key", key_fingerprint: keyFingerprint },
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Create user failed");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    key_fingerprint: keyFingerprint,
    access_key_hash: accessKeyHash,
    display_name: DISPLAY_NAME,
    username: USERNAME,
    is_admin: true,
    premium_sync_enabled: true,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(profileError.message);
  }

  const { error: secretError } = await admin.from("auth_secrets").upsert({
    user_id: created.user.id,
    session_secret: sessionSecret,
  });

  if (secretError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(secretError.message);
  }

  await admin.from("profiles").update({ is_admin: false }).neq("id", created.user.id);
  await admin
    .from("profiles")
    .update({
      is_admin: true,
      username: USERNAME,
      display_name: DISPLAY_NAME,
      premium_sync_enabled: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", created.user.id);

  await upsertModules(admin, created.user.id, modules);
  return { userId: created.user.id, recreated: true };
}

async function createViaPg(client, { keyFingerprint, accessKeyHash, sessionSecret, userId, email, modules }) {
  const { rows: existingRows } = await client.query(
    `select id from public.profiles where username = $1 limit 1`,
    [USERNAME],
  );

  if (existingRows[0]?.id) {
    const existingId = existingRows[0].id;
    await client.query(`update public.profiles set is_admin = false where id <> $1`, [existingId]);
    if (rotateKey) {
      await client.query(
        `update auth.users
         set encrypted_password = crypt($2, gen_salt('bf')), updated_at = now()
         where id = $1`,
        [existingId, sessionSecret],
      );
      await client.query(
        `update public.profiles
         set is_admin = true, display_name = $2, key_fingerprint = $3, access_key_hash = $4,
             premium_sync_enabled = true, updated_at = now()
         where id = $1`,
        [existingId, DISPLAY_NAME, keyFingerprint, accessKeyHash],
      );
      await client.query(
        `insert into public.auth_secrets (user_id, session_secret)
         values ($1, $2)
         on conflict (user_id) do update set session_secret = excluded.session_secret`,
        [existingId, sessionSecret],
      );
    } else {
      await client.query(
        `update public.profiles
         set is_admin = true, display_name = $2, premium_sync_enabled = true, updated_at = now()
         where id = $1`,
        [existingId, DISPLAY_NAME],
      );
    }
    await upsertModulesPg(client, existingId, modules);
    return { userId: existingId, recreated: false, rotated: rotateKey };
  }

  const identityId = randomUUID();
  await client.query("BEGIN");
  try {
    await client.query(
      `insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, recovery_sent_at, last_sign_in_at,
        confirmation_token, recovery_token, email_change_token_new, email_change, phone_change,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) values (
        '00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated', $2,
        crypt($3, gen_salt('bf')), now(), now(), now(),
        '', '', '', '', '',
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('auth_type', 'access_key', 'key_fingerprint', $4::text),
        now(), now()
      )`,
      [userId, email, sessionSecret, keyFingerprint],
    );

    await client.query(
      `insert into auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) values (
        $1, $2::uuid,
        jsonb_build_object('sub', $3::text, 'email', $4::text, 'email_verified', true, 'phone_verified', false),
        'email', $3::text, now(), now(), now()
      )`,
      [identityId, userId, userId, email],
    );

    await client.query(
      `insert into public.profiles (
        id, key_fingerprint, access_key_hash, display_name, username, is_admin, premium_sync_enabled, updated_at
      ) values ($1, $2, $3, $4, $5, true, true, now())
      on conflict (id) do update set
        key_fingerprint = excluded.key_fingerprint,
        access_key_hash = excluded.access_key_hash,
        display_name = excluded.display_name,
        username = excluded.username,
        is_admin = excluded.is_admin,
        premium_sync_enabled = excluded.premium_sync_enabled,
        updated_at = excluded.updated_at`,
      [userId, keyFingerprint, accessKeyHash, DISPLAY_NAME, USERNAME],
    );

    await client.query(
      `insert into public.auth_secrets (user_id, session_secret) values ($1, $2)`,
      [userId, sessionSecret],
    );

    await client.query(`update public.profiles set is_admin = false where id <> $1`, [userId]);
    await client.query(
      `update public.profiles
       set is_admin = true, username = $2, display_name = $3, premium_sync_enabled = true, updated_at = now()
       where id = $1`,
      [userId, USERNAME, DISPLAY_NAME],
    );

    await upsertModulesPg(client, userId, modules);
    await client.query("COMMIT");
    return { userId, recreated: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

async function upsertModulesPg(client, userId, modules) {
  const mods = [
    ["labs", modules.labs],
    ["cycle", modules.cycle],
    ["gym", modules.gym],
    ["nutrition", modules.nutrition],
    ["settings", modules.settings],
  ];
  for (const [module, data] of mods) {
    await client.query(
      `insert into public.user_modules (user_id, module, data, updated_at)
       values ($1, $2, $3::jsonb, $4::timestamptz)
       on conflict (user_id, module) do update set
         data = excluded.data,
         updated_at = excluded.updated_at`,
      [userId, module, JSON.stringify(data), modules.updated_at],
    );
  }
}

const modules = buildUserModules();
const accessKey = generateAccessKey();
const keyFingerprint = fingerprintAccessKey(accessKey);
const accessKeyHash = await hashAccessKey(accessKey);
const sessionSecret = randomBytes(32).toString("base64url");
const userId = randomUUID();
const email = internalEmail(userId);

let result;
let outputKey = rotateKey ? accessKey : accessKey;

if (serviceKey) {
  result = await createViaApi({
    keyFingerprint,
    accessKeyHash,
    sessionSecret,
    userId,
    email,
    modules,
  });
  if (!result.recreated && !result.rotated) {
    outputKey = "(unchanged — existing account; pass --rotate-key for a new access key)";
  }
} else {
  const pgUrls = resolveDatabaseUrls();
  if (pgUrls.length === 0) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL/SUPABASE_DB_PASSWORD.");
    process.exit(1);
  }
  console.log("Seeding via direct Postgres connection...");
  const client = await connectPg(pgUrls);
  try {
    result = await createViaPg(client, {
      keyFingerprint,
      accessKeyHash,
      sessionSecret,
      userId,
      email,
      modules,
    });
    if (!result.recreated && !result.rotated) {
    outputKey = "(unchanged — existing account; pass --rotate-key for a new access key)";
  }
  } finally {
    await client.end();
  }
}

const summary = {
  accessKey: outputKey,
  keyFingerprint: result.recreated || result.rotated ? keyFingerprint : "(existing)",
  userId: result.userId,
  displayName: DISPLAY_NAME,
  username: USERNAME,
  recreated: result.recreated,
  seeded: {
    labsReports: modules.labs.length,
    cycleWeeks: modules.cycle.state.weeks,
    cycleCompounds: modules.cycle.state.compounds.length,
    workouts: modules.gym.state.history.length,
    nutritionDays: Object.keys(modules.nutrition.state.logs).length,
  },
  adminFingerprintHint: result.recreated
    ? `Set ADMIN_FINGERPRINT=${keyFingerprint} in Vercel for production admin detection`
    : undefined,
};

console.log(JSON.stringify(summary, null, 2));