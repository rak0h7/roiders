import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { fetchSiteSettings, resolveLegalContactHref } from "@/lib/siteSettings";

const UPDATED = "June 18, 2026";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Roiders Club — private performance health tracking with access-key authentication.",
};

export default async function TermsPage() {
  const settings = await fetchSiteSettings();
  const supportHref = resolveLegalContactHref(settings);

  return (
    <LegalPageShell siteName={settings.site_name} title="Terms of Service" updated={UPDATED}>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Agreement</h2>
        <p>
          By creating an account or using {settings.site_name} (&quot;the Service&quot;), you agree to these
          Terms of Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Not medical advice</h2>
        <p>
          {settings.site_name} is a personal tracking and interpretation tool. It does not provide medical
          advice, diagnosis, or treatment. Content, flags, simulations, and guides are for informational
          purposes only. Always consult a qualified healthcare professional before making health decisions.
          You use the Service at your own risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Eligibility</h2>
        <p>
          You must be at least 18 years old to use the Service. You are responsible for ensuring your use
          complies with applicable laws in your jurisdiction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Accounts &amp; access keys</h2>
        <p>
          The Service uses private access keys instead of email passwords. You are solely responsible for
          keeping your key secure. We cannot recover a lost key. Do not share your key with others. You are
          responsible for all activity under your account.
        </p>
        <p>
          Free accounts store data locally in your browser by default. Premium cloud sync, when enabled for
          your account, stores encrypted application data on our infrastructure to sync across devices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Attempt to access other users&apos; data or administrative systems</li>
          <li>Reverse engineer, scrape, or overload the Service</li>
          <li>Use the Service for unlawful purposes or to harm others</li>
          <li>Resell or redistribute access except through approved vendor programs authorized by us</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Your data</h2>
        <p>
          You retain ownership of the data you enter. You may export your data at any time from Settings.
          See our{" "}
          <Link href="/privacy" className="text-[var(--labs)] hover:underline">
            Privacy Policy
          </Link>{" "}
          for how we handle information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Service availability</h2>
        <p>
          We may modify, suspend, or discontinue features at any time, including maintenance periods. The
          Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind,
          express or implied.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {settings.site_name} and its operators shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages, or any loss of data,
          profits, or health outcomes arising from your use of the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Termination</h2>
        <p>
          We may suspend or terminate access for violations of these Terms or to protect the Service. You
          may stop using the Service at any time. Export your data before discontinuing use if you wish to
          keep a copy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Changes</h2>
        <p>
          We may update these Terms from time to time. Continued use after changes constitutes acceptance of
          the revised Terms. Material changes will be reflected by updating the date above.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Contact</h2>
        <p>
          Questions about these Terms?{" "}
          <a href={supportHref} className="text-[var(--labs)] hover:underline" target="_blank" rel="noopener noreferrer">
            Contact support
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}