export type DashboardRole = "super-admin" | "admin" | "user-admin";

export type DashboardWidgetDefinition = {
  id: string;
  title: string;
  area: "hero" | "kpi" | "quality" | "main" | "right" | "chat";
  roles: DashboardRole[];
};

export const enterpriseDashboardWidgets: DashboardWidgetDefinition[] = [
  { id: "hero", title: "AI Copilot Hero", area: "hero", roles: ["super-admin", "admin", "user-admin"] },
  { id: "project-health", title: "Project Health", area: "kpi", roles: ["super-admin"] },
  { id: "critical-bugs", title: "Critical Bugs", area: "kpi", roles: ["super-admin"] },
  { id: "medium-bugs", title: "Medium Bugs", area: "kpi", roles: ["super-admin", "admin"] },
  { id: "low-priority", title: "Low Priority", area: "kpi", roles: ["super-admin", "admin", "user-admin"] },
  { id: "performance", title: "Performance", area: "kpi", roles: ["super-admin", "admin"] },
  { id: "security", title: "Security", area: "kpi", roles: ["super-admin"] },
  { id: "quality-row", title: "Quality Row", area: "quality", roles: ["super-admin"] },
  { id: "project-overview", title: "Project Overview", area: "main", roles: ["super-admin", "admin"] },
  { id: "ai-insights", title: "AI Project Insights", area: "main", roles: ["super-admin", "admin", "user-admin"] },
  { id: "ai-assistant", title: "AI Assistant", area: "right", roles: ["super-admin", "admin", "user-admin"] },
  { id: "system-monitor", title: "System Monitor", area: "right", roles: ["super-admin"] },
  { id: "recent-activity", title: "Recent Activity", area: "right", roles: ["super-admin", "admin", "user-admin"] },
  { id: "chat-console", title: "AI Copilot Chat Console", area: "chat", roles: ["super-admin", "admin", "user-admin"] },
];

export function widgetsForRole(role: DashboardRole) {
  return enterpriseDashboardWidgets.filter((widget) => widget.roles.includes(role));
}