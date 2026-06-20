import type { Metadata } from "next";
import { FeaturesIndexContent } from "@/components/marketing/FeaturesIndexContent";
import { buildPageMetadata } from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  return buildPageMetadata({
    title: `Features — Labs, Gear & Training`,
    description: `Explore ${settings.site_name} modules: bloodwork tracking, cycle planning, and workout logging. Free performance health tools at roiders.club.`,
    path: "/features",
  });
}

export default async function FeaturesPage() {
  const settings = await fetchSiteSettings();
  return <FeaturesIndexContent siteName={settings.site_name} />;
}