import type { UserRole } from "@/config/roles";
import type { DashboardRole, DashboardRoleConfig } from "./types";

const roleConfigs = new Map<DashboardRole, DashboardRoleConfig>();

export function registerDashboardRole(config: DashboardRoleConfig): () => void {
  roleConfigs.set(config.role, config);
  return () => roleConfigs.delete(config.role);
}

export function getDashboardRole(role: UserRole): DashboardRole {
  if (role === "CUSTOMER") return "MANAGER";
  return role;
}

export function getDashboardRoleConfig(role: UserRole): DashboardRoleConfig | undefined {
  return roleConfigs.get(getDashboardRole(role));
}

export function listDashboardRoleConfigs(): DashboardRoleConfig[] {
  return [...roleConfigs.values()];
}
