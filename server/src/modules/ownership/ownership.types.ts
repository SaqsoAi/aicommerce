export type OwnershipScopeKind =
  | "CUSTOMER"
  | "STAFF"
  | "STORE"
  | "BRANCH"
  | "WAREHOUSE"
  | "TENANT"
  | "GLOBAL";

export type OwnershipResource =
  | "profile"
  | "order"
  | "orders"
  | "wishlist"
  | "membership"
  | "rewards"
  | "address"
  | "addresses"
  | "savedLook"
  | "savedLooks"
  | "virtualTryOn"
  | "invoice"
  | "invoices"
  | "review"
  | "reviews"
  | "task"
  | "inventoryOperation"
  | "purchase"
  | "return"
  | "product"
  | "inventory"
  | "stock"
  | "transfer"
  | "grn"
  | "adjustment"
  | "dispatch"
  | "media"
  | "report"
  | string;

export interface OwnershipActor {
  id?: string;
  userId?: string;
  customerId?: string | null;
  staffId?: string | null;
  tenantId?: string | null;
  storeId?: string | null;
  branchId?: string | null;
  warehouseId?: string | null;
  role?: string | null;
  roles?: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
  [key: string]: unknown;
}

export interface OwnershipContext {
  actor: OwnershipActor;
  resource: OwnershipResource;
  action?: string;
  requestedOwnerId?: string | null;
  requestedCustomerId?: string | null;
  requestedStaffId?: string | null;
  requestedTenantId?: string | null;
  requestedStoreId?: string | null;
  requestedBranchId?: string | null;
  requestedWarehouseId?: string | null;
  record?: Record<string, unknown> | null;
  allowSuperAdminOverride?: boolean;
}

export interface OwnershipDecision {
  allowed: boolean;
  reason: string;
  scope: OwnershipScopeKind;
  actorId?: string | null;
  ownerField?: string | null;
  ownerValue?: string | null;
  filters: Record<string, unknown>;
}

export interface OwnershipRule {
  resource: OwnershipResource;
  ownerField: string;
  scope: OwnershipScopeKind;
  actorField: keyof OwnershipActor;
}

export class OwnershipError extends Error {
  public readonly statusCode = 403;
  public readonly code = "OWNERSHIP_DENIED";

  constructor(message = "Ownership denied") {
    super(message);
    this.name = "OwnershipError";
  }
}