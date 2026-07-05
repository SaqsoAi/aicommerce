export const ENTERPRISE_ROLE_HIERARCHY = [
  "SUPER_ADMIN",
  "TENANT_OWNER",
  "STORE_ADMIN",
  "BRANCH_MANAGER",
  "WAREHOUSE_MANAGER",
  "PURCHASE_MANAGER",
  "SALES_MANAGER",
  "FINANCE_MANAGER",
  "MARKETING_MANAGER",
  "CONTENT_MANAGER",
  "CUSTOMER_SERVICE",
  "STAFF",
  "CUSTOMER",
  "GUEST",
] as const;

export type EnterpriseRoleKey = (typeof ENTERPRISE_ROLE_HIERARCHY)[number];

export const PROTECTED_SYSTEM_ROLES: ReadonlySet<EnterpriseRoleKey> = new Set([
  "SUPER_ADMIN",
  "TENANT_OWNER",
  "CUSTOMER",
  "GUEST",
]);

export const ROLE_RANK: Record<EnterpriseRoleKey, number> =
  ENTERPRISE_ROLE_HIERARCHY.reduce((acc, role, index) => {
    acc[role] = index;
    return acc;
  }, {} as Record<EnterpriseRoleKey, number>);

export const ROLE_INHERITANCE: Record<EnterpriseRoleKey, EnterpriseRoleKey[]> = {
  SUPER_ADMIN: ["TENANT_OWNER"],
  TENANT_OWNER: ["STORE_ADMIN"],
  STORE_ADMIN: ["BRANCH_MANAGER"],
  BRANCH_MANAGER: ["WAREHOUSE_MANAGER"],
  WAREHOUSE_MANAGER: ["PURCHASE_MANAGER"],
  PURCHASE_MANAGER: ["SALES_MANAGER"],
  SALES_MANAGER: ["FINANCE_MANAGER"],
  FINANCE_MANAGER: ["MARKETING_MANAGER"],
  MARKETING_MANAGER: ["CONTENT_MANAGER"],
  CONTENT_MANAGER: ["CUSTOMER_SERVICE"],
  CUSTOMER_SERVICE: ["STAFF"],
  STAFF: ["CUSTOMER"],
  CUSTOMER: ["GUEST"],
  GUEST: [],
};

export const ENTERPRISE_PERMISSION_MATRIX: Record<EnterpriseRoleKey, readonly string[]> = {
  SUPER_ADMIN: ["system.manage", "role.manage", "permission.manage", "settings.manage"],
  TENANT_OWNER: ["role.read", "permission.read", "store.manage", "settings.read"],
  STORE_ADMIN: ["role.read", "permission.read", "staff.manage", "settings.read"],
  BRANCH_MANAGER: ["staff.read", "order.read", "inventory.read"],
  WAREHOUSE_MANAGER: ["inventory.read", "inventory.adjust", "grn.manage"],
  PURCHASE_MANAGER: ["purchase.read", "purchase.manage", "supplier.read"],
  SALES_MANAGER: ["order.read", "customer.read", "report.read"],
  FINANCE_MANAGER: ["invoice.read", "ledger.read", "report.read"],
  MARKETING_MANAGER: ["campaign.read", "campaign.manage", "coupon.manage"],
  CONTENT_MANAGER: ["homepage.manage", "media.manage", "template.read"],
  CUSTOMER_SERVICE: ["customer.read", "order.read", "returns.read"],
  STAFF: ["dashboard.read"],
  CUSTOMER: ["account.read", "order.own.read", "wishlist.own.manage"],
  GUEST: ["catalog.read"],
};

export function isEnterpriseRole(role: string | null | undefined): role is EnterpriseRoleKey {
  return !!role && (ENTERPRISE_ROLE_HIERARCHY as readonly string[]).includes(role);
}

export function compareRoleRank(a: EnterpriseRoleKey, b: EnterpriseRoleKey): number {
  return ROLE_RANK[a] - ROLE_RANK[b];
}

export function canManageRole(actorRole: EnterpriseRoleKey, targetRole: EnterpriseRoleKey): boolean {
  if (actorRole === "SUPER_ADMIN") return true;
  return ROLE_RANK[actorRole] < ROLE_RANK[targetRole];
}

export function isProtectedSystemRole(role: EnterpriseRoleKey): boolean {
  return PROTECTED_SYSTEM_ROLES.has(role);
}
