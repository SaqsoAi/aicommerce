import { RequestScope, ScopedUser, hasGlobalScope } from "./scope.context";

type ScopeValidationResult = {
  allowed: boolean;
  reason?: string;
};

function includesScope(value: string | undefined, ownValue?: string | null, ownValues?: string[]): boolean {
  if (!value) return true;
  if (ownValue && ownValue === value) return true;
  if (Array.isArray(ownValues) && ownValues.includes(value)) return true;
  return false;
}

export function validateUserScopeAccess(user: ScopedUser | undefined | null, scope: RequestScope): ScopeValidationResult {
  if (!user) return { allowed: false, reason: "Unauthenticated request cannot access scoped data." };
  if (hasGlobalScope(user)) return { allowed: true };

  switch (user.role) {
    case "TENANT_OWNER":
      return includesScope(scope.tenantId, user.tenantId, user.tenantIds)
        ? { allowed: true }
        : { allowed: false, reason: "Tenant scope mismatch." };

    case "STORE_ADMIN":
      if (!includesScope(scope.tenantId, user.tenantId, user.tenantIds)) return { allowed: false, reason: "Tenant scope mismatch." };
      return includesScope(scope.storeId, user.storeId, user.storeIds)
        ? { allowed: true }
        : { allowed: false, reason: "Store scope mismatch." };

    case "BRANCH_MANAGER":
      if (!includesScope(scope.tenantId, user.tenantId, user.tenantIds)) return { allowed: false, reason: "Tenant scope mismatch." };
      if (!includesScope(scope.storeId, user.storeId, user.storeIds)) return { allowed: false, reason: "Store scope mismatch." };
      return includesScope(scope.branchId, user.branchId, user.branchIds)
        ? { allowed: true }
        : { allowed: false, reason: "Branch scope mismatch." };

    case "WAREHOUSE_MANAGER":
      if (!includesScope(scope.tenantId, user.tenantId, user.tenantIds)) return { allowed: false, reason: "Tenant scope mismatch." };
      return includesScope(scope.warehouseId, user.warehouseId, user.warehouseIds)
        ? { allowed: true }
        : { allowed: false, reason: "Warehouse scope mismatch." };

    case "STAFF":
      if (!includesScope(scope.tenantId, user.tenantId, user.tenantIds)) return { allowed: false, reason: "Tenant scope mismatch." };
      if (!includesScope(scope.storeId, user.storeId, user.storeIds)) return { allowed: false, reason: "Store scope mismatch." };
      if (!includesScope(scope.branchId, user.branchId, user.branchIds)) return { allowed: false, reason: "Branch scope mismatch." };
      if (!includesScope(scope.warehouseId, user.warehouseId, user.warehouseIds)) return { allowed: false, reason: "Warehouse scope mismatch." };
      return { allowed: true };

    case "CUSTOMER":
      return { allowed: true, reason: "Customer ownership is deferred to Phase 4.5." };

    default:
      return { allowed: false, reason: "Role does not have scoped administrative access." };
  }
}

export function assertUserScopeAccess(user: ScopedUser | undefined | null, scope: RequestScope): void {
  const result = validateUserScopeAccess(user, scope);
  if (!result.allowed) {
    const error = new Error(result.reason || "Scope access denied.");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }
}
