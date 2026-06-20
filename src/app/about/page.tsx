import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { PUBLIC_FAQ, buildPageMetadata, faqJsonLd, resolveSiteDescription } from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/siteSettings";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const description = resolveSiteDescription(settings.site_description, settings.site_tagline);
  return buildPageMetadata({
    title: `What is ${settings.site_name}?`,
    description: `${description} Not a steroid shop or motorcycle Riders Club — performance health tracking at roiders.club.`,
    path: "/about",
  });
}

export default async function AboutPage() {
  const settings = await fetchSiteSettings();
  const description = resolveSiteDescription(settings.site_description, settings.site_tagline);
  const signupEnabled = settings.allow_public_signup;

  return (
    <MarketingPageShell siteName={settings.site_name}>
      <JsonLd data={faqJsonLd(PUBLIC_FAQ)} />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className={ui.overline}>About</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          What is {settings.site_name}?
        </h1>
        <p className="mt-4 text-sm text-[var(--muted)] sm:text-base">
          {description}
        </p>

        <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-[var(--muted)]">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Performance health, one app</h2>
            <p>
              <strong className="text-[var(--foreground)]">{settings.site_name}</strong> at{" "}
              <strong className="text-[var(--foreground)]">roiders.club</strong> is a private web app for people
              who track bloodwork, cycle planning, and training seriously. Upload lab PDFs or
              screenshots, get traffic-light analysis flags, plan compounds with saturation curves, and log workouts
              — without juggling separate apps.
            </p>
            <p>
              The core product is <strong className="text-[var(--foreground)]">free</strong>: all three modules,
              cross-module intelligence, export/import, and private access-key login. Optional premium adds
              encrypted cloud sync and premium sources — available on request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Not a steroid shop or compound vendor
            </h2>
            <p>
              <strong className="text-[var(--foreground)]">{settings.site_name}</strong> does not sell compounds,
              ship products, or operate as an e-commerce steroid site. There is no cart, no checkout, and no
              inventory. The app is a harm-reduction-adjacent tracking tool: log bloodwork, plan protocols,
              and record training so you can make more informed decisions with your own data and
              clinical guidance.
            </p>
            <p>
              If you landed here looking for a &quot;roid&quot; brand or underground vendor marketplace, that is
              not what this is. See our{" "}
              <Link href="/terms" className="text-[var(--labs)] hover:underline">
                Terms of Service
              </Link>{" "}
              for the educational-use disclaimer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Not &quot;Riders Club&quot; motorcycle or cycling sites
            </h2>
            <p>
              If you searched &quot;what is roiders.club&quot; and saw motorcycle clubs, cycling marathons, or
              Royal Enfield owner groups — that is a different thing.{" "}
              <strong className="text-[var(--foreground)]">Roiders Club</strong> (spelled with an{" "}
              <strong className="text-[var(--foreground)]">o</strong>, domain{" "}
              <strong className="text-[var(--foreground)]">roiders.club</strong>) is a performance health
              tracking platform, not a riders community or motorsport organization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">What you can track</h2>
            <p>
              Each module has a public overview on our{" "}
              <Link href="/features" className="text-[var(--labs)] hover:underline">
                features pages
              </Link>
              .
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <Link href="/features/labs" className="text-[var(--labs)] hover:underline">
                  <strong className="text-[var(--foreground)]">Labs</strong>
                </Link>{" "}
                — bloodwork logging, trend charts, optimized on-cycle ranges, OCR screenshot upload, review flags
              </li>
              <li>
                <Link href="/features/gear" className="text-[var(--labs)] hover:underline">
                  <strong className="text-[var(--foreground)]">Gear</strong>
                </Link>{" "}
                — cycle builder, PK saturation curves, compound risk, 100+ guides
              </li>
              <li>
                <Link href="/features/training" className="text-[var(--labs)] hover:underline">
                  <strong className="text-[var(--foreground)]">Training</strong>
                </Link>{" "}
                — workout log, programs, PRs, weekly volume
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Privacy-first</h2>
            <p>
              No email required. Sign in with a private access key. Data stays on your device by default; cloud
              sync is opt-in premium. See our{" "}
              <Link href="/privacy" className="text-[var(--labs)] hover:underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {signupEnabled ? (
            <Link href="/auth/signup" className={ui.btnPrimary}>
              Create free account
            </Link>
          ) : (
            <Link href="/auth/login" className={ui.btnPrimary}>
              Sign in
            </Link>
          )}
          <Link href="/" className={ui.btnSecondary}>
            Back to home
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">FAQ</h2>
          <dl className="mt-4 space-y-4">
            {PUBLIC_FAQ.map((item) => (
              <div key={item.question} className={cn(ui.card, ui.cardPad)}>
                <dt className="font-semibold text-[var(--foreground)]">{item.question}</dt>
                <dd className="mt-2 text-sm text-[var(--muted)]">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </MarketingPageShell>
  );
}