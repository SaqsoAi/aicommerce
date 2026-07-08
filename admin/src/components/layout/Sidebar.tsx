"use client";

import {
  Activity,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  Code2,
  Database,
  Flag,
  Gauge,
  Home,
  KeyRound,
  Layers,
  MessageSquare,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER";
type Item = { label: string; href: string; icon: LucideIcon };
type Group = { title: string; items: Item[] };

function roleFromStorage(): Role {
  if (typeof window === "undefined") return "MANAGER";
  try {
    const raw = localStorage.getItem("user");
    const parsed = raw ? JSON.parse(raw) : null;
    const role = String(parsed?.role || localStorage.getItem("role") || "MANAGER").toUpperCase();
    if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
    if (role === "ADMIN") return "ADMIN";
  } catch {}
  return "MANAGER";
}

const superGroups: Group[] = [
  { title: "Platform Command", items: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Analytics", href: "/analytics", icon: Activity },
    { label: "Tenant Usage", href: "/tenant-usage", icon: Gauge },
    { label: "Subscriptions", href: "/subscriptions", icon: WalletCards },
    { label: "Feature Flags", href: "/feature-flags", icon: Flag },
    { label: "Provider Control", href: "/super-admin/provider-control", icon: SlidersHorizontal },
  ] },
  { title: "Security & RBAC", items: [
    { label: "Roles", href: "/roles", icon: ShieldCheck },
    { label: "Permissions", href: "/permissions", icon: KeyRound },
    { label: "Super Admin Users", href: "/super-admin/users", icon: Users },
    { label: "Audit Logs", href: "/audit-logs", icon: Code2 },
    { label: "Auth Provider Center", href: "/auth-provider-center", icon: Settings },
    { label: "Enterprise Auth Identity", href: "/enterprise-auth-identity", icon: ShieldCheck },
  ] },
  { title: "AI Management", items: [
    { label: "AI Developer", href: "/ai-development-copilot", icon: Bot },
    { label: "AI Architect", href: "/ai", icon: Layers },
    { label: "AI Code Reviewer", href: "/ai-code-reviewer", icon: Code2 },
    { label: "AI Bug Detector", href: "/ai-bug-detector", icon: Activity },
    { label: "AI Performance", href: "/ai-performance", icon: Gauge },
    { label: "AI Search", href: "/ai-search", icon: Search },
  ] },
  { title: "Project Management", items: [
    { label: "Projects", href: "/automation-studio", icon: Boxes },
    { label: "Modules", href: "/settings", icon: Layers },
    { label: "Database", href: "/analytics", icon: Database },
  ] },
];

const adminGroups: Group[] = [
  { title: "Store Operations", items: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Analytics", href: "/analytics", icon: Activity },
    { label: "Orders", href: "/orders", icon: ShoppingBag },
    { label: "Products", href: "/products", icon: Package },
    { label: "Categories", href: "/categories", icon: Boxes },
    { label: "Subcategories", href: "/subcategories", icon: Boxes },
    { label: "Brands", href: "/brands", icon: ShieldCheck },
    { label: "Customers", href: "/customers", icon: Users },
  ] },
  { title: "Inventory & Fulfillment", items: [
    { label: "Inventory", href: "/inventory", icon: Database },
    { label: "Stock Adjustment", href: "/stock-adjustment", icon: SlidersHorizontal },
    { label: "Stock Transfer", href: "/stock-transfer", icon: Activity },
    { label: "Couriers", href: "/couriers", icon: Package },
    { label: "Returns", href: "/returns", icon: ShoppingBag },
    { label: "Refunds", href: "/refunds", icon: WalletCards },
  ] },
  { title: "Marketing", items: [
    { label: "Campaigns", href: "/campaigns", icon: ChartNoAxesCombined },
    { label: "Notifications", href: "/notifications", icon: MessageSquare },
    { label: "Store Settings", href: "/store-settings", icon: Settings },
  ] },
];

const managerGroups: Group[] = [
  { title: "Manager Workspace", items: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Assigned Orders", href: "/orders", icon: ShoppingBag },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Products", href: "/products", icon: Package },
    { label: "Inventory", href: "/inventory", icon: Database },
  ] },
  { title: "Daily Tasks", items: [
    { label: "Reviews", href: "/reviews", icon: MessageSquare },
    { label: "Returns", href: "/returns", icon: ShoppingBag },
    { label: "Refunds", href: "/refunds", icon: WalletCards },
    { label: "Notifications", href: "/notifications", icon: MessageSquare },
    { label: "Reports", href: "/analytics", icon: Activity },
  ] },
  { title: "Limited Tools", items: [
    { label: "AI Chat", href: "/ai-chat", icon: Bot },
    { label: "AI Search", href: "/ai-search", icon: Search },
    { label: "Store Settings", href: "/store-settings", icon: Settings },
  ] },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>("MANAGER");

  useEffect(() => setRole(roleFromStorage()), []);

  const groups = useMemo(() => role === "SUPER_ADMIN" ? superGroups : role === "ADMIN" ? adminGroups : managerGroups, [role]);
  const product = role === "SUPER_ADMIN" ? "AICopilot" : "AI-Commerce";
  const subtitle = role === "SUPER_ADMIN" ? "Super Admin - AI Development Copilot" : role === "ADMIN" ? "Admin - Commerce Operations" : "User Admin - Limited Workspace";
  const status = role === "SUPER_ADMIN" ? "All Systems Operational" : role === "ADMIN" ? "Business Modules Active" : "Limited Access Active";
  const accentClass = role === "SUPER_ADMIN" ? "super" : role === "ADMIN" ? "admin" : "manager";

  return (
    <aside className={`ds-sidebar ${collapsed ? "collapsed" : ""} ${accentClass}`}>
      <div className="ds-brand">
        <i>AI</i>
        <div>
          <strong>{product}</strong>
          <small>{subtitle}</small>
        </div>
      </div>

      <div className="ds-menu-search">Search menu...</div>

      <nav>
        {groups.map((group) => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link href={item.href} key={item.href + item.label} className={active ? "active" : ""}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>

      <div className="ds-status">
        <i>AI</i>
        <div>
          <strong>AI System Status</strong>
          <small>{status}</small>
        </div>
        <b />
      </div>
    </aside>
  );
}