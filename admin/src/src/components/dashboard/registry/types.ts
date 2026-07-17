import type { UserRole } from "@/config/roles";

export type DashboardRole = Exclude<UserRole, "CUSTOMER">;
export type WidgetType = "metric" | "chart" | "table" | "assistant" | "monitor" | "activity" | "chat" | "status" | "tasks";
export type WidgetSize = "sm" | "md" | "lg" | "xl";

export type DashboardWidgetConfig = {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  roles: DashboardRole[];
  permission?: string;
  route?: string;
  enabled: boolean;
  order?: number;
  pluginKey?: string;
  setupSteps?: string[];
};

export type DashboardRoleConfig = {
  role: DashboardRole;
  label: string;
  accent: "super" | "admin" | "manager";
  widgets: string[];
  sidebarGroups: string[];
};

export type DashboardQuickAction = {
  key: string;
  label: string;
  route: string;
  roles: DashboardRole[];
  permission?: string;
  order?: number;
  pluginKey?: string;
};
