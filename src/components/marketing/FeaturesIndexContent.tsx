import Link from "next/link";
import { Blocks, Dumbbell, FlaskConical } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEATURE_PAGES } from "@/lib/featurePages";
import { getSiteUrl } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const ICONS = {
  labs: FlaskConical,
  gear: Blocks,
  training: Dumbbell,
} as const;

type FeaturesIndexContentProps = {
  siteName: string;
};

function featuresIndexJsonLd(siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: `${getSiteUrl()}/features`,
    name: `${siteName} Features`,
    description:
      "Explore Roiders Club modules for bloodwork tracking, cycle planning, and workout logging — free performance health tools at roiders.club.",
    hasPart: FEATURE_PAGES.map((page) => ({
      "@type": "WebPage",
      name: page.h1,
      url: `${getSiteUrl()}/features/${page.slug}`,
    })),
  };
}

function accentCard(accent: "labs" | "protocol" | "intel") {
  return { labs: ui.cardLabs, protocol: ui.cardProtocol, intel: ui.cardIntel }[accent];
}

function accentText(accent: "labs" | "protocol" | "intel") {
  return {
    labs: "text-[var(--labs)]",
    protocol: "text-[var(--protocol)]",
    intel: "text-[var(--intel)]",
  }[accent];
}

export function FeaturesIndexContent({ siteName }: FeaturesIndexContentProps) {
  return (
    <MarketingPageShell siteName={siteName}>
      <JsonLd data={featuresIndexJsonLd(siteName)} />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className={ui.overline}>Public feature overview</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Performance health features at roiders.club
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {siteName} keeps labs, gear, and training in one private dashboard. These pages describe what
          each module does — crawlable overviews separate from the secure in-app experience behind access-key login.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURE_PAGES.map((page) => {
            const Icon = ICONS[page.slug];
            return (
              <li key={page.slug}>
                <Link
                  href={`/features/${page.slug}`}
                  className={cn(accentCard(page.accent), ui.cardHover, "block h-full", ui.cardPad)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", accentText(page.accent))} aria-hidden />
                    <h2 className={cn("font-display text-lg font-semibold", accentText(page.accent))}>{page.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{page.intro}</p>
                  <span className="mt-4 inline-block text-xs font-semibold text-[var(--foreground)]">
                    Learn more →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </MarketingPageShell>
  );
}