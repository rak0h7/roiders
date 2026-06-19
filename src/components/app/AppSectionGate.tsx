"use client";

import { usePathname } from "next/navigation";
import { notFound } from "next/navigation";
import { routeFromPathname } from "@/lib/appRoutes";

export function AppSectionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (routeFromPathname(pathname) === null) {
    notFound();
  }

  return <>{children}</>;
}