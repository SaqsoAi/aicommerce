export type ScopeRole =
  | "SUPER_ADMIN"
  | "TENANT_OWNER"
  | "STORE_ADMIN"
  | "BRANCH_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "STAFF"
  | string;

export type RequestScope = {
  tenantId?: string;
  storeId?: string;
  branchId?: string;
  warehouseId?: string;
};

export type ScopedUser = {
  id?: string;
  role?: ScopeRole;
  tenantId?: string | null;
  storeId?: string | null;
  branchId?: string | null;
  warehouseId?: string | null;
  tenantIds?: string[];
  storeIds?: string[];
  branchIds?: string[];
  warehouseIds?: string[];
};

export type ScopeSource = {
  user?: ScopedUser;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, unknown>;
};

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

export function parseRequestScope(source: ScopeSource): RequestScope {
  const headers = source.headers || {};
  const query = source.query || {};
  const params = source.params || {};
  const body = source.body || {};
  const user = source.user || {};

  return {
    tenantId: firstString(params.tenantId, query.tenantId, body.tenantId, headers["x-tenant-id"], user.tenantId),
    storeId: firstString(params.storeId, query.storeId, body.storeId, headers["x-store-id"], user.storeId),
    branchId: firstString(params.branchId, query.branchId, body.branchId, headers["x-branch-id"], user.branchId),
    warehouseId: firstString(params.warehouseId, query.warehouseId, body.warehouseId, headers["x-warehouse-id"], user.warehouseId),
  };
}

export function compactScope(scope: RequestScope): RequestScope {
  return Object.fromEntries(
    Object.entries(scope).filter(([, value]) => typeof value === "string" && value.length > 0),
  ) as RequestScope;
}

export function hasGlobalScope(user: ScopedUser | undefined | null): boolean {
  return user?.role === "SUPER_ADMIN";
}
