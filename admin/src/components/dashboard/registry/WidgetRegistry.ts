import type { UserRole } from "@/config/roles";
import type { DashboardWidgetConfig } from "./types";

const baseWidgets: DashboardWidgetConfig[] = [
  { id: "project.health", title: "Project Health Score", type: "metric", size: "sm", roles: ["SUPER_ADMIN"], enabled: true, permission: "dashboard.project.read", order: 10 },
  { id: "project.overview", title: "Project Overview", type: "chart", size: "xl", roles: ["SUPER_ADMIN"], enabled: true, permission: "dashboard.project.read", order: 20 },
  { id: "ai.assistant", title: "AI Assistant", type: "assistant", size: "lg", roles: ["SUPER_ADMIN"], enabled: true, permission: "ai.assistant.use", order: 30 },
  { id: "sales.overview", title: "Sales Overview", type: "chart", size: "xl", roles: ["ADMIN","MANAGER","FINANCE_MANAGER"], enabled: true, permission: "analytics.read", order: 10 },
  { id: "orders.recent", title: "Recent Orders", type: "table", size: "lg", roles: ["ADMIN","MANAGER","SUPPORT","DELIVERY_MANAGER","FINANCE_MANAGER"], enabled: true, permission: "order.read", order: 20 },
  { id: "inventory.alerts", title: "Inventory Alerts", type: "status", size: "md", roles: ["ADMIN","MANAGER","INVENTORY","WAREHOUSE_MANAGER"], enabled: true, permission: "inventory.read", order: 30 },
  { id: "marketing.performance", title: "Marketing Performance", type: "chart", size: "lg", roles: ["ADMIN","MARKETING"], enabled: true, permission: "campaign.read", order: 40 },
  { id: "quick.actions", title: "Quick Actions", type: "activity", size: "md", roles: ["ADMIN","MANAGER","INVENTORY","MARKETING","SUPPORT","WAREHOUSE_MANAGER","DELIVERY_MANAGER","FINANCE_MANAGER"], enabled: true, order: 100 },
];

const runtimeWidgets = new Map<string, DashboardWidgetConfig>();

export function registerDashboardWidget(widget: DashboardWidgetConfig): () => void {
  runtimeWidgets.set(widget.id, widget);
  return () => runtimeWidgets.delete(widget.id);
}

export function getDashboardWidgets(): DashboardWidgetConfig[] {
  return [...baseWidgets, ...runtimeWidgets.values()]
    .filter((widget) => widget.enabled)
    .sort((a,b) => (a.order ?? 1000) - (b.order ?? 1000) || a.id.localeCompare(b.id));
}

export function getWidgetsForRole(role: UserRole, permissions: string[] = []): DashboardWidgetConfig[] {
  if (role === "CUSTOMER") return [];
  const permissionSet = new Set(permissions);
  return getDashboardWidgets().filter((widget) => {
    if (!widget.roles.includes(role)) return false;
    if (!widget.permission || role === "SUPER_ADMIN" || permissionSet.has("*")) return true;
    return permissionSet.has(widget.permission);
  });
}

export const widgetRegistry = baseWidgets;
