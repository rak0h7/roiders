import type { User } from "@supabase/supabase-js";
import type { CloudModule } from "@/lib/cloudSync";
import { summarizeModuleData } from "@/lib/cloudSync";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminFingerprint } from "@/lib/adminFingerprint";
import { loadUserProfile, resolveProfileGate } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export type AdminProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  key_fingerprint: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUser = AdminProfile & {
  module_count: number;
  modules: string[];
};

export function createSessionClient(request: NextRequest, response?: NextResponse) {
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        if (!response) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

export async function getSessionUser(request: NextRequest) {
  const supabase = createSessionClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isUserAdmin(request: NextRequest, userId: string) {
  const supabase = createSessionClient(request);
  const profile = await loadUserProfile(supabase, userId);
  return profile.is_admin;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const admin = await isUserAdmin(request, user.id);
  if (!admin) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}

export async function fetchAdminStats() {
  const admin = createAdminClient();

  let profilesRes = await admin
    .from("profiles")
    .select("id, is_admin, key_fingerprint, created_at", { count: "exact" });

  if (profilesRes.error?.message?.includes("does not exist")) {
    profilesRes = await admin
      .from("profiles")
      .select("id, key_fingerprint, created_at", { count: "exact" });
  }

  const modulesRes = await admin.from("user_modules").select("user_id, module", { count: "exact" });

  if (profilesRes.error) throw profilesRes.error;
  if (modulesRes.error) throw modulesRes.error;

  const profiles = profilesRes.data ?? [];
  const modules = modulesRes.data ?? [];

  return {
    totalAccounts: profilesRes.count ?? profiles.length,
    adminAccounts: profiles.filter(
      (p) => Boolean(p.is_admin) || isAdminFingerprint(p.key_fingerprint)
    ).length,
    syncedModules: modulesRes.count ?? modules.length,
    accountsLast7Days: profiles.filter((p) => {
      const created = new Date(p.created_at).getTime();
      return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
    }).length,
    moduleBreakdown: modules.reduce<Record<string, number>>((acc, row) => {
      acc[row.module] = (acc[row.module] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient();

  const fullProfilesRes = await admin
    .from("profiles")
    .select("id, username, display_name, key_fingerprint, is_admin, created_at, updated_at")
    .order("created_at", { ascending: false });

  const profilesRes =
    fullProfilesRes.error?.message?.includes("does not exist")
      ? await admin
          .from("profiles")
          .select("id, display_name, key_fingerprint, created_at, updated_at")
          .order("created_at", { ascending: false })
      : fullProfilesRes;

  const { data: modules, error: modulesError } = await admin.from("user_modules").select("user_id, module");

  if (profilesRes.error) throw profilesRes.error;
  if (modulesError) throw modulesError;

  const profileRows = (profilesRes.data ?? []) as Record<string, unknown>[];

  const modulesByUser = (modules ?? []).reduce<Record<string, string[]>>((acc, row) => {
    if (!acc[row.user_id]) acc[row.user_id] = [];
    acc[row.user_id].push(row.module);
    return acc;
  }, {});

  return profileRows.map((row) => {
    const profile = resolveProfileGate(row);
    const userModules = modulesByUser[row.id as string] ?? [];
    return {
      id: row.id as string,
      username: profile.username,
      display_name: profile.display_name,
      key_fingerprint: profile.key_fingerprint,
      is_admin: profile.is_admin,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      modules: userModules,
      module_count: userModules.length,
    };
  });
}

export type AdminUserModule = {
  module: CloudModule;
  updated_at: string;
  summary: string;
  size_bytes: number;
};

export async function fetchAdminUserModules(userId: string): Promise<AdminUserModule[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_modules")
    .select("module, data, updated_at")
    .eq("user_id", userId)
    .order("module");

  if (error) throw error;

  return (data ?? []).map((row) => {
    const mod = row.module as CloudModule;
    const serialized = JSON.stringify(row.data ?? {});
    return {
      module: mod,
      updated_at: row.updated_at as string,
      summary: summarizeModuleData(mod, row.data),
      size_bytes: serialized.length,
    };
  });
}

export async function resetAdminUserModule(userId: string, module: CloudModule | "all") {
  const admin = createAdminClient();
  if (module === "all") {
    const { error } = await admin.from("user_modules").delete().eq("user_id", userId);
    if (error) throw error;
    return;
  }
  const { error } = await admin.from("user_modules").delete().eq("user_id", userId).eq("module", module);
  if (error) throw error;
}

export async function deleteAdminUser(actor: User, targetId: string) {
  if (actor.id === targetId) {
    throw new Error("You cannot delete your own account from the admin panel");
  }

  const admin = createAdminClient();
  const { data: target, error: targetError } = await admin
    .from("profiles")
    .select("id, is_admin, key_fingerprint")
    .eq("id", targetId)
    .maybeSingle();

  if (targetError && !targetError.message.includes("does not exist")) throw targetError;

  let targetRow: Record<string, unknown> | null = target as Record<string, unknown> | null;
  if (targetError?.message.includes("does not exist")) {
    const fallback = await admin
      .from("profiles")
      .select("id, key_fingerprint")
      .eq("id", targetId)
      .maybeSingle();
    if (fallback.error) throw fallback.error;
    targetRow = fallback.data as Record<string, unknown> | null;
  }

  if (!targetRow) throw new Error("Account not found");
  const resolved = resolveProfileGate(targetRow);
  if (resolved.is_admin) throw new Error("Cannot delete another admin account");

  const { error: deleteError } = await admin.auth.admin.deleteUser(targetId);
  if (deleteError) throw deleteError;
}