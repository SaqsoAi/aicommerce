"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isPublicAdminPath,
  readAdminSession,
  subscribeAdminSession,
} from "@/config/adminAccess.registry";
import DashboardLayout from "./DashboardLayout";

export default function AdminShellRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const publicPath = isPublicAdminPath(pathname);
  const [ready, setReady] = useState(publicPath);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (publicPath) {
      setAuthenticated(false);
      setReady(true);
      return;
    }

    const refresh = () => {
      const session = readAdminSession();
      setAuthenticated(session.authenticated);
      setReady(true);

      if (!session.authenticated && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login?reason=authentication-required");
      }
    };

    refresh();
    return subscribeAdminSession(refresh);
  }, [publicPath]);

  if (publicPath) return <>{children}</>;

  if (!ready || !authenticated) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#070b14",
          color: "#cbd5e1",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Verifying administrative session…
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
