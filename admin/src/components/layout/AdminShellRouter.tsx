"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "./DashboardLayout";

const PUBLIC_ROUTES = ["/login"];
const FULLSCREEN_ROUTES = ["/enterprise-hero-studio"];

export default function AdminShellRouter({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (
    PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    FULLSCREEN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  ) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
