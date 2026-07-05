import {
  OwnershipActor,
  OwnershipContext,
  OwnershipDecision,
  OwnershipResource,
  OwnershipRule,
} from "./ownership.types";

const superAdminRoles = new Set(["SUPER_ADMIN", "SUPERADMIN", "ROOT", "OWNER"]);

const customerResources = new Set([
  "profile",
  "order",
  "orders",
  "wishlist",
  "membership",
  "rewards",
  "address",
  "addresses",
  "savedLook",
  "savedLooks",
  "virtualTryOn",
  "invoice",
  "invoices",
  "review",
  "reviews",
]);

const staffResources = new Set([
  "task",
  "assignedTask",
  "orderAssignment",
  "assignedOrder",
  "inventoryOperation",
  "purchase",
  "return",
]);

const storeResources = new Set([
  "product",
  "products",
  "inventory",
  "customer",
  "customers",
  "order",
  "orders",
  "report",
  "reports",
  "media",
]);

const branchResources = new Set([
  "order",
  "orders",
  "inventory",
  "stock",
  "transfer",
  "transfers",
  "return",
  "returns",
]);

const warehouseResources = new Set([
  "stock",
  "adjustment",
  "adjustments",
  "grn",
  "transfer",
  "transfers",
  "dispatch",
]);

export const ownershipRules: OwnershipRule[] = [
  { resource: "profile", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "order", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "orders", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "wishlist", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "membership", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "rewards", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "address", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "addresses", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "savedLook", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "savedLooks", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "virtualTryOn", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "invoice", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "invoices", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "review", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },
  { resource: "reviews", ownerField: "userId", scope: "CUSTOMER", actorField: "id" },

  { resource: "task", ownerField: "assignedStaffId", scope: "STAFF", actorField: "staffId" },
  { resource: "assignedTask", ownerField: "assignedStaffId", scope: "STAFF", actorField: "staffId" },
  { resource: "assignedOrder", ownerField: "assignedStaffId", scope: "STAFF", actorField: "staffId" },
  { resource: "inventoryOperation", ownerField: "assignedStaffId", scope: "STAFF", actorField: "staffId" },
  { resource: "purchase", ownerField: "assignedStaffId", scope: "STAFF", actorField: "staffId" },
  { resource: "return", ownerField: "assignedStaffId", scope: "STAFF", actorField: "staffId" },

  { resource: "product", ownerField: "storeId", scope: "STORE", actorField: "storeId" },
  { resource: "products", ownerField: "storeId", scope: "STORE", actorField: "storeId" },
  { resource: "inventory", ownerField: "storeId", scope: "STORE", actorField: "storeId" },
  { resource: "customer", ownerField: "storeId", scope: "STORE", actorField: "storeId" },
  { resource: "customers", ownerField: "storeId", scope: "STORE", actorField: "storeId" },
  { resource: "report", ownerField: "storeId", scope: "STORE", actorField: "storeId" },
  { resource: "reports", ownerField: "storeId", scope: "STORE", actorField: "storeId" },
  { resource: "media", ownerField: "storeId", scope: "STORE", actorField: "storeId" },

  { resource: "stock", ownerField: "warehouseId", scope: "WAREHOUSE", actorField: "warehouseId" },
  { resource: "adjustment", ownerField: "warehouseId", scope: "WAREHOUSE", actorField: "warehouseId" },
  { resource: "adjustments", ownerField: "warehouseId", scope: "WAREHOUSE", actorField: "warehouseId" },
  { resource: "grn", ownerField: "warehouseId", scope: "WAREHOUSE", actorField: "warehouseId" },
  { resource: "dispatch", ownerField: "warehouseId", scope: "WAREHOUSE", actorField: "warehouseId" },

  { resource: "transfer", ownerField: "branchId", scope: "BRANCH", actorField: "branchId" },
  { resource: "transfers", ownerField: "branchId", scope: "BRANCH", actorField: "branchId" },
];

function norm(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export function actorRoles(actor: OwnershipActor): string[] {
  const roles = Array.isArray(actor.roles) ? actor.roles : [];
  const role = actor.role ? [String(actor.role)] : [];
  return [...roles, ...role].map((r) => r.toUpperCase());
}

export function hasSuperAdminOverride(actor: OwnershipActor): boolean {
  if (actor.isSuperAdmin === true) return true;
  return actorRoles(actor).some((role) => superAdminRoles.has(role));
}

export function resolveOwnershipRule(resource: OwnershipResource): OwnershipRule {
  const exact = ownershipRules.find((rule) => rule.resource === resource);
  if (exact) return exact;

  if (warehouseResources.has(resource)) {
    return { resource, ownerField: "warehouseId", scope: "WAREHOUSE", actorField: "warehouseId" };
  }
  if (branchResources.has(resource)) {
    return { resource, ownerField: "branchId", scope: "BRANCH", actorField: "branchId" };
  }
  if (storeResources.has(resource)) {
    return { resource, ownerField: "storeId", scope: "STORE", actorField: "storeId" };
  }
  if (staffResources.has(resource)) {
    return { resource, ownerField: "assignedStaffId", scope: "STAFF", actorField: "staffId" };
  }
  if (customerResources.has(resource)) {
    return { resource, ownerField: "userId", scope: "CUSTOMER", actorField: "id" };
  }

  return { resource, ownerField: "tenantId", scope: "TENANT", actorField: "tenantId" };
}

function valueFromContext(ctx: OwnershipContext, ownerField: string): string | null {
  const recordValue = ctx.record ? norm(ctx.record[ownerField]) : null;
  if (recordValue) return recordValue;

  const explicit: Record<string, unknown> = {
    userId: ctx.requestedOwnerId ?? ctx.requestedCustomerId,
    customerId: ctx.requestedCustomerId,
    assignedStaffId: ctx.requestedStaffId,
    staffId: ctx.requestedStaffId,
    tenantId: ctx.requestedTenantId,
    storeId: ctx.requestedStoreId,
    branchId: ctx.requestedBranchId,
    warehouseId: ctx.requestedWarehouseId,
  };

  return norm(explicit[ownerField]);
}

export function resolveOwnership(ctx: OwnershipContext): OwnershipDecision {
  const actor = ctx.actor ?? {};
  const rule = resolveOwnershipRule(ctx.resource);
  const actorValue = norm(actor[rule.actorField]) ?? (rule.actorField === "id" ? norm(actor.userId) : null);
  const targetValue = valueFromContext(ctx, rule.ownerField);

  if ((ctx.allowSuperAdminOverride ?? true) && hasSuperAdminOverride(actor)) {
    return {
      allowed: true,
      reason: "SUPER_ADMIN_OWNERSHIP_OVERRIDE",
      scope: "GLOBAL",
      actorId: norm(actor.id) ?? norm(actor.userId),
      ownerField: rule.ownerField,
      ownerValue: targetValue,
      filters: {},
    };
  }

  if (!actorValue) {
    return {
      allowed: false,
      reason: `ACTOR_${String(rule.actorField).toUpperCase()}_MISSING`,
      scope: rule.scope,
      actorId: norm(actor.id) ?? norm(actor.userId),
      ownerField: rule.ownerField,
      ownerValue: targetValue,
      filters: {},
    };
  }

  const filters = { [rule.ownerField]: actorValue };

  if (!targetValue) {
    return {
      allowed: true,
      reason: "OWNERSHIP_FILTER_REQUIRED",
      scope: rule.scope,
      actorId: norm(actor.id) ?? norm(actor.userId),
      ownerField: rule.ownerField,
      ownerValue: actorValue,
      filters,
    };
  }

  const allowed = actorValue === targetValue;
  return {
    allowed,
    reason: allowed ? "OWNERSHIP_MATCH" : "OWNERSHIP_MISMATCH",
    scope: rule.scope,
    actorId: norm(actor.id) ?? norm(actor.userId),
    ownerField: rule.ownerField,
    ownerValue: targetValue,
    filters,
  };
}