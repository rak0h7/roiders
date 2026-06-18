import { NextResponse, type NextRequest } from "next/server";
import {
  fingerprintAccessKey,
  internalEmail,
  normalizeAccessKey,
  verifyAccessKey,
} from "@/lib/accessKey.server";
import { isAdminFingerprint } from "@/lib/adminFingerprint";
import { OWNER_DISPLAY_NAME, OWNER_USERNAME } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthServerConfigured } from "@/lib/supabase/env";
import { jsonWithSession } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  if (!isAuthServerConfigured()) {
    return NextResponse.json({ error: "Auth server is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { accessKey?: string };
  const accessKey = normalizeAccessKey(body.accessKey ?? "");

  if (!accessKey.startsWith("roiders_")) {
    return NextResponse.json({ error: "Invalid access key format" }, { status: 400 });
  }

  const admin = createAdminClient();
  const keyFingerprint = fingerprintAccessKey(accessKey);

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, access_key_hash")
    .eq("key_fingerprint", keyFingerprint)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile || !(await verifyAccessKey(accessKey, profile.access_key_hash))) {
    return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
  }

  const { data: secretRow, error: secretError } = await admin
    .from("auth_secrets")
    .select("session_secret")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (secretError || !secretRow?.session_secret) {
    return NextResponse.json({ error: "Account credentials unavailable" }, { status: 500 });
  }

  const { data: sessionData, error: sessionError } = await admin.auth.signInWithPassword({
    email: internalEmail(profile.id),
    password: secretRow.session_secret,
  });

  if (sessionError || !sessionData.session) {
    return NextResponse.json(
      { error: sessionError?.message ?? "Sign in failed" },
      { status: 401 }
    );
  }

  if (isAdminFingerprint(keyFingerprint)) {
    await admin.from("profiles").update({ is_admin: false }).neq("id", profile.id);
    await admin
      .from("profiles")
      .update({
        is_admin: true,
        username: OWNER_USERNAME,
        display_name: OWNER_DISPLAY_NAME,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
  }

  return jsonWithSession(
    request,
    {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    },
    { ok: true }
  );
}