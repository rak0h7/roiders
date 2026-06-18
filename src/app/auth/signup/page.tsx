import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageHeader } from "@/components/auth/AuthPageHeader";
export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <AuthPageHeader mode="signup" />
        <Suspense fallback={<div className="h-48 animate-pulse rounded-[var(--radius-lg)] bg-[var(--bg-elevated)]" />}>
          <AuthForm mode="signup" />
        </Suspense>
        <p className="text-center text-xs text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[var(--labs)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}