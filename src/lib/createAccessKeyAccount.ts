import { randomBytes } from "crypto";
import {
  fingerprintAccessKey,
  generateAccessKey,
  hashAccessKey,
  internalEmail,
} from "@/lib/accessKey.server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreatedAccessKeyAccount = {
  accessKey: string;
  userId: string;
  keyFingerprint: string;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  };
};

export async function createAccessKeyAccount(): Promise<CreatedAccessKeyAccount> {
  const admin = createAdminClient();
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
    throw new Error(createError?.message ?? "Failed to create account");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    key_fingerprint: keyFingerprint,
    access_key_hash: accessKeyHash,
    display_name: null,
    username: null,
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

  const { data: sessionData, error: sessionError } = await admin.auth.signInWithPassword({
    email,
    password: sessionSecret,
  });

  if (sessionError || !sessionData.session) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(sessionError?.message ?? "Account created but session failed");
  }

  return {
    accessKey,
    userId: created.user.id,
    keyFingerprint,
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at,
    },
  };
}