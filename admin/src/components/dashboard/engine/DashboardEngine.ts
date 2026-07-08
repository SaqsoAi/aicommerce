import { getRoleConfig } from "../config/role.config";
import { getWidgetsForRole } from "../registry/WidgetRegistry";
import { canAccessWidget } from "../permissions/PermissionResolver";
export function resolveDashboard(role: string, permissions?: string[]) {
  const roleConfig = getRoleConfig(role);
  const widgets = getWidgetsForRole(roleConfig.role).filter(w => canAccessWidget(permissions, w.permission));
  return { roleConfig, widgets };
}
