import type { AdminAppRole } from "@/config/roles";

export type NavigationCompatibilityRole =
  | AdminAppRole
  | "TENANT_OWNER"
  | "TENANT_ADMIN"
  | "STORE_ADMIN"
  | "USER_ADMIN"
  | "STAFF"
  | "PLATFORM_ADMIN"
  | "SUPERADMIN"
  | "FINANCE"
  | "DELIVERY"
  | "WAREHOUSE";

export type AdminRole = NavigationCompatibilityRole;


export type AdminNavItem = {
  id: string;
  name: string;
  label: string;
  href: string;
  icon: string;
  section: string;
  group: string;
  keywords: string[];
  roles: AdminRole[];
  permissionAnyOf?: string[];
  moduleKey?: string;
  featureFlag?: string;
  order: number;
  disabled?: boolean;
};

export type AdminNavGroup = {
  id: string;
  name: string;
  label: string;
  title: string;
  section: string;
  icon: string;
  items: AdminNavItem[];
  roles: AdminRole[];
  order: number;
};

const PLATFORM: AdminRole[] = ["SUPER_ADMIN"];
const ADMIN: AdminRole[] = ["ADMIN", "TENANT_OWNER", "TENANT_ADMIN"];
const MANAGER: AdminRole[] = ["MANAGER", "STAFF", "USER_ADMIN"];
const INVENTORY: AdminRole[] = ["INVENTORY", "WAREHOUSE_MANAGER"];
const MARKETING: AdminRole[] = ["MARKETING"];
const SUPPORT: AdminRole[] = ["SUPPORT"];
const DELIVERY: AdminRole[] = ["DELIVERY_MANAGER"];
const FINANCE: AdminRole[] = ["FINANCE_MANAGER"];

const TENANT_OPERATIONS: AdminRole[] = [
  ...ADMIN,
  ...MANAGER,
  ...INVENTORY,
  ...MARKETING,
  ...SUPPORT,
  ...DELIVERY,
  ...FINANCE,
];

const ALL_ADMIN_EXPERIENCES: AdminRole[] = [...PLATFORM, ...TENANT_OPERATIONS];

function item(
  section: string,
  order: number,
  name: string,
  href: string,
  icon: string,
  roles: AdminRole[],
  keywords: string[] = [],
  permissionAnyOf?: string[],
): AdminNavItem {
  return {
    id: href.replace(/^\//, "").replace(/\//g, ".") || "dashboard",
    name,
    label: name,
    href,
    icon,
    section,
    group: section,
    keywords,
    roles,
    order,
    permissionAnyOf,
  };
}

function group(
  order: number,
  name: string,
  icon: string,
  roles: AdminRole[],
  items: AdminNavItem[],
): AdminNavGroup {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    label: name,
    title: name,
    section: name,
    icon,
    roles,
    order,
    items,
  };
}

export const adminNavigation: AdminNavGroup[] = [
  group(0, "Dashboard", "LayoutDashboard", ALL_ADMIN_EXPERIENCES, [
    item("Dashboard", 0, "Dashboard", "/dashboard", "LayoutDashboard", ALL_ADMIN_EXPERIENCES, ["overview", "home"]),
    item("Dashboard", 10, "Analytics", "/analytics", "BarChart3", [...PLATFORM, ...ADMIN, ...MANAGER, ...FINANCE], ["report", "sales"]),
  ]),

  group(10, "Platform Command", "Crown", PLATFORM, [
    item("Platform Command", 10, "Tenant Management", "/system/tenant-management", "Building2", PLATFORM, ["tenant", "store", "domain"]),
    item("Platform Command", 20, "Platform Analytics", "/super-admin/platform-analytics", "ChartNoAxesCombined", PLATFORM),
    item("Platform Command", 30, "Tenant Usage", "/tenant-usage", "Gauge", PLATFORM),
    item("Platform Command", 40, "Plugin Manager", "/system/plugin-manager", "Package", PLATFORM),
    item("Platform Command", 50, "AI Migrator", "/system/migration-studio", "Wand2", PLATFORM, ["migration", "template", "react", "laravel"]),
  ]),

  group(20, "AI Development", "Bot", PLATFORM, [
    item("AI Development", 10, "AI Development Copilot", "/ai-development-copilot", "Bot", PLATFORM),
    item("AI Development", 20, "AI Architect", "/ai", "Layers3", PLATFORM),
    item("AI Development", 30, "AI Code Reviewer", "/ai-code-reviewer", "Code2", PLATFORM),
    item("AI Development", 40, "AI Bug Detector", "/ai-bug-detector", "Activity", PLATFORM),
    item("AI Development", 50, "AI Performance", "/ai-performance", "Gauge", PLATFORM),
    item("AI Development", 60, "AI Documentation", "/ai-documentation", "FileSearch", PLATFORM),
    item("AI Development", 70, "AI Security Automation", "/ai-security-automation", "ShieldCheck", PLATFORM),
    item("AI Development", 80, "AI Social Manager", "/ai-social-manager", "Share2", PLATFORM),
  ]),

  group(30, "AI Management", "Cpu", PLATFORM, [
    item("AI Management", 10, "AI Control Center", "/ai-control-center", "Cpu", PLATFORM),
    item("AI Management", 20, "AI Providers", "/super-admin/provider-control", "Network", PLATFORM),
    item("AI Management", 30, "AI Usage & Cost", "/tenant-usage", "BarChart3", PLATFORM),
    item("AI Management", 40, "AI Feature Flags", "/super-admin/feature-flags", "ToggleLeft", PLATFORM),
    item("AI Management", 50, "Automation Studio", "/automation-studio", "Workflow", PLATFORM),
    item("AI Management", 60, "Automation Rules", "/automation-rules", "ListChecks", PLATFORM),
  ]),

  group(40, "Catalog", "Package", [...ADMIN, ...MANAGER], [
    item("Catalog", 10, "Products", "/products", "Package", [...ADMIN, ...MANAGER], ["catalog", "sku"], ["products.read"]),
    item("Catalog", 20, "Categories", "/categories", "Layers3", [...ADMIN, ...MANAGER], ["taxonomy"], ["categories.read"]),
    item("Catalog", 30, "Sub Categories", "/subcategories", "ListTree", ADMIN, ["taxonomy"], ["categories.manage"]),
    item("Catalog", 40, "Brands", "/brands", "Tags", ADMIN, ["brand"], ["brands.read"]),
    item("Catalog", 50, "Product Engine", "/product-engine", "SlidersHorizontal", ADMIN),
    item("Catalog", 60, "Size & Fit Builder", "/size-fit-builder", "Ruler", ADMIN),
    item("Catalog", 70, "Product Import", "/import-center", "UploadCloud", ADMIN),
  ]),

  group(50, "Inventory & Purchase", "Warehouse", [...ADMIN, ...MANAGER, ...INVENTORY], [
    item("Inventory & Purchase", 10, "Inventory", "/inventory", "ClipboardList", [...ADMIN, ...MANAGER, ...INVENTORY], ["stock"], ["inventory.read"]),
    item("Inventory & Purchase", 20, "Stock Adjustment", "/stock-adjustment", "SlidersHorizontal", [...ADMIN, ...INVENTORY], [], ["inventory.adjust"]),
    item("Inventory & Purchase", 30, "Stock Transfer", "/stock-transfer", "GitBranch", [...ADMIN, ...INVENTORY], [], ["inventory.transfer"]),
    item("Inventory & Purchase", 40, "GRN", "/grn", "ClipboardCheck", [...ADMIN, ...INVENTORY]),
    item("Inventory & Purchase", 50, "Purchases", "/purchases", "BadgeDollarSign", [...ADMIN, ...INVENTORY]),
    item("Inventory & Purchase", 60, "Suppliers", "/suppliers", "Factory", [...ADMIN, ...INVENTORY]),
    item("Inventory & Purchase", 70, "Supplier Ledger", "/supplier-ledger", "Receipt", [...ADMIN, ...INVENTORY, ...FINANCE]),
  ]),

  group(60, "Sales", "ShoppingCart", [...ADMIN, ...MANAGER, ...SUPPORT, ...DELIVERY, ...FINANCE], [
    item("Sales", 10, "Orders", "/orders", "ShoppingCart", [...ADMIN, ...MANAGER, ...SUPPORT, ...DELIVERY, ...FINANCE], ["order"], ["orders.read"]),
    item("Sales", 20, "Returns", "/returns", "RotateCcw", [...ADMIN, ...MANAGER, ...SUPPORT, ...FINANCE], [], ["returns.read"]),
    item("Sales", 30, "Refunds", "/refunds", "Receipt", [...ADMIN, ...SUPPORT, ...FINANCE], [], ["refunds.read"]),
    item("Sales", 40, "Couriers", "/couriers", "Truck", [...ADMIN, ...DELIVERY]),
  ]),

  group(70, "Customers", "Users", [...ADMIN, ...MANAGER, ...SUPPORT], [
    item("Customers", 10, "Customer List", "/customers", "Users", [...ADMIN, ...MANAGER, ...SUPPORT], ["crm"], ["customers.read"]),
    item("Customers", 20, "Customer Intelligence", "/customer-intelligence", "ChartNoAxesCombined", [...ADMIN, ...SUPPORT]),
    item("Customers", 30, "Customer Profile Builder", "/customer-profile-builder", "UserCog", ADMIN),
    item("Customers", 40, "Reviews", "/reviews", "MessageSquare", [...ADMIN, ...MANAGER, ...SUPPORT], [], ["reviews.read"]),
    item("Customers", 50, "Wishlist", "/wishlist", "Heart", ADMIN),
    item("Customers", 60, "Membership", "/membership", "BadgeCheck", ADMIN),
    item("Customers", 70, "Rewards", "/rewards", "Crown", ADMIN),
  ]),

  group(80, "Marketing", "Megaphone", [...ADMIN, ...MARKETING], [
    item("Marketing", 10, "Campaigns", "/campaigns", "Megaphone", [...ADMIN, ...MARKETING]),
    item("Marketing", 20, "Coupons", "/coupons", "TicketPercent", [...ADMIN, ...MARKETING]),
    item("Marketing", 30, "Discount Policy", "/discount-policy", "BadgeDollarSign", [...ADMIN, ...MARKETING]),
    item("Marketing", 40, "Notifications", "/notifications", "Bell", [...ADMIN, ...MARKETING]),
    item("Marketing", 50, "Omnichannel", "/omnichannel", "Share2", [...ADMIN, ...MARKETING]),
    item("Marketing", 60, "Messaging Queue", "/messaging-queue", "ListChecks", [...ADMIN, ...MARKETING]),
    item("Marketing", 70, "Messaging Analytics", "/messaging-delivery-analytics", "ChartNoAxesCombined", [...ADMIN, ...MARKETING]),
    item("Marketing", 80, "Messaging Event Mapping", "/messaging-event-mapping", "Workflow", [...ADMIN, ...MARKETING]),
    item("Marketing", 90, "Notification Providers", "/notification-providers", "RadioTower", [...ADMIN, ...MARKETING]),
    item("Marketing", 100, "Membership Banner", "/membership-banner", "PanelTop", [...ADMIN, ...MARKETING]),
  ]),

  group(90, "Website CMS", "PanelsTopLeft", [...ADMIN, ...MARKETING], [
    item("Website CMS", 10, "Homepage Builder", "/homepage-builder", "PanelsTopLeft", [...ADMIN, ...MARKETING]),
    item("Website CMS", 20, "Homepage Hero", "/homepage-hero", "Image", [...ADMIN, ...MARKETING]),
    item("Website CMS", 30, "Landing Builder", "/landing-builder", "FileStack", [...ADMIN, ...MARKETING]),
    item("Website CMS", 40, "Lookbooks", "/lookbooks", "Images", [...ADMIN, ...MARKETING]),
    item("Website CMS", 50, "Media Library", "/media", "FolderOpen", [...ADMIN, ...MARKETING]),
    item("Website CMS", 60, "Enterprise Hero Studio", "/enterprise-hero-studio", "Images", [...ADMIN, ...MARKETING]),
    item("Website CMS", 70, "Hero Library", "/heroes", "GalleryHorizontalEnd", [...ADMIN, ...MARKETING]),
    item("Website CMS", 80, "Templates", "/templates", "FileStack", ADMIN),
  ]),

  group(100, "AI Business Tools", "Sparkles", [...ADMIN, ...MARKETING], [
    item("AI Business Tools", 10, "AI Chat", "/ai-chat", "Bot", [...ADMIN, ...MARKETING]),
    item("AI Business Tools", 20, "AI Search", "/ai-search", "Search", [...ADMIN, ...MARKETING]),
    item("AI Business Tools", 30, "AI Recommendation", "/ai-recommendation", "Wand2", ADMIN),
    item("AI Business Tools", 40, "Virtual Try-On", "/ai-virtual-tryon", "Shirt", ADMIN),
    item("AI Business Tools", 50, "AI Marketing", "/ai-marketing", "Megaphone", [...ADMIN, ...MARKETING]),
    item("AI Business Tools", 60, "AI Creative Studio", "/ai-creative-studio", "Sparkles", [...ADMIN, ...MARKETING]),
  ]),

  group(110, "Staff & Access", "ShieldCheck", ADMIN, [
    item("Staff & Access", 10, "Roles", "/roles", "ShieldCheck", ADMIN),
    item("Staff & Access", 20, "Permissions", "/permissions", "KeyRound", ADMIN),
    item("Staff & Access", 30, "Audit Logs", "/audit-logs", "FileSearch", ADMIN),
  ]),

  group(120, "Store Settings", "Settings", ADMIN, [
    item("Store Settings", 10, "Store Settings", "/store-settings", "Store", ADMIN),
    item("Store Settings", 20, "Enterprise Store Settings", "/enterprise-store-settings", "Settings2", ADMIN),
    item("Store Settings", 30, "Theme Settings", "/settings/theme", "SlidersHorizontal", ADMIN),
    item("Store Settings", 40, "General Settings", "/settings", "Settings", ADMIN),
    item("Store Settings", 50, "Subscriptions", "/subscriptions", "CreditCard", ADMIN),
    item("Store Settings", 60, "Membership Settings", "/membership-settings", "BadgeCheck", ADMIN),
    item("Store Settings", 70, "Membership Benefits", "/membership-benefits", "Gift", ADMIN),
    item("Store Settings", 80, "Plugin Settings", "/plugin-settings", "PackageCog", ADMIN),
  ]),

  group(130, "Platform & Security", "ShieldCheck", PLATFORM, [
    item("Platform & Security", 10, "Roles", "/roles", "ShieldCheck", PLATFORM),
    item("Platform & Security", 20, "Permissions", "/permissions", "KeyRound", PLATFORM),
    item("Platform & Security", 30, "Audit Logs", "/audit-logs", "FileSearch", PLATFORM),
    item("Platform & Security", 40, "Auth Provider Center", "/auth-provider-center", "LockKeyhole", PLATFORM),
    item("Platform & Security", 50, "Enterprise Identity", "/enterprise-auth-identity", "Fingerprint", PLATFORM),
    item("Platform & Security", 60, "Platform Admin Users", "/super-admin/users", "Crown", PLATFORM),
    item("Platform & Security", 70, "Enterprise Auth Providers", "/enterprise-auth-providers", "Network", PLATFORM),
    item("Platform & Security", 80, "Plugin Settings", "/plugin-settings", "PackageCog", PLATFORM),
  ]),
];

export const navigation = adminNavigation;
export const sidebarNavigation = adminNavigation;
export const adminSidebarNavigation = adminNavigation;
export default adminNavigation;
