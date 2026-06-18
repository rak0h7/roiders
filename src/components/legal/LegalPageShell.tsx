import Link from "next/link";
import { Background } from "@/components/Background";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type LegalPageShellProps = {
  siteName: string;
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPageShell({ siteName, title, updated, children }: LegalPageShellProps) {
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10">
        <header className="border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
            <Link href="/" className="font-display text-lg font-semibold text-gradient">
              {siteName}
            </Link>
            <nav className="flex items-center gap-4 text-xs text-[var(--muted)] sm:text-sm">
              <Link href="/terms" className="hover:text-[var(--foreground)]">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[var(--foreground)]">
                Privacy
              </Link>
              <Link href="/auth/login" className="hover:text-[var(--foreground)]">
                Sign in
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className={cn(ui.glass, "rounded-[var(--radius-lg)] p-6 sm:p-8")}>
            <p className={ui.overline}>Legal</p>
            <h1 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
            <p className="mt-2 text-xs text-[var(--muted)]">Last updated {updated}</p>
            <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-[var(--muted)]">
              {children}
            </div>
          </div>
        </main>

        <footer className="border-t border-[var(--border)] py-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} {siteName}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted)]">
              <Link href="/" className="hover:text-[var(--foreground)]">
                Home
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