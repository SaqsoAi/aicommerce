import { Request } from "express";
import { OwnershipActor } from "./ownership.types";

type RequestWithUser = Request & {
  user?: OwnershipActor;
  authUser?: OwnershipActor;
  scope?: Partial<OwnershipActor>;
};

export function getOwnershipActor(req: Request): OwnershipActor {
  const r = req as RequestWithUser;
  const user = (r.user ?? r.authUser ?? {}) as OwnershipActor;
  const scope = (r.scope ?? {}) as Partial<OwnershipActor>;

  const id = user.id ?? user.userId;
  return {
    ...scope,
    ...user,
    id,
    userId: user.userId ?? id,
    tenantId: user.tenantId ?? scope.tenantId ?? null,
    storeId: user.storeId ?? scope.storeId ?? null,
    branchId: user.branchId ?? scope.branchId ?? null,
    warehouseId: user.warehouseId ?? scope.warehouseId ?? null,
    staffId: user.staffId ?? null,
    customerId: user.customerId ?? null,
  };
}

export function readOwnershipTarget(req: Request): Record<string, string | null> {
  const source = {
    ...(req.params ?? {}),
    ...(req.query ?? {}),
    ...(typeof req.body === "object" && req.body ? req.body : {}),
  } as Record<string, unknown>;

  const read = (...keys: string[]) => {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && String(value).trim()) return String(value);
    }
    return null;
  };

  return {
    requestedOwnerId: read("ownerId", "userId", "customerUserId"),
    requestedCustomerId: read("customerId", "userId", "customerUserId"),
    requestedStaffId: read("staffId", "assignedStaffId", "assignedUserId"),
    requestedTenantId: read("tenantId"),
    requestedStoreId: read("storeId"),
    requestedBranchId: read("branchId"),
    requestedWarehouseId: read("warehouseId"),
  };
}