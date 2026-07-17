import { requirePermission } from "./authorize.middleware";

export const permission = (...requiredPermissions: string[]) =>
  requirePermission(...requiredPermissions);

export { requirePermission };
