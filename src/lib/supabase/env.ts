import { projectRefFromUrl } from "@/lib/supabase/projectRef";

function projectRefFromJwt(jwt: string): string | null {
  try {
    const payload = jwt.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      ref?: string;
    };
    return json.ref ?? null;
  } catch {
    return null;
  }
}

function getSupabaseUrlOptional(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
}

function getSupabaseAnonKeyOptional(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY
  );
}

function getSupabaseServiceKeyOptional(): string | undefined {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  return key?.trim() || undefined;
}

export function getSupabaseUrl(): string {
  const url = getSupabaseUrlOptional();
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = getSupabaseAnonKeyOptional();
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = getSupabaseServiceKeyOptional();
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrlOptional() && getSupabaseAnonKeyOptional());
}

/** True when any non-empty service role / secret key is configured. */
export function hasServiceRoleKey(): boolean {
  return Boolean(getSupabaseServiceKeyOptional());
}

/** True only when service key exists and matches the configured project ref. */
export function hasSupabaseServiceKey(): boolean {
  const urlRef = projectRefFromUrl(getSupabaseUrlOptional());
  const serviceKey = getSupabaseServiceKeyOptional();
  if (!serviceKey || !urlRef) return false;

  // Legacy JWT service_role keys include the project ref in the payload.
  if (serviceKey.startsWith("eyJ")) {
    const keyRef = projectRefFromJwt(serviceKey);
    return keyRef === urlRef;
  }

  // New sb_secret_* keys cannot be cross-checked here — prefer postgres when unsure.
  return false;
}

export function isAuthServerConfigured(): boolean {
  if (!isSupabaseConfigured()) return false;
  if (hasServiceRoleKey()) return true;
  return Boolean(
    process.env.DATABASE_URL ??
      process.env.SUPABASE_DB_URL ??
      process.env.POSTGRES_URL ??
      process.env.POSTGRES_URL_NON_POOLING ??
      (process.env.POSTGRES_HOST && process.env.POSTGRES_PASSWORD) ??
      process.env.SUPABASE_DB_PASSWORD,
  );
}