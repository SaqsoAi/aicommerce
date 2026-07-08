"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "./DashboardShell";
import { adminDashboard, cloneDashboard, managerDashboard, superDashboard, type DashboardModel } from "./data";
import { hydrateDashboard } from "./liveData";

function detectRole() {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    const role = String(user?.role || localStorage.getItem("role") || localStorage.getItem("userRole") || "MANAGER").toUpperCase();
    if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
    if (role === "ADMIN") return "ADMIN";
    if (role === "USER_ADMIN") return "MANAGER";
    return "MANAGER";
  } catch {
    return "MANAGER";
  }
}

function modelForRole(role: string): DashboardModel {
  if (role === "SUPER_ADMIN") return superDashboard;
  if (role === "ADMIN") return adminDashboard;
  return managerDashboard;
}

export default function DashboardRouter() {
  const [role, setRole] = useState("MANAGER");
  const [data, setData] = useState<DashboardModel>(() => cloneDashboard(managerDashboard));
  const baseModel = useMemo(() => modelForRole(role), [role]);

  useEffect(() => setRole(detectRole()), []);

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
