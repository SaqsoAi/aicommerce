export type AdminRole = "SUPER_ADMIN" | "TENANT_OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";

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

const SA: AdminRole[] = ["SUPER_ADMIN"];
const ADMIN: AdminRole[] = ["ADMIN", "TENANT_OWNER"];
const MANAGER: AdminRole[] = ["MANAGER"];
const BUSINESS: AdminRole[] = [...ADMIN, ...MANAGER];
const ALL_DASHBOARD: AdminRole[] = [...SA, ...ADMIN, ...MANAGER];
const ADMIN_AND_PLATFORM: AdminRole[] = [...ADMIN];

function item(section: string, order: number, name: string, href: string, icon: string, roles: AdminRole[], keywords: string[] = [], permissionAnyOf?: string[]): AdminNavItem {
  return { id: href.replace(/^\//, "").replace(/\//g, ".") || "dashboard", name, label: name, href, icon, section, group: section, keywords, roles, order, permissionAnyOf };
}
function group(order: number, name: string, icon: string, roles: AdminRole[], items: AdminNavItem[]): AdminNavGroup {
  return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), name, label: name, title: name, section: name, icon, roles, order, items };
}

export const adminNavigation: AdminNavGroup[] = [
  group(0, "Dashboard", "LayoutDashboard", ALL_DASHBOARD, [
    item("Dashboard", 0, "Dashboard", "/dashboard", "LayoutDashboard", ALL_DASHBOARD, ["overview", "home"]),
    item("Dashboard", 10, "Analytics", "/analytics", "BarChart3", [...SA, ...ADMIN], ["report", "sales"]),
  ]),

  group(10, "AI Development", "Bot", SA, [
    item("AI Development", 10, "AI Developer", "/ai-development-copilot", "Bot", SA),
    item("AI Development", 20, "AI Architect", "/ai", "Layers3", SA),
    item("AI Development", 30, "AI Code Reviewer", "/ai-code-reviewer", "Code2", SA),
    item("AI Development", 40, "AI Bug Detector", "/ai-bug-detector", "Activity", SA),
    item("AI Development", 50, "AI Performance", "/ai-performance", "Gauge", SA),
    item("AI Development", 60, "AI Documentation", "/ai-documentation", "FileSearch", SA),
    item("AI Development", 70, "AI Security Automation", "/ai-security-automation", "ShieldCheck", SA),
    item("AI Development", 80, "AI Social Manager", "/ai-social-manager", "Share2", SA),
  ]),

  group(20, "AI Management", "Cpu", SA, [
    item("AI Management", 10, "AI Control Center", "/ai-control-center", "Cpu", SA),
    item("AI Management", 20, "AI Providers", "/super-admin/provider-control", "Network", SA),
    item("AI Management", 30, "AI Usage & Cost", "/tenant-usage", "BarChart3", SA),
    item("AI Management", 40, "AI Feature Flags", "/super-admin/feature-flags", "ToggleLeft", SA),
    item("AI Management", 50, "Automation Studio", "/automation-studio", "Workflow", SA),
    item("AI Management", 60, "Automation Rules", "/automation-rules", "ListChecks", SA),
  ]),

  group(30, "Catalog", "Package", BUSINESS, [
    item("Catalog", 10, "Products", "/products", "Package", BUSINESS, ["catalog", "sku"], ["products.read"]),
    item("Catalog", 20, "Categories", "/categories", "Layers3", BUSINESS, ["taxonomy"], ["categories.read"]),
    item("Catalog", 30, "Sub Categories", "/subcategories", "ListTree", ADMIN, ["taxonomy"], ["categories.manage"]),
    item("Catalog", 40, "Brands", "/brands", "Tags", ADMIN, ["brand"], ["brands.read"]),
    item("Catalog", 50, "Product Engine", "/product-engine", "SlidersHorizontal", ADMIN),
    item("Catalog", 60, "Size & Fit Builder", "/size-fit-builder", "Ruler", ADMIN),
    item("Catalog", 70, "Product Import", "/import-center", "UploadCloud", ADMIN),
  ]),

  group(40, "Inventory", "Warehouse", BUSINESS, [
    item("Inventory", 10, "Inventory", "/inventory", "ClipboardList", BUSINESS, ["stock"], ["inventory.read"]),
    item("Inventory", 20, "Stock Adjustment", "/stock-adjustment", "SlidersHorizontal", ADMIN, [], ["inventory.adjust"]),
    item("Inventory", 30, "Stock Transfer", "/stock-transfer", "GitBranch", ADMIN, [], ["inventory.transfer"]),
    item("Inventory", 40, "GRN", "/grn", "ClipboardCheck", ADMIN),
    item("Inventory", 50, "Purchases", "/purchases", "BadgeDollarSign", ADMIN),
    item("Inventory", 60, "Suppliers", "/suppliers", "Factory", ADMIN),
    item("Inventory", 70, "Supplier Ledger", "/supplier-ledger", "Receipt", ADMIN),
  ]),

  group(50, "Sales", "ShoppingCart", BUSINESS, [
    item("Sales", 10, "Orders", "/orders", "ShoppingCart", BUSINESS, ["order"], ["orders.read"]),
    item("Sales", 20, "Returns", "/returns", "RotateCcw", ADMIN, [], ["returns.read"]),
    item("Sales", 30, "Refunds", "/refunds", "Receipt", ADMIN, [], ["refunds.read"]),
    item("Sales", 40, "Couriers", "/couriers", "Truck", ADMIN),
  ]),

  group(60, "Customers", "Users", BUSINESS, [
    item("Customers", 10, "Customer List", "/customers", "Users", BUSINESS, ["crm"], ["customers.read"]),
    item("Customers", 20, "Customer Intelligence", "/customer-intelligence", "ChartNoAxesCombined", ADMIN),
    item("Customers", 30, "Customer Profile Builder", "/customer-profile-builder", "UserCog", ADMIN),
    item("Customers", 40, "Reviews", "/reviews", "MessageSquare", BUSINESS, [], ["reviews.read"]),
    item("Customers", 50, "Wishlist", "/wishlist", "Heart", ADMIN),
    item("Customers", 60, "Membership", "/membership", "BadgeCheck", ADMIN),
    item("Customers", 70, "Rewards", "/rewards", "Crown", ADMIN),
  ]),

  group(70, "Marketing", "Megaphone", ADMIN_AND_PLATFORM, [
    item("Marketing", 10, "Campaigns", "/campaigns", "Megaphone", ADMIN_AND_PLATFORM),
    item("Marketing", 20, "Coupons", "/coupons", "TicketPercent", ADMIN_AND_PLATFORM),
    item("Marketing", 30, "Discount Policy", "/discount-policy", "BadgeDollarSign", ADMIN_AND_PLATFORM),
    item("Marketing", 40, "Notifications", "/notifications", "Bell", ADMIN_AND_PLATFORM),
    item("Marketing", 50, "Omnichannel", "/omnichannel", "Share2", ADMIN_AND_PLATFORM),
    item("Marketing", 60, "Messaging Queue", "/messaging-queue", "ListChecks", ADMIN_AND_PLATFORM),
    item("Marketing", 70, "Messaging Analytics", "/messaging-delivery-analytics", "ChartNoAxesCombined", ADMIN_AND_PLATFORM),
    item("Marketing", 80, "Messaging Event Mapping", "/messaging-event-mapping", "Workflow", ADMIN_AND_PLATFORM),
    item("Marketing", 90, "Notification Providers", "/notification-providers", "RadioTower", ADMIN_AND_PLATFORM),
    item("Marketing", 100, "Membership Banner", "/membership-banner", "PanelTop", ADMIN_AND_PLATFORM),
  ]),

  group(80, "Website CMS", "PanelsTopLeft", ADMIN_AND_PLATFORM, [
    item("Website CMS", 10, "Homepage Builder", "/homepage-builder", "PanelsTopLeft", ADMIN_AND_PLATFORM),
    item("Website CMS", 20, "Homepage Hero", "/homepage-hero", "Image", ADMIN_AND_PLATFORM),
    item("Website CMS", 30, "Landing Builder", "/landing-builder", "FileStack", ADMIN_AND_PLATFORM),
    item("Website CMS", 40, "Lookbooks", "/lookbooks", "Images", ADMIN_AND_PLATFORM),
    item("Website CMS", 50, "Media Library", "/media", "FolderOpen", ADMIN_AND_PLATFORM),
    item("Website CMS", 60, "Enterprise Hero Studio", "/enterprise-hero-studio", "Images", ADMIN_AND_PLATFORM),
    item("Website CMS", 70, "Hero Library", "/heroes", "GalleryHorizontalEnd", ADMIN_AND_PLATFORM),
    item("Website CMS", 80, "Templates", "/templates", "FileStack", ADMIN_AND_PLATFORM),
  ]),

  group(90, "AI Tools", "Sparkles", ADMIN_AND_PLATFORM, [
    item("AI Tools", 10, "AI Chat", "/ai-chat", "Bot", ADMIN_AND_PLATFORM),
    item("AI Tools", 20, "AI Search", "/ai-search", "Search", ADMIN_AND_PLATFORM),
    item("AI Tools", 30, "AI Recommendation", "/ai-recommendation", "Wand2", ADMIN_AND_PLATFORM),
    item("AI Tools", 40, "Virtual Try-On", "/ai-virtual-tryon", "Shirt", ADMIN_AND_PLATFORM),
    item("AI Tools", 50, "AI Marketing", "/ai-marketing", "Megaphone", ADMIN_AND_PLATFORM),
    item("AI Tools", 60, "AI Creative Studio", "/ai-creative-studio", "Sparkles", ADMIN_AND_PLATFORM),
    item("AI Tools", 70, "AI Social Manager", "/ai-social-manager", "Share2", ADMIN_AND_PLATFORM),
  ]),

  group(100, "Store Settings", "Settings", ADMIN_AND_PLATFORM, [
    item("Store Settings", 10, "Store Settings", "/store-settings", "Store", ADMIN_AND_PLATFORM),
    item("Store Settings", 20, "Enterprise Store Settings", "/enterprise-store-settings", "Settings2", ADMIN_AND_PLATFORM),
    item("Store Settings", 30, "Theme Settings", "/settings/theme", "SlidersHorizontal", ADMIN_AND_PLATFORM),
    item("Store Settings", 40, "General Settings", "/settings", "Settings", ADMIN_AND_PLATFORM),
    item("Store Settings", 50, "Subscriptions", "/subscriptions", "CreditCard", ADMIN_AND_PLATFORM),
    item("Store Settings", 60, "Membership Settings", "/membership-settings", "BadgeCheck", ADMIN_AND_PLATFORM),
    item("Store Settings", 70, "Membership Benefits", "/membership-benefits", "Gift", ADMIN_AND_PLATFORM),
    item("Store Settings", 80, "Plugin Settings", "/plugin-settings", "PackageCog", ADMIN_AND_PLATFORM),
  ]),

  group(110, "Platform & Security", "ShieldCheck", SA, [
    item("Platform & Security", 10, "Plugin Manager", "/system/plugin-manager", "Package", SA),
    item("Platform & Security", 15, "AI Migrator", "/system/migration-studio", "Wand2", SA, ["migration", "template", "react", "laravel"]),
    item("Platform & Security", 16, "Tenant Management", "/system/tenant-management", "Building2", SA, ["tenant", "store", "domain", "template"]),
    item("Platform & Security", 20, "Roles", "/roles", "ShieldCheck", SA),
    item("Platform & Security", 30, "Permissions", "/permissions", "KeyRound", SA),
    item("Platform & Security", 40, "Audit Logs", "/audit-logs", "FileSearch", SA),
    item("Platform & Security", 50, "Auth Provider Center", "/auth-provider-center", "LockKeyhole", SA),
    item("Platform & Security", 60, "Enterprise Identity", "/enterprise-auth-identity", "Fingerprint", SA),
    item("Platform & Security", 70, "Super Admin Users", "/super-admin/users", "Crown", SA),
    item("Platform & Security", 80, "Enterprise Auth Providers", "/enterprise-auth-providers", "Network", SA),
    item("Platform & Security", 90, "Plugin Settings", "/plugin-settings", "PackageCog", SA),
  ]),
];

export const navigation = adminNavigation;
export const sidebarNavigation = adminNavigation;
export const adminSidebarNavigation = adminNavigation;
export default adminNavigation;
