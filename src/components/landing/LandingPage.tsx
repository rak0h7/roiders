"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  Check,
  Cloud,
  Dumbbell,
  FlaskConical,
  Lock,
  Mail,
  Shield,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { Background } from "@/components/Background";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { SiteAnnouncement } from "@/components/shell/SiteAnnouncement";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const MODULES = [
  {
    icon: FlaskConical,
    title: "Labs",
    accent: "labs" as const,
    desc: "Log panels, track trends over time, and get interpretation flags with baseline and on-cycle range modes.",
    highlights: ["Trend charts", "PDF import", "Cross-alerts"],
  },
  {
    icon: Blocks,
    title: "Gear",
    accent: "protocol" as const,
    desc: "Build your stack, simulate saturation curves, assess compound risk, and browse in-depth guides.",
    highlights: ["Cycle builder", "Risk analytics", "Compound guides"],
  },
  {
    icon: Dumbbell,
    title: "Training",
    accent: "protocol" as const,
    desc: "Log workouts, manage programs, track PRs and weekly volume, with rest timers and supersets.",
    highlights: ["Workout log", "Programs", "Progress charts"],
  },
  {
    icon: UtensilsCrossed,
    title: "Nutrition",
    accent: "intel" as const,
    desc: "Personalized macro targets from your stats, daily food diary, micronutrient tracking, and custom foods.",
    highlights: ["Macro goals", "Food search", "Micro tracking"],
  },
];

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Full access to every tracker. Create an account and start logging immediately.",
    features: [
      "All four modules — labs, gear, training, nutrition",
      "Cross-module intelligence & alerts",
      "Export & import your data anytime",
      "Private access-key login — no email required",
      "On-device storage",
    ],
    cta: "Create free account",
    href: "/auth/signup",
    featured: true,
    requestOnly: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "Request",
    period: "access",
    tagline: "Cloud sync, multi-device backup, and priority support — available on request.",
    features: [
      "Everything in Free",
      "Cloud sync across devices",
      "Automatic backup",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Request premium access",
    href: "#premium",
    featured: false,
    requestOnly: true,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45 },
};

function accentCard(accent: "labs" | "protocol" | "intel") {
  return {
    labs: ui.cardLabs,
    protocol: ui.cardProtocol,
    intel: ui.cardIntel,
  }[accent];
}

function accentText(accent: "labs" | "protocol" | "intel") {
  return {
    labs: "text-[var(--labs)]",
    protocol: "text-[var(--protocol)]",
    intel: "text-[var(--intel)]",
  }[accent];
}

function PreviewDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[var(--radius-xl)] opacity-60 blur-2xl"
        style={{ background: "var(--gradient-ambient)" }}
      />
      <div className={cn(ui.glassAccent, "relative overflow-hidden p-4 sm:p-5")}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={ui.overline}>Command center</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)]/80 px-2.5 py-0.5 text-[10px] text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            All modules active
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className={cn(ui.cardLabs, "p-3")}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--labs)]">Labs score</p>
            <p className="font-display mt-1 text-2xl font-bold">84</p>
            <p className="mt-1 text-[10px] text-[var(--muted)]">2 markers flagged</p>
          </div>
          <div className={cn(ui.cardProtocol, "p-3")}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--protocol)]">Gear</p>
            <p className="font-display mt-1 text-2xl font-bold">4</p>
            <p className="mt-1 text-[10px] text-[var(--muted)]">compounds active</p>
          </div>
          <div className={cn(ui.cardProtocol, "p-3")}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--protocol)]">Training</p>
            <p className="font-display mt-1 text-2xl font-bold">12.4k</p>
            <p className="mt-1 text-[10px] text-[var(--muted)]">lb volume this week</p>
          </div>
          <div className={cn(ui.cardIntel, "p-3")}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--intel)]">Nutrition</p>
            <p className="font-display mt-1 text-2xl font-bold">2,840</p>
            <p className="mt-1 text-[10px] text-[var(--muted)]">kcal · 186g protein</p>
          </div>
        </div>

        <div className={cn(ui.cardInner, "mt-2.5 flex items-center gap-2 px-3 py-2")}>
          <Zap className="h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
          <p className="text-[10px] text-[var(--muted)]">
            Cross-alert: elevated hematocrit while on gear — review labs module
          </p>
        </div>
      </div>
    </div>
  );
}

function requestHref(supportUrl: string) {
  return supportUrl.trim() || "mailto:support@roiders.club?subject=Premium%20access%20request";
}

export function LandingPage() {
  const { settings } = useSiteConfig();
  const signupEnabled = settings.allow_public_signup;
  const premiumHref = requestHref(settings.support_url);

  return (
    <div className="relative min-h-screen">
      <Background />

      <div className="relative z-10">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
            <Link href="/" className="font-display text-lg font-semibold text-gradient">
              {settings.site_name}
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
              <a href="#modules" className="transition hover:text-[var(--foreground)]">Modules</a>
              <a href="#pricing" className="transition hover:text-[var(--foreground)]">Pricing</a>
              <Link href="/privacy" className="transition hover:text-[var(--foreground)]">Privacy</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className={cn(ui.btnGhost, "text-xs sm:text-sm")}>
                Sign in
              </Link>
              {signupEnabled ? (
                <Link href="/auth/signup" className={cn(ui.btnPrimary, "text-xs sm:text-sm")}>
                  Get started free
                </Link>
              ) : (
                <a href={premiumHref} className={cn(ui.btnSecondary, "text-xs sm:text-sm")}>
                  Request access
                </a>
              )}
            </div>
          </div>
        </header>

        <SiteAnnouncement audience="guest" />

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div {...fadeUp}>
              <p className={ui.overline}>Free performance health platform</p>
              <h1 className="font-display mt-3 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                Labs, protocol, training & nutrition —{" "}
                <span className="text-gradient text-gradient-glow">one command center</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                {settings.site_description ||
                  settings.site_tagline ||
                  "Private performance tracking for people who take their bloodwork seriously."}{" "}
                Every module is free. Premium cloud sync is available on request.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {signupEnabled ? (
                  <Link href="/auth/signup" className={ui.btnPrimary}>
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href={premiumHref} className={ui.btnPrimary}>
                    Request access
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                <a href="#modules" className={ui.btnSecondary}>
                  See what&apos;s included
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--labs)]" />
                  100% free core product
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[var(--intel)]" />
                  No email required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[var(--labs)]" />
                  Private access keys
                </span>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.1 }}>
              <PreviewDashboard />
            </motion.div>
          </div>
        </section>

        {/* Cross-intelligence */}
        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]/40 py-14 sm:py-20">
          <motion.div {...fadeUp} className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className={ui.overline}>Cross-intelligence</p>
            <h2 className="font-display mx-auto mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Your data talks to each other
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Roiders Club correlates labs, gear compounds, training load, and nutrition — surfacing alerts
              you would miss when each tracker lives in a separate app.
            </p>
            <div className="mx-auto mt-10 grid max-w-3xl items-stretch gap-3 sm:grid-cols-3">
              {[
                { label: "Lab flags", sub: "Baseline & on-cycle ranges" },
                { label: "Compound risk", sub: "Stack-aware analytics" },
                { label: "Daily macros", sub: "Goal-based from your stats" },
              ].map((item) => (
                <div key={item.label} className={cn(ui.cardInner, "flex h-full flex-col justify-center px-4 py-4 text-left")}>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{item.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Modules */}
        <section id="modules" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div {...fadeUp} className="mb-10 text-center sm:mb-14">
            <p className={ui.overline}>Four integrated trackers</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything included — no paywalls
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted)]">
              Each module is a full tracker on its own. Together they form a unified health dashboard, free for everyone.
            </p>
          </motion.div>

          <div className={cn(ui.equalGrid, "sm:grid-cols-2")}>
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.title}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={cn(accentCard(mod.accent), ui.cardPad, ui.cardHover, "flex h-full flex-col")}
                >
                  <div className="flex flex-1 items-start gap-3">
                    <div
                      className={cn(
                        "flex h-[var(--control-height)] w-[var(--control-height)] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/80",
                        accentText(mod.accent)
                      )}
                    >
                      <Icon className="app-icon" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={ui.sectionTitle}>{mod.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{mod.desc}</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {mod.highlights.map((h) => (
                          <li
                            key={h}
                            className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-2.5 py-0.5 text-[10px] font-medium text-[var(--muted)]"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-[var(--border)] bg-[var(--bg-elevated)]/30 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp} className="mb-10 text-center sm:mb-14">
              <p className={ui.overline}>Simple pricing</p>
              <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Free to use. Premium on request.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted)]">
                The full tracker suite costs nothing. Need cloud sync or priority support? Reach out and we&apos;ll set you up.
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
              {TIERS.map((tier, i) => (
                <motion.div
                  key={tier.id}
                  id={tier.id === "premium" ? "premium" : undefined}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={cn(
                    ui.card,
                    ui.cardPad,
                    "relative flex flex-col",
                    tier.featured && "border-[var(--labs)]/40 shadow-[0_0_40px_var(--labs-glow)]"
                  )}
                >
                  {tier.featured && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--labs)]/40 bg-[var(--labs-dim)] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--labs)]">
                      <Sparkles className="h-3 w-3" />
                      Free forever
                    </span>
                  )}
                  <div>
                    <h3 className="font-display text-lg font-semibold">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-display text-3xl font-bold">{tier.price}</span>
                      {tier.period && (
                        <span className="text-sm text-[var(--muted)]">{tier.period}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">{tier.tagline}</p>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {tier.requestOnly ? (
                    <a
                      href={premiumHref}
                      className={cn("mt-8 w-full", ui.btnSecondary)}
                    >
                      <Mail className="h-4 w-4" />
                      {tier.cta}
                    </a>
                  ) : signupEnabled ? (
                    <Link
                      href={tier.href}
                      className={cn("mt-8 w-full", tier.featured ? ui.btnPrimary : ui.btnSecondary)}
                    >
                      {tier.cta}
                    </Link>
                  ) : (
                    <a href={premiumHref} className={cn("mt-8 w-full", ui.btnPrimary)}>
                      Request access
                    </a>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.p {...fadeUp} className="mx-auto mt-8 max-w-lg text-center text-xs text-[var(--muted)]">
              Premium features include cloud sync across devices. Approved vendors can also issue access keys — contact us to become a partner.
            </motion.p>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <motion.div {...fadeUp} className={cn(ui.glass, "rounded-[var(--radius-lg)] p-6 sm:p-8")}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <p className={ui.overline}>Privacy-first</p>
                <h2 className="font-display mt-2 text-xl font-semibold sm:text-2xl">
                  Your data stays yours
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  Sign in with a private access key — no email, no social login. Data lives on your device by default.
                  Request cloud sync when you want backup across devices. Export your full history anytime as JSON.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                {signupEnabled ? (
                  <Link href="/auth/signup" className={ui.btnProtocol}>
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href={premiumHref} className={ui.btnProtocol}>
                    Request access
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                <p className="text-[10px] text-[var(--muted)]">Interpretation only — not medical advice</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <p className="text-xs text-[var(--muted)]">
              © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted)]">
              <Link href="/auth/login" className="hover:text-[var(--foreground)]">Sign in</Link>
              {signupEnabled ? (
                <Link href="/auth/signup" className="hover:text-[var(--foreground)]">Sign up free</Link>
              ) : null}
              <a href={premiumHref} className="hover:text-[var(--foreground)]">
                Request premium
              </a>
              <Link href="/terms" className="hover:text-[var(--foreground)]">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--foreground)]">Privacy</Link>
              {settings.support_url ? (
                <a href={settings.support_url} className="hover:text-[var(--foreground)]" target="_blank" rel="noopener noreferrer">
                  Support
                </a>
              ) : null}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}