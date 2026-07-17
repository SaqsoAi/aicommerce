"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, Bell, Bot, Boxes, Bug, ChevronDown, Code2, Database, FileText,
  Gauge, GitBranch, Home, Layers3, LayoutGrid, LogOut, Mail, Menu, Moon,
  Package, Search, Settings, ShieldCheck, Sparkles, Truck, UserCog, Users,
  Wallet, Zap, GripVertical, HelpCircle, CircleDot
} from "lucide-react";

type Role = "SUPER_ADMIN" | "ADMIN" | "USER_ADMIN";
type Accent = "purple" | "orange" | "green";
type MenuItem = { label: string; icon: React.ElementType; href: string };
type MenuGroup = { title: string; items: MenuItem[] };
type Kpi = { label: string; value: string | number; meta?: string };
type DashboardData = {
  currency: string;
  kpis: Kpi[];
  status: Kpi[];
  products: any[];
  orders: any[];
  customers: any[];
  lowStock: any[];
  activities: any[];
  insights: any[];
  metrics: Record<string, string | number>;
};

const blankData: DashboardData = { currency: "BDT", kpis: [], status: [], products: [], orders: [], customers: [], lowStock: [], activities: [], insights: [], metrics: {} };

function mi(label: string, icon: React.ElementType, href = "#"): MenuItem { return { label, icon, href }; }

const SUPER_ADMIN_MENU: MenuGroup[] = [
  { title: "AI DEVELOPMENT", items: [mi("Dashboard", Home), mi("AI Developer", Bot), mi("AI Architect", Layers3), mi("AI Code Reviewer", Code2), mi("AI Bug Detector", Bug), mi("AI Security Expert", ShieldCheck), mi("AI Performance", Gauge), mi("AI Database Engineer", Database), mi("AI Refactoring", GitBranch), mi("AI Documentation", FileText), mi("AI Test Generator", Activity), mi("AI DevOps", Zap), mi("AI UI/UX Auditor", LayoutGrid)] },
  { title: "AI MANAGEMENT", items: [mi("AI Providers", Sparkles), mi("AI Models", Bot), mi("Prompt Registry", FileText), mi("AI Usage & Cost", Wallet), mi("AI Feature Flags", Settings), mi("AI Settings", Settings), mi("AI Agents", Bot), mi("Vector DB", Database), mi("Embedding", Sparkles)] },
  { title: "PLATFORM MANAGEMENT", items: [mi("Tenants", LayoutGrid), mi("Users", Users), mi("Roles", UserCog), mi("Database", Database), mi("API Management", GitBranch), mi("File Explorer", FileText), mi("Git Integration", GitBranch), mi("Audit Center", ShieldCheck), mi("Monitoring", Activity), mi("Queues", Layers3), mi("Workers", Zap), mi("Scheduler", Activity), mi("Backups", Database), mi("Health", Gauge), mi("License", ShieldCheck), mi("Billing", Wallet), mi("Marketplace", Package), mi("Plugins", Boxes), mi("Themes", Sparkles), mi("Settings", Settings)] },
];

const ADMIN_MENU: MenuGroup[] = [
  { title: "CATALOG", items: [mi("Dashboard", Home), mi("Products", Package), mi("Categories", Layers3), mi("Sub Categories", LayoutGrid), mi("Brands", ShieldCheck), mi("Variants", Boxes), mi("Product Engine", Sparkles)] },
  { title: "INVENTORY", items: [mi("Inventory", Database), mi("Stock Adjustment", Activity), mi("Stock Transfer", Truck), mi("Purchases", Wallet), mi("GRN", FileText), mi("Suppliers", Users), mi("Supplier Ledger", Database)] },
  { title: "SALES", items: [mi("Orders", Truck), mi("Returns", Activity), mi("Refunds", Wallet), mi("Invoices", FileText), mi("POS", Wallet)] },
  { title: "CUSTOMERS", items: [mi("Customers", Users), mi("Groups", UserCog), mi("Reviews", Sparkles), mi("Wishlist", ShieldCheck), mi("Rewards", Wallet)] },
  { title: "MARKETING", items: [mi("Campaigns", Bell), mi("Coupons", Wallet), mi("Newsletter", Mail), mi("Social Media", Sparkles), mi("SEO", Gauge)] },
  { title: "CMS", items: [mi("Homepage", Home), mi("Hero", Sparkles), mi("Landing", LayoutGrid), mi("Pages", FileText), mi("Media Library", FileText), mi("Lookbook", LayoutGrid), mi("Templates", LayoutGrid), mi("Menus", Layers3)] },
  { title: "SETTINGS", items: [mi("Store Settings", Settings), mi("Theme Settings", Settings), mi("Users & Roles", UserCog), mi("Audit Logs", FileText), mi("API Settings", GitBranch), mi("Payment Methods", Wallet), mi("Shipping Methods", Truck), mi("Taxes", Wallet), mi("Import Center", Database), mi("Export Center", Database)] },
];

const USER_ADMIN_MENU: MenuGroup[] = [
  { title: "MANAGE STORE", items: [mi("Dashboard", Home), mi("Products", Package), mi("Orders", Truck), mi("Customers", Users), mi("Inventory", Database), mi("Categories", Layers3), mi("Coupons", Wallet), mi("Reviews", Sparkles)] },
  { title: "MARKETING", items: [mi("Campaigns", Bell), mi("Newsletter", Mail), mi("Social Media", Sparkles)] },
  { title: "REPORTS", items: [mi("Sales Report", Activity), mi("Performance", Gauge), mi("Customers", Users)] },
  { title: "SETTINGS", items: [mi("Store Settings", Settings), mi("Payment Methods", Wallet), mi("Shipping Methods", Truck), mi("Profile", UserCog)] },
];

function getRole(): Role {
  if (typeof window === "undefined") return "SUPER_ADMIN";
  const raw = (localStorage.getItem("role") || localStorage.getItem("userRole") || "SUPER_ADMIN").toUpperCase();
  if (raw === "ADMIN") return "ADMIN";
  if (raw === "MANAGER" || raw === "USER_ADMIN") return "USER_ADMIN";
  return "SUPER_ADMIN";
}

function roleTheme(role: Role) {
  if (role === "ADMIN") return { accent: "orange" as Accent, title: "AI-Commerce", subtitle: "Admin Dashboard", name: "Admin", roleLabel: "Administrator", initials: "AD" };
  if (role === "USER_ADMIN") return { accent: "green" as Accent, title: "AI-Commerce", subtitle: "User Admin Dashboard", name: "User Admin", roleLabel: "Manager", initials: "UA" };
  return { accent: "purple" as Accent, title: "AICopilot", subtitle: "Super Admin - AI Development Copilot", name: "Sojal Ahmed", roleLabel: "Super Admin", initials: "SA" };
}

function menuFor(role: Role): MenuGroup[] { return role === "SUPER_ADMIN" ? SUPER_ADMIN_MENU : role === "ADMIN" ? ADMIN_MENU : USER_ADMIN_MENU; }
function money(n: number, currency = "BDT") { return currency === "BDT" ? "৳" + n.toLocaleString() : "$" + n.toLocaleString(); }
function val(v: unknown, fallback = 0) { return typeof v === "number" || typeof v === "string" ? v : fallback; }

async function getJson(path: string) {
  try { const res = await fetch(path, { credentials: "include" }); if (!res.ok) return null; const json = await res.json(); return json?.data ?? json; } catch { return null; }
}

function normalizeArray(value: any): any[] { if (Array.isArray(value)) return value; if (Array.isArray(value?.items)) return value.items; if (Array.isArray(value?.data)) return value.data; return []; }

function useDashboardData(role: Role) {
  const [data, setData] = useState<DashboardData>(blankData);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const roleEndpoint = role === "SUPER_ADMIN" ? "/api/dashboard/super-admin" : role === "ADMIN" ? "/api/dashboard/admin" : "/api/dashboard/user-admin";
      const [dash, productsRaw, ordersRaw, customersRaw, settingsRaw] = await Promise.all([
        getJson(roleEndpoint), getJson("/api/products"), getJson("/api/orders"), getJson("/api/customers"), getJson("/api/enterprise-settings")
      ]);
      const products = normalizeArray(dash?.products ?? productsRaw);
      const orders = normalizeArray(dash?.orders ?? ordersRaw);
      const customers = normalizeArray(dash?.customers ?? customersRaw);
      const currency = dash?.currency || settingsRaw?.currency || settingsRaw?.storeCurrency || "BDT";
      const sales = Number(dash?.totalSales ?? dash?.sales ?? orders.reduce((s, o) => s + Number(o?.total || o?.amount || o?.grandTotal || 0), 0));
      const lowStock = normalizeArray(dash?.lowStock ?? products.filter((p) => Number(p?.stock ?? p?.quantity ?? 0) > 0 && Number(p?.stock ?? p?.quantity ?? 0) <= 10));
      const metrics = { products: products.length, orders: orders.length, customers: customers.length, lowStock: lowStock.length, sales };
      const next: DashboardData = {
        currency,
        kpis: normalizeArray(dash?.kpis),
        status: normalizeArray(dash?.status),
        products,
        orders,
        customers,
        lowStock,
        activities: normalizeArray(dash?.activities),
        insights: normalizeArray(dash?.insights),
        metrics,
      };
      if (mounted) { setData(next); setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [role]);
  return { data, loading };
}

export default function EnterpriseDashboard() {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const [collapsed, setCollapsed] = useState(false);
  const [sideWidth, setSideWidth] = useState(214);
  const theme = roleTheme(role);
  const { data } = useDashboardData(role);

  useEffect(() => {
    const r = getRole();
    setRole(r);
    setCollapsed(localStorage.getItem("enterprise-dashboard-sidebar-collapsed") === "true");
    const saved = Number(localStorage.getItem("enterprise-dashboard-sidebar-width") || "214");
    setSideWidth(Math.min(300, Math.max(214, saved)));
  }, []);

  const style = { "--side": `${collapsed ? 78 : sideWidth}px` } as CSSProperties;

  return <div className={`enterprise-dashboard ${theme.accent} ${collapsed ? "is-collapsed" : ""}`} style={style}>
    <RoleSidebar role={role} theme={theme} collapsed={collapsed} setCollapsed={setCollapsed} sideWidth={sideWidth} setSideWidth={setSideWidth}/>
    <main className="enterprise-main">
      <RoleHeader role={role} theme={theme}/>
      <div className="enterprise-page">
        {role === "SUPER_ADMIN" ? <SuperAdminDashboard data={data}/> : role === "ADMIN" ? <AdminDashboard data={data}/> : <UserAdminDashboard data={data}/>} 
      </div>
    </main>
  </div>;
}

function RoleSidebar({ role, theme, collapsed, setCollapsed, sideWidth, setSideWidth }: any) {
  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    const start = e.clientX;
    const base = sideWidth;
    function move(ev: MouseEvent) { const next = Math.min(300, Math.max(214, base + ev.clientX - start)); setSideWidth(next); localStorage.setItem("enterprise-dashboard-sidebar-width", String(next)); }
    function up() { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); }
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  }
  return <aside className="enterprise-sidebar">
    <div className="enterprise-brand">
      <div className="enterprise-logo">AI</div>
      {!collapsed && <div className="brand-copy"><h1>{theme.title}</h1><p>{theme.subtitle}</p></div>}
      <button aria-label="Toggle sidebar" onClick={() => { const next = !collapsed; localStorage.setItem("enterprise-dashboard-sidebar-collapsed", String(next)); setCollapsed(next); }}><Menu size={18}/></button>
    </div>
    <nav className="enterprise-menu">
      {menuFor(role).map(group => <div className="menu-group" key={group.title}>
        {!collapsed && <h4>{group.title}</h4>}
        {group.items.map((item, index) => { const Icon = item.icon; return <a key={`${group.title}-${item.label}`} className={index === 0 ? "active" : ""} href={item.href} title={item.label}><Icon size={18}/>{!collapsed && <span>{item.label}</span>}</a>; })}
      </div>)}
    </nav>
    <div className="sidebar-footer-card">
      <span className="online-dot" />
      {!collapsed && <><b>{role === "SUPER_ADMIN" ? "AI System Status" : "Store System"}</b><p>System by Suqlaen Sojal @ SAQSO STUDIO</p></>}
      <MiniLine />
    </div>
    <button className="sidebar-resize" onMouseDown={startDrag} aria-label="Resize sidebar"><GripVertical size={14}/></button>
  </aside>;
}

function RoleHeader({ role, theme }: any) {
  const router = useRouter();
  function signOut() { try { localStorage.clear(); sessionStorage.clear(); document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")); } catch {} router.push("/login"); }
  return <header className="enterprise-header">
    <div className="enterprise-search"><Search size={18}/><span>{role === "SUPER_ADMIN" ? "Search anything in project..." : "Search products, orders, customers..."}</span><kbd>Ctrl /</kbd></div>
    <div className="header-actions"><Bell size={17}/><Mail size={17}/><Settings size={17}/><HelpCircle size={17}/><Moon size={17}/>
      <details className="profile-menu"><summary><div className="avatar">{theme.initials}</div><div><b>{theme.name}</b><p>{theme.roleLabel}</p></div><ChevronDown size={16}/></summary><div className="profile-pop"><button>Profile settings</button><button>View permissions</button><button className="danger" onClick={signOut}><LogOut size={14}/> Sign out</button></div></details>
    </div>
  </header>;
}

function SuperAdminDashboard({ data }: { data: DashboardData }) {
  const primary = [
    { label: "Project Health Score", value: firstKpi(data, "Project Health Score", 0), meta: "API ready", icon: Gauge },
    { label: "Critical Bugs", value: firstKpi(data, "Critical Bugs", 0), meta: "Needs immediate fix", icon: Bug, danger: true },
    { label: "Medium Bugs", value: firstKpi(data, "Medium Bugs", 0), meta: "Should fix soon", icon: Bug, warning: true },
    { label: "Low Priority", value: firstKpi(data, "Low Priority", 0), meta: "Minor issues", icon: FileText, warning: true },
    { label: "Performance Score", value: firstKpi(data, "Performance Score", 0), meta: "API ready", icon: Zap },
    { label: "Security Score", value: firstKpi(data, "Security Score", 0), meta: "API ready", icon: ShieldCheck },
  ];
  return <div className="reference-grid super-reference">
    <Hero title="Good Evening, Sojal 👋" subtitle="AI Copilot is analyzing your project in real-time." />
    <section className="kpi-grid six">{primary.map(k => <KpiCard key={k.label} {...k}/>)}</section>
    <section className="status-grid">{["Build Status", "Test Coverage", "Code Quality", "Tech Debt", "Duplicate Code", "Unused Files", "Dependencies"].map(label => <StatusCard key={label} label={label} value={firstStatus(data, label, 0)} />)}</section>
    <section className="middle-grid"><ProjectOverview data={data}/><Insights data={data}/></section>
    <section className="bottom-layout"><ChatConsole/><RightColumn data={data}/></section>
  </div>;
}

function AdminDashboard({ data }: { data: DashboardData }) { return <CommerceDashboard data={data} role="ADMIN" />; }
function UserAdminDashboard({ data }: { data: DashboardData }) { return <CommerceDashboard data={data} role="USER_ADMIN" />; }

function CommerceDashboard({ data, role }: { data: DashboardData; role: Role }) {
  const admin = role === "ADMIN";
  const kpis = [
    { label: "Total Sales", value: money(Number(data.metrics.sales || 0), data.currency), meta: "API aggregate", icon: Wallet },
    { label: "Orders", value: val(data.metrics.orders), meta: "Total orders", icon: Truck },
    { label: "Customers", value: val(data.metrics.customers), meta: "Total customers", icon: Users },
    { label: "Conversion Rate", value: firstKpi(data, "Conversion Rate", "0%"), meta: "Orders/customers", icon: Gauge },
    { label: "Avg. Order Value", value: money(Number(firstKpi(data, "Avg. Order Value", 0)), data.currency), meta: "API average", icon: Wallet },
  ];
  return <div className="reference-grid commerce-reference">
    <Hero title={`Welcome back, ${admin ? "Admin" : "User Admin"}! 👋`} subtitle="Here’s what’s happening with your store today." />
    <div className="commerce-shell">
      <div className="commerce-main">
        <section className="kpi-grid five">{kpis.map(k => <KpiCard key={k.label} {...k}/>)}</section>
        <section className="commerce-cards">
          <Card title="Sales Overview"><ChartPanel accent="var(--accent)"/></Card>
          <Card title={admin ? "Top Selling Products" : "Order Status"}>{admin ? <EntityList items={data.products} type="product" currency={data.currency}/> : <DonutPanel total={data.orders.length}/>}</Card>
          <Card title={admin ? "Recent Orders" : "Top Selling Products"}>{admin ? <EntityList items={data.orders} type="order" currency={data.currency}/> : <EntityList items={data.products} type="product" currency={data.currency}/>}</Card>
          <Card title={admin ? "Order Status Overview" : "Recent Orders"}>{admin ? <DonutPanel total={data.orders.length}/> : <EntityList items={data.orders} type="order" currency={data.currency}/>}</Card>
          <Card title="Low Stock Alert"><EntityList items={data.lowStock} type="stock" currency={data.currency}/></Card>
          <Card title="Top Customers"><EntityList items={data.customers} type="customer" currency={data.currency}/></Card>
        </section>
        <Card title="Recent Activity"><ActivityStrip items={data.activities}/></Card>
        <div className="system-branding">System by Suqlaen Sojal @ SAQSO STUDIO</div>
      </div>
      <RightColumn data={data} commerce />
    </div>
  </div>;
}

function firstKpi(data: DashboardData, label: string, fallback: string | number) { const found = data.kpis.find(k => k.label === label || k.label?.toLowerCase() === label.toLowerCase()); return found?.value ?? fallback; }
function firstStatus(data: DashboardData, label: string, fallback: string | number) { const found = data.status.find(k => k.label === label || k.label?.toLowerCase() === label.toLowerCase()); return found?.value ?? fallback; }
function Hero({ title, subtitle }: { title: string; subtitle: string }) { return <section className="dash-hero"><div><h2>{title}</h2><p>{subtitle}</p></div><div><button>This Week</button><button className="primary">Quick Actions</button></div></section>; }
function KpiCard({ label, value, meta, icon: Icon, danger, warning }: any) { return <article className={`kpi-card ${danger ? "danger" : warning ? "warning" : ""}`}><Icon size={18}/><h3>{value}</h3><b>{label}</b><p>{meta}</p><MiniLine/></article>; }
function StatusCard({ label, value }: { label: string; value: string | number }) { return <article className="status-card"><ShieldCheck size={18}/><b>{label}</b><strong>{value}</strong></article>; }
function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="dash-card"><header><h3>{title}</h3><a>View All</a></header>{children}</section>; }
function ProjectOverview({ data }: { data: DashboardData }) { return <Card title="Project Overview"><div className="project-overview"><div>{["products", "orders", "customers", "lowStock"].map(key => <p key={key}><span>{key}</span><b>{String(data.metrics[key] ?? 0)}</b></p>)}</div><ChartPanel accent="var(--accent)"/></div></Card>; }
function Insights({ data }: { data: DashboardData }) { return <Card title="AI Project Insights"><div className="insight-list">{data.insights.length ? data.insights.slice(0,5).map((x:any,i:number)=><p key={i}><Sparkles size={18}/><b>{x.title || x.label || "Insight"}</b><span>{x.time || ""}</span></p>) : <EmptyLine text="No AI insight API data"/>}</div></Card>; }
function RightColumn({ data, commerce }: { data: DashboardData; commerce?: boolean }) { return <aside className="right-column"><Card title="AI Assistant"><div className="ai-orb">AI</div><p className="assistant-copy">I am your AI Development Copilot.<br/>How can I help you today?</p><div className="assistant-actions">{["Analyze Project", "Fix Bugs", "Optimize Performance", "Review Code", "Generate Docs", "Add New Feature"].map(x => <button key={x}>{x}</button>)}</div></Card><Card title={commerce ? "Store Status" : "System Monitor"}><div className="monitor-grid"><KpiCard label="CPU Usage" value={firstKpi(data,"CPU Usage",0)} meta="API ready" icon={Activity}/><KpiCard label="Memory Usage" value={firstKpi(data,"Memory Usage",0)} meta="API ready" icon={Gauge}/></div></Card><Card title="Recent Activity"><EntityList items={data.activities.length ? data.activities : data.products} type="activity" currency={data.currency}/></Card></aside>; }
function ChatConsole() { return <Card title="AI Copilot Chat Console"><div className="chat-console"><aside>{["Optimize Product API", "Why Login is Slow?", "Improve Checkout Flow", "Database Analysis", "Remove Duplicate Code"].map(x => <p key={x}>{x}</p>)}</aside><main><b>AI workspace is API-ready.</b><p>Connect the AI analysis endpoint to stream real project insights here.</p></main></div><div className="chat-input">Ask anything about your project...<button>Send</button></div></Card>; }
function DonutPanel({ total }: { total: number }) { return <div className="donut-panel"><div><b>{total}</b><span>Total Orders</span></div><p>Order status API will render live segments.</p></div>; }
function EntityList({ items, type, currency }: { items: any[]; type: string; currency: string }) { if (!items.length) return <EmptyLine text={type === "product" ? "No product API data" : type === "order" ? "No orders" : type === "customer" ? "No customers" : type === "stock" ? "No low stock" : "No activity"}/>; return <div className="entity-list">{items.slice(0,6).map((item, index) => <p key={item.id || index}><span>{item.name || item.title || item.customerName || item.orderNumber || item.email || "Record"}</span><b>{item.total ? money(Number(item.total), currency) : item.status || item.role || "ACTIVE"}</b></p>)}</div>; }
function ActivityStrip({ items }: { items: any[] }) { if (!items.length) return <EmptyLine text="No activity API data"/>; return <div className="activity-strip">{items.slice(0,5).map((x:any,i:number)=><p key={i}><CircleDot size={18}/><b>{x.title || x.label || "Activity"}</b><span>{x.time || ""}</span></p>)}</div>; }
function EmptyLine({ text }: { text: string }) { return <div className="empty-line">{text}</div>; }
function MiniLine() { return <svg className="mini-line" viewBox="0 0 120 40"><polyline points="4,32 18,26 34,28 50,18 66,22 80,12 96,16 116,7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><path d="M4 40 L18 34 L34 36 L50 26 L66 30 L80 20 L96 24 L116 15 L116 40 Z" fill="currentColor" opacity=".16"/></svg>; }
function ChartPanel({ accent }: { accent: string }) { return <div className="chart-panel" style={{ color: accent } as CSSProperties}><MiniLine/></div>; }