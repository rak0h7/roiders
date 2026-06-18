/**
 * Creates the sole site admin account. Run once:
 *   node scripts/create-admin-account.mjs
 */
import { createHash, randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const scryptAsync = promisify(scrypt);
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function normalizeAccessKey(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

function generateAccessKey() {
  const bytes = randomBytes(16);
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) group += ALPHABET[bytes[g * 4 + i] % ALPHABET.length];
    groups.push(group);
  }
  return `roiders_${groups.join("_")}`;
}

function fingerprintAccessKey(key) {
  return createHash("sha256").update(normalizeAccessKey(key)).digest("hex").slice(0, 16);
}

async function hashAccessKey(key) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(normalizeAccessKey(key), salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function internalEmail(userId) {
  return `${userId}@users.roidersclub.internal`;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accessKey = generateAccessKey();
const keyFingerprint = fingerprintAccessKey(accessKey);
const accessKeyHash = await hashAccessKey(accessKey);
const sessionSecret = randomBytes(32).toString("base64url");
const userId = crypto.randomUUID();
const email = internalEmail(userId);

const { data: created, error: createError } = await admin.auth.admin.createUser({
  id: userId,
  email,
  password: sessionSecret,
  email_confirm: true,
  user_metadata: { auth_type: "access_key", key_fingerprint: keyFingerprint },
});

if (createError || !created.user) {
  console.error("Create user failed:", createError?.message);
  process.exit(1);
}

const { error: profileError } = await admin.from("profiles").upsert({
  id: created.user.id,
  key_fingerprint: keyFingerprint,
  access_key_hash: accessKeyHash,
  display_name: "Admin",
  updated_at: new Date().toISOString(),
});

if (profileError) {
  await admin.auth.admin.deleteUser(created.user.id);
  console.error("Profile failed:", profileError.message);
  process.exit(1);
}

const { error: secretError } = await admin.from("auth_secrets").upsert({
  user_id: created.user.id,
  session_secret: sessionSecret,
});

if (secretError) {
  await admin.auth.admin.deleteUser(created.user.id);
  console.error("Auth secret failed:", secretError.message);
  process.exit(1);
}

const demote = await admin.from("profiles").update({ is_admin: false }).neq("id", created.user.id);
if (demote.error && !demote.error.message.includes("does not exist")) {
  console.warn("Demote warning:", demote.error.message);
}

const promote = await admin
  .from("profiles")
  .update({
    is_admin: true,
    username: "admin",
    display_name: "Admin",
    updated_at: new Date().toISOString(),
  })
  .eq("id", created.user.id);

if (promote.error && !promote.error.message.includes("does not exist")) {
  console.warn("Promote warning:", promote.error.message);
}

console.log(
  JSON.stringify(
    {
      accessKey,
      keyFingerprint,
      userId: created.user.id,
      displayName: "Admin",
      username: "admin",
    },
    null,
    2
  )
);