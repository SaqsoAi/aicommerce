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

export const ENTERPRISE_ROLE_LABELS: Record<EnterpriseRoleKey, string> = {
  SUPER_ADMIN: "Super Admin",
  TENANT_OWNER: "Tenant Owner",
  STORE_ADMIN: "Store Admin",
  BRANCH_MANAGER: "Branch Manager",
  WAREHOUSE_MANAGER: "Warehouse Manager",
  PURCHASE_MANAGER: "Purchase Manager",
  SALES_MANAGER: "Sales Manager",
  FINANCE_MANAGER: "Finance Manager",
  MARKETING_MANAGER: "Marketing Manager",
  CONTENT_MANAGER: "Content Manager",
  CUSTOMER_SERVICE: "Customer Service",
  STAFF: "Staff",
  CUSTOMER: "Customer",
  GUEST: "Guest",
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

export function getRoleDependencyEdges() {
  return ENTERPRISE_ROLE_HIERARCHY.slice(0, -1).map((role, index) => ({
    from: role,
    to: ENTERPRISE_ROLE_HIERARCHY[index + 1],
  }));
}
