import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturePageLayout } from "@/components/marketing/FeaturePageLayout";
import { FEATURE_SLUGS, getFeaturePage, isFeatureSlug } from "@/lib/featurePages";
import { buildPageMetadata } from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getFeaturePage(slug);
  if (!page) return {};

  return buildPageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: `/features/${page.slug}`,
  });
}

export default async function FeatureSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isFeatureSlug(slug)) notFound();

  const page = getFeaturePage(slug);
  if (!page) notFound();

  const settings = await fetchSiteSettings();
  const premiumHref =
    settings.support_url.trim() || "mailto:support@roiders.club?subject=Premium%20access%20request";

  return (
    <FeaturePageLayout
      page={page}
      siteName={settings.site_name}
      signupEnabled={settings.allow_public_signup}
      premiumHref={premiumHref}
    />
  );
}