import { RequestScope, ScopedUser, hasGlobalScope } from "./scope.context";

export function buildScopeWhere(user: ScopedUser | undefined | null, requestedScope: RequestScope = {}): Record<string, string> {
  if (!user) return {};
  if (hasGlobalScope(user)) {
    return Object.fromEntries(Object.entries(requestedScope).filter(([, value]) => !!value)) as Record<string, string>;
  }

  const where: Record<string, string> = {};

  const tenantId = requestedScope.tenantId || user.tenantId || user.tenantIds?.[0];
  const storeId = requestedScope.storeId || user.storeId || user.storeIds?.[0];
  const branchId = requestedScope.branchId || user.branchId || user.branchIds?.[0];
  const warehouseId = requestedScope.warehouseId || user.warehouseId || user.warehouseIds?.[0];

  if (tenantId) where.tenantId = tenantId;
  if (storeId) where.storeId = storeId;
  if (branchId) where.branchId = branchId;
  if (warehouseId) where.warehouseId = warehouseId;

  return where;
}

export function mergeScopeWhere<TWhere extends Record<string, unknown>>(where: TWhere, scopeWhere: Record<string, string>): TWhere & Record<string, string> {
  return {
    ...where,
    ...scopeWhere,
  };
}
