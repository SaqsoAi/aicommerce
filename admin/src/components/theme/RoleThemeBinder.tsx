"use client";

import { useEffect } from "react";
import { applyRoleTheme, getCurrentAdminRoleTheme } from "@/lib/dashboardRoleTheme";

export default function RoleThemeBinder() {
  useEffect(() => {
    const sync = () => applyRoleTheme(getCurrentAdminRoleTheme());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("admin-role-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("admin-role-changed", sync);
    };
  }, []);
  return null;
}