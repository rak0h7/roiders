import { NextResponse, type NextRequest } from "next/server";
import {
  fingerprintAccessKey,
  internalEmail,
  normalizeAccessKey,
  verifyAccessKey,
} from "@/lib/accessKey.server";
import { isAdminFingerprint } from "@/lib/adminFingerprint";
import { queryPg } from "@/lib/db/postgres.server";
import { OWNER_DISPLAY_NAME, OWNER_USERNAME } from "@/lib/profile";
import { createAdminClient, createAuthClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceKey, isAuthServerConfigured } from "@/lib/supabase/env";
import { jsonWithSession } from "@/lib/supabase/route";

type LoginProfile = { id: string; access_key_hash: string };

async function loadProfile(keyFingerprint: string): Promise<LoginProfile | null> {
  if (hasSupabaseServiceKey()) {
    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select("id, access_key_hash")
      .eq("key_fingerprint", keyFingerprint)
      .maybeSingle();

    if (error) {
      if (error.message.includes("Invalid API key")) {
        return loadProfileViaPg(keyFingerprint);
      }
      throw new Error(error.message);
    }
    return profile;
  }

  return loadProfileViaPg(keyFingerprint);
}

async function loadProfileViaPg(keyFingerprint: string): Promise<LoginProfile | null> {
  const { rows } = await queryPg<LoginProfile>(
    `select id, access_key_hash
     from public.profiles
     where key_fingerprint = $1
     limit 1`,
    [keyFingerprint],
  );
  return rows[0] ?? null;
}

async function loadSessionSecret(userId: string): Promise<string | null> {
  if (hasSupabaseServiceKey()) {
    const admin = createAdminClient();
    const { data: secretRow, error } = await admin
      .from("auth_secrets")
      .select("session_secret")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return secretRow?.session_secret ?? null;
  }

  const { rows } = await queryPg<{ session_secret: string }>(
    `select session_secret from public.auth_secrets where user_id = $1 limit 1`,
    [userId],
  );
  return rows[0]?.session_secret ?? null;
}

async function promoteOwner(profileId: string, keyFingerprint: string) {
  if (!isAdminFingerprint(keyFingerprint)) return;

  if (hasSupabaseServiceKey()) {
    const admin = createAdminClient();
    await admin.from("profiles").update({ is_admin: false }).neq("id", profileId);
    await admin
      .from("profiles")
      .update({
        is_admin: true,
        username: OWNER_USERNAME,
        display_name: OWNER_DISPLAY_NAME,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);
    return;
  }

  await queryPg(`update public.profiles set is_admin = false where id <> $1`, [profileId]);
  await queryPg(
    `update public.profiles
     set is_admin = true, username = $2, display_name = $3, updated_at = now()
     where id = $1`,
    [profileId, OWNER_USERNAME, OWNER_DISPLAY_NAME],
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthServerConfigured()) {
    return NextResponse.json({ error: "Auth server is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { accessKey?: string };
  const accessKey = normalizeAccessKey(body.accessKey ?? "");

  if (!accessKey.startsWith("roiders_")) {
    return NextResponse.json({ error: "Invalid access key format" }, { status: 400 });
  }

  const keyFingerprint = fingerprintAccessKey(accessKey);

  let profile: LoginProfile | null;
  try {
    profile = await loadProfile(keyFingerprint);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Profile lookup failed" },
      { status: 500 },
    );
  }

  if (!profile || !(await verifyAccessKey(accessKey, profile.access_key_hash))) {
    return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
  }

  let sessionSecret: string | null;
  try {
    sessionSecret = await loadSessionSecret(profile.id);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Credential lookup failed" },
      { status: 500 },
    );
  }

  if (!sessionSecret) {
    return NextResponse.json({ error: "Account credentials unavailable" }, { status: 500 });
  }

  const authClient = hasSupabaseServiceKey() ? createAdminClient() : createAuthClient();
  const { data: sessionData, error: sessionError } = await authClient.auth.signInWithPassword({
    email: internalEmail(profile.id),
    password: sessionSecret,
  });

  if (sessionError || !sessionData.session) {
    return NextResponse.json(
      { error: sessionError?.message ?? "Sign in failed" },
      { status: 401 },
    );
  }

  try {
    await promoteOwner(profile.id, keyFingerprint);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Admin promotion failed" },
      { status: 500 },
    );
  }

  return jsonWithSession(
    request,
    {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    },
    { ok: true },
  );
}