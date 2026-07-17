export type DashboardRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER_ADMIN" | "INVENTORY" | "MARKETING" | "SUPPORT" | "FINANCE_MANAGER" | "WAREHOUSE_MANAGER" | "DELIVERY_MANAGER";

export type DashboardWidgetKey =
  | "projectHealth"
  | "aiAssistant"
  | "aiInsights"
  | "systemMonitor"
  | "kpiCards"
  | "recentActivity"
  | "quickActions"
  | "charts"
  | "aiChatConsole"
  | "storeStatus"
  | "orders"
  | "inventory"
  | "customers";

export type DashboardWidgetDefinition = {
  key: DashboardWidgetKey;
  title: string;
  api: string;
  roles: DashboardRole[];
  featureFlag: string;
  permissions: string[];
  defaultOrder: number;
  defaultVisible: boolean;
};

export const enterpriseDashboardWidgetRegistry: DashboardWidgetDefinition[] = [
  {
    key: "projectHealth",
    title: "Project Health",
    api: "/api/admin/dashboard/project-health",
    roles: ["SUPER_ADMIN"],
    featureFlag: "dashboard.projectHealth",
    permissions: ["dashboard:read", "project:read"],
    defaultOrder: 10,
    defaultVisible: true,
  },
  {
    key: "aiAssistant",
    title: "AI Assistant",
    api: "/api/admin/ai/assistant/summary",
    roles: ["SUPER_ADMIN"],
    featureFlag: "dashboard.aiAssistant",
    permissions: ["ai:read"],
    defaultOrder: 20,
    defaultVisible: true,
  },
  {
    key: "aiInsights",
    title: "AI Project Insights",
    api: "/api/admin/ai/insights",
    roles: ["SUPER_ADMIN"],
    featureFlag: "dashboard.aiInsights",
    permissions: ["ai:read", "audit:read"],
    defaultOrder: 30,
    defaultVisible: true,
  },
  {
    key: "systemMonitor",
    title: "System Monitor",
    api: "/api/admin/system/monitor",
    roles: ["SUPER_ADMIN"],
    featureFlag: "dashboard.systemMonitor",
    permissions: ["system:read"],
    defaultOrder: 40,
    defaultVisible: true,
  },
  {
    key: "kpiCards",
    title: "KPI Cards",
    api: "/api/admin/dashboard/kpis",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER_ADMIN"],
    featureFlag: "dashboard.kpis",
    permissions: ["dashboard:read"],
    defaultOrder: 50,
    defaultVisible: true,
  },
  {
    key: "charts",
    title: "Charts",
    api: "/api/admin/dashboard/charts",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER_ADMIN"],
    featureFlag: "dashboard.charts",
    permissions: ["dashboard:read", "analytics:read"],
    defaultOrder: 60,
    defaultVisible: true,
  },
  {
    key: "recentActivity",
    title: "Recent Activity",
    api: "/api/admin/dashboard/recent-activity",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER_ADMIN"],
    featureFlag: "dashboard.recentActivity",
    permissions: ["dashboard:read", "activity:read"],
    defaultOrder: 70,
    defaultVisible: true,
  },
  {
    key: "quickActions",
    title: "Quick Actions",
    api: "/api/admin/dashboard/quick-actions",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER_ADMIN"],
    featureFlag: "dashboard.quickActions",
    permissions: ["dashboard:read"],
    defaultOrder: 80,
    defaultVisible: true,
  },
  {
    key: "aiChatConsole",
    title: "AI Copilot Chat Console",
    api: "/api/admin/ai/chat/dashboard",
    roles: ["SUPER_ADMIN"],
    featureFlag: "dashboard.aiChatConsole",
    permissions: ["ai:chat"],
    defaultOrder: 90,
    defaultVisible: true,
  },
  {
    key: "storeStatus",
    title: "Store Status",
    api: "/api/admin/dashboard/store-status",
    roles: ["ADMIN", "MANAGER", "USER_ADMIN"],
    featureFlag: "dashboard.storeStatus",
    permissions: ["store:read"],
    defaultOrder: 100,
    defaultVisible: true,
  },
];

export function getWidgetsForRole(role: DashboardRole, featureFlags: Record<string, boolean>, permissions: string[]) {
  const permissionSet = new Set(permissions);
  return enterpriseDashboardWidgetRegistry
    .filter((widget) => widget.roles.includes(role))
    .filter((widget) => featureFlags[widget.featureFlag] !== false)
    .filter((widget) => widget.permissions.every((permission) => permissionSet.has(permission) || permissionSet.has("*")))
    .sort((a, b) => a.defaultOrder - b.defaultOrder);
}