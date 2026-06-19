import { randomBytes } from "crypto";
import { internalEmail } from "@/lib/accessKey.server";
import { isInvalidCredentialsError } from "@/lib/auth/credentialErrors";
import { createAdminClient, createAuthClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey } from "@/lib/supabase/env";
import type { Session } from "@supabase/supabase-js";

export { isInvalidCredentialsError } from "@/lib/auth/credentialErrors";

export function generateSessionSecret(): string {
  return randomBytes(32).toString("base64url");
}

async function loadProfileFingerprint(profileId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("key_fingerprint")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return typeof data?.key_fingerprint === "string" ? data.key_fingerprint : null;
}

export async function repairAccountCredentials(profileId: string): Promise<string> {
  const admin = createAdminClient();
  const sessionSecret = generateSessionSecret();
  const keyFingerprint = await loadProfileFingerprint(profileId);

  const { error: updateError } = await admin.auth.admin.updateUserById(profileId, {
    password: sessionSecret,
    ...(keyFingerprint
      ? { user_metadata: { auth_type: "access_key", key_fingerprint: keyFingerprint } }
      : {}),
  });
  if (updateError) throw new Error(updateError.message);

  const { error: secretError } = await admin.from("auth_secrets").upsert({
    user_id: profileId,
    session_secret: sessionSecret,
  });
  if (secretError) throw new Error(secretError.message);

  return sessionSecret;
}

export async function signInWithSessionSecret(
  profileId: string,
  sessionSecret: string
): Promise<{ session: Session | null; error: string | null }> {
  const authClient = hasServiceRoleKey() ? createAdminClient() : createAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email: internalEmail(profileId),
    password: sessionSecret,
  });

  if (error || !data.session) {
    return { session: null, error: error?.message ?? "Sign in failed" };
  }

  return { session: data.session, error: null };
}