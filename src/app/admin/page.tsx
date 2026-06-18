"use client";

import { Background } from "@/components/Background";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-10">
          <AdminPanel />
        </div>
      </div>
    </AdminGuard>
  );
}