import type { DashboardRoleConfig } from "../registry/types";
export const dashboardRoleConfig: DashboardRoleConfig[] = [
  { role: "SUPER_ADMIN", label: "Super Admin", accent: "super", widgets: ["project.health","project.overview","ai.assistant"], sidebarGroups: ["platform","security","ai","project"] },
  { role: "ADMIN", label: "Administrator", accent: "admin", widgets: ["sales.overview","orders.recent","quick.actions"], sidebarGroups: ["store","inventory","marketing"] },
  { role: "MANAGER", label: "User Admin", accent: "manager", widgets: ["sales.overview","orders.recent","quick.actions"], sidebarGroups: ["manager","tasks","limited"] }
];
export function getRoleConfig(role: string) { return dashboardRoleConfig.find(r => r.role === role) || dashboardRoleConfig[2]; }
