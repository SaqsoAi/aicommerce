import type { DashboardRoleConfig } from "../registry/types";

export const dashboardRoleConfig: DashboardRoleConfig[] = [
  { role: "SUPER_ADMIN", label: "Platform Admin", accent: "super", widgets: ["project.health","project.overview","ai.assistant"], sidebarGroups: ["platform","tenants","subscription","ai","security","infrastructure"] },
  { role: "ADMIN", label: "Store Admin", accent: "admin", widgets: ["sales.overview","orders.recent","inventory.alerts","marketing.performance","quick.actions"], sidebarGroups: ["catalog","inventory","sales","customers","marketing","cms","settings"] },
  { role: "MANAGER", label: "Store Manager", accent: "manager", widgets: ["sales.overview","orders.recent","inventory.alerts","quick.actions"], sidebarGroups: ["operations","reports"] },
  { role: "INVENTORY", label: "Inventory Officer", accent: "manager", widgets: ["inventory.alerts","quick.actions"], sidebarGroups: ["inventory","purchase"] },
  { role: "WAREHOUSE_MANAGER", label: "Warehouse Manager", accent: "manager", widgets: ["inventory.alerts","quick.actions"], sidebarGroups: ["warehouse","inventory"] },
  { role: "MARKETING", label: "Marketing Officer", accent: "manager", widgets: ["marketing.performance","quick.actions"], sidebarGroups: ["marketing","cms"] },
  { role: "FINANCE_MANAGER", label: "Finance Manager", accent: "manager", widgets: ["sales.overview","orders.recent","quick.actions"], sidebarGroups: ["finance","reports"] },
  { role: "SUPPORT", label: "Support Officer", accent: "manager", widgets: ["orders.recent","quick.actions"], sidebarGroups: ["support","customers"] },
  { role: "DELIVERY_MANAGER", label: "Delivery Manager", accent: "manager", widgets: ["orders.recent","quick.actions"], sidebarGroups: ["delivery","orders"] },
];

export function getRoleConfig(role: string) {
  return dashboardRoleConfig.find((entry) => entry.role === role)
    ?? dashboardRoleConfig.find((entry) => entry.role === "MANAGER")!;
}
