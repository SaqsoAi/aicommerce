export type AdminRole =
  | "SUPER_ADMIN"
  | "TENANT_OWNER"
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "CUSTOMER";

export type AdminNavItem = {
  id?: string;
  name: string;
  label: string;
  href: string;
  icon: string;
  section?: string;
  group?: string;
  keywords: string[];
  roles?: AdminRole[];
  badge?: string;
  featureFlag?: string;
  order?: number;
  disabled?: boolean;
};

export type AdminNavGroup = {
  id?: string;
  name: string;
  label: string;
  title?: string;
  section: string;
  icon: string;
  items: AdminNavItem[];
  roles?: AdminRole[];
  order?: number;
};

export const allAdminRoles: AdminRole[] = [
  "SUPER_ADMIN",
  "TENANT_OWNER",
  "ADMIN",
  "MANAGER",
  "STAFF",
  "CUSTOMER",
];

function item(
  section: string,
  order: number,
  name: string,
  href: string,
  icon: string,
  keywords: string[] = []
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
    roles: allAdminRoles,
    order,
  };
}

function group(
  order: number,
  name: string,
  icon: string,
  items: AdminNavItem[]
): AdminNavGroup {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    label: name,
    title: name,
    section: name,
    icon,
    roles: allAdminRoles,
    order,
    items,
  };
}

export const adminNavigation: AdminNavGroup[] = [
  group(10, "Dashboard", "LayoutDashboard", [
    item("Dashboard", 10, "Dashboard", "/dashboard", "LayoutDashboard", ["overview", "home"]),
    item("Dashboard", 20, "Analytics", "/analytics", "BarChart3", ["report", "sales", "revenue"]),
  ]),

  group(20, "Catalog Management", "Package", [
    item("Catalog Management", 10, "Products", "/products", "Package", ["catalog", "sku"]),
    item("Catalog Management", 20, "Categories", "/categories", "Layers3", ["taxonomy"]),
    item("Catalog Management", 30, "Subcategories", "/subcategories", "ListTree", ["taxonomy"]),
    item("Catalog Management", 40, "Brands", "/brands", "Tags", ["brand"]),
    item("Catalog Management", 50, "Variants", "/variants", "Boxes", ["size", "color"]),
    item("Catalog Management", 60, "Product Normalization", "/enterprise-product-normalization", "SlidersHorizontal", ["standard"]),
    item("Catalog Management", 70, "Size Fit Builder", "/size-fit-builder", "Ruler", ["size", "fit"]),
  ]),

  group(30, "Order Management", "ShoppingCart", [
    item("Order Management", 10, "Orders", "/orders", "ShoppingCart", ["order"]),
    item("Order Management", 20, "Returns", "/returns", "RotateCcw", ["return"]),
    item("Order Management", 30, "Refunds", "/refunds", "Receipt", ["refund"]),
    item("Order Management", 40, "Couriers", "/couriers", "Truck", ["delivery"]),
  ]),

  group(40, "Customers", "Users", [
    item("Customers", 10, "Customers", "/customers", "Users", ["crm"]),
    item("Customers", 20, "Customer Profile Builder", "/customer-profile-builder", "UserCog", ["profile"]),
    item("Customers", 30, "Membership", "/membership", "BadgeCheck", ["loyalty"]),
    item("Customers", 40, "Membership Settings", "/membership-settings", "Settings2", ["loyalty"]),
    item("Customers", 50, "Membership Banner", "/membership-banner", "PanelTop", ["banner"]),
    item("Customers", 60, "Wishlist", "/wishlist", "Heart", ["wishlist"]),
  ]),

  group(50, "Inventory & ERP", "Warehouse", [
    item("Inventory & ERP", 10, "Inventory", "/inventory", "ClipboardList", ["stock"]),
    item("Inventory & ERP", 20, "Suppliers", "/suppliers", "Factory", ["supplier"]),
    item("Inventory & ERP", 30, "Purchase", "/purchase", "BadgeDollarSign", ["purchase"]),
    item("Inventory & ERP", 40, "GRN", "/grn", "ClipboardCheck", ["goods", "receive"]),
  ]),

  group(60, "Marketing & CMS", "Megaphone", [
    item("Marketing & CMS", 10, "Campaigns", "/campaigns", "Megaphone", ["marketing"]),
    item("Marketing & CMS", 20, "Coupons", "/coupons", "TicketPercent", ["discount"]),
    item("Marketing & CMS", 30, "Homepage Builder", "/homepage-builder", "PanelsTopLeft", ["homepage"]),
    item("Marketing & CMS", 40, "Homepage Hero", "/homepage-hero", "Image", ["hero"]),
    item("Marketing & CMS", 50, "Hero Studio", "/enterprise-hero-studio", "Sparkles", ["hero", "studio"]),
    item("Marketing & CMS", 60, "Heroes", "/heroes", "Images", ["hero"]),
    item("Marketing & CMS", 70, "Landing Builder", "/landing-builder", "FileStack", ["landing"]),
    item("Marketing & CMS", 80, "Templates", "/templates", "LayoutTemplate", ["template"]),
    item("Marketing & CMS", 90, "Template Settings", "/template-settings", "LayoutTemplate", ["template"]),
    item("Marketing & CMS", 100, "Media Library", "/media", "FolderOpen", ["media"]),
    item("Marketing & CMS", 110, "Social Feed Settings", "/social-feed-settings", "Share2", ["social"]),
  ]),

  group(70, "AI Center", "Sparkles", [
    item("AI Center", 10, "AI Dashboard", "/ai", "Sparkles", ["ai"]),
    item("AI Center", 20, "AI Control Center", "/ai-control-center", "Cpu", ["ai", "control"]),
    item("AI Center", 30, "AI Chat", "/ai-chat", "Bot", ["chat"]),
    item("AI Center", 40, "AI Search", "/ai-search", "Search", ["search"]),
    item("AI Center", 50, "AI Recommendation", "/ai-recommendation", "Wand2", ["recommendation"]),
    item("AI Center", 60, "AI Virtual Try-On", "/ai-virtual-tryon", "Shirt", ["tryon"]),
    item("AI Center", 70, "Virtual Try-On", "/virtual-tryon", "Shirt", ["tryon"]),
  ]),

  group(80, "Notification & Automation", "Bell", [
    item("Notification & Automation", 10, "Notifications", "/notifications", "Bell", ["alert"]),
    item("Notification & Automation", 20, "SMS Control Center", "/sms-control-center", "MessageSquareText", ["sms"]),
    item("Notification & Automation", 30, "Messaging Queue", "/messaging-queue", "ListChecks", ["queue"]),
    item("Notification & Automation", 40, "Delivery Analytics", "/messaging-delivery-analytics", "Activity", ["delivery"]),
    item("Notification & Automation", 50, "Event Mapping", "/messaging-event-mapping", "GitBranch", ["event"]),
    item("Notification & Automation", 60, "Automation Studio", "/automation-studio", "Workflow", ["automation"]),
    item("Notification & Automation", 70, "Automation Rules", "/automation-rules", "ListTodo", ["rules"]),
  ]),

  group(90, "Enterprise Settings", "Settings", [
    item("Enterprise Settings", 10, "Store Settings", "/store-settings", "Store", ["store", "brand"]),
    item("Enterprise Settings", 20, "Enterprise Store Settings", "/enterprise-store-settings", "Store", ["brand"]),
    item("Enterprise Settings", 30, "Settings", "/settings", "Settings", ["settings"]),
    item("Enterprise Settings", 40, "Settings V2", "/settings-v2", "Settings2", ["settings"]),
    item("Enterprise Settings", 50, "Import Center", "/import-center", "UploadCloud", ["import"]),
    item("Enterprise Settings", 60, "Subscription", "/subscriptions", "CreditCard", ["billing"]),
  ]),

  group(100, "Security & Super Admin", "ShieldCheck", [
    item("Security & Super Admin", 10, "Roles", "/roles", "ShieldCheck", ["rbac"]),
    item("Security & Super Admin", 20, "Permissions", "/permissions", "KeyRound", ["access"]),
    item("Security & Super Admin", 30, "Audit Logs", "/audit-logs", "FileSearch", ["audit"]),
    item("Security & Super Admin", 40, "Auth Provider Center", "/auth-provider-center", "LockKeyhole", ["auth"]),
    item("Security & Super Admin", 50, "Enterprise Auth Identity", "/enterprise-auth-identity", "Fingerprint", ["identity"]),
    item("Security & Super Admin", 60, "Enterprise Auth Providers", "/enterprise-auth-providers", "Shield", ["providers"]),
    item("Security & Super Admin", 70, "Feature Flags", "/super-admin/feature-flags", "ToggleLeft", ["flags"]),
    item("Security & Super Admin", 80, "Provider Control", "/super-admin/provider-control", "Network", ["provider"]),
    item("Security & Super Admin", 90, "Super Admin Users", "/super-admin/users", "Crown", ["super"]),
  ]),
];

export const navigation = adminNavigation;
export const sidebarNavigation = adminNavigation;
export const adminSidebarNavigation = adminNavigation;
export default adminNavigation;