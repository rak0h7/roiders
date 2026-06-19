import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import type { FeaturePage } from "@/lib/featurePages";
import { featurePageJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type FeaturePageLayoutProps = {
  page: FeaturePage;
  siteName: string;
  signupEnabled: boolean;
  premiumHref: string;
};

function accentCard(accent: FeaturePage["accent"]) {
  return { labs: ui.cardLabs, protocol: ui.cardProtocol, intel: ui.cardIntel }[accent];
}

function accentText(accent: FeaturePage["accent"]) {
  return {
    labs: "text-[var(--labs)]",
    protocol: "text-[var(--protocol)]",
    intel: "text-[var(--intel)]",
  }[accent];
}

export function FeaturePageLayout({ page, siteName, signupEnabled, premiumHref }: FeaturePageLayoutProps) {
  return (
    <MarketingPageShell siteName={siteName}>
      <JsonLd data={featurePageJsonLd(page)} />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/features"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All features
        </Link>

        <p className={cn(ui.overline, "mt-6")}>Feature</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{page.h1}</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">{page.intro}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {page.highlights.map((item) => (
            <li
              key={item}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--muted)]"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {section.heading}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{section.summary}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {section.subFeatures.map((sub) => (
                  <li key={sub.title} className={cn(accentCard(page.accent), ui.cardPad)}>
                    <h3 className={cn("text-sm font-semibold", accentText(page.accent))}>{sub.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{sub.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className={cn(ui.cardInner, "mt-10 flex items-start gap-2.5 px-4 py-3 text-xs text-[var(--muted)]")}>
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
          <p>
            Educational and planning tools only — not medical advice. Always pair protocol decisions with labs and
            qualified clinical guidance.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {signupEnabled ? (
            <Link href="/auth/signup" className={ui.btnPrimary}>
              Create free account
            </Link>
          ) : (
            <a href={premiumHref} className={ui.btnPrimary}>
              Request access
            </a>
          )}
          <Link href="/features" className={ui.btnSecondary}>
            View all features
          </Link>
        </div>
      </article>
    </MarketingPageShell>
  );
}