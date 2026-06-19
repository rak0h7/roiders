import Link from "next/link";
import {
  Blocks,
  Dumbbell,
  FlaskConical,
  Lock,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { PUBLIC_FAQ, faqJsonLd, resolveSiteDescription, webSiteJsonLd } from "@/lib/seo";
import type { SiteSettings } from "@/lib/siteSettings";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const MODULES = [
  {
    icon: FlaskConical,
    title: "Labs",
    slug: "labs",
    accent: "labs" as const,
    desc: "Log bloodwork, chart markers, and get red/green analysis flags with baseline and on-cycle range modes.",
  },
  {
    icon: Blocks,
    title: "Gear",
    slug: "gear",
    accent: "protocol" as const,
    desc: "Plan cycles, simulate saturation curves, assess compound risk, and browse in-depth guides.",
  },
  {
    icon: Dumbbell,
    title: "Training",
    slug: "training",
    accent: "protocol" as const,
    desc: "Workout diary with programs, PRs, weekly volume charts, rest timers, and supersets.",
  },
  {
    icon: UtensilsCrossed,
    title: "Nutrition",
    slug: "nutrition",
    accent: "intel" as const,
    desc: "Macro targets, daily food log, micronutrient tracking, and custom foods.",
  },
] as const;

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

type Props = {
  settings: SiteSettings;
};

export function PublicHomeContent({ settings }: Props) {
  const description = resolveSiteDescription(settings.site_description, settings.site_tagline);
  const signupEnabled = settings.allow_public_signup;
  const premiumHref = settings.support_url.trim() || "mailto:support@roiders.club?subject=Premium%20access%20request";

  return (
    <MarketingPageShell siteName={settings.site_name}>
      <JsonLd data={webSiteJsonLd(description)} />
      <JsonLd data={faqJsonLd(PUBLIC_FAQ)} />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
        <p className={ui.overline}>Free performance health platform</p>
        <h1 className="font-display mt-3 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
          {settings.site_name} — labs, gear, training &amp; nutrition in{" "}
          <span className="text-gradient text-gradient-glow">one command center</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          {description} Every core module is free. Premium cloud sync is available on request.
        </p>

        <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
          Not a steroid shop, motorcycle club, or cycling site —{" "}
          <Link href="/about" className="text-[var(--labs)] hover:underline">
            learn what {settings.site_name} is
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {signupEnabled ? (
            <Link href="/auth/signup" className={ui.btnPrimary}>
              Create free account
            </Link>
          ) : (
            <a href={premiumHref} className={ui.btnPrimary}>
              Request access
            </a>
          )}
          <Link href="/about" className={ui.btnSecondary}>
            What is {settings.site_name}?
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[var(--labs)]" aria-hidden />
            100% free core product
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[var(--intel)]" aria-hidden />
            Private access-key login
          </span>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Performance health modules built for serious trackers
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Cross-module intelligence connects labs, gear, training, and nutrition so flags surface when your data lines up.
          Explore each module on our public{" "}
          <Link href="/features" className="text-[var(--labs)] hover:underline">
            features pages
          </Link>
          .
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {MODULES.map(({ icon: Icon, title, slug, accent, desc }) => (
            <li key={title} className={cn(accentCard(accent), ui.cardPad)}>
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", accentText(accent))} aria-hidden />
                <h3 className={cn("font-display text-lg font-semibold", accentText(accent))}>
                  <Link href={`/features/${slug}`} className="hover:underline">
                    {title}
                  </Link>
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{desc}</p>
              <Link
                href={`/features/${slug}`}
                className="mt-3 inline-block text-xs font-semibold text-[var(--foreground)] hover:underline"
              >
                Learn more →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Common questions</h2>
        <dl className="mt-6 space-y-6">
          {PUBLIC_FAQ.map((item) => (
            <div key={item.question} className={cn(ui.card, ui.cardPad)}>
              <dt className="font-semibold text-[var(--foreground)]">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </MarketingPageShell>
  );
}