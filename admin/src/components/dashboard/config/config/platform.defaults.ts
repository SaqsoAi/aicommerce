import { registerDashboardQuickAction } from "../registry/QuickActionRegistry";

let registered = false;

export function registerPlatformDashboardDefaults(): void {
  if (registered) return;
  registered = true;

  [
    { key: "platform.tenants", label: "Manage Tenants", route: "/tenants", roles: ["SUPER_ADMIN"], order: 10 },
    { key: "platform.ai-builder", label: "Open AI Builder", route: "/ai-development-copilot", roles: ["SUPER_ADMIN"], order: 20 },
    { key: "platform.health", label: "System Health", route: "/system-health", roles: ["SUPER_ADMIN"], order: 30 },
    { key: "tenant.product", label: "Add Product", route: "/products", roles: ["ADMIN"], order: 10 },
    { key: "tenant.order", label: "View Orders", route: "/orders", roles: ["ADMIN","MANAGER","SUPPORT","DELIVERY_MANAGER","FINANCE_MANAGER"], order: 20 },
    { key: "tenant.inventory", label: "Inventory", route: "/inventory", roles: ["ADMIN","MANAGER","INVENTORY","WAREHOUSE_MANAGER"], order: 30 },
    { key: "tenant.marketing", label: "Campaigns", route: "/campaigns", roles: ["ADMIN","MARKETING"], order: 40 },
  ].forEach((action) => registerDashboardQuickAction(action as never));
}
