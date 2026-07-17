"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, Archive, Badge, Bell, BookOpen, Bot, Boxes, Brain, Bug, ChevronDown, ClipboardList, Code2,
  CreditCard, Database, FileText, Folder, FolderKanban, Gauge, Gift, GitBranch, GripVertical,
  Heart, Home, Image, Images, Layers, LayoutGrid, LayoutTemplate, LogOut, Mail, Megaphone, Menu,
  Moon, Network, Package, Palette, PanelsTopLeft, RotateCcw, Search, Settings, Share2, Shield,
  ShoppingBag, Sparkles, Star, Ticket, ToggleLeft, Truck, Upload, UserCog, Users, Wallet,
  Warehouse, Zap
} from "lucide-react";
import { loadDashboardData, emptyDashboard } from "./api";
import { menusForRole } from "./menu";
import type { DashboardAccent, DashboardData, DashboardRole, ListRow, MenuItem, MetricCard } from "./types";
import "./style.css";

const ICONS = {
  Activity, Archive, Badge, Bell, BookOpen, Bot, Boxes, Brain, Bug, ChevronDown, ClipboardList, Code: Code2,
  CreditCard, Database, FileText, Folder, FolderKanban, Gauge, Gift, GitBranch, GripVertical,
  Heart, Home, Image, Images, Layers, LayoutGrid, LayoutTemplate, LogOut, Mail, Megaphone, Menu,
  Moon, Network, Package, Palette, PanelsTopLeft, RotateCcw, Search, Settings, Share2, Shield,
  ShoppingBag, Sparkles, Star, Ticket, ToggleLeft, Truck, Upload, UserCog, Users, Wallet,
  Warehouse, Zap
};

type IconName = keyof typeof ICONS;

function roleFromStorage(): DashboardRole {
  if (typeof window === "undefined") return "SUPER_ADMIN";
  const raw = (localStorage.getItem("role") || localStorage.getItem("userRole") || "SUPER_ADMIN").toUpperCase();
  if (raw === "ADMIN") return "ADMIN";
  if (raw === "MANAGER" || raw === "USER_ADMIN") return "USER_ADMIN";
  return "SUPER_ADMIN";
}

function theme(role: DashboardRole): { accent: DashboardAccent; title: string; subtitle: string; name: string; roleLabel: string; initials: string } {
  if (role === "ADMIN") return { accent: "orange", title: "AI-Commerce", subtitle: "Admin Dashboard", name: "Admin", roleLabel: "Administrator", initials: "AD" };
  if (role === "USER_ADMIN") return { accent: "green", title: "AI-Commerce", subtitle: "User Admin Dashboard", name: "User Admin", roleLabel: "Manager", initials: "UA" };
  return { accent: "purple", title: "AICopilot", subtitle: "Super Admin - AI Development Copilot", name: "Sojal Ahmed", roleLabel: "Super Admin", initials: "SA" };
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Component = ICONS[(name in ICONS ? name : "LayoutGrid") as IconName];
  return <Component size={size} strokeWidth={1.8} />;
}

export default function EnterpriseDashboardRouter() {
  const [role, setRole] = useState<DashboardRole>("SUPER_ADMIN");
  const [data, setData] = useState<DashboardData>(() => emptyDashboard("SUPER_ADMIN"));
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(214);

  useEffect(() => {
    const nextRole = roleFromStorage();
    setRole(nextRole);
    setData(emptyDashboard(nextRole));
    setCollapsed(localStorage.getItem("enterprise-dashboard-sidebar-collapsed") === "true");
    const savedWidth = Number(localStorage.getItem("enterprise-dashboard-sidebar-width") || "214");
    setWidth(Math.max(214, Math.min(300, savedWidth)));
    loadDashboardData(nextRole).then(setData);
  }, []);

  const t = theme(role);

  return (
    <div className={`enterprise-dashboard ${t.accent} ${collapsed ? "is-collapsed" : ""}`} style={{ "--sidebar-width": `${collapsed ? 82 : width}px` } as React.CSSProperties}>
      <RoleSidebar role={role} collapsed={collapsed} width={width} onCollapse={setCollapsed} onResize={setWidth} />
      <main className="enterprise-main">
        <DashboardHeader role={role} />
        <section className="enterprise-page">
          {role === "SUPER_ADMIN" ? <SuperAdminDashboard data={data} /> : role === "ADMIN" ? <AdminDashboard data={data} /> : <UserAdminDashboard data={data} />}
        </section>
      </main>
    </div>
  );
}

function RoleSidebar({ role, collapsed, onCollapse, onResize }: { role: DashboardRole; collapsed: boolean; width: number; onCollapse: (value: boolean) => void; onResize: (value: number) => void }) {
  const t = theme(role);
  const groups = menusForRole(role);

  function beginResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = Number(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width").replace("px", "")) || 214;
    const move = (event: MouseEvent) => {
      const next = Math.max(214, Math.min(300, startWidth + event.clientX - startX));
      localStorage.setItem("enterprise-dashboard-sidebar-width", String(next));
      onResize(next);
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  function toggleCollapse() {
    const next = !collapsed;
    localStorage.setItem("enterprise-dashboard-sidebar-collapsed", String(next));
    onCollapse(next);
  }

  return (
    <aside className="enterprise-sidebar">
      <div className="sidebar-brand">
        <div className="ai-chip">AI</div>
        {!collapsed && <div className="brand-copy"><strong>{t.title}</strong><span>{t.subtitle}</span></div>}
        <button type="button" onClick={toggleCollapse} aria-label="Toggle sidebar"><Menu size={18} /></button>
      </div>
      <nav className="sidebar-nav">
        {groups.map((group) => (
          <section key={group.title}>
            {!collapsed && <h4>{group.title}</h4>}
            {group.items.map((item) => <MenuLink key={`${group.title}-${item.label}`} item={item} collapsed={collapsed} />)}
          </section>
        ))}
      </nav>
      <div className="sidebar-footer-card">
        <span className="live-dot" />
        {!collapsed && <><strong>{role === "SUPER_ADMIN" ? "AI System Status" : "Store System"}</strong><small>System by Suqlaen Sojal @ SAQSO STUDIO</small></>}
        <Sparkline points={[2,4,3,6,5,8,7]} />
      </div>
      {!collapsed && <button type="button" className="resize-handle" onMouseDown={beginResize} aria-label="Resize sidebar"><GripVertical size={14} /></button>}
    </aside>
  );
}

function MenuLink({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {
  return <a href={item.href} className={item.href === "/dashboard" ? "active" : ""} title={item.label}><Icon name={item.icon} />{!collapsed && <span>{item.label}</span>}</a>;
}

function DashboardHeader({ role }: { role: DashboardRole }) {
  const router = useRouter();
  const t = theme(role);
  const placeholder = role === "SUPER_ADMIN" ? "Search anything in project..." : "Search products, orders, customers...";

  function signOut() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    } catch {}
    router.push("/login");
  }

  return (
    <header className="enterprise-header">
      <div className="dashboard-search"><Search size={17} /><span>{placeholder}</span><kbd>Ctrl /</kbd></div>
      <div className="header-actions"><Bell size={18}/><Mail size={18}/><Settings size={18}/><Moon size={18}/>
        <details className="profile-menu"><summary><div className="avatar">{t.initials}</div><div><strong>{t.name}</strong><small>{t.roleLabel}</small></div><ChevronDown size={16}/></summary>
          <div className="profile-dropdown"><button type="button">Profile settings</button><button type="button">View permissions</button><button type="button" onClick={signOut} className="signout"><LogOut size={14}/> Sign out</button></div>
        </details>
      </div>
    </header>
  );
}

function SuperAdminDashboard({ data }: { data: DashboardData }) {
  return <div className="reference-grid super-admin-grid">
    <Hero title="Good Evening, Sojal 👋" subtitle="AI Copilot is analyzing your project in real-time." />
    <MetricGrid metrics={data.primaryMetrics} columns={6} />
    <SecondaryMetrics metrics={data.secondaryMetrics} />
    <div className="main-two-column"><ProjectOverview data={data} /><Insights data={data} /></div>
    <div className="bottom-with-right"><ChatConsole /><RightRail data={data} superAdmin /></div>
  </div>;
}

function AdminDashboard({ data }: { data: DashboardData }) {
  return <div className="reference-grid commerce-grid"><Hero title="Welcome back, Admin! 👋" subtitle="Here’s what’s happening with your store today." /><div className="commerce-with-right"><div><MetricGrid metrics={data.primaryMetrics} columns={5} /><CommercePanels data={data} admin /><BrandFooter role="Administrator" /></div><RightRail data={data} /></div></div>;
}

function UserAdminDashboard({ data }: { data: DashboardData }) {
  return <div className="reference-grid commerce-grid"><Hero title="Welcome back, User Admin! 👋" subtitle="Here’s what’s happening with your store today." /><div className="commerce-with-right"><div><MetricGrid metrics={data.primaryMetrics} columns={5} /><UserPanels data={data} /><BrandFooter role="User Admin" /></div><RightRail data={data} /></div></div>;
}

function Hero({ title, subtitle }: { title: string; subtitle: string }) { return <div className="dashboard-hero"><div><h1>{title}</h1><p>{subtitle}</p></div><div><button>This Week</button><button className="primary">Quick Actions</button></div></div>; }
function MetricGrid({ metrics, columns }: { metrics: MetricCard[]; columns: number }) { return <div className={`metric-grid cols-${columns}`}>{metrics.map((metric) => <MetricCardView metric={metric} key={metric.key} />)}</div>; }
function MetricCardView({ metric }: { metric: MetricCard }) { return <article className={`metric-card ${metric.status || ""}`}><Icon name={metric.status === "danger" ? "Bug" : "Gauge"}/><h2>{metric.value ?? 0}</h2><strong>{metric.label}</strong><small>{metric.meta || "API ready"}</small><Sparkline points={metric.trend || [0,0,0,0,0,0,0]} /></article>; }
function SecondaryMetrics({ metrics }: { metrics: MetricCard[] }) { return <div className="secondary-metrics">{metrics.map((m) => <div key={m.key}><Icon name="Shield"/><strong>{m.label}</strong><span>{m.value ?? 0}</span></div>)}</div>; }
function ProjectOverview({ data }: { data: DashboardData }) { return <Card title="Project Overview"><div className="overview-layout"><ListBlock rows={data.overview} empty="No project overview API data" /><ChartBlock series={data.chartSeries} /></div></Card>; }
function Insights({ data }: { data: DashboardData }) { return <Card title="AI Project Insights"><ListBlock rows={data.insights} empty="No AI insight API data" /></Card>; }
function CommercePanels({ data, admin }: { data: DashboardData; admin?: boolean }) { return <div className="commerce-panels"><Card title="Sales Overview"><ChartBlock series={data.chartSeries}/></Card><Card title="Top Selling Products"><ListBlock rows={data.products} empty="No products" /></Card><Card title="Recent Orders"><ListBlock rows={data.orders} empty="No orders" /></Card><Card title="Order Status Overview"><DonutBlock /></Card><Card title="Low Stock Alert"><ListBlock rows={data.lowStock} empty="No low stock" /></Card><Card title="Top Customers"><ListBlock rows={data.customers} empty="No customers" /></Card><Card title="Recent Activity" wide><ListBlock rows={data.activity} empty="No activity" /></Card></div>; }
function UserPanels({ data }: { data: DashboardData }) { return <div className="commerce-panels user-panels"><Card title="Sales Overview"><ChartBlock series={data.chartSeries}/></Card><Card title="Order Status"><DonutBlock /></Card><Card title="Top Selling Products"><ListBlock rows={data.products} empty="No products" /></Card><Card title="Recent Orders"><ListBlock rows={data.orders} empty="No orders" /></Card><Card title="Low Stock Alert"><ListBlock rows={data.lowStock} empty="No low stock" /></Card><Card title="Top Customers"><ListBlock rows={data.customers} empty="No customers" /></Card><Card title="Recent Activity" wide><ListBlock rows={data.activity} empty="No activity" /></Card></div>; }
function RightRail({ data, superAdmin }: { data: DashboardData; superAdmin?: boolean }) { return <aside className="right-rail"><AIAssistant /><Card title={superAdmin ? "System Monitor" : "Store Status"}><MetricGrid metrics={data.system.slice(0,4)} columns={2}/></Card><Card title="Recent Activity"><ListBlock rows={data.activity.length ? data.activity : data.products} empty="No recent activity" /></Card></aside>; }
function AIAssistant() { return <Card title="AI Assistant"><div className="ai-orb">AI</div><p className="assistant-copy">I am your AI Development Copilot.<br/>How can I help you today?</p><div className="assistant-actions">{["Analyze Project","Fix Bugs","Optimize Performance","Review Code","Generate Docs","Add New Feature"].map((a) => <button key={a}>{a}</button>)}</div></Card>; }
function ChatConsole() { return <Card title="AI Copilot Chat Console"><div className="chat-layout"><aside>{["Optimize Product API","Why Login is Slow?","Improve Checkout Flow","Database Analysis","Remove Duplicate Code"].map((x) => <p key={x}>{x}</p>)}</aside><main><strong>AI workspace is API-ready.</strong><p>Connect the AI analysis endpoint to stream real project insights here.</p></main></div><div className="chat-input">Ask anything about your project...<button>Send</button></div></Card>; }
function BrandFooter({ role }: { role: string }) { return <footer className="brand-footer"><span>System by Suqlaen Sojal @ SAQSO STUDIO</span><strong>{role}</strong></footer>; }
function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) { return <section className={`dashboard-card ${wide ? "wide" : ""}`}><div className="card-head"><h3>{title}</h3><a>View All</a></div>{children}</section>; }
function ListBlock({ rows, empty }: { rows: ListRow[]; empty: string }) { if (!rows.length) return <div className="empty-state">{empty}</div>; return <div className="list-block">{rows.slice(0,6).map((row, index) => <p key={row.id || `${row.title}-${index}`}><span><strong>{row.title}</strong>{row.subtitle && <small>{row.subtitle}</small>}</span>{row.value !== undefined && <b>{row.value}</b>}{row.status && <em>{row.status}</em>}</p>)}</div>; }
function ChartBlock({ series }: { series: number[] }) { return <div className="chart-block"><Sparkline points={series.length ? series : [0,0,0,0,0,0,0]} large /></div>; }
function DonutBlock() { return <div className="donut-block"><div><strong>0</strong><small>Total Orders</small></div><p>Connect order status API to render live segments.</p></div>; }
function Sparkline({ points, large }: { points: number[]; large?: boolean }) { const safe = points.length ? points : [0,0,0,0,0,0,0]; const max = Math.max(1, ...safe.map(Math.abs)); const path = safe.map((value, index) => `${index === 0 ? "M" : "L"}${(index/(safe.length-1))*100},${38-(value/max)*32}`).join(" "); return <svg className={`sparkline ${large ? "large" : ""}`} viewBox="0 0 100 40" preserveAspectRatio="none"><path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d={`${path} L100,40 L0,40 Z`} fill="currentColor" opacity=".12"/></svg>; }