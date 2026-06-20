import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Background } from "@/components/Background";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Props = {
  siteName: string;
  isAuthenticated: boolean;
  children: ReactNode;
  layout?: "index" | "article";
};

export function ArticlesPageShell({
  siteName,
  isAuthenticated,
  children,
  layout = "index",
}: Props) {
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-[var(--border)]/60 bg-[var(--bg-base)]/90 backdrop-blur-xl">
          <div
            className={cn(
              "mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:h-16 sm:px-6",
              layout === "article" ? "max-w-5xl" : "max-w-6xl",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Back to app</span>
                </Link>
              ) : (
                <Link href="/" className="font-display text-lg font-semibold text-gradient">
                  {siteName}
                </Link>
              )}
            </div>
            <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <Link href="/articles" className="hover:text-[var(--foreground)]">
                Articles
              </Link>
              {!isAuthenticated && (
                <>
                  <Link href="/auth/login" className="hidden hover:text-[var(--foreground)] sm:inline">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" className={cn(ui.btnPrimary, "text-xs sm:text-sm")}>
                    Get started
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)]">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto px-4 py-10 sm:px-6 sm:py-14",
            layout === "article" ? "max-w-5xl" : "max-w-3xl",
          )}
        >
          {children}
        </main>

        <footer className="border-t border-[var(--border)]/60 py-10">
          <div
            className={cn(
              "mx-auto flex flex-col items-center justify-between gap-3 px-4 text-xs text-[var(--muted)] sm:flex-row sm:px-6",
              layout === "article" ? "max-w-5xl" : "max-w-6xl",
            )}
          >
            <p>
              © {new Date().getFullYear()} {siteName}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
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