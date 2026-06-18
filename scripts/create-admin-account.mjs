/**
 * Creates the sole site admin account. Run once:
 *   npm run create-admin
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

loadEnv();

async function createAdminViaApi({ url, serviceKey, keyFingerprint, accessKeyHash, sessionSecret, userId, email }) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

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
    display_name: "Admin",
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
      username: "admin",
      display_name: "Admin",
      updated_at: new Date().toISOString(),
    })
    .eq("id", created.user.id);

  return created.user.id;
}

async function createAdminViaPg(client, { keyFingerprint, accessKeyHash, sessionSecret, userId, email }) {
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
        id, key_fingerprint, access_key_hash, display_name, username, is_admin, updated_at
      ) values ($1, $2, $3, 'Admin', 'admin', true, now())
      on conflict (id) do update set
        key_fingerprint = excluded.key_fingerprint,
        access_key_hash = excluded.access_key_hash,
        display_name = excluded.display_name,
        username = excluded.username,
        is_admin = excluded.is_admin,
        updated_at = excluded.updated_at`,
      [userId, keyFingerprint, accessKeyHash],
    );

    await client.query(
      `insert into public.auth_secrets (user_id, session_secret)
       values ($1, $2)
       on conflict (user_id) do update set session_secret = excluded.session_secret`,
      [userId, sessionSecret],
    );

    await client.query(`update public.profiles set is_admin = false where id <> $1`, [userId]);
    await client.query(
      `update public.profiles
       set is_admin = true, username = 'admin', display_name = 'Admin', updated_at = now()
       where id = $1`,
      [userId],
    );

    await client.query("COMMIT");
    return userId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!url) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const accessKey = generateAccessKey();
const keyFingerprint = fingerprintAccessKey(accessKey);
const accessKeyHash = await hashAccessKey(accessKey);
const sessionSecret = randomBytes(32).toString("base64url");
const userId = randomUUID();
const email = internalEmail(userId);

let createdUserId;

if (serviceKey) {
  createdUserId = await createAdminViaApi({
    url,
    serviceKey,
    keyFingerprint,
    accessKeyHash,
    sessionSecret,
    userId,
    email,
  });
} else {
  const pgUrls = resolveDatabaseUrls();
  if (pgUrls.length === 0) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL/SUPABASE_DB_PASSWORD.");
    process.exit(1);
  }
  console.log("Creating admin via direct Postgres connection...");
  const client = await connectPg(pgUrls);
  try {
    createdUserId = await createAdminViaPg(client, {
      keyFingerprint,
      accessKeyHash,
      sessionSecret,
      userId,
      email,
    });
  } finally {
    await client.end();
  }
}

console.log(
  JSON.stringify(
    {
      accessKey,
      keyFingerprint,
      userId: createdUserId,
      displayName: "Admin",
      username: "admin",
    },
    null,
    2,
  ),
);