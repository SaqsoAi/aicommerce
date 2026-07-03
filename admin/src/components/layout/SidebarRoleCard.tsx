"use client";

import { useEffect, useState } from "react";
import { getEnterpriseRoleTheme } from "@/lib/enterprise-theme";

export default function SidebarRoleCard() {
  const [role,setRole] = useState("SUPER_ADMIN");

  useEffect(() => {
    setRole(
      localStorage.getItem("role")
      || "SUPER_ADMIN"
    );
  }, []);

  const theme =
    getEnterpriseRoleTheme(role);

  return (
    /* ADMIN_SIDEBAR_V3_MARKER */
    <div
      className={`
        mx-3 mb-3
        rounded-2xl
        p-4
        text-white
        bg-gradient-to-r
        ${theme.gradient}
      `}
    >
      <div className="text-xs opacity-80">
        Workspace
      </div>

      <div className="font-bold mt-1">
        {theme.badge}
      </div>

      <div className="text-xs mt-2 opacity-70">
        {theme.description}
      </div>
    </div>
  );
}
