import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const VAULT_SALT = "roiders-club-key-vault-v1";

function vaultKey(): Buffer {
  const secret = process.env.ACCESS_KEY_VAULT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("ACCESS_KEY_VAULT_SECRET must be set (at least 32 characters)");
  }
  return scryptSync(secret, VAULT_SALT, 32);
}

export function encryptAccessKey(accessKey: string): string {
  const key = vaultKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(accessKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((buf) => buf.toString("base64url")).join(".");
}

export function decryptAccessKey(payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 3) throw new Error("Invalid vault payload");

  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");

  const decipher = createDecipheriv("aes-256-gcm", vaultKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export async function storeAccessKeyInVault(
  userId: string,
  accessKey: string,
  issuedByUserId?: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("access_key_vault").upsert({
    user_id: userId,
    encrypted_key: encryptAccessKey(accessKey),
    issued_by: issuedByUserId ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    if (error.message.includes("does not exist")) {
      throw new Error(
        "access_key_vault table missing — run npm run db:migrate before creating accounts",
      );
    }
    throw new Error(error.message);
  }
}

export async function revealAccessKeyFromVault(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("access_key_vault")
    .select("encrypted_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.message.includes("does not exist")) return null;
    throw new Error(error.message);
  }

  if (!data?.encrypted_key || typeof data.encrypted_key !== "string") return null;
  return decryptAccessKey(data.encrypted_key);
}