"use client";

import { Background } from "@/components/Background";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthPageHeader } from "@/components/auth/AuthPageHeader";
import { UsernameSetup } from "@/components/auth/UsernameSetup";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function WelcomePage() {
  const { username, profileLoading } = useAuth();

  useEffect(() => {
    if (!profileLoading && username) {
      window.location.replace("/");
    }
  }, [username, profileLoading]);

  return (
    <AuthGuard>
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="mb-6">
            <AuthPageHeader mode="welcome" />
          </div>
          <div className="w-full max-w-md">
            <UsernameSetup />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}