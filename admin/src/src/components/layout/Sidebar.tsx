"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { roleLabel, type UserRole } from "@/config/roles";
import { readAdminSession, subscribeAdminSession } from "@/config/adminAccess.registry";
import { filterAdminNavigationByRole, isAdminNavActive } from "./navigation.helpers";
import { adminNavigation, type AdminNavGroup, type AdminRole } from "./navigation";
import { loadPluginNavigation, mergeNavigationGroups } from "./pluginNavigation.registry";

function iconFor(name: string): LucideIcon {
  const candidate = (Icons as unknown as Record<string, LucideIcon>)[name];
  return candidate ?? Icons.Circle;
}

function accentFor(role: UserRole): string {
  if (role === "SUPER_ADMIN") return "super";
  if (role === "ADMIN") return "admin";
  return "manager";
}

function subtitleFor(role: UserRole): string {
  if (role === "SUPER_ADMIN") return "Platform Admin Command Center";
  if (role === "ADMIN") return "Store Administration";
  return `${roleLabel(role)} Workspace`;
}

function statusFor(role: UserRole): string {
  if (role === "SUPER_ADMIN") return "Platform-wide administrative access";
  if (role === "ADMIN") return "Tenant business administration";
  return "Role-scoped operational access";
}

export default function Sidebar({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("MANAGER");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pluginGroups, setPluginGroups] = useState<AdminNavGroup[]>([]);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const applySession = () => {
      const session = readAdminSession();
      setRole(session.role);
      setPermissions(session.permissions);
    };

    applySession();
    return subscribeAdminSession(() => applySession());
  }, []);

  useEffect(() => {
    let active = true;
    loadPluginNavigation(role).then((groups) => {
      if (active) setPluginGroups(groups);
    });
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    navRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, role]);

  const groups = useMemo(() => {
    const merged = mergeNavigationGroups(adminNavigation, pluginGroups);
    return filterAdminNavigationByRole(role as AdminRole, merged, permissions);
  }, [permissions, pluginGroups, role]);

  const product = role === "SUPER_ADMIN" ? "SAQSO.AI" : "AI-Commerce";
  const subtitle = subtitleFor(role);
  const status = statusFor(role);
  const accentClass = accentFor(role);

  return (
    <aside className={`ds-sidebar ${collapsed ? "collapsed" : ""} ${accentClass}`}>
      <div className="ds-brand"><i>AI</i><div><strong>{product}</strong><small>{subtitle}</small></div></div>
      <div className="ds-menu-search" aria-hidden="true">Search menu...</div>
      <nav ref={navRef} id="admin-primary-navigation" aria-label={`${roleLabel(role)} dashboard navigation`}>
        {groups.map((group) => (
          <section key={group.id}>
            {group.label !== "Dashboard" ? <h3>{group.label}</h3> : null}
            {group.items.filter((item) => !item.disabled).map((item) => {
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
      <div className="ds-status"><i>AI</i><div><strong>{role === "SUPER_ADMIN" ? "AI System Status" : roleLabel(role)}</strong><small>{status}</small></div><b /></div>
    </aside>
  );
}
