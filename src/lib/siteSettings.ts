import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SITE_DESCRIPTION } from "@/lib/seo";
import type { AppRoute } from "@/context/NavigationContext";
import type { RangeMode } from "@/lib/types";

export type AnnouncementLevel = "info" | "warning" | "danger";
export type SiteModule = "labs" | "cycle" | "gym" | "nutrition";
export type SiteLabsRangeMode = RangeMode;

export type SiteSettings = {
  site_name: string;
  site_tagline: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  allow_public_signup: boolean;
  announcement_enabled: boolean;
  announcement_message: string;
  announcement_level: AnnouncementLevel;
  announcement_link: string;
  welcome_message: string;
  login_message: string;
  signup_message: string;
  support_url: string;
  max_accounts: number;
  cloud_sync_enabled: boolean;
  debug_panel_enabled: boolean;
  module_labs_enabled: boolean;
  module_cycle_enabled: boolean;
  module_gym_enabled: boolean;
  module_nutrition_enabled: boolean;
  public_landing_enabled: boolean;
  premium_sources_enabled: boolean;
  vendor_portal_enabled: boolean;
  default_labs_range_mode: SiteLabsRangeMode;
  legal_contact_email: string;
  signup_closed_message: string;
  site_description: string;
  announcement_guest_visible: boolean;
  updated_at: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "Roiders Club",
  site_tagline: "Private performance tracking",
  maintenance_mode: false,
  maintenance_message: "Roiders Club is undergoing maintenance. Please check back soon.",
  allow_public_signup: true,
  announcement_enabled: false,
  announcement_message: "",
  announcement_level: "info",
  announcement_link: "",
  welcome_message: "",
  login_message: "",
  signup_message: "",
  support_url: "",
  max_accounts: 50,
  cloud_sync_enabled: true,
  debug_panel_enabled: false,
  module_labs_enabled: true,
  module_cycle_enabled: true,
  module_gym_enabled: true,
  module_nutrition_enabled: true,
  public_landing_enabled: true,
  premium_sources_enabled: true,
  vendor_portal_enabled: true,
  default_labs_range_mode: "optimized",
  legal_contact_email: "",
  signup_closed_message: "",
  site_description: DEFAULT_SITE_DESCRIPTION,
  announcement_guest_visible: false,
  updated_at: new Date().toISOString(),
};

export type PublicSiteSettings = Pick<
  SiteSettings,
  | "site_name"
  | "site_tagline"
  | "site_description"
  | "maintenance_message"
  | "allow_public_signup"
  | "announcement_enabled"
  | "announcement_message"
  | "announcement_level"
  | "announcement_link"
  | "announcement_guest_visible"
  | "welcome_message"
  | "login_message"
  | "signup_message"
  | "signup_closed_message"
  | "support_url"
  | "cloud_sync_enabled"
  | "debug_panel_enabled"
  | "module_labs_enabled"
  | "module_cycle_enabled"
  | "module_gym_enabled"
  | "module_nutrition_enabled"
  | "public_landing_enabled"
  | "premium_sources_enabled"
  | "vendor_portal_enabled"
  | "default_labs_range_mode"
>;

export type SiteSettingsPatch = Partial<
  Pick<
    SiteSettings,
    | "site_name"
    | "site_tagline"
    | "maintenance_mode"
    | "maintenance_message"
    | "allow_public_signup"
    | "announcement_enabled"
    | "announcement_message"
    | "announcement_level"
    | "announcement_link"
    | "welcome_message"
    | "login_message"
    | "signup_message"
    | "support_url"
    | "max_accounts"
    | "cloud_sync_enabled"
    | "debug_panel_enabled"
    | "module_labs_enabled"
    | "module_cycle_enabled"
    | "module_gym_enabled"
    | "module_nutrition_enabled"
    | "public_landing_enabled"
    | "premium_sources_enabled"
    | "vendor_portal_enabled"
    | "default_labs_range_mode"
    | "legal_contact_email"
    | "signup_closed_message"
    | "site_description"
    | "announcement_guest_visible"
  >
>;

export function toPublicSettings(settings: SiteSettings): PublicSiteSettings {
  return {
    site_name: settings.site_name,
    site_tagline: settings.site_tagline,
    site_description: settings.site_description,
    maintenance_message: settings.maintenance_message,
    allow_public_signup: settings.allow_public_signup,
    announcement_enabled: settings.announcement_enabled,
    announcement_message: settings.announcement_message,
    announcement_level: settings.announcement_level,
    announcement_link: settings.announcement_link,
    announcement_guest_visible: settings.announcement_guest_visible,
    welcome_message: settings.welcome_message,
    login_message: settings.login_message,
    signup_message: settings.signup_message,
    signup_closed_message: settings.signup_closed_message,
    support_url: settings.support_url,
    cloud_sync_enabled: settings.cloud_sync_enabled,
    debug_panel_enabled: settings.debug_panel_enabled,
    module_labs_enabled: settings.module_labs_enabled,
    module_cycle_enabled: settings.module_cycle_enabled,
    module_gym_enabled: settings.module_gym_enabled,
    module_nutrition_enabled: settings.module_nutrition_enabled,
    public_landing_enabled: settings.public_landing_enabled,
    premium_sources_enabled: settings.premium_sources_enabled,
    vendor_portal_enabled: settings.vendor_portal_enabled,
    default_labs_range_mode: settings.default_labs_range_mode,
  };
}

export function resolveLegalContactHref(
  settings: Pick<SiteSettings, "legal_contact_email" | "support_url">
): string {
  const email = settings.legal_contact_email.trim();
  if (email) return `mailto:${email}`;
  return settings.support_url.trim() || "mailto:support@roiders.club";
}

export function routeModule(route: AppRoute): SiteModule | null {
  if (route.startsWith("bloodwork")) return "labs";
  if (route.startsWith("cycle")) return "cycle";
  if (route.startsWith("gym")) return "gym";
  if (route.startsWith("nutrition")) return "nutrition";
  return null;
}

type ModuleToggleSettings = Pick<
  SiteSettings,
  "module_labs_enabled" | "module_cycle_enabled" | "module_gym_enabled" | "module_nutrition_enabled"
>;

export function isModuleEnabled(settings: ModuleToggleSettings, module: SiteModule): boolean {
  switch (module) {
    case "labs":
      return settings.module_labs_enabled !== false;
    case "cycle":
      return settings.module_cycle_enabled !== false;
    case "gym":
      return settings.module_gym_enabled !== false;
    case "nutrition":
      return settings.module_nutrition_enabled !== false;
    default:
      return true;
  }
}

export function isRouteEnabled(settings: ModuleToggleSettings, route: AppRoute): boolean {
  const mod = routeModule(route);
  if (!mod) return true;
  return isModuleEnabled(settings, mod);
}

function normalizeRow(row: Record<string, unknown>): SiteSettings {
  const level = row.announcement_level;
  const announcementLevel: AnnouncementLevel =
    level === "warning" || level === "danger" ? level : "info";

  const maxAccounts = Number(row.max_accounts);
  const parsedMax = Number.isFinite(maxAccounts) && maxAccounts >= 0 ? Math.floor(maxAccounts) : 0;

  return {
    site_name: typeof row.site_name === "string" ? row.site_name : DEFAULT_SITE_SETTINGS.site_name,
    site_tagline:
      typeof row.site_tagline === "string" ? row.site_tagline : DEFAULT_SITE_SETTINGS.site_tagline,
    maintenance_mode: Boolean(row.maintenance_mode),
    maintenance_message:
      typeof row.maintenance_message === "string"
        ? row.maintenance_message
        : DEFAULT_SITE_SETTINGS.maintenance_message,
    allow_public_signup:
      row.allow_public_signup === undefined
        ? DEFAULT_SITE_SETTINGS.allow_public_signup
        : Boolean(row.allow_public_signup),
    announcement_enabled: Boolean(row.announcement_enabled),
    announcement_message:
      typeof row.announcement_message === "string" ? row.announcement_message : "",
    announcement_level: announcementLevel,
    announcement_link:
      typeof row.announcement_link === "string" ? row.announcement_link : "",
    welcome_message: typeof row.welcome_message === "string" ? row.welcome_message : "",
    login_message: typeof row.login_message === "string" ? row.login_message : "",
    signup_message: typeof row.signup_message === "string" ? row.signup_message : "",
    support_url: typeof row.support_url === "string" ? row.support_url : "",
    max_accounts: parsedMax,
    cloud_sync_enabled: row.cloud_sync_enabled === undefined ? true : Boolean(row.cloud_sync_enabled),
    debug_panel_enabled: Boolean(row.debug_panel_enabled),
    module_labs_enabled: row.module_labs_enabled === undefined ? true : Boolean(row.module_labs_enabled),
    module_cycle_enabled:
      row.module_cycle_enabled === undefined ? true : Boolean(row.module_cycle_enabled),
    module_gym_enabled: row.module_gym_enabled === undefined ? true : Boolean(row.module_gym_enabled),
    module_nutrition_enabled:
      row.module_nutrition_enabled === undefined ? true : Boolean(row.module_nutrition_enabled),
    public_landing_enabled:
      row.public_landing_enabled === undefined ? true : Boolean(row.public_landing_enabled),
    premium_sources_enabled:
      row.premium_sources_enabled === undefined ? true : Boolean(row.premium_sources_enabled),
    vendor_portal_enabled:
      row.vendor_portal_enabled === undefined ? true : Boolean(row.vendor_portal_enabled),
    default_labs_range_mode:
      row.default_labs_range_mode === "lab" ? "lab" : "optimized",
    legal_contact_email:
      typeof row.legal_contact_email === "string" ? row.legal_contact_email : "",
    signup_closed_message:
      typeof row.signup_closed_message === "string" ? row.signup_closed_message : "",
    site_description: typeof row.site_description === "string" ? row.site_description : "",
    announcement_guest_visible: Boolean(row.announcement_guest_visible),
    updated_at:
      typeof row.updated_at === "string" ? row.updated_at : DEFAULT_SITE_SETTINGS.updated_at,
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("site_settings").select("*").eq("id", 1).maybeSingle();

    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return normalizeRow(data);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function fetchAccountCount(): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin.from("profiles").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function assertCanCreateAccount(settings: SiteSettings): Promise<string | null> {
  if (settings.max_accounts <= 0) return null;
  const count = await fetchAccountCount();
  if (count >= settings.max_accounts) {
    return `Account limit reached (${settings.max_accounts}). Contact the site owner.`;
  }
  return null;
}

export async function updateSiteSettings(
  patch: SiteSettingsPatch,
  updatedBy: string
): Promise<SiteSettings> {
  const admin = createAdminClient();
  const payload = {
    ...patch,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  };

  const { data, error } = await admin
    .from("site_settings")
    .upsert({ id: 1, ...payload }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return normalizeRow(data);
}

function isValidUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSiteSettingsPatch(patch: SiteSettingsPatch): string | null {
  if (patch.site_name !== undefined) {
    const name = patch.site_name.trim();
    if (!name) return "Site name is required";
    if (name.length > 60) return "Site name must be 60 characters or fewer";
  }

  if (patch.site_tagline !== undefined && patch.site_tagline.length > 120) {
    return "Tagline must be 120 characters or fewer";
  }

  if (patch.maintenance_message !== undefined && patch.maintenance_message.length > 500) {
    return "Maintenance message must be 500 characters or fewer";
  }

  if (patch.announcement_message !== undefined && patch.announcement_message.length > 500) {
    return "Announcement must be 500 characters or fewer";
  }

  if (patch.welcome_message !== undefined && patch.welcome_message.length > 300) {
    return "Welcome message must be 300 characters or fewer";
  }

  if (patch.login_message !== undefined && patch.login_message.length > 300) {
    return "Login message must be 300 characters or fewer";
  }

  if (patch.signup_message !== undefined && patch.signup_message.length > 300) {
    return "Signup message must be 300 characters or fewer";
  }

  if (patch.support_url !== undefined && patch.support_url.trim()) {
    if (!isValidUrl(patch.support_url.trim())) return "Support URL must be a valid http(s) link";
  }

  if (patch.announcement_link !== undefined && patch.announcement_link.trim()) {
    if (!isValidUrl(patch.announcement_link.trim())) {
      return "Announcement link must be a valid http(s) URL";
    }
  }

  if (patch.max_accounts !== undefined) {
    if (!Number.isInteger(patch.max_accounts) || patch.max_accounts < 0 || patch.max_accounts > 10_000) {
      return "Max accounts must be 0 (unlimited) or a positive integer up to 10,000";
    }
  }

  if (
    patch.announcement_level !== undefined &&
    !["info", "warning", "danger"].includes(patch.announcement_level)
  ) {
    return "Invalid announcement level";
  }

  if (patch.default_labs_range_mode !== undefined && !["lab", "optimized"].includes(patch.default_labs_range_mode)) {
    return "Default labs range mode must be lab or optimized";
  }

  if (patch.legal_contact_email !== undefined && patch.legal_contact_email.length > 120) {
    return "Legal contact email must be 120 characters or fewer";
  }

  if (patch.signup_closed_message !== undefined && patch.signup_closed_message.length > 300) {
    return "Signup closed message must be 300 characters or fewer";
  }

  if (patch.site_description !== undefined && patch.site_description.length > 200) {
    return "Site description must be 200 characters or fewer";
  }

  return null;
}