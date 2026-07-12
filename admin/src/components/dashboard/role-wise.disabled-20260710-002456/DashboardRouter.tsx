"use client";

import { useEffect, useState } from "react";
import DashboardShell from "./DashboardShell";
import { adminDashboard, managerDashboard, superDashboard } from "./data";

function detectRole() {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    const role = String(user?.role || localStorage.getItem("role") || "MANAGER").toUpperCase();
    if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
    if (role === "ADMIN") return "ADMIN";
    return "MANAGER";
  } catch {
    return "MANAGER";
  }
}

export default function DashboardRouter() {
  const [role, setRole] = useState("MANAGER");
  useEffect(() => setRole(detectRole()), []);

  if (role === "SUPER_ADMIN") return <DashboardShell data={superDashboard} />;
  if (role === "ADMIN") return <DashboardShell data={adminDashboard} />;
  return <DashboardShell data={managerDashboard} />;
}