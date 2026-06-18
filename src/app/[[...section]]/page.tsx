"use client";

import { AppShell } from "@/components/shell/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppPage() {
  return (
    <AuthGuard>
      <AppShell />
    </AuthGuard>
  );
}