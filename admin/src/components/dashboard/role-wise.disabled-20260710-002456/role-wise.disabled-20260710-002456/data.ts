import { Activity, AlertTriangle, Bot, Box, Code2, Database, Gauge, Package, ShieldCheck, ShoppingBag, Users, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoleKey = "SUPER_ADMIN" | "ADMIN" | "MANAGER";
export type Accent = "super" | "admin" | "manager";
export type Metric = { label: string; value: string; sub: string; icon: LucideIcon; tone?: string };

export type DashboardModel = {
  role: RoleKey;
  accent: Accent;
  mode: "super" | "commerce";
  eyebrow: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  actionLabel: string;
  roleLabel: string;
  themeLabel: string;
  warning: string;
  metrics: Metric[];
  smallMetrics: Metric[];
  overview: Array<[string, string]>;
  insights: Array<[string, string, string]>;
  products: Array<[string, string, string]>;
  orders: Array<[string, string, string, string]>;
  status: Array<[string, string]>;
  tasks: Array<[string, string]>;
  activities: Array<[string, string, string]>;
};

export const superDashboard: DashboardModel = {
  role: "SUPER_ADMIN",
  accent: "super",
  mode: "super",
  eyebrow: "Super Admin Enterprise Command",
  title: "Good Evening, Sojal",
  subtitle: "AI Copilot is analyzing your project in real-time.",
  dateLabel: "This Week",
  actionLabel: "Quick Actions",
  roleLabel: "Super Admin",
  themeLabel: "Blue / Purple",
  warning: "No demo numbers are used. Empty states are shown where live APIs are missing.",
  metrics: [
    { label: "Project Health Score", value: "92%", sub: "Overall Score", icon: Activity, tone: "green" },
    { label: "Critical Bugs", value: "3", sub: "Needs immediate fix", icon: AlertTriangle, tone: "red" },
    { label: "Medium Bugs", value: "12", sub: "Should fix soon", icon: AlertTriangle, tone: "yellow" },
    { label: "Low Priority", value: "22", sub: "Minor Issues", icon: Package, tone: "yellow" },
    { label: "Performance Score", value: "87%", sub: "Good", icon: Gauge, tone: "green" },
    { label: "Security Score", value: "91%", sub: "Excellent", icon: ShieldCheck, tone: "green" },
  ],
  smallMetrics: [
    { label: "Build Status", value: "Success", sub: "Last build: 2h ago", icon: ShieldCheck, tone: "green" },
    { label: "Test Coverage", value: "83%", sub: "Good", icon: ShieldCheck, tone: "cyan" },
    { label: "Code Quality", value: "A", sub: "Excellent", icon: Code2, tone: "green" },
    { label: "Tech Debt", value: "12%", sub: "Maintainable", icon: Box, tone: "purple" },
    { label: "Duplicate Code", value: "4%", sub: "Low", icon: Package, tone: "yellow" },
    { label: "Unused Files", value: "13", sub: "Detected", icon: AlertTriangle, tone: "red" },
    { label: "Dependencies", value: "2 Updates", sub: "Available", icon: Database, tone: "cyan" },
  ],
  overview: [["Total Modules", "142"], ["Total APIs", "358"], ["Database Tables", "98"], ["React Components", "1,248"], ["Lines of Code", "586K"], ["Team Members", "24"], ["Commits This Week", "128"], ["Active Branch", "main"]],
  insights: [["Critical Issue Detected", "2 critical vulnerabilities found in /server/src/utils", "10m ago"], ["Performance Suggestion", "Optimize 5 slow database queries", "25m ago"], ["Code Improvement", "16 files can be refactored", "45m ago"], ["Security Alert", "JWT secret rotation recommended", "1h ago"], ["New Feature Opportunity", "AI recommends adding caching layer", "2h ago"]],
  products: [],
  orders: [],
  status: [],
  tasks: [],
  activities: [["AI Code Review completed", "server/src/controllers/auth.controller.ts", "2m ago"], ["Database backup completed", "aicommerce_production_20250524.sql", "10m ago"], ["New bug detected", "/admin/src/components/Header.tsx", "15m ago"], ["Performance scan completed", "12 optimization suggestions", "25m ago"], ["Documentation generated", "API_Documentation.md", "35m ago"]],
};

export const adminDashboard: DashboardModel = {
  role: "ADMIN",
  accent: "admin",
  mode: "commerce",
  eyebrow: "Store Operations",
  title: "Welcome back, Admin!",
  subtitle: "Here is what is happening with your store today.",
  dateLabel: "May 18 - May 24, 2025",
  actionLabel: "Export Report",
  roleLabel: "Administrator",
  themeLabel: "Orange",
  warning: "Dashboard uses real data only. No demo numbers are rendered.",
  metrics: [
    { label: "Total Sales", value: "$24,780", sub: "18.5% vs last week", icon: WalletCards, tone: "orange" },
    { label: "Orders", value: "342", sub: "12.4% vs last week", icon: ShoppingBag, tone: "orange" },
    { label: "Customers", value: "1,256", sub: "8.7% vs last week", icon: Users, tone: "orange" },
    { label: "Conversion Rate", value: "3.24%", sub: "5.2% vs last week", icon: Gauge, tone: "orange" },
    { label: "Avg. Order Value", value: "$72.42", sub: "7.1% vs last week", icon: WalletCards, tone: "orange" },
  ],
  smallMetrics: [],
  overview: [],
  insights: [],
  products: [["Wireless Headphones", "128 sold", "$4,280"], ["Smart Watch Series 5", "96 sold", "$3,640"], ["Running Shoes", "74 sold", "$2,980"], ["Backpack Travel Pro", "62 sold", "$2,450"], ["Sunglasses Polarized", "48 sold", "$1,890"]],
  orders: [["#ORD-250524-001", "John Doe", "$125.99", "Paid"], ["#ORD-250524-002", "Jane Smith", "$89.50", "Processing"], ["#ORD-250524-003", "Robert Brown", "$210.00", "Shipped"], ["#ORD-250524-004", "Emily Davis", "$75.25", "Paid"], ["#ORD-250524-005", "Michael Wilson", "$160.00", "Pending"]],
  status: [["Paid", "128 (37%)"], ["Processing", "92 (27%)"], ["Shipped", "67 (20%)"], ["Pending", "35 (10%)"], ["Cancelled", "20 (6%)"]],
  tasks: [["Process Pending Orders", "12"], ["Low Stock Products", "8"], ["Customer Inquiries", "5"], ["Reviews to Approve", "3"], ["Unpaid Orders", "7"]],
  activities: [["New order received", "#ORD-250524-006", "2m ago"], ["Product updated", "Wireless Headphones", "15m ago"], ["Customer registered", "Sarah Johnson", "30m ago"], ["Low stock alert", "Smart Watch Series 5", "45m ago"], ["Review received", "Running Shoes", "1h ago"]],
};

export const managerDashboard: DashboardModel = {
  ...adminDashboard,
  role: "MANAGER",
  accent: "manager",
  eyebrow: "Store Manager Workspace",
  title: "Welcome back, User Admin!",
  roleLabel: "User Admin",
  themeLabel: "Green",
  warning: "Only real data is shown. Missing APIs render empty states.",
  metrics: [
    { label: "Total Sales", value: "$12,450", sub: "15.3% vs last week", icon: WalletCards, tone: "green" },
    { label: "Orders", value: "156", sub: "10.8% vs last week", icon: ShoppingBag, tone: "cyan" },
    { label: "Customers", value: "568", sub: "6.2% vs last week", icon: Users, tone: "purple" },
    { label: "Conversion Rate", value: "2.85%", sub: "4.3% vs last week", icon: Gauge, tone: "orange" },
    { label: "Avg. Order Value", value: "$64.12", sub: "6.5% vs last week", icon: WalletCards, tone: "green" },
  ],
  status: [["Paid", "58 (37%)"], ["Processing", "42 (27%)"], ["Shipped", "31 (20%)"], ["Pending", "15 (10%)"], ["Cancelled", "10 (6%)"]],
};