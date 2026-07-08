import type { DashboardWidgetConfig } from "./types";
export const widgetRegistry: DashboardWidgetConfig[] = [
  { id: "project.health", title: "Project Health Score", type: "metric", size: "sm", roles: ["SUPER_ADMIN"], enabled: true, permission: "dashboard.project.read" },
  { id: "project.overview", title: "Project Overview", type: "chart", size: "xl", roles: ["SUPER_ADMIN"], enabled: true, permission: "dashboard.project.read" },
  { id: "ai.assistant", title: "AI Assistant", type: "assistant", size: "lg", roles: ["SUPER_ADMIN"], enabled: true, permission: "ai.assistant.use" },
  { id: "sales.overview", title: "Sales Overview", type: "chart", size: "xl", roles: ["ADMIN", "MANAGER"], enabled: true, permission: "analytics.read" },
  { id: "orders.recent", title: "Recent Orders", type: "table", size: "lg", roles: ["ADMIN", "MANAGER"], enabled: true, permission: "order.read" },
  { id: "quick.actions", title: "Quick Actions", type: "activity", size: "md", roles: ["ADMIN", "MANAGER"], enabled: true }
];
export function getWidgetsForRole(role: string) { return widgetRegistry.filter(w => w.enabled && w.roles.includes(role as never)); }
