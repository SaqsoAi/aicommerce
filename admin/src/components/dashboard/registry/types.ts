export type DashboardRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER";
export type WidgetType = "metric" | "chart" | "table" | "assistant" | "monitor" | "activity" | "chat" | "status" | "tasks";
export type WidgetSize = "sm" | "md" | "lg" | "xl";
export type DashboardWidgetConfig = { id: string; title: string; type: WidgetType; size: WidgetSize; roles: DashboardRole[]; permission?: string; route?: string; enabled: boolean; setupSteps?: string[]; };
export type DashboardRoleConfig = { role: DashboardRole; label: string; accent: "super" | "admin" | "manager"; widgets: string[]; sidebarGroups: string[]; };
