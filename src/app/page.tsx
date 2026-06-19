import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthenticatedAppEntry } from "@/components/landing/AuthenticatedAppEntry";
import { PublicHomeContent } from "@/components/landing/PublicHomeContent";
import { buildPageMetadata, PRIVATE_PAGE_METADATA, resolveSiteDescription } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();

  if (!settings.public_landing_enabled) {
    return {
      ...PRIVATE_PAGE_METADATA,
      title: `Sign in — ${settings.site_name}`,
      description: `Sign in to ${settings.site_name} — private performance health tracking.`,
    };
  }

  const description = resolveSiteDescription(settings.site_description, settings.site_tagline);
  return buildPageMetadata({
    title: `${settings.site_name} — Performance Health Tracker for Bloodwork, Cycles & Training`,
    description,
    path: "/",
  });
}

export default async function HomePage() {
  const settings = await fetchSiteSettings();

  if (settings.maintenance_mode) {
    redirect("/maintenance");
  }

  if (!isSupabaseConfigured()) {
    return <PublicHomeContent settings={settings} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <AuthenticatedAppEntry />;
  }

  if (!settings.public_landing_enabled) {
    redirect("/auth/login");
  }

  return <PublicHomeContent settings={settings} />;
}