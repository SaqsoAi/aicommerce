import type { AdminRoleTheme } from "./dashboardRoleTheme";

export type DashboardWidgetKey =
  | "kpi"
  | "quality"
  | "overview"
  | "insights"
  | "chat"
  | "assistant"
  | "system-monitor"
  | "recent-activity"
  | "api-health";

export type DashboardWidget = { key: DashboardWidgetKey; label: string; roles: AdminRoleTheme[] };

export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  { key: "kpi", label: "KPI Cards", roles: ["super-admin", "admin", "user-admin"] },
  { key: "quality", label: "Quality Cards", roles: ["super-admin", "admin", "user-admin"] },
  { key: "overview", label: "Project Overview", roles: ["super-admin", "admin", "user-admin"] },
  { key: "insights", label: "AI Project Insights", roles: ["super-admin", "admin", "user-admin"] },
  { key: "chat", label: "AI Copilot Chat", roles: ["super-admin", "admin", "user-admin"] },
  { key: "assistant", label: "AI Assistant", roles: ["super-admin", "admin", "user-admin"] },
  { key: "system-monitor", label: "System Monitor", roles: ["super-admin", "admin"] },
  { key: "recent-activity", label: "Recent Activity", roles: ["super-admin", "admin", "user-admin"] },
  { key: "api-health", label: "API Health", roles: ["super-admin", "admin"] }
];

export function getWidgetsForRole(role: AdminRoleTheme): DashboardWidget[] {
  return DASHBOARD_WIDGETS.filter((widget) => widget.roles.includes(role));
}