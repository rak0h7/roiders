import { NextResponse, type NextRequest } from "next/server";
import {
  fingerprintAccessKey,
  normalizeAccessKey,
  verifyAccessKey,
} from "@/lib/accessKey.server";
import {
  isInvalidCredentialsError,
  repairAccountCredentials,
  signInWithSessionSecret,
} from "@/lib/auth/loginSession";
import { isAdminFingerprint } from "@/lib/adminFingerprint";
import { queryPg } from "@/lib/db/postgres.server";
import { OWNER_DISPLAY_NAME, OWNER_USERNAME } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, isAuthServerConfigured } from "@/lib/supabase/env";
import { jsonWithSession } from "@/lib/supabase/route";

type LoginProfile = { id: string; access_key_hash: string };

async function loadProfile(keyFingerprint: string): Promise<LoginProfile | null> {
  if (hasServiceRoleKey()) {
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
  if (hasServiceRoleKey()) {
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

  if (hasServiceRoleKey()) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("username, display_name")
      .eq("id", profileId)
      .maybeSingle();

    await admin.from("profiles").update({ is_admin: false }).neq("id", profileId);
    await admin
      .from("profiles")
      .update({
        is_admin: true,
        username: profile?.username ?? OWNER_USERNAME,
        display_name: profile?.display_name ?? OWNER_DISPLAY_NAME,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);
    return;
  }

  await queryPg(`update public.profiles set is_admin = false where id <> $1`, [profileId]);
  await queryPg(
    `update public.profiles
     set is_admin = true,
         username = coalesce(username, $2),
         display_name = coalesce(display_name, $3),
         updated_at = now()
     where id = $1`,
    [profileId, OWNER_USERNAME, OWNER_DISPLAY_NAME],
  );
}

async function resolveSession(profileId: string): Promise<{ session: { access_token: string; refresh_token: string } | null; error: string | null }> {
  let sessionSecret = await loadSessionSecret(profileId);

  if (!sessionSecret) {
    try {
      sessionSecret = await repairAccountCredentials(profileId);
    } catch (err) {
      return {
        session: null,
        error: err instanceof Error ? err.message : "Account credentials unavailable",
      };
    }
  }

  let attempt = await signInWithSessionSecret(profileId, sessionSecret);
  if (attempt.session) {
    return {
      session: {
        access_token: attempt.session.access_token,
        refresh_token: attempt.session.refresh_token,
      },
      error: null,
    };
  }

  if (!isInvalidCredentialsError(attempt.error ?? undefined)) {
    return { session: null, error: attempt.error ?? "Sign in failed" };
  }

  try {
    sessionSecret = await repairAccountCredentials(profileId);
  } catch (err) {
    return {
      session: null,
      error: err instanceof Error ? err.message : "Credential repair failed",
    };
  }

  attempt = await signInWithSessionSecret(profileId, sessionSecret);
  if (!attempt.session) {
    return { session: null, error: attempt.error ?? "Sign in failed after credential repair" };
  }

  return {
    session: {
      access_token: attempt.session.access_token,
      refresh_token: attempt.session.refresh_token,
    },
    error: null,
  };
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

  let sessionResult: { session: { access_token: string; refresh_token: string } | null; error: string | null };
  try {
    sessionResult = await resolveSession(profile.id);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Credential lookup failed" },
      { status: 500 },
    );
  }

  if (!sessionResult.session) {
    const status = sessionResult.error?.toLowerCase().includes("invalid") ? 401 : 500;
    return NextResponse.json({ error: sessionResult.error ?? "Sign in failed" }, { status });
  }

  try {
    await promoteOwner(profile.id, keyFingerprint);
  } catch (err) {
    console.error("Admin promotion failed during login:", err);
  }

  return jsonWithSession(request, sessionResult.session, { ok: true });
}