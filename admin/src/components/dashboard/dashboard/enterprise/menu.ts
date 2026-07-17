import type { DashboardRole, MenuGroup } from "./types";

export const SUPER_ADMIN_MENUS: MenuGroup[] = [
  { title: "AI DEVELOPMENT", items: [
    { label: "Dashboard", href: "/dashboard", icon: "Home" },
    { label: "AI Developer", href: "/ai-developer", icon: "Bot" },
    { label: "AI Architect", href: "/ai-architect", icon: "Network" },
    { label: "AI Code Reviewer", href: "/ai-code-reviewer", icon: "Code" },
    { label: "AI Bug Detector", href: "/ai-bug-detector", icon: "Bug" },
    { label: "AI Security Expert", href: "/ai-security-expert", icon: "Shield" },
    { label: "AI Performance", href: "/ai-performance", icon: "Gauge" },
    { label: "AI Database Engineer", href: "/ai-database-engineer", icon: "Database" },
    { label: "AI Refactoring", href: "/ai-refactoring", icon: "GitBranch" },
    { label: "AI Documentation", href: "/ai-documentation", icon: "FileText" },
    { label: "AI Test Generator", href: "/ai-test-generator", icon: "Activity" },
    { label: "AI DevOps", href: "/ai-devops", icon: "Zap" },
    { label: "AI UI/UX Auditor", href: "/ai-ui-ux-auditor", icon: "LayoutGrid" },
  ]},
  { title: "AI MANAGEMENT", items: [
    { label: "AI Providers", href: "/ai-providers", icon: "Sparkles" },
    { label: "AI Models", href: "/ai-models", icon: "Bot" },
    { label: "Prompt Registry", href: "/prompt-registry", icon: "FileText" },
    { label: "AI Usage & Cost", href: "/ai-usage-cost", icon: "Wallet" },
    { label: "AI Feature Flags", href: "/ai-feature-flags", icon: "ToggleLeft" },
    { label: "AI Settings", href: "/ai-settings", icon: "Settings" },
  ]},
  { title: "PROJECT MANAGEMENT", items: [
    { label: "Projects", href: "/projects", icon: "FolderKanban" },
    { label: "Modules", href: "/modules", icon: "Boxes" },
    { label: "Database", href: "/database", icon: "Database" },
    { label: "API Management", href: "/api-management", icon: "Network" },
    { label: "File Explorer", href: "/file-explorer", icon: "Folder" },
    { label: "Git Integration", href: "/git-integration", icon: "GitBranch" },
    { label: "Audit Center", href: "/audit-center", icon: "ClipboardList" },
    { label: "System Health", href: "/system-health", icon: "Activity" },
    { label: "Backups", href: "/backups", icon: "Archive" },
  ]},
];

export const ADMIN_MENUS: MenuGroup[] = [
  { title: "CATALOG", items: [
    { label: "Dashboard", href: "/dashboard", icon: "Home" },
    { label: "Products", href: "/products", icon: "Package" },
    { label: "Categories", href: "/categories", icon: "Layers" },
    { label: "Sub Categories", href: "/sub-categories", icon: "LayoutGrid" },
    { label: "Brands", href: "/brands", icon: "Badge" },
    { label: "Variants", href: "/variants", icon: "Boxes" },
    { label: "Product Engine", href: "/product-engine", icon: "Sparkles" },
  ]},
  { title: "INVENTORY", items: [
    { label: "Inventory", href: "/inventory", icon: "Warehouse" },
    { label: "Stock Adjustment", href: "/stock-adjustment", icon: "Activity" },
    { label: "Stock Transfer", href: "/stock-transfer", icon: "Truck" },
    { label: "Purchases", href: "/purchases", icon: "ShoppingBag" },
    { label: "GRN", href: "/grn", icon: "ClipboardList" },
    { label: "Suppliers", href: "/suppliers", icon: "Users" },
    { label: "Supplier Ledger", href: "/supplier-ledger", icon: "BookOpen" },
  ]},
  { title: "SALES", items: [
    { label: "Orders", href: "/orders", icon: "Truck" },
    { label: "Returns", href: "/returns", icon: "RotateCcw" },
    { label: "Refunds", href: "/refunds", icon: "Wallet" },
    { label: "Invoices", href: "/invoices", icon: "FileText" },
    { label: "POS", href: "/pos", icon: "CreditCard" },
  ]},
  { title: "CUSTOMERS", items: [
    { label: "Customers", href: "/customers", icon: "Users" },
    { label: "Customer Intelligence", href: "/customer-intelligence", icon: "Brain" },
    { label: "Reviews", href: "/reviews", icon: "Star" },
    { label: "Wishlist", href: "/wishlist", icon: "Heart" },
    { label: "Membership", href: "/membership", icon: "Badge" },
    { label: "Rewards", href: "/rewards", icon: "Gift" },
  ]},
  { title: "MARKETING", items: [
    { label: "Campaigns", href: "/campaigns", icon: "Megaphone" },
    { label: "Coupons", href: "/coupons", icon: "Ticket" },
    { label: "Newsletter", href: "/newsletter", icon: "Mail" },
    { label: "Social Media", href: "/social-media", icon: "Share2" },
    { label: "SEO", href: "/seo", icon: "Search" },
  ]},
  { title: "WEBSITE CMS", items: [
    { label: "Homepage Builder", href: "/homepage-builder", icon: "Home" },
    { label: "Homepage Hero", href: "/homepage-hero", icon: "Image" },
    { label: "Landing Builder", href: "/landing-builder", icon: "PanelsTopLeft" },
    { label: "Media Library", href: "/media-library", icon: "Images" },
    { label: "Templates", href: "/templates", icon: "LayoutTemplate" },
    { label: "Menus", href: "/menus", icon: "Menu" },
  ]},
  { title: "SETTINGS", items: [
    { label: "Store Settings", href: "/store-settings", icon: "Settings" },
    { label: "Theme Settings", href: "/theme-settings", icon: "Palette" },
    { label: "Users & Roles", href: "/users-roles", icon: "UserCog" },
    { label: "Audit Logs", href: "/audit-logs", icon: "ClipboardList" },
    { label: "Payment Methods", href: "/payment-methods", icon: "CreditCard" },
    { label: "Shipping Methods", href: "/shipping-methods", icon: "Truck" },
    { label: "Import Center", href: "/import-center", icon: "Upload" },
  ]},
];

export const USER_ADMIN_MENUS: MenuGroup[] = [
  { title: "MANAGE STORE", items: [
    { label: "Dashboard", href: "/dashboard", icon: "Home" },
    { label: "Products", href: "/products", icon: "Package" },
    { label: "Orders", href: "/orders", icon: "Truck" },
    { label: "Customers", href: "/customers", icon: "Users" },
    { label: "Inventory", href: "/inventory", icon: "Warehouse" },
    { label: "Categories", href: "/categories", icon: "Layers" },
    { label: "Coupons", href: "/coupons", icon: "Ticket" },
    { label: "Reviews", href: "/reviews", icon: "Star" },
  ]},
  { title: "MARKETING", items: [
    { label: "Campaigns", href: "/campaigns", icon: "Megaphone" },
    { label: "Newsletter", href: "/newsletter", icon: "Mail" },
    { label: "Social Media", href: "/social-media", icon: "Share2" },
  ]},
  { title: "REPORTS", items: [
    { label: "Sales Report", href: "/sales-report", icon: "Activity" },
    { label: "Performance", href: "/performance", icon: "Gauge" },
    { label: "Customers", href: "/customer-reports", icon: "Users" },
  ]},
  { title: "SETTINGS", items: [
    { label: "Store Settings", href: "/store-settings", icon: "Settings" },
    { label: "Payment Methods", href: "/payment-methods", icon: "CreditCard" },
    { label: "Shipping Methods", href: "/shipping-methods", icon: "Truck" },
    { label: "Profile", href: "/profile", icon: "UserCog" },
  ]},
];

export function menusForRole(role: DashboardRole): MenuGroup[] {
  if (role === "SUPER_ADMIN") return SUPER_ADMIN_MENUS;
  if (role === "ADMIN") return ADMIN_MENUS;
  return USER_ADMIN_MENUS;
}