import type { ReactNode } from "react";
import Link from "next/link";
import { Background } from "@/components/Background";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type MarketingPageShellProps = {
  siteName: string;
  children: ReactNode;
};

export function MarketingPageShell({ siteName, children }: MarketingPageShellProps) {
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
            <Link href="/" className="font-display text-lg font-semibold text-gradient">
              {siteName}
            </Link>
            <nav className="flex items-center gap-4 text-xs text-[var(--muted)] sm:gap-6 sm:text-sm">
              <Link href="/about" className="hover:text-[var(--foreground)]">
                About
              </Link>
              <Link href="/privacy" className="hover:text-[var(--foreground)]">
                Privacy
              </Link>
              <Link href="/auth/login" className="hover:text-[var(--foreground)]">
                Sign in
              </Link>
              <Link href="/auth/signup" className={cn(ui.btnPrimary, "text-xs sm:text-sm")}>
                Get started
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-[var(--border)] py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} {siteName}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted)]">
              <Link href="/" className="hover:text-[var(--foreground)]">
                Home
              </Link>
              <Link href="/about" className="hover:text-[var(--foreground)]">
                About
              </Link>
              <Link href="/terms" className="hover:text-[var(--foreground)]">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[var(--foreground)]">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}