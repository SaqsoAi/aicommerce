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
export type MetricFinding = {
  category: string;
  file: string;
  line: number;
  message: string;
  instruction: string;
};
export type Metric = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: string;
  source: string;
  state: DataState;
  findings?: MetricFinding[];
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
  roleCoverage?: Array<[string, string, DataState?, string?]>;
  insights: Array<[string, string, string]>;
  products: Array<[string, string, string, string?]>;
  orders: Array<[string, string, string, string, string?, string?]>;
  status: Array<[string, string]>;
  tasks: Array<[string, string]>;
  activities: Array<[string, string, string]>;
  salesTrend: Array<{ label: string; value: number }>;
  projectActivity: Array<{ label: string; value: number; commits?: number; issues?: number; pullRequests?: number; codeReviews?: number }>;
  conversations: Array<[string, string, string, string]>;
  customers: Array<[string, string, string]>;
  inventory: Array<[string, string]>;
  system: Array<[string, string]>;
  store: Array<[string, string]>;
  findings?: MetricFinding[];
};

export const unavailable = "Unavailable";

const unavailableMetric = (label: string, icon: LucideIcon, source: string, tone?: string): Metric => ({
  label,
  value: unavailable,
  sub: "",
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
  eyebrow: "SAQSO.AI Platform Command",
  title: "Platform Command Center",
  subtitle: "Monitor tenants, AI usage, security, infrastructure and platform operations.",
  dateLabel: "This Week",
  actionLabel: "Quick Actions",
  roleLabel: "Platform Admin",
  themeLabel: "Blue / Purple",
  warning: "Unavailable widgets are intentionally not estimated or demo-filled.",
  sources: baseSources,
  metrics: [
    unavailableMetric("Project Health Score", Gauge, "Project telemetry API", "green"),
    unavailableMetric("Critical Bugs", AlertTriangle, "Bug severity telemetry API", "red"),
    unavailableMetric("Medium Bugs", AlertTriangle, "Bug severity telemetry API", "orange"),
    unavailableMetric("Low Priority", AlertTriangle, "Bug severity telemetry API", "yellow"),
    unavailableMetric("Performance Score", Activity, "Performance telemetry API", "green"),
    unavailableMetric("Security Score", ShieldCheck, "Security telemetry API", "green"),
  ],
  smallMetrics: [
    unavailableMetric("Build Status", Activity, "CI build telemetry API", "green"),
    unavailableMetric("Test Coverage", ShieldCheck, "Test coverage telemetry API", "cyan"),
    unavailableMetric("Code Quality", Code2, "Code quality telemetry API", "green"),
    unavailableMetric("Tech Debt", Bot, "Code quality telemetry API", "purple"),
    unavailableMetric("Duplicate Code", AlertTriangle, "Code quality telemetry API", "yellow"),
    unavailableMetric("Unused Files", KeyRound, "Repository telemetry API", "red"),
    unavailableMetric("Dependencies", Database, "Dependency telemetry API", "cyan"),
  ],
  overview: [
    ["Total Modules", unavailable, "unavailable", "Project telemetry API"],
    ["Total APIs", unavailable, "unavailable", "Project telemetry API"],
    ["Database Tables", unavailable, "unavailable", "Project telemetry API"],
    ["React Components", unavailable, "unavailable", "Project telemetry API"],
    ["Lines of Code", unavailable, "unavailable", "Repository telemetry API"],
    ["Team Members", unavailable, "unavailable", "Project telemetry API"],
    ["Commits (This Week)", unavailable, "unavailable", "Repository telemetry API"],
    ["Active Branch", unavailable, "unavailable", "Repository telemetry API"],
  ],
  insights: [],
  products: [],
  orders: [],
  status: [],
  tasks: [],
  activities: [],
  salesTrend: [],
  projectActivity: [],
  conversations: [],
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
  roleLabel: "Store Admin",
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
  projectActivity: [],
  conversations: [],
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
  title: "Operations Dashboard",
  subtitle: "Manage daily store operations within assigned permissions using live APIs.",
  actionLabel: "View Orders",
  roleLabel: "Store Manager",
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
    products: model.products.map((row) => [...row] as [string, string, string, string?]),
    orders: model.orders.map((row) => [...row] as [string, string, string, string, string?, string?]),
    status: model.status.map((row) => [...row] as [string, string]),
    tasks: model.tasks.map((row) => [...row] as [string, string]),
    activities: model.activities.map((row) => [...row] as [string, string, string]),
    salesTrend: model.salesTrend.map((point) => ({ ...point })),
    projectActivity: model.projectActivity.map((point) => ({ ...point })),
    conversations: model.conversations.map((row) => [...row] as [string, string, string, string]),
    customers: model.customers.map((row) => [...row] as [string, string, string]),
    inventory: model.inventory.map((row) => [...row] as [string, string]),
    system: model.system.map((row) => [...row] as [string, string]),
    store: model.store.map((row) => [...row] as [string, string]),
    findings: (model.findings || []).map((finding) => ({ ...finding })),
  };
}



