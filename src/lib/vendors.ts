import { createAccessKeyAccount } from "@/lib/createAccessKeyAccount";
import { createAdminClient } from "@/lib/supabase/admin";

export type VendorRecord = {
  id: string;
  profile_id: string;
  name: string;
  contact_url: string;
  key_quota: number;
  keys_issued: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type VendorWithProfile = VendorRecord & {
  profile_username: string | null;
  profile_display_name: string | null;
  profile_fingerprint: string | null;
  active_customers: number;
};

export type VendorCustomer = {
  id: string;
  username: string | null;
  display_name: string | null;
  key_fingerprint: string | null;
  created_at: string;
  module_count: number;
};

export type VendorPatch = Partial<
  Pick<VendorRecord, "name" | "contact_url" | "key_quota" | "enabled">
>;

function normalizeVendorRow(row: Record<string, unknown>): VendorRecord {
  const keyQuota = Number(row.key_quota);
  const keysIssued = Number(row.keys_issued);

  return {
    id: row.id as string,
    profile_id: row.profile_id as string,
    name: typeof row.name === "string" ? row.name : "Vendor",
    contact_url: typeof row.contact_url === "string" ? row.contact_url : "",
    key_quota: Number.isFinite(keyQuota) && keyQuota >= 0 ? Math.floor(keyQuota) : 0,
    keys_issued: Number.isFinite(keysIssued) && keysIssued >= 0 ? Math.floor(keysIssued) : 0,
    enabled: row.enabled !== false,
    created_at: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    updated_at: typeof row.updated_at === "string" ? row.updated_at : new Date().toISOString(),
  };
}

export function vendorKeysRemaining(vendor: Pick<VendorRecord, "key_quota" | "keys_issued">): number | null {
  if (vendor.key_quota <= 0) return null;
  return Math.max(0, vendor.key_quota - vendor.keys_issued);
}

export function assertVendorCanIssue(vendor: VendorRecord): string | null {
  if (!vendor.enabled) return "This vendor account is disabled";
  const remaining = vendorKeysRemaining(vendor);
  if (remaining !== null && remaining <= 0) {
    return `Key quota reached (${vendor.key_quota}). Contact the site owner.`;
  }
  return null;
}

export async function fetchVendorByProfileId(profileId: string): Promise<VendorRecord | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vendors")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    if (error.message.includes("does not exist")) return null;
    throw error;
  }
  if (!data) return null;
  return normalizeVendorRow(data as Record<string, unknown>);
}

export async function fetchVendorById(vendorId: string): Promise<VendorRecord | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("vendors").select("*").eq("id", vendorId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizeVendorRow(data as Record<string, unknown>);
}

export async function fetchVendorsWithStats(): Promise<VendorWithProfile[]> {
  const admin = createAdminClient();

  const { data: vendors, error: vendorsError } = await admin
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  if (vendorsError) {
    if (vendorsError.message.includes("does not exist")) return [];
    throw vendorsError;
  }

  const vendorRows = (vendors ?? []).map((row) => normalizeVendorRow(row as Record<string, unknown>));
  if (vendorRows.length === 0) return [];

  const profileIds = vendorRows.map((v) => v.profile_id);
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, username, display_name, key_fingerprint")
    .in("id", profileIds);

  if (profilesError) throw profilesError;

  const profileById = new Map(
    (profiles ?? []).map((row) => [row.id as string, row as Record<string, unknown>])
  );

  const vendorIds = vendorRows.map((v) => v.id);
  const { data: customers, error: customersError } = await admin
    .from("profiles")
    .select("issued_by_vendor_id")
    .in("issued_by_vendor_id", vendorIds);

  if (customersError && !customersError.message.includes("does not exist")) throw customersError;

  const activeByVendor = (customers ?? []).reduce<Record<string, number>>((acc, row) => {
    const vendorId = row.issued_by_vendor_id as string;
    acc[vendorId] = (acc[vendorId] ?? 0) + 1;
    return acc;
  }, {});

  return vendorRows.map((vendor) => {
    const profile = profileById.get(vendor.profile_id);
    return {
      ...vendor,
      profile_username: typeof profile?.username === "string" ? profile.username : null,
      profile_display_name: typeof profile?.display_name === "string" ? profile.display_name : null,
      profile_fingerprint: typeof profile?.key_fingerprint === "string" ? profile.key_fingerprint : null,
      active_customers: activeByVendor[vendor.id] ?? 0,
    };
  });
}

export async function fetchVendorCustomers(vendorId: string): Promise<VendorCustomer[]> {
  const admin = createAdminClient();

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, username, display_name, key_fingerprint, created_at")
    .eq("issued_by_vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (profilesError) {
    if (profilesError.message.includes("does not exist")) return [];
    throw profilesError;
  }

  const profileRows = profiles ?? [];
  if (profileRows.length === 0) return [];

  const userIds = profileRows.map((row) => row.id as string);
  const { data: modules, error: modulesError } = await admin
    .from("user_modules")
    .select("user_id, module")
    .in("user_id", userIds);

  if (modulesError) throw modulesError;

  const moduleCountByUser = (modules ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.user_id as string] = (acc[row.user_id as string] ?? 0) + 1;
    return acc;
  }, {});

  return profileRows.map((row) => ({
    id: row.id as string,
    username: typeof row.username === "string" ? row.username : null,
    display_name: typeof row.display_name === "string" ? row.display_name : null,
    key_fingerprint: typeof row.key_fingerprint === "string" ? row.key_fingerprint : null,
    created_at: row.created_at as string,
    module_count: moduleCountByUser[row.id as string] ?? 0,
  }));
}

export async function createVendorAccount(input: {
  name: string;
  contact_url?: string;
  key_quota?: number;
}): Promise<{ vendor: VendorRecord; accessKey: string; userId: string }> {
  const name = input.name.trim();
  if (!name) throw new Error("Vendor name is required");
  if (name.length > 80) throw new Error("Vendor name must be 80 characters or fewer");

  const contactUrl = (input.contact_url ?? "").trim();
  const keyQuota =
    input.key_quota === undefined
      ? 0
      : Math.max(0, Math.min(10_000, Math.floor(input.key_quota)));

  const created = await createAccessKeyAccount();
  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      is_vendor: true,
      display_name: name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", created.userId);

  if (profileError) {
    await admin.auth.admin.deleteUser(created.userId);
    throw new Error(profileError.message);
  }

  const { data: vendorRow, error: vendorError } = await admin
    .from("vendors")
    .insert({
      profile_id: created.userId,
      name,
      contact_url: contactUrl,
      key_quota: keyQuota,
      keys_issued: 0,
      enabled: true,
    })
    .select("*")
    .single();

  if (vendorError || !vendorRow) {
    await admin.auth.admin.deleteUser(created.userId);
    throw new Error(vendorError?.message ?? "Failed to create vendor record");
  }

  return {
    vendor: normalizeVendorRow(vendorRow as Record<string, unknown>),
    accessKey: created.accessKey,
    userId: created.userId,
  };
}

export async function updateVendor(vendorId: string, patch: VendorPatch): Promise<VendorRecord> {
  const admin = createAdminClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) throw new Error("Vendor name is required");
    if (name.length > 80) throw new Error("Vendor name must be 80 characters or fewer");
    payload.name = name;
  }

  if (patch.contact_url !== undefined) payload.contact_url = patch.contact_url.trim();
  if (patch.enabled !== undefined) payload.enabled = patch.enabled;

  if (patch.key_quota !== undefined) {
    if (!Number.isInteger(patch.key_quota) || patch.key_quota < 0 || patch.key_quota > 10_000) {
      throw new Error("Key quota must be 0 (unlimited) or a positive integer up to 10,000");
    }
    payload.key_quota = patch.key_quota;
  }

  const { data, error } = await admin
    .from("vendors")
    .update(payload)
    .eq("id", vendorId)
    .select("*")
    .single();

  if (error) throw error;
  return normalizeVendorRow(data as Record<string, unknown>);
}

export async function deleteVendor(vendorId: string): Promise<void> {
  const admin = createAdminClient();
  const vendor = await fetchVendorById(vendorId);
  if (!vendor) throw new Error("Vendor not found");

  await admin.from("profiles").update({ issued_by_vendor_id: null }).eq("issued_by_vendor_id", vendorId);

  const { error: vendorDeleteError } = await admin.from("vendors").delete().eq("id", vendorId);
  if (vendorDeleteError) throw vendorDeleteError;

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_vendor: false, updated_at: new Date().toISOString() })
    .eq("id", vendor.profile_id);

  if (profileError) throw profileError;

  const { error: userDeleteError } = await admin.auth.admin.deleteUser(vendor.profile_id);
  if (userDeleteError) throw userDeleteError;
}

export async function issueVendorCustomerKey(vendorId: string): Promise<{
  accessKey: string;
  userId: string;
  keyFingerprint: string;
}> {
  const vendor = await fetchVendorById(vendorId);
  if (!vendor) throw new Error("Vendor not found");

  const limitError = assertVendorCanIssue(vendor);
  if (limitError) throw new Error(limitError);

  const created = await createAccessKeyAccount({
    issuedByVendorId: vendorId,
    issuedByUserId: vendor.profile_id,
  });
  const admin = createAdminClient();

  const { error: countError } = await admin
    .from("vendors")
    .update({
      keys_issued: vendor.keys_issued + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vendorId);

  if (countError) throw new Error(countError.message);

  return {
    accessKey: created.accessKey,
    userId: created.userId,
    keyFingerprint: created.keyFingerprint,
  };
}