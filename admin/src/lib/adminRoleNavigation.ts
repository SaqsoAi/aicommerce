import type { AdminRoleTheme } from "./dashboardRoleTheme";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  roles?: AdminRoleTheme[];
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

const superAdminSections: AdminNavSection[] = [
  {
    title: "PLATFORM COMMAND",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "home" },
      { label: "Analytics", href: "/analytics", icon: "chart" },
      { label: "Tenant Usage", href: "/tenant-usage", icon: "speed" },
      { label: "Subscriptions", href: "/subscriptions", icon: "cost" },
      { label: "Feature Flags", href: "/super-admin/feature-flags", icon: "flag" },
      { label: "Provider Control", href: "/super-admin/provider-control", icon: "nodes" },
    ],
  },
  {
    title: "SECURITY & RBAC",
    items: [
      { label: "Roles", href: "/roles", icon: "shield" },
      { label: "Permissions", href: "/permissions", icon: "lock" },
      { label: "Super Admin Users", href: "/super-admin/users", icon: "users" },
      { label: "Audit Logs", href: "/audit-logs", icon: "doc" },
      { label: "Auth Provider Center", href: "/auth-provider-center", icon: "lock" },
      { label: "Enterprise Auth Identity", href: "/enterprise-auth-identity", icon: "shield" },
      { label: "Enterprise Auth Providers", href: "/enterprise-auth-providers", icon: "nodes" },
    ],
  },
  {
    title: "AI MANAGEMENT",
    items: [
      { label: "AI Developer", href: "/ai", icon: "bot" },
      { label: "AI Control Center", href: "/ai-control-center", icon: "chip" },
      { label: "AI Chat", href: "/ai-chat", icon: "message" },
      { label: "AI Search", href: "/ai-search", icon: "search" },
      { label: "AI Recommendation", href: "/ai-recommendation", icon: "spark" },
      { label: "AI Marketing", href: "/ai-marketing", icon: "megaphone" },
      { label: "AI Creative Studio", href: "/ai-creative-studio", icon: "wand" },
      { label: "AI Social Manager", href: "/ai-social-manager", icon: "share" },
      { label: "AI Security Automation", href: "/ai-security-automation", icon: "shield" },
      { label: "AI Development Copilot", href: "/ai-development-copilot", icon: "code" },
    ],
  },
  {
    title: "COMMERCE CONTROL",
    items: [
      { label: "Orders", href: "/orders", icon: "cart" },
      { label: "Products", href: "/products", icon: "box" },
      { label: "Customers", href: "/customers", icon: "users" },
      { label: "Inventory", href: "/inventory", icon: "warehouse" },
      { label: "Store Settings", href: "/store-settings", icon: "gear" },
    ],
  },
];

const adminSections: AdminNavSection[] = [
  {
    title: "STORE OPERATIONS",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "home" },
      { label: "Analytics", href: "/analytics", icon: "chart" },
      { label: "Orders", href: "/orders", icon: "cart" },
      { label: "Products", href: "/products", icon: "box" },
      { label: "Categories", href: "/categories", icon: "grid" },
      { label: "Subcategories", href: "/subcategories", icon: "grid" },
      { label: "Brands", href: "/brands", icon: "tag" },
      { label: "Customers", href: "/customers", icon: "users" },
    ],
  },
  {
    title: "INVENTORY & FULFILLMENT",
    items: [
      { label: "Inventory", href: "/inventory", icon: "warehouse" },
      { label: "Stock Adjustment", href: "/stock-adjustment", icon: "speed" },
      { label: "Stock Transfer", href: "/stock-transfer", icon: "branch" },
      { label: "Couriers", href: "/couriers", icon: "cart" },
      { label: "Returns", href: "/returns", icon: "branch" },
      { label: "Refunds", href: "/refunds", icon: "cost" },
    ],
  },
  {
    title: "MARKETING & CUSTOMER",
    items: [
      { label: "Campaigns", href: "/campaigns", icon: "megaphone" },
      { label: "Coupons", href: "/coupons", icon: "tag" },
      { label: "Reviews", href: "/reviews", icon: "spark" },
      { label: "Wishlist", href: "/wishlist", icon: "heart" },
      { label: "Membership", href: "/membership", icon: "users" },
      { label: "Rewards", href: "/rewards", icon: "cost" },
      { label: "AI Marketing", href: "/ai-marketing", icon: "spark" },
    ],
  },
  {
    title: "STORE SETTINGS",
    items: [
      { label: "Store Settings", href: "/store-settings", icon: "gear" },
      { label: "Homepage Hero", href: "/homepage-hero", icon: "file" },
      { label: "Homepage Builder", href: "/homepage-builder", icon: "grid" },
      { label: "Templates", href: "/templates", icon: "file" },
      { label: "Notifications", href: "/notifications", icon: "message" },
    ],
  },
];

const userAdminSections: AdminNavSection[] = [
  {
    title: "MANAGER WORKSPACE",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "home" },
      { label: "Assigned Orders", href: "/orders", icon: "cart" },
      { label: "Customers", href: "/customers", icon: "users" },
      { label: "Products", href: "/products", icon: "box" },
      { label: "Inventory", href: "/inventory", icon: "warehouse" },
    ],
  },
  {
    title: "DAILY TASKS",
    items: [
      { label: "Reviews", href: "/reviews", icon: "spark" },
      { label: "Returns", href: "/returns", icon: "branch" },
      { label: "Refunds", href: "/refunds", icon: "cost" },
      { label: "Notifications", href: "/notifications", icon: "message" },
      { label: "Reports", href: "/analytics", icon: "chart" },
    ],
  },
  {
    title: "LIMITED TOOLS",
    items: [
      { label: "AI Chat", href: "/ai-chat", icon: "bot" },
      { label: "AI Search", href: "/ai-search", icon: "search" },
      { label: "Store Settings", href: "/store-settings", icon: "gear" },
    ],
  },
];

export function getNavigationForRole(role: AdminRoleTheme): AdminNavSection[] {
  if (role === "super-admin") return superAdminSections;
  if (role === "user-admin") return userAdminSections;
  return adminSections;
}

export function countNavigationItems(role: AdminRoleTheme): number {
  return getNavigationForRole(role).reduce((total, section) => total + section.items.length, 0);
}
