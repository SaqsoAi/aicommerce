import type { UserRole } from "@/config/roles";
import type { DashboardQuickAction } from "./types";

const actions = new Map<string, DashboardQuickAction>();

export function registerDashboardQuickAction(action: DashboardQuickAction): () => void {
  actions.set(action.key, action);
  return () => actions.delete(action.key);
}

export function getDashboardQuickActions(role: UserRole, permissions: string[] = []): DashboardQuickAction[] {
  if (role === "CUSTOMER") return [];
  const permissionSet = new Set(permissions);
  return [...actions.values()]
    .filter((action) => {
      if (!action.roles.includes(role)) return false;
      if (!action.permission || role === "SUPER_ADMIN" || permissionSet.has("*")) return true;
      return permissionSet.has(action.permission);
    })
    .sort((a,b) => (a.order ?? 1000) - (b.order ?? 1000) || a.key.localeCompare(b.key));
}
