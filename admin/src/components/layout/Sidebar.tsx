"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { filterAdminNavigationByRole, isAdminNavActive } from "./navigation.helpers";
import type { AdminRole } from "./navigation";

type DashboardRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER";

function normalizeRole(value: unknown): DashboardRole {
  const role = String(value ?? "").trim().toUpperCase().replace(/[-\s]+/g, "_");
  if (role === "SUPER_ADMIN" || role === "SUPERADMIN") return "SUPER_ADMIN";
  if (role === "ADMIN" || role === "TENANT_OWNER" || role === "TENANT_ADMIN") return "ADMIN";
  return "MANAGER";
}

function readRole(): DashboardRole {
  if (typeof window === "undefined") return "MANAGER";
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? (JSON.parse(raw) as { role?: unknown }) : null;
    return normalizeRole(user?.role ?? localStorage.getItem("role") ?? localStorage.getItem("userRole"));
  } catch {
    return normalizeRole(localStorage.getItem("role") ?? localStorage.getItem("userRole"));
  }
}

function iconFor(name: string): LucideIcon {
  const candidate = (Icons as unknown as Record<string, LucideIcon>)[name];
  return candidate ?? Icons.Circle;
}

function toRegistryRole(role: DashboardRole): AdminRole {
  return role;
}

export default function Sidebar({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [role, setRole] = useState<DashboardRole>("MANAGER");
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const refreshRole = () => setRole(readRole());
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
    navRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, role]);

  const groups = useMemo(() => filterAdminNavigationByRole(toRegistryRole(role)), [role]);
  const product = role === "SUPER_ADMIN" ? "AICopilot" : "AI-Commerce";
  const subtitle = role === "SUPER_ADMIN" ? "Super Admin - AI Development Copilot" : role === "ADMIN" ? "Admin Dashboard" : "Manager Dashboard";
  const status = role === "SUPER_ADMIN" ? "All Systems Operational" : role === "ADMIN" ? "Tenant Business Administration" : "Limited Operational Access";
  const accentClass = role === "SUPER_ADMIN" ? "super" : role === "ADMIN" ? "admin" : "manager";

  return (
    <aside className={`ds-sidebar ${collapsed ? "collapsed" : ""} ${accentClass}`}>
      <div className="ds-brand"><i>AI</i><div><strong>{product}</strong><small>{subtitle}</small></div></div>
      <div className="ds-menu-search" aria-hidden="true">Search menu...</div>
      <nav ref={navRef} id="admin-primary-navigation" aria-label={`${role} dashboard navigation`}>
        {groups.map((group) => (
          <section key={group.id}>
            {group.label !== "Dashboard" ? <h3>{group.label}</h3> : null}
            {group.items.map((item) => {
              const Icon = iconFor(item.icon);
              const active = isAdminNavActive(pathname, item.href);
              return (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  key={item.id}
                  className={active ? "active" : ""}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>
      <div className="ds-status"><i>AI</i><div><strong>{role === "SUPER_ADMIN" ? "AI System Status" : "Current Role"}</strong><small>{status}</small></div><b /></div>
    </aside>
  );
}
