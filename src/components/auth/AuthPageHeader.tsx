"use client";

import { useSiteConfig } from "@/context/SiteConfigContext";
import { ui } from "@/lib/ui";

const DEFAULT_COPY = {
  login: "Enter your private access key. No email required.",
  signup: "Generate a one-time access key. Save it — it cannot be recovered.",
  welcome: "Pick a username to finish setting up your account.",
} as const;

const TITLES = {
  login: "Sign in",
  signup: "Create account",
  welcome: "One last step",
} as const;

export function AuthPageHeader({ mode }: { mode: keyof typeof DEFAULT_COPY }) {
  const { settings } = useSiteConfig();

  const custom =
    mode === "login"
      ? settings.login_message
      : mode === "signup"
        ? settings.signup_message
        : settings.welcome_message;

  return (
    <div className="text-center">
      <span className="font-display text-2xl font-semibold text-gradient">{settings.site_name}</span>
      {settings.site_tagline && (
        <p className="mt-1 text-xs text-[var(--muted)]">{settings.site_tagline}</p>
      )}
      <h1 className={`${ui.pageTitle} mt-3`}>{TITLES[mode]}</h1>
      <p className={ui.pageSub}>{custom?.trim() || DEFAULT_COPY[mode]}</p>
    </div>
  );
}