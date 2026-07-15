"use client";

import { useEffect, useMemo, useState } from "react";
import { readAdminSession, subscribeAdminSession } from "@/config/adminAccess.registry";
import type { UserRole } from "@/config/roles";
import DashboardShell from "./DashboardShell";
import { adminDashboard, cloneDashboard, managerDashboard, superDashboard, type DashboardModel } from "./data";
import { hydrateDashboard } from "./liveData";

function modelForRole(role: UserRole): DashboardModel {
  if (role === "SUPER_ADMIN") return superDashboard;
  if (role === "ADMIN") return adminDashboard;
  return managerDashboard;
}

export default function DashboardRouter() {
  const [role, setRole] = useState<UserRole>(() => "MANAGER");
  const [data, setData] = useState<DashboardModel>(() => cloneDashboard(managerDashboard));
  const baseModel = useMemo(() => modelForRole(role), [role]);

  useEffect(() => {
    const applySession = () => setRole(readAdminSession().role);
    applySession();
    return subscribeAdminSession(() => applySession());
  }, []);

  useEffect(() => {
    let active = true;
    setData(cloneDashboard(baseModel));
    hydrateDashboard(baseModel)
      .then((hydrated) => { if (active) setData(hydrated); })
      .catch(() => { if (active) setData(cloneDashboard(baseModel)); });
    return () => { active = false; };
  }, [baseModel]);

  return <DashboardShell data={data} />;
}
