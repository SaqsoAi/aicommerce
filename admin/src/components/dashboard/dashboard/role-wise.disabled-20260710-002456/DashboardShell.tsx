"use client";

import { useState } from "react";
import ActionModal, { ActionInfo } from "./ActionModal";
import { Donut, MiniLine, ProjectChart, SalesChart, Spark } from "./charts";
import type { DashboardModel, Metric } from "./data";

const actionMap: Record<string, ActionInfo> = {
  analyze: { title: "Enable AI Project Analysis", route: "/ai-development-copilot", steps: ["Connect project audit API.", "Map permission ai.project.analyze.", "Keep preview approval before AI action."] },
  fix: { title: "Enable AI Bug Fix", route: "/ai-bug-detector", steps: ["Connect bug detector endpoint.", "Create approval queue.", "Map permission ai.bugs.fix.preview."] },
  performance: { title: "Enable Performance Optimization", route: "/ai-performance", steps: ["Connect metrics API.", "Add slow query telemetry.", "Map permission ai.performance.optimize."] },
  review: { title: "Enable Code Review", route: "/ai-code-reviewer", steps: ["Connect repository scanner.", "Return file-level issues.", "Keep read-only until approval."] },
  docs: { title: "Enable Documentation Generator", route: "/ai-documentation", steps: ["Connect docs endpoint.", "Save generated docs to audit folder.", "Map permission ai.docs.generate."] },
  feature: { title: "Enable Feature Builder", route: "/automation-studio", steps: ["Create feature request workflow.", "Connect approval module.", "Add audit log before implementation."] },
  products: { title: "Product Action", route: "/products", steps: ["Open product module.", "Connect product.create permission.", "Connect upload/category API."] },
  orders: { title: "Order Action", route: "/orders", steps: ["Open order module.", "Connect order.create permission.", "Connect customer/product lookup."] },
  coupon: { title: "Coupon Action", route: "/coupons", steps: ["Open coupon module.", "Map coupon.create permission.", "Validate discount rules."] },
  report: { title: "Sales Report", route: "/analytics", steps: ["Open analytics module.", "Connect date range filter.", "Map analytics.read permission."] },
  users: { title: "User Management", route: "/roles", steps: ["Open roles module.", "Connect user-role API.", "Verify tenant isolation."] },
};

function canNavigate(route?: string) {
  if (!route) return false;
  return ["/products", "/orders", "/coupons", "/analytics", "/roles", "/ai-development-copilot", "/ai-code-reviewer", "/ai-performance"].includes(route);
}

function KpiCard({ metric, compact = false }: { metric: Metric; compact?: boolean }) {
  const Icon = metric.icon;
  return (
    <article className={compact ? "ds-small-kpi" : "ds-kpi"}>
      <span className="ds-live" />
      <i className={`ds-kpi-icon tone-${metric.tone || ""}`}><Icon size={compact ? 17 : 21} /></i>
      <p>{metric.label}</p>
      <strong>{metric.value}</strong>
      <small>{metric.sub}</small>
      {compact ? <Spark /> : <MiniLine tone={metric.tone} />}
    </article>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="ds-panel">
      <header><h2>{title}</h2>{action}</header>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: Array<[string, string]> }) {
  return <div className="ds-rows">{rows.map(([a, b]) => <div key={a}><span>{a}</span><b>{b}</b></div>)}</div>;
}

function Hero({ data, onAction }: { data: DashboardModel; onAction: (key: string) => void }) {
  return (
    <header className="ds-hero">
      <div className="ds-hero-copy">
        <p>{data.eyebrow}</p>
        <h1>{data.title}</h1>
        <span>{data.subtitle}</span>
      </div>
      <div className="ds-hero-actions">
        <button type="button">{data.dateLabel}</button>
        <button type="button" className="primary" onClick={() => onAction(data.mode === "super" ? "analyze" : "report")}>{data.actionLabel}</button>
      </div>
      <aside><b>Some APIs are unavailable.</b><span>{data.warning}</span></aside>
    </header>
  );
}

function SuperBody({ data, onAction }: { data: DashboardModel; onAction: (key: string) => void }) {
  return (
    <>
      <Hero data={data} onAction={onAction} />
      <section className="ds-kpi-grid super">{data.metrics.map((m) => <KpiCard key={m.label} metric={m} />)}</section>
      <section className="ds-small-kpi-grid">{data.smallMetrics.map((m) => <KpiCard key={m.label} metric={m} compact />)}</section>
      <section className="ds-super-content">
        <Panel title="Project Overview" action={<button onClick={() => onAction("analyze")}>7 Days</button>}>
          <div className="ds-tabs"><b>Overview</b><span>Modules</span><span>Activity</span><span>Statistics</span></div>
          <div className="ds-project-layout">
            <Rows rows={data.overview} />
            <div><h3>Project Activity</h3><ProjectChart /></div>
          </div>
        </Panel>
        <Panel title="AI Project Insights" action={<button onClick={() => onAction("review")}>View All Insights</button>}>
          <div className="ds-insights">{data.insights.map(([a,b,c]) => <article key={a}><b>{a}</b><p>{b}</p><small>{c}</small></article>)}</div>
        </Panel>
      </section>
      <Panel title="AI Copilot Chat Console">
        <div className="ds-chat">
          <aside>{["Optimize Product API", "Why Login is Slow?", "Improve Checkout Flow", "Database Analysis", "Remove Duplicate Code"].map((label) => <button key={label} onClick={() => onAction("analyze")}><span>{label}</span><small>2m ago</small></button>)}</aside>
          <main>
            <button onClick={() => onAction("analyze")}>Why is the login API slow?</button>
            <article><b>Root Cause Identified</b><p>Password verification, lookup query, and session caching must be measured with live telemetry.</p><b>Recommended Fixes</b><p>Add database index, Redis caching, careful bcrypt rounds, and rate limiting.</p></article>
            <button className="ask" onClick={() => onAction("analyze")}><span>Ask anything about your project...</span><b>Send</b></button>
          </main>
        </div>
      </Panel>
    </>
  );
}

function CommerceBody({ data, onAction }: { data: DashboardModel; onAction: (key: string) => void }) {
  return (
    <>
      <Hero data={data} onAction={onAction} />
      <section className="ds-kpi-grid commerce">{data.metrics.map((m) => <KpiCard key={m.label} metric={m} />)}</section>
      <section className="ds-commerce-content">
        <Panel title="Sales Overview" action={<button onClick={() => onAction("report")}>View Report</button>}>
          <div className="ds-tabs"><b>This Week</b><span>This Month</span><span>This Year</span></div>
          <SalesChart />
        </Panel>
        <Panel title="Top Selling Products" action={<button onClick={() => onAction("products")}>View All</button>}>
          <div className="ds-products">{data.products.map(([a,b,c]) => <article key={a}><i /><div><b>{a}</b><span>{b}</span></div><strong>{c}</strong></article>)}</div>
        </Panel>
        {data.role === "ADMIN" ? (
          <Panel title="Recent Orders" action={<button onClick={() => onAction("orders")}>View All</button>}>
            <div className="ds-orders">{data.orders.map(([a,b,c,d]) => <div key={a}><span>{a}</span><span>{b}</span><span>{c}</span><b>{d}</b></div>)}</div>
          </Panel>
        ) : null}
        <Panel title="Order Status Overview"><Donut value={data.role === "ADMIN" ? "342" : "156"} label="Total Orders" /><Rows rows={data.status} /></Panel>
        <Panel title="Low Stock Alert" action={<button onClick={() => onAction("products")}>View All</button>}><Rows rows={[["Wireless Headphones", "Stock: 8"], ["Smart Watch Series 5", "Stock: 12"], ["Running Shoes", "Stock: 15"], ["Backpack Travel Pro", "Stock: 7"]]} /></Panel>
        {data.role === "ADMIN" ? <Panel title="Top Customers" action={<button onClick={() => onAction("users")}>View All</button>}><Rows rows={[["John Doe", "12 Orders / $1,560"], ["Jane Smith", "8 Orders / $980"], ["Robert Brown", "6 Orders / $750"], ["Emily Davis", "5 Orders / $620"]]} /></Panel> : null}
      </section>
      <Panel title="Recent Activity">
        <div className="ds-activity-row">{data.activities.map(([a,b,c]) => <article key={a}><i /><div><b>{a}</b><span>{b}</span></div><small>{c}</small></article>)}</div>
      </Panel>
    </>
  );
}

function RightRail({ data, onAction }: { data: DashboardModel; onAction: (key: string) => void }) {
  if (data.mode === "super") {
    return (
      <aside className="ds-right">
        <Panel title="AI Assistant" action={<button onClick={() => onAction("analyze")}>Online</button>}>
          <div className="ds-ai-orb"><span>AI</span></div>
          <h3>I am your AI Development Copilot.</h3>
          <p>How can I help you today?</p>
          <div className="ds-ai-actions">
            {[
              ["Analyze Project", "analyze"],
              ["Fix Bugs", "fix"],
              ["Optimize Performance", "performance"],
              ["Review Code", "review"],
              ["Generate Docs", "docs"],
              ["Add New Feature", "feature"],
            ].map(([label, key]) => <button key={label} onClick={() => onAction(key)}>{label}</button>)}
          </div>
        </Panel>
        <Panel title="System Monitor" action={<button onClick={() => onAction("performance")}>View All</button>}>
          <div className="ds-monitor">{[["CPU Usage","34%"],["Memory Usage","62%"],["Disk Usage","45%"],["Network","68%"]].map(([a,b]) => <article key={a}><span>{a}</span><strong>{b}</strong><MiniLine /></article>)}</div>
        </Panel>
        <Panel title="Recent Activity" action={<button onClick={() => onAction("review")}>View All</button>}>
          <div className="ds-side-list">{data.activities.map(([a,b,c]) => <article key={a}><b>{a}</b><span>{b}</span><small>{c}</small></article>)}</div>
        </Panel>
      </aside>
    );
  }

  return (
    <aside className="ds-right">
      <Panel title="Store Status" action={<button onClick={() => onAction("report")}>Online</button>}>
        <Donut />
        <Rows rows={data.role === "ADMIN" ? [["Total Products","1,248"],["Low Stock Items","24"],["Out Of Stock","8"],["Total Customers","1,256"]] : [["Total Products","842"],["Total Customers","1,568"],["Low Stock Items","24"],["Out Of Stock","8"]]} />
      </Panel>
      <Panel title="Quick Actions">
        <div className="ds-quick">
          {[
            ["Add New Product", "products"],
            ["Create New Order", "orders"],
            ["Add New Coupon", "coupon"],
            ["View Sales Report", "report"],
            [data.role === "ADMIN" ? "Manage Users" : "Manage Customers", "users"],
          ].map(([label, key]) => <button key={label} onClick={() => onAction(key)}><span>{label}</span><b>Ã¢â‚¬Âº</b></button>)}
        </div>
      </Panel>
      <Panel title="My Tasks"><Rows rows={data.tasks} /></Panel>
    </aside>
  );
}

export default function DashboardShell({ data }: { data: DashboardModel }) {
  const [modal, setModal] = useState<ActionInfo | null>(null);

  function onAction(key: string) {
    const action = actionMap[key];
    if (!action) return;
    if (canNavigate(action.route)) {
      window.location.href = action.route!;
      return;
    }
    setModal(action);
  }

  return (
    <section className={`dashboard-system ${data.accent}`}>
      <main className="ds-main">
        {data.mode === "super" ? <SuperBody data={data} onAction={onAction} /> : <CommerceBody data={data} onAction={onAction} />}
        <footer className="ds-role-bar"><span>Role Based Theme:</span><b>{data.roleLabel}</b><strong>{data.themeLabel}</strong></footer>
      </main>
      <RightRail data={data} onAction={onAction} />
      <ActionModal action={modal} onClose={() => setModal(null)} />
    </section>
  );
}