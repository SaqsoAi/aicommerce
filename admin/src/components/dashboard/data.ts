import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  Box,
  Code2,
  Database,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoleKey = "SUPER_ADMIN" | "ADMIN" | "MANAGER";
export type Accent = "super" | "admin" | "manager";
export type DataState = "available" | "unavailable";
export type Metric = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: string;
  source: string;
  state: DataState;
};

export type DashboardModel = {
  role: RoleKey;
  accent: Accent;
  mode: "super" | "commerce";
  eyebrow: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  actionLabel: string;
  roleLabel: string;
  themeLabel: string;
  warning: string;
  sources: Array<{ label: string; path: string; state: DataState }>;
  metrics: Metric[];
  smallMetrics: Metric[];
  overview: Array<[string, string, DataState?, string?]>;
  insights: Array<[string, string, string]>;
  products: Array<[string, string, string]>;
  orders: Array<[string, string, string, string]>;
  status: Array<[string, string]>;
  tasks: Array<[string, string]>;
  activities: Array<[string, string, string]>;
  salesTrend: Array<{ label: string; value: number }>;
  customers: Array<[string, string, string]>;
  inventory: Array<[string, string]>;
  system: Array<[string, string]>;
  store: Array<[string, string]>;
};

export const unavailable = "Unavailable";

const unavailableMetric = (label: string, icon: LucideIcon, source: string, tone?: string): Metric => ({
  label,
  value: unavailable,
  sub: "Waiting for live API",
  icon,
  tone,
  source,
  state: "unavailable",
});

const baseSources = [
  { label: "Dashboard Summary", path: "/api/dashboard/summary", state: "unavailable" as DataState },
  { label: "Roles", path: "/api/roles", state: "unavailable" as DataState },
  { label: "Permissions", path: "/api/permissions", state: "unavailable" as DataState },
  { label: "AI Control", path: "/api/ai-control/dashboard", state: "unavailable" as DataState },
  { label: "Notifications", path: "/api/notifications/unread-count", state: "unavailable" as DataState },
];

export const superDashboard: DashboardModel = {
  role: "SUPER_ADMIN",
  accent: "super",
  mode: "super",
  eyebrow: "Super Admin Enterprise Command",
  title: "Platform Command Center",
  subtitle: "AI Copilot command center uses live platform APIs only.",
  dateLabel: "Live API",
  actionLabel: "Quick Actions",
  roleLabel: "Super Admin",
  themeLabel: "Blue / Purple",
  warning: "Unavailable widgets are intentionally not estimated or demo-filled.",
  sources: baseSources,
  metrics: [
    unavailableMetric("AI Features", Bot, "/api/ai-control/dashboard", "green"),
    unavailableMetric("AI Providers", Database, "/api/ai-control/dashboard", "cyan"),
    unavailableMetric("Enabled Features", ShieldCheck, "/api/ai-control/dashboard", "green"),
    unavailableMetric("Enabled Providers", Activity, "/api/ai-control/dashboard", "purple"),
    unavailableMetric("Usage Events", Gauge, "/api/ai-control/dashboard", "yellow"),
    unavailableMetric("Active Overrides", KeyRound, "/api/ai-control/dashboard", "red"),
  ],
  smallMetrics: [
    unavailableMetric("API Health", Activity, "/api/health", "green"),
    unavailableMetric("Roles", Users, "/api/roles", "cyan"),
    unavailableMetric("Permissions", ShieldCheck, "/api/permissions", "green"),
    unavailableMetric("AI Features", Bot, "/api/ai-control/dashboard", "purple"),
    unavailableMetric("AI Providers", Database, "/api/ai-control/dashboard", "yellow"),
    unavailableMetric("Usage Logs", Activity, "/api/ai-control/dashboard", "cyan"),
    unavailableMetric("Overrides", KeyRound, "/api/ai-control/dashboard", "red"),
  ],
  overview: [
    ["Platform API", unavailable, "unavailable", "/api/health"],
    ["Roles", unavailable, "unavailable", "/api/roles"],
    ["Permissions", unavailable, "unavailable", "/api/permissions"],
    ["AI Features", unavailable, "unavailable", "/api/ai-control/dashboard"],
    ["AI Providers", unavailable, "unavailable", "/api/ai-control/dashboard"],
    ["Usage Events", unavailable, "unavailable", "/api/ai-control/dashboard"],
    ["Role Menu Coverage", "Configured", "available", "Local role registry"],
    ["Active Overrides", unavailable, "unavailable", "/api/ai-control/dashboard"],
  ],
  insights: [],
  products: [],
  orders: [],
  status: [],
  tasks: [],
  activities: [],
  salesTrend: [],
  customers: [],
  inventory: [],
  system: [],
  store: [],
};

export const adminDashboard: DashboardModel = {
  role: "ADMIN",
  accent: "admin",
  mode: "commerce",
  eyebrow: "Store Operations",
  title: "Store Command Center",
  subtitle: "Here is what is happening with your store from live APIs.",
  dateLabel: "Live API",
  actionLabel: "Export Report",
  roleLabel: "Administrator",
  themeLabel: "Orange",
  warning: "No demo sales, orders, customers, products, or customer names are rendered.",
  sources: baseSources.slice(0, 1),
  metrics: [
    unavailableMetric("Total Sales", WalletCards, "/api/dashboard/summary", "orange"),
    unavailableMetric("Orders", ShoppingBag, "/api/dashboard/summary", "orange"),
    unavailableMetric("Customers", Users, "/api/dashboard/summary", "orange"),
    unavailableMetric("Conversion Rate", Gauge, "Analytics conversion API", "orange"),
    unavailableMetric("Avg. Order Value", WalletCards, "/api/dashboard/summary", "orange"),
  ],
  smallMetrics: [],
  overview: [],
  insights: [],
  products: [],
  orders: [],
  status: [],
  tasks: [
    ["Process Pending Orders", unavailable],
    ["Low Stock Products", unavailable],
    ["Customer Inquiries", unavailable],
    ["Reviews to Approve", unavailable],
    ["Unpaid Orders", unavailable],
  ],
  activities: [],
  salesTrend: [],
  customers: [],
  inventory: [],
  system: [],
  store: [],
};

export const managerDashboard: DashboardModel = {
  ...adminDashboard,
  role: "MANAGER",
  accent: "manager",
  eyebrow: "Store Operations",
  title: "Operations Command Center",
  subtitle: "Manage daily store operations within assigned permissions using live APIs.",
  roleLabel: "Manager",
  themeLabel: "Green",
  warning: "Manager view hides platform/security/provider controls and only shows live store data.",
  metrics: [
    unavailableMetric("Total Sales", WalletCards, "/api/dashboard/summary", "green"),
    unavailableMetric("Orders", ShoppingBag, "/api/dashboard/summary", "cyan"),
    unavailableMetric("Customers", Users, "/api/dashboard/summary", "purple"),
    unavailableMetric("Conversion Rate", Gauge, "Analytics conversion API", "orange"),
    unavailableMetric("Avg. Order Value", WalletCards, "/api/dashboard/summary", "green"),
  ],
};

export function cloneDashboard(model: DashboardModel): DashboardModel {
  return {
    ...model,
    sources: model.sources.map((source) => ({ ...source })),
    metrics: model.metrics.map((metric) => ({ ...metric })),
    smallMetrics: model.smallMetrics.map((metric) => ({ ...metric })),
    overview: model.overview.map((row) => [...row] as [string, string, DataState?, string?]),
    insights: model.insights.map((row) => [...row] as [string, string, string]),
    products: model.products.map((row) => [...row] as [string, string, string]),
    orders: model.orders.map((row) => [...row] as [string, string, string, string]),
    status: model.status.map((row) => [...row] as [string, string]),
    tasks: model.tasks.map((row) => [...row] as [string, string]),
    activities: model.activities.map((row) => [...row] as [string, string, string]),
    salesTrend: model.salesTrend.map((point) => ({ ...point })),
    customers: model.customers.map((row) => [...row] as [string, string, string]),
    inventory: model.inventory.map((row) => [...row] as [string, string]),
    system: model.system.map((row) => [...row] as [string, string]),
    store: model.store.map((row) => [...row] as [string, string]),
  };
}


