"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "./DashboardShell";
import { adminDashboard, cloneDashboard, managerDashboard, superDashboard, type DashboardModel, type RoleKey } from "./data";
import { hydrateDashboard } from "./liveData";

function detectRole(): RoleKey {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? (JSON.parse(raw) as { role?: unknown }) : null;
    const role = String(user?.role ?? localStorage.getItem("role") ?? localStorage.getItem("userRole") ?? "MANAGER")
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, "_");
    if (role === "SUPER_ADMIN" || role === "SUPERADMIN") return "SUPER_ADMIN";
    if (role === "ADMIN" || role === "TENANT_OWNER" || role === "TENANT_ADMIN") return "ADMIN";
    return "MANAGER";
  } catch {
    return "MANAGER";
  }
}

function modelForRole(role: RoleKey): DashboardModel {
  if (role === "SUPER_ADMIN") return superDashboard;
  if (role === "ADMIN") return adminDashboard;
  return managerDashboard;
}

export default function DashboardRouter() {
  const [role, setRole] = useState<RoleKey>("MANAGER");
  const [data, setData] = useState<DashboardModel>(() => cloneDashboard(managerDashboard));
  const baseModel = useMemo(() => modelForRole(role), [role]);

  useEffect(() => {
    const refreshRole = () => setRole(detectRole());
    refreshRole();
    window.addEventListener("storage", refreshRole);
    window.addEventListener("auth:changed", refreshRole);
    window.addEventListener("role:changed", refreshRole);
    window.addEventListener("focus", refreshRole);
    return () => {
      window.removeEventListener("storage", refreshRole);
      window.removeEventListener("auth:changed", refreshRole);
      window.removeEventListener("role:changed", refreshRole);
      window.removeEventListener("focus", refreshRole);
    };
  }, []);

  useEffect(() => {
    let active = true;
    setData(cloneDashboard(baseModel));
    hydrateDashboard(baseModel)
      .then((hydrated) => {
        if (active) setData(hydrated);
      })
      .catch(() => {
        if (active) setData(cloneDashboard(baseModel));
      });

    return () => {
      active = false;
    };
  }, [baseModel]);

  return <DashboardShell data={data} />;
}
