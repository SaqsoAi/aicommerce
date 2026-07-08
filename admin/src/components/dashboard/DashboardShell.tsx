"use client";

import { useState } from "react";
import ActionModal, { ActionInfo } from "./ActionModal";
import { Donut, MiniLine, ProjectChart, SalesChart, Spark } from "./charts";
import type { DashboardModel, DataState, Metric } from "./data";

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

function EmptyState({ label, source }: { label: string; source: string }) {
  return (
    <div className="ds-empty-state">
      <b>Unavailable</b>
      <span>{label}</span>
      <small>Source: {source}</small>
    </div>
  );
}

function KpiCard({ metric, compact = false }: { metric: Metric; compact?: boolean }) {
  const Icon = metric.icon;
  return (
    <article className={`${compact ? "ds-small-kpi" : "ds-kpi"} ${metric.state === "unavailable" ? "is-unavailable" : ""}`}>
      <span className="ds-live" />
      <i className={`ds-kpi-icon tone-${metric.tone || ""}`}><Icon size={compact ? 17 : 21} /></i>
      <p>{metric.label}</p>
      <strong>{metric.value}</strong>
      <small>{metric.sub}</small>
      <em>Source: {metric.source}</em>
      {metric.state === "available" ? (compact ? <Spark /> : <MiniLine tone={metric.tone} />) : null}
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

function Rows({ rows, fallback, source }: { rows: Array<[string, string, DataState?, string?]>; fallback: string; source: string }) {
  if (!rows.length) return <EmptyState label={fallback} source={source} />;
  return <div className="ds-rows">{rows.map(([a, b, state, rowSource]) => <div key={a} className={state === "unavailable" ? "is-unavailable" : ""}><span>{a}</span><b>{b}</b><small>{rowSource}</small></div>)}</div>;
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
      <aside><b>Real Data Gate</b><span>{data.warning}</span></aside>
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
        <Panel title="Platform Overview" action={<button onClick={() => onAction("analyze")}>Live Sources</button>}>
          <div className="ds-tabs"><b>Overview</b><span>API Health</span><span>Role Coverage</span><span>Activity</span></div>
          <div className="ds-project-layout">
            <Rows rows={data.overview} fallback="Platform overview API did not return data." source="/api/dashboard/summary" />
            <div><h3>Project Activity</h3><EmptyState label="Project activity chart requires telemetry API." source="Project telemetry API" /></div>
          </div>
        </Panel>
        <Panel title="AI Project Insights" action={<button onClick={() => onAction("review")}>View All Insights</button>}>
          {data.insights.length ? <div className="ds-insights">{data.insights.map(([a,b,c]) => <article key={a}><b>{a}</b><p>{b}</p><small>{c}</small></article>)}</div> : <EmptyState label="AI insight API is unavailable for this dashboard." source="/api/ai/development-copilot" />}
        </Panel>
      </section>
      <Panel title="AI Copilot Chat Console">
        <div className="ds-chat">
          <aside><EmptyState label="Recent AI conversations require a persisted copilot chat API." source="AI Copilot conversation API" /></aside>
          <main>
            <button onClick={() => onAction("analyze")}>Open AI Copilot</button>
            <article><b>Real API Mode</b><p>This console is intentionally empty until a live copilot conversation endpoint returns data.</p></article>
            <button className="ask" onClick={() => onAction("analyze")}><span>Ask anything about your project...</span><b>Open</b></button>
          </main>
        </div>
      </Panel>
    </>
  );
}

function CommerceBody({ data, onAction }: { data: DashboardModel; onAction: (key: string) => void }) {
  const hasOrders = data.orders.length > 0;
  return (
    <>
      <Hero data={data} onAction={onAction} />
      <section className="ds-kpi-grid commerce">{data.metrics.map((m) => <KpiCard key={m.label} metric={m} />)}</section>
      <section className="ds-commerce-content">
        <Panel title="Sales Overview" action={<button onClick={() => onAction("report")}>View Report</button>}>
          <div className="ds-tabs"><b>Live</b><span>Trend API</span><span>Export</span></div>
          <EmptyState label="Sales time-series endpoint is not available." source="Sales analytics time-series API" />
        </Panel>
        <Panel title="Top Selling Products" action={<button onClick={() => onAction("products")}>View All</button>}>
          {data.products.length ? <div className="ds-products">{data.products.map(([a,b,c]) => <article key={a}><i /><div><b>{a}</b><span>{b}</span></div><strong>{c}</strong></article>)}</div> : <EmptyState label="Top selling products require a real ranking endpoint." source="Top products API" />}
        </Panel>
        <Panel title="Recent Orders" action={<button onClick={() => onAction("orders")}>View All</button>}>
          {hasOrders ? <div className="ds-orders">{data.orders.map(([a,b,c,d]) => <div key={a}><span>{a}</span><span>{b}</span><span>{c}</span><b>{d}</b></div>)}</div> : <EmptyState label="Recent orders are unavailable." source="/api/dashboard/summary" />}
        </Panel>
        <Panel title={data.role === "MANAGER" ? "Order Status" : "Order Status Overview"}>{hasOrders ? <Donut value={String(data.orders.length)} label="Recent Orders" /> : <EmptyState label="Order status breakdown API is unavailable." source="Order status analytics API" />}<Rows rows={data.status} fallback="Order status breakdown is unavailable." source="Order status analytics API" /></Panel>
        <Panel title="Low Stock Alert" action={<button onClick={() => onAction("products")}>View All</button>}><Rows rows={data.tasks.filter(([label]) => label === "Low Stock Products") as Array<[string, string]>} fallback="Low stock product list is unavailable." source="/api/dashboard/summary" /></Panel>
        {data.role === "ADMIN" ? <Panel title="Top Customers" action={<button onClick={() => onAction("users")}>View All</button>}><EmptyState label="Top customers require a real customer ranking endpoint." source="Customer analytics API" /></Panel> : null}
      </section>
      <Panel title="Recent Activity">
        {data.activities.length ? <div className="ds-activity-row">{data.activities.map(([a,b,c]) => <article key={a + b}><i /><div><b>{a}</b><span>{b}</span></div><small>{c}</small></article>)}</div> : <EmptyState label="Recent activity endpoint is unavailable." source="/api/audit-logs" />}
      </Panel>
    </>
  );
}

function RightRail({ data, onAction }: { data: DashboardModel; onAction: (key: string) => void }) {
  if (data.mode === "super") {
    return (
      <aside className="ds-right">
        <Panel title="AI Assistant" action={<button onClick={() => onAction("analyze")}>Open</button>}>
          <div className="ds-ai-orb"><span>AI</span></div>
          <h3>I am your AI Development Copilot.</h3>
          <p>Live insights appear after the copilot APIs respond.</p>
          <div className="ds-ai-actions">{[["Analyze Project", "analyze"], ["Fix Bugs", "fix"], ["Optimize Performance", "performance"], ["Review Code", "review"], ["Generate Docs", "docs"], ["Add New Feature", "feature"]].map(([label, key]) => <button key={label} onClick={() => onAction(key)}>{label}</button>)}</div>
        </Panel>
        <Panel title="System Monitor" action={<button onClick={() => onAction("performance")}>View All</button>}><EmptyState label="System monitor metrics require a monitoring API." source="Monitoring API" /></Panel>
        <Panel title="Notifications" action={<button onClick={() => onAction("review")}>View All</button>}><Rows rows={data.smallMetrics.filter((m) => m.label === "Notifications").map((m) => [m.label, m.value, m.state, m.source])} fallback="Notifications unavailable." source="/api/notifications/unread-count" /></Panel>
      </aside>
    );
  }

  return (
    <aside className="ds-right">
      <Panel title="Store Status" action={<button onClick={() => onAction("report")}>Online</button>}>
        <Rows rows={data.metrics.filter((metric) => ["Products", "Customers", "Orders", "Total Sales"].includes(metric.label)).map((metric) => [metric.label, metric.value, metric.state, metric.source])} fallback="Store status unavailable." source="/api/dashboard/summary" />
      </Panel>
      <Panel title="Quick Actions">
        <div className="ds-quick">{[["Add New Product", "products"], ["Create New Order", "orders"], ["Add New Coupon", "coupon"], ["View Sales Report", "report"], [data.role === "ADMIN" ? "Manage Users" : "Manage Customers", "users"]].map(([label, key]) => <button key={label} onClick={() => onAction(key)}><span>{label}</span><b>&gt;</b></button>)}</div>
      </Panel>
      <Panel title="My Tasks"><Rows rows={data.tasks as Array<[string, string]>} fallback="Task API unavailable." source="Task workflow API" /></Panel>
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

