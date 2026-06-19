import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { buildPageMetadata } from "@/lib/seo";
import { fetchSiteSettings, resolveLegalContactHref } from "@/lib/siteSettings";

const UPDATED = "June 18, 2026";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How Roiders Club handles your data — local-first storage, optional cloud sync, and access-key authentication.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const settings = await fetchSiteSettings();
  const supportHref = resolveLegalContactHref(settings);

  return (
    <LegalPageShell siteName={settings.site_name} title="Privacy Policy" updated={UPDATED}>
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Overview</h2>
        <p>
          {settings.site_name} is built privacy-first. We do not require an email address or social login.
          By default, your tracking data stays on your device. This policy explains what we collect, when
          cloud sync applies, and your choices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">What we collect</h2>
        <p>
          <strong className="text-[var(--foreground)]">Account identifiers.</strong> When you create an
          account, we store a cryptographic hash and fingerprint of your access key — never the key itself in
          plain text. We may store an optional username and display name you choose.
        </p>
        <p>
          <strong className="text-[var(--foreground)]">Application data (local).</strong> Labs, gear,
          training, nutrition logs, settings, and exports are stored in your browser&apos;s local storage by
          default. This data does not leave your device unless you enable cloud sync or export it yourself.
        </p>
        <p>
          <strong className="text-[var(--foreground)]">Application data (cloud sync).</strong> If premium
          cloud sync is enabled for your account and the platform sync switch is on, your module data is
          stored in our database so you can access it across devices. You can request sync be disabled at any
          time via support.
        </p>
        <p>
          <strong className="text-[var(--foreground)]">Technical data.</strong> Like most web services, our
          host (Vercel) and database provider (Supabase) may process standard request logs — IP address,
          browser type, timestamps — for security and operations. We do not use third-party advertising
          trackers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">What we do not collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Email addresses (unless you voluntarily contact us outside the app)</li>
          <li>Real names (unless you enter one as a display name)</li>
          <li>Payment card data (premium is arranged off-platform)</li>
          <li>Third-party analytics or ad profiling cookies</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">How we use information</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Authenticate you when you sign in with your access key</li>
          <li>Store and sync your tracking data when cloud sync is enabled</li>
          <li>Operate admin and vendor tools for account management</li>
          <li>Maintain security, prevent abuse, and improve reliability</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Data retention</h2>
        <p>
          Local data remains on your device until you clear browser storage or uninstall. Cloud-synced data
          is retained while your account is active and sync remains enabled. If your account is deleted by an
          administrator, associated cloud data is removed. Export your data regularly if you want an
          independent backup.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Your choices</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--foreground)]">Export:</strong> Download a full JSON export from
            Settings at any time
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Local-only:</strong> Use the free tier without cloud
            sync — no server copy of your module data
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Sync opt-in:</strong> Cloud sync is off by default
            and only enabled per account by an administrator after you request premium access
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Security</h2>
        <p>
          Access keys are verified using one-way hashing. Sessions use secure cookies. Cloud data is
          transmitted over HTTPS. No system is perfectly secure — protect your access key like a password.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Children</h2>
        <p>
          The Service is not intended for anyone under 18. We do not knowingly collect data from minors.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date above reflects the
          current version. Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Related policies</h2>
        <p>
          See also our{" "}
          <Link href="/terms" className="text-[var(--labs)] hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Contact</h2>
        <p>
          Privacy questions or data requests?{" "}
          <a href={supportHref} className="text-[var(--labs)] hover:underline" target="_blank" rel="noopener noreferrer">
            Contact support
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}