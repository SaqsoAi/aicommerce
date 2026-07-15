"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Bot, CalendarDays, ChartNoAxesCombined, CircleAlert, ClipboardList, Code2, FileText, Gauge, Image as ImageIcon, Package, Paperclip, PlusCircle, Send, Sparkles, UserRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ActionModal, { ActionInfo } from "./ActionModal";
import { Donut, MiniLine, ProjectChart, SalesChart, Spark } from "./charts";
import type { DashboardModel, DataState, Metric, MetricFinding } from "./data";
import { apiUrl, authHeaders } from "./liveData";

type DashboardStoreContext = {
  user: { id: string; name: string; email: string; role: string; permissions?: string[] | null };
  tenant: { id: string; name: string; slug: string; status: string } | null;
  store: {
    id: string;
    name: string;
    status: string;
    primaryDomain?: string | null;
    activeTemplate?: { id: string; name: string; slug: string; version?: string | null } | null;
  } | null;
};

type MetricReport = {
  title: string;
  value: string;
  status: DataState;
  source: string;
  summary: string;
  instructions: string[];
  findings: MetricFinding[];
};

type CopilotActionKey = "analyze" | "fix" | "performance" | "review" | "docs" | "feature";

const copilotActionPrompts: Record<CopilotActionKey, { mode: string; role: string; prompt: string }> = {
  analyze: { mode: "analyze", role: "AI_SOFTWARE_ARCHITECT", prompt: "Analyze this project using live repository telemetry and return the most important dashboard report." },
  fix: { mode: "fix", role: "AI_BUG_DETECTOR", prompt: "Review current telemetry and prepare a bug-fix instruction report. Preview only; do not apply code." },
  performance: { mode: "performance", role: "AI_PERFORMANCE_ENGINEER", prompt: "Analyze performance signals and return optimization instructions from live telemetry. Preview only." },
  review: { mode: "review", role: "AI_CODE_REVIEWER", prompt: "Review current repository telemetry and return code-review findings with safe fix instructions." },
  docs: { mode: "docs", role: "AI_DOCUMENTATION_GENERATOR", prompt: "Generate a documentation plan for the current dashboard/project telemetry state. Preview only." },
  feature: { mode: "feature", role: "AI_FULL_STACK_DEVELOPER", prompt: "Prepare a safe feature implementation plan using the project workflow gates. Preview only." },
};

const metricInstructionMap: Record<string, string[]> = {
  "Project Health Score": ["Check BUILD, CODE_QUALITY, SECURITY and PERFORMANCE telemetry snapshots.", "Fix the highest severity issue group first, then re-run server/admin validation.", "Re-ingest telemetry so the health score is recalculated from real signals."],
  "Critical Bugs": ["Open the issue source report and inspect every critical security/build finding.", "Patch owner files only; do not use global regex updates.", "Run server typecheck, admin build and dashboard Playwright before closing."],
  "Medium Bugs": ["Review TODO/FIXME/performance findings from the repository scanner.", "Group similar findings by owner module and fix the highest impact module first.", "Re-index repository telemetry after fixes."],
  "Low Priority": ["Clean low-risk code quality signals such as loose any, console statements and minor debt markers.", "Avoid cosmetic-only churn outside the dashboard owner files.", "Keep the count visible until telemetry confirms the cleanup."],
  "Performance Score": ["Inspect performance findings and runtime System Monitor values.", "Check slow API queries, await-in-loop patterns and large UI render sections.", "Run targeted build/Playwright after optimization."],
  "Security Score": ["Inspect security scanner findings before changing auth or secrets code.", "Rotate any exposed token/secret outside source code if a real secret is found.", "Run security-sensitive typecheck and RBAC smoke test after patch."],
  "Build Status": ["If not SUCCESS/INDEXED, run the failing build command locally.", "Fix the first compiler/runtime owner error before UI polish.", "Refresh telemetry after build passes."],
  "Test Coverage": ["Run the real coverage command configured for the project.", "Add tests around changed owner modules only.", "Publish coverage artifact or telemetry snapshot so the dashboard can read it."],
  "Code Quality": ["Open the code quality findings and fix strict TypeScript or lint debt first.", "Prefer small typed helpers over large component patches.", "Re-run admin build and server typecheck."],
  "Tech Debt": ["Reduce TODO/FIXME debt in active owner files.", "Extract repeated dashboard logic only when it removes real duplication.", "Keep the fix surgical and report remaining debt."],
  "Duplicate Code": ["Compare repeated blocks before extracting shared helpers.", "Do not create a second dashboard/component implementation.", "After refactor, run build and visual dashboard checks."],
  "Unused Files": ["Confirm each candidate is truly unreferenced before delete.", "Prefer quarantine/report first if ownership is uncertain.", "Never remove routes/components without build and navigation check."],
  "Dependencies": ["Review package manifests and dependency update telemetry.", "Update only required packages, then run lockfile-aware install/build.", "Do not change production dependencies without a release gate."],
  "Total Sales": ["Verify dashboard summary API revenue calculation from real orders.", "Check date range and tenant/store filtering if value looks wrong.", "Do not add demo revenue fallback."],
  "Orders": ["Open the orders API/report and verify status filters.", "Fix order aggregation in the server summary endpoint if counts mismatch.", "Confirm recent orders and tasks use the same source."],
  "Customers": ["Verify customer count from the real customer API.", "Check tenant isolation before changing query scope.", "Avoid test customer fallback rows."],
  "Conversion Rate": ["Connect a real analytics/conversion endpoint before showing a percentage.", "Define visits and successful checkout source tables clearly.", "Keep unavailable if analytics source is absent."],
  "Avg. Order Value": ["Verify revenue divided by real order count for the active scope.", "Handle zero-order stores without fake values.", "Cross-check with recent order totals."],
};

function buildMetricReport(metric: Metric): MetricReport {
  const source = metric.source || "Dashboard data source";
  const unavailableValue = metric.state === "unavailable";
  return {
    title: `${metric.label} Report`,
    value: metric.value,
    status: metric.state,
    source,
    summary: unavailableValue
      ? `${metric.label} has no trusted live value from ${source}. Demo fallback is blocked, so the card waits for the real API/scanner source.`
      : `${metric.label} is showing ${metric.value}${metric.sub ? ` (${metric.sub})` : ""} from ${source}.`,
    instructions: metricInstructionMap[metric.label] || ["Inspect this widget's API/source first.", "Patch the existing owner file only if source mapping is wrong.", "Run build and dashboard visual validation after the fix."],
    findings: (metric.findings || []).slice(0, 12),
  };
}

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
  customers: { title: "Customer Management", route: "/customers", steps: ["Open the customer module.", "Use live customer APIs.", "Verify tenant isolation."] },
};

function canNavigate(route?: string) {
  if (!route) return false;
  return ["/products", "/orders", "/customers", "/coupons", "/analytics", "/roles", "/ai-development-copilot", "/ai-bug-detector", "/ai-code-reviewer", "/ai-performance", "/ai-documentation", "/automation-studio"].includes(route);
}

function EmptyState({ label, icon: Icon = ChartNoAxesCombined }: { label: string; source?: string; icon?: LucideIcon }) {
  return (
    <div className="ds-empty-state">
      <i><Icon size={22} /></i>
      <b>No data available</b>
      <span>{label}</span>
    </div>
  );
}

function KpiCard({ metric, compact = false, onReport }: { metric: Metric; compact?: boolean; onReport: (metric: Metric) => void }) {
  const Icon = metric.icon;
  if (!compact && metric.label === "Project Health Score") {
    const score = metric.state === "available" ? Math.max(0, Math.min(100, Number.parseFloat(metric.value))) : 0;
    const ringStyle = { "--health-score": Number.isFinite(score) ? score : 0 } as CSSProperties;
    return (
      <button type="button" className={`ds-kpi ds-kpi-button ds-health-kpi ${metric.state === "unavailable" ? "is-unavailable" : ""}`} onClick={() => onReport(metric)} aria-label={`Open ${metric.label} report`}>
        <p>{metric.label}</p>
        <div className="ds-health-ring" style={ringStyle}><strong>{metric.state === "available" ? metric.value : "—"}</strong><span>{metric.state === "available" ? "Overall Score" : "Unavailable"}</span></div>
        <em>View report</em>
      </button>
    );
  }
  return (
    <button type="button" className={`${compact ? "ds-small-kpi" : "ds-kpi"} ds-kpi-button ${metric.state === "unavailable" ? "is-unavailable" : ""}`} onClick={() => onReport(metric)} aria-label={`Open ${metric.label} report`}>
      <span className="ds-live" />
      <i className={`ds-kpi-icon tone-${metric.tone || ""}`}><Icon size={compact ? 17 : 21} /></i>
      <p>{metric.label}</p>
      <strong>{metric.value}</strong>
      {metric.sub ? <small>{metric.sub}</small> : null}
      {metric.state === "available" ? (compact ? <Spark /> : <MiniLine tone={metric.tone} />) : null}
      <em>View report</em>
    </button>
  );
}

function MetricReportModal({ report, onClose }: { report: MetricReport | null; onClose: () => void }) {
  if (!report) return null;
  return (
    <div className="ds-modal-overlay">
      <div className="ds-modal ds-metric-report" role="dialog" aria-modal="true" aria-label={report.title}>
        <button type="button" className="ds-modal-close" onClick={onClose}><X size={18} /></button>
        <p>Live Metric Report</p>
        <h2>{report.title}</h2>
        <div className="ds-report-grid">
          <article><span>Current Value</span><strong>{report.value}</strong></article>
          <article><span>Status</span><strong>{report.status === "available" ? "Available" : "Unavailable"}</strong></article>
          <article className="wide"><span>Source/API</span><strong>{report.source}</strong></article>
        </div>
        <section className="ds-report-summary"><b>Report</b><p>{report.summary}</p></section>
        <section className="ds-report-findings"><b>Location evidence</b>{report.findings.length ? <div>{report.findings.map((finding, index) => <article key={`${finding.file}-${finding.line}-${index}`}><code>{finding.file}:{finding.line}</code><strong>{finding.category.replace(/_/g, " ")}</strong><p>{finding.message}</p><span>{finding.instruction}</span></article>)}</div> : <p>No file-level evidence returned for this metric yet. Re-index telemetry after the scanner reports detailed findings.</p>}</section>
        <section className="ds-report-steps"><b>Fix instruction</b><ol>{report.instructions.map((step) => <li key={step}>{step}</li>)}</ol></section>
        <button type="button" onClick={onClose}>Close Report</button>
      </div>
    </div>
  );
}

function ProductMedia({ imageUrl, label, fallback: Fallback = Package }: { imageUrl?: string; label: string; fallback?: LucideIcon }) {
  return (
    <i className="ds-product-media">
      {imageUrl ? <img src={imageUrl} alt={label} loading="lazy" /> : <Fallback size={17} aria-hidden="true" />}
    </i>
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

function Rows({ rows, fallback, source, icon: Icon = CircleAlert }: { rows: Array<[string, string, DataState?, string?]>; fallback: string; source: string; icon?: LucideIcon }) {
  if (!rows.length) return <EmptyState label={fallback} source={source} icon={Icon} />;
  return <div className="ds-rows">{rows.map(([a, b, state]) => <div key={a} className={state === "unavailable" ? "is-unavailable" : ""}><i className="ds-row-icon"><Icon size={14} /></i><span>{a}</span><b>{b}</b></div>)}</div>;
}



function insightMetricLabel(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes("critical")) return "Critical Bugs";
  if (normalized.includes("performance")) return "Performance Score";
  if (normalized.includes("security")) return "Security Score";
  if (normalized.includes("low priority")) return "Low Priority";
  if (normalized.includes("code improvement") || normalized.includes("duplicate")) return "Duplicate Code";
  if (normalized.includes("repository") || normalized.includes("index")) return "Project Health Score";
  return "Project Health Score";
}
function ProjectEvents({ rows }: { rows: Array<[string, string, string?]> }) {
  if (!rows.length) return <EmptyState label="No persisted project activity yet." source="/api/audit-logs" icon={CalendarDays} />;
  return (
    <div className="ds-project-events">
      {rows.map(([title, detail, time], index) => (
        <article key={`${title}-${time || index}`}>
          <i><CalendarDays size={14} /></i>
          <div><b>{title}</b><span>{detail}</span></div>
          <time>{time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time>
        </article>
      ))}
    </div>
  );
}
function actionIcon(key: string): LucideIcon {
  return { analyze: Bot, fix: CircleAlert, performance: Gauge, review: Code2, docs: FileText, feature: PlusCircle, products: Package, orders: ClipboardList, coupon: Sparkles, report: ChartNoAxesCombined, users: UserRound, customers: UserRound }[key] ?? Sparkles;
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
        <button type="button" className="primary" onClick={() => onAction(data.mode === "super" ? "analyze" : data.role === "ADMIN" ? "report" : "orders")}>{data.actionLabel}</button>
      </div>
    </header>
  );
}

type ProjectTab = "overview" | "modules" | "activity" | "statistics";
type CopilotPreviewPayload = {
  success?: boolean;
  message?: string;
  data?: { mode?: string; summary?: string; recommendations?: string[] };
};

function SuperBody({ data, onAction, onMetricReport }: { data: DashboardModel; onAction: (key: string) => void; onMetricReport: (metric: Metric) => void }) {
  const [projectTab, setProjectTab] = useState<ProjectTab>("overview");
  const [conversations, setConversations] = useState(data.conversations);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [chatError, setChatError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setConversations(data.conversations);
    setSelectedConversation(0);
  }, [data.conversations]);

  const activeConversation = conversations[selectedConversation];
  const moduleRows = data.overview.filter(([label]) => ["Total Modules", "Total APIs", "Database Tables", "React Components", "Lines of Code"].includes(label));
  const statisticsRows = data.overview.filter(([label]) => ["Team Members", "Commits (This Week)", "Active Branch"].includes(label));
  const activityRows = data.activities.map(([title, detail]) => [title, detail, "available", "/api/audit-logs"] as [string, string, DataState, string]);

  async function runCopilotPreview(nextPrompt: string, mode = "review", role = "AI_CODE_REVIEWER") {
    if (!nextPrompt || submitting) return;

    setSubmitting(true);
    setChatError("");
    try {
      const headers = new Headers(authHeaders());
      headers.set("Content-Type", "application/json");
      const response = await fetch(apiUrl("/api/ai/development-copilot/preview"), {
        method: "POST",
        headers,
        body: JSON.stringify({ mode, role, prompt: nextPrompt }),
      });
      const payload = await response.json() as CopilotPreviewPayload;
      if (!response.ok || !payload.data) throw new Error(payload.message || `Copilot request failed (${response.status})`);

      const answer = [payload.data.summary, ...(payload.data.recommendations || []).map((item, index) => `${index + 1}. ${item}`)]
        .filter(Boolean)
        .join("\n");
      const nextConversation: [string, string, string, string] = [
        `Development Copilot · ${payload.data.mode || "review"}`,
        nextPrompt,
        answer,
        new Date().toISOString(),
      ];
      setConversations((current) => [nextConversation, ...current]);
      setSelectedConversation(0);
      setPrompt("");
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Copilot request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runCopilotPreview(prompt.trim());
  }

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      const action = detail?.key && copilotActionPrompts[detail.key as CopilotActionKey];
      if (!action) return;
      void runCopilotPreview(action.prompt, action.mode, action.role);
    };
    window.addEventListener("dashboard-copilot-action", handler);
    return () => window.removeEventListener("dashboard-copilot-action", handler);
  }, [submitting]);

  function projectTabContent() {
    if (projectTab === "modules") {
      return <Rows rows={moduleRows} fallback="Module telemetry endpoint returned no rows." source="/api/project-telemetry/latest" />;
    }
    if (projectTab === "statistics") {
      return <Rows rows={statisticsRows.length ? statisticsRows : (data.roleCoverage || [])} fallback="Project statistics endpoint returned no rows." source="/api/project-telemetry/latest" icon={UserRound} />;
    }
    if (projectTab === "activity") {
      return (
        <div className="ds-project-layout">
          <ProjectEvents rows={activityRows.map(([title, detail]) => [title, detail, ""])} />
          <div><h3>Project Activity</h3>{data.projectActivity.length ? <ProjectChart points={data.projectActivity} /> : <EmptyState label="Project activity chart requires telemetry API." source="Project telemetry API" />}</div>
        </div>
      );
    }
    return (
      <div className="ds-project-layout">
        <Rows rows={data.overview} fallback="Project overview API did not return data." source="/api/project-telemetry/latest" />
        <div><h3>Project Activity</h3>{data.projectActivity.length ? <ProjectChart points={data.projectActivity} /> : <EmptyState label="Project activity chart requires telemetry API." source="Project telemetry API" />}</div>
      </div>
    );
  }

  return (
    <>
      <Hero data={data} onAction={onAction} />
      <section className="ds-kpi-grid super">{data.metrics.map((m) => <KpiCard key={m.label} metric={m} onReport={onMetricReport} />)}</section>
      <section className="ds-small-kpi-grid">{data.smallMetrics.map((m) => <KpiCard key={m.label} metric={m} compact onReport={onMetricReport} />)}</section>
      <section className="ds-super-content">
        <Panel title="Project Overview" action={<button onClick={() => onAction("analyze")}>Live Sources</button>}>
          <div className="ds-tabs" role="tablist" aria-label="Platform overview views">
            {(["overview", "modules", "activity", "statistics"] as ProjectTab[]).map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={projectTab === tab} className={projectTab === tab ? "active" : ""} onClick={() => setProjectTab(tab)}>
                {{ overview: "Overview", modules: "Modules", activity: "Activity", statistics: "Statistics" }[tab]}
              </button>
            ))}
          </div>
          <div className="ds-tab-content" role="tabpanel">{projectTabContent()}</div>
        </Panel>
        <Panel title="AI Project Insights" action={<button onClick={() => onAction("review")}>View All Insights</button>}>
          {data.insights.length ? <><div className="ds-insights">{data.insights.map(([a,b,c]) => {
            const metricLabel = insightMetricLabel(a);
            const metric = [...data.metrics, ...data.smallMetrics].find((item) => item.label === metricLabel) || data.metrics[0];
            return <button type="button" className="ds-insight-button" key={`${a}-${b}`} onClick={() => metric && onMetricReport(metric)} aria-label={`Open ${a} report`}><i><Sparkles size={15} /></i><div><b>{a}</b><p>{b}</p></div><small>{c}</small></button>;
          })}</div><button type="button" className="ds-insights-footer" onClick={() => onAction("review")}>View All Insights <span>→</span></button></> : <EmptyState label="AI insight API is unavailable for this dashboard." source="/api/ai/development-copilot" icon={Sparkles} />}
        </Panel>
      </section>
      <Panel title="AI Copilot Chat Console">
        <div className="ds-chat-console-head"><span>AI Developer Mode</span><small>GPT-4o</small><em>Preview only</em><b>{activeConversation?.[1] || "Why is the login API slow?"}</b></div>
        <div className="ds-chat ds-chat-window">
          <aside>
            <h3>Recent Conversations</h3>
            {conversations.length ? <div className="ds-chat-list">{conversations.map(([feature, conversationPrompt, , createdAt], index) => <button type="button" className={selectedConversation === index ? "active" : ""} key={`${feature}-${createdAt}-${index}`} onClick={() => setSelectedConversation(index)}><i><FileText size={14} /></i><span><b>{conversationPrompt}</b><small>{feature}</small></span><time>{createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time></button>)}</div> : <EmptyState label="Start a conversation to see it here." source="AI Copilot conversation API" icon={Bot} />}
            <button type="button" className="ds-view-conversations" onClick={() => onAction("analyze")}>View All Conversations <span>→</span></button>
          </aside>
          <main>
            <div className="ds-chat-transcript">
              {activeConversation ? <article className="ds-ai-message"><i><Bot size={18} /></i><div><b>{activeConversation[1]}</b><p>{activeConversation[2]}</p><small>{activeConversation[0]}</small></div></article> : <EmptyState label="Ask a project question to create a persisted preview conversation." source="/api/ai/development-copilot/preview" icon={Bot} />}
            </div>
            {chatError ? <p className="ds-chat-error" role="alert">{chatError}</p> : null}
            <form className="ds-chat-composer" onSubmit={submitPrompt}>
              <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask anything about your project..." aria-label="Copilot prompt" />
              <span className="ds-chat-tools" aria-hidden="true"><Paperclip size={16} /><Code2 size={16} /><ImageIcon size={16} /></span>
              <button type="submit" disabled={submitting || !prompt.trim()}><Send size={15} />{submitting ? "Analyzing..." : "Send"}</button>
            </form>
          </main>
        </div>
      </Panel>
    </>
  );
}

function CommerceBody({ data, onAction, onMetricReport }: { data: DashboardModel; onAction: (key: string) => void; onMetricReport: (metric: Metric) => void }) {
  const hasOrders = data.orders.length > 0;
  return (
    <>
      <Hero data={data} onAction={onAction} />
      <section className="ds-kpi-grid commerce">{data.metrics.map((m) => <KpiCard key={m.label} metric={m} onReport={onMetricReport} />)}</section>
      <section className="ds-commerce-content">
        <Panel title="Sales Overview" action={<button onClick={() => onAction("report")}>View Report</button>}>
          <div className="ds-tabs"><b>Live</b><span>Trend API</span><span>Export</span></div>
          {data.salesTrend.length ? <SalesChart points={data.salesTrend} /> : <EmptyState label="Sales time-series endpoint returned no rows." source="/api/dashboard/summary" />}
        </Panel>
        <Panel title="Top Selling Products" action={<button onClick={() => onAction("products")}>View All</button>}>
          {data.products.length ? <div className="ds-products">{data.products.map(([a,b,c,imageUrl]) => <article key={a}><ProductMedia imageUrl={imageUrl} label={a} /><div><b>{a}</b><span>{b}</span></div><strong>{c}</strong></article>)}</div> : <EmptyState label="Top selling products require a real ranking endpoint." source="Top products API" icon={Package} />}
        </Panel>
        <Panel title="Recent Orders" action={<button onClick={() => onAction("orders")}>View All</button>}>
          {hasOrders ? <div className="ds-orders">{data.orders.map(([a,b,c,d,imageUrl,productName]) => <div key={a} className="with-media"><ProductMedia imageUrl={imageUrl} label={productName || a} fallback={ClipboardList} /><span>{a}</span><span>{b}</span><span>{c}</span><b>{d}</b></div>)}</div> : <EmptyState label="Recent orders are unavailable." source="/api/dashboard/summary" icon={ClipboardList} />}
        </Panel>
        <Panel title={data.role === "MANAGER" ? "Order Status" : "Order Status Overview"}>{data.status.length ? <Donut value={String(data.status.reduce((sum, [, value]) => sum + Number(value || 0), 0))} label="Total Orders" segments={data.status} /> : <EmptyState label="Order status breakdown returned no rows." source="/api/dashboard/summary" />}<Rows rows={data.status} fallback="Order status breakdown is unavailable." source="Order status analytics API" /></Panel>
        <Panel title="Low Stock Alert" action={<button onClick={() => onAction("products")}>View All</button>}><Rows rows={data.inventory} fallback="No low-stock variants were returned." source="/api/dashboard/summary" /></Panel>
        {data.role === "ADMIN" ? <Panel title="Top Customers" action={<button onClick={() => onAction("customers")}>View All</button>}>{data.customers.length ? <div className="ds-products">{data.customers.map(([name, orders, total]) => <article key={name}><i><UserRound size={18} /></i><div><b>{name}</b><span>{orders}</span></div><strong>{total}</strong></article>)}</div> : <EmptyState label="No customer ranking rows were returned." source="/api/dashboard/summary" icon={UserRound} />}</Panel> : null}
      </section>
      <Panel title="Recent Activity">
        {data.activities.length ? <div className="ds-activity-row">{data.activities.map(([a,b,c]) => <article key={a + b}><i><CalendarDays size={16} /></i><div><b>{a}</b><span>{b}</span></div><small>{c}</small></article>)}</div> : <EmptyState label="Recent activity endpoint is unavailable." source="/api/audit-logs" icon={CalendarDays} />}
      </Panel>
    </>
  );
}

function RightRail({ data, onAction }: { data: DashboardModel; onAction: (key: string) => void }) {
  if (data.mode === "super") {
    return (
      <aside className="ds-right">
        <Panel title="AI Assistant" action={<button className="ds-online-pill" onClick={() => onAction("analyze")}>{data.system.length ? "● Online" : "Unavailable"}</button>}>
          <div className="ds-ai-orb"><span>AI</span></div>
          <h3>I am your AI Development Copilot.<br />How can I help you today?</h3>
          <div className="ds-ai-actions">{[["Analyze Project", "analyze"], ["Fix Bugs", "fix"], ["Optimize Performance", "performance"], ["Review Code", "review"], ["Generate Docs", "docs"], ["Add New Feature", "feature"]].map(([label, key]) => { const Icon = actionIcon(key); return <button key={label} onClick={() => onAction(key)}><Icon size={14} />{label}</button>; })}</div>
        </Panel>
        <Panel title="System Monitor" action={<button onClick={() => onAction("performance")}>View All</button>}>
          {data.system.length ? (
            <div className="ds-monitor">
              {data.system.map(([label, value], index) => {
                const Icon = index % 2 === 0 ? Gauge : ChartNoAxesCombined;
                return <article key={label}><span>{label}</span><div><strong>{value}</strong><i><Icon size={18} /></i></div></article>;
              })}
            </div>
          ) : <EmptyState label="Runtime telemetry is unavailable." source="/api/dashboard/super-admin" icon={Gauge} />}
        </Panel>
        <Panel title="Recent Activity" action={<button onClick={() => onAction("review")}>View All</button>}>
          {data.activities.length ? (
            <div className="ds-rail-activity">{data.activities.slice(0, 5).map(([title, detail, time]) => <article key={`${title}-${detail}`}><i><CalendarDays size={15} /></i><div><b>{title}</b><span>{detail}</span></div><small>{time}</small></article>)}</div>
          ) : <EmptyState label="Recent activity endpoint returned no rows." source="/api/audit-logs" icon={CalendarDays} />}
        </Panel>
      </aside>
    );
  }

  return (
    <aside className="ds-right">
      <Panel title="Store Status" action={<button onClick={() => onAction("report")}>Online</button>}>
        <div className="ds-store-status"><div className="ds-store-ring"><strong>{data.store.length ? "Online" : "Unavailable"}</strong></div><Rows rows={data.store} fallback="Store status unavailable." source="/api/dashboard/summary" icon={CircleAlert} /></div><button className="ds-store-report" onClick={() => onAction("report")}>View Store Report <span>→</span></button>
      </Panel>
      <Panel title="Quick Actions">
        <div className="ds-quick">{(data.role === "ADMIN" ? [["Add New Product", "products"], ["Create New Order", "orders"], ["Add New Coupon", "coupon"], ["View Sales Report", "report"], ["Manage Users", "users"]] : [["Add New Product", "products"], ["Create New Order", "orders"], ["Manage Customers", "customers"]]).map(([label, key]) => { const Icon = actionIcon(key); return <button key={label} onClick={() => onAction(key)}><i><Icon size={14} /></i><span>{label}</span><b>&gt;</b></button>; })}</div>
      </Panel>
      <Panel title="My Tasks"><Rows rows={data.tasks as Array<[string, string]>} fallback="Task API unavailable." source="Task workflow API" /></Panel>
    </aside>
  );
}

export default function DashboardShell({ data }: { data: DashboardModel }) {
  const [modal, setModal] = useState<ActionInfo | null>(null);
  const [metricReport, setMetricReport] = useState<MetricReport | null>(null);
  const [storeContext, setStoreContext] = useState<DashboardStoreContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStoreContext() {
      try {
        const response = await fetch(apiUrl("/platform-tenancy/me-context"), {
          credentials: "include",
          cache: "no-store",
          headers: authHeaders(),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || cancelled) return;
        setStoreContext((body?.data ?? body) as DashboardStoreContext);
      } catch {
        if (!cancelled) setStoreContext(null);
      }
    }

    void loadStoreContext();
    return () => {
      cancelled = true;
    };
  }, []);

  function onAction(key: string) {
    if (data.mode === "super" && key in copilotActionPrompts) {
      window.dispatchEvent(new CustomEvent("dashboard-copilot-action", { detail: { key } }));
      return;
    }
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
        {data.mode !== "super" && storeContext ? (
          <section
            style={{
              margin: "0 0 12px",
              padding: "10px 14px",
              border: "1px solid rgba(56,189,248,.22)",
              borderRadius: 10,
              background: "rgba(2,132,199,.08)",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <b>{storeContext.store?.name ?? "Store not assigned"}</b>
              <span style={{ marginLeft: 8, opacity: .72 }}>
                {storeContext.tenant?.name ?? "Tenant not assigned"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, opacity: .82 }}>
              <span>{storeContext.user.role}</span>
              <span>{Array.isArray(storeContext.user.permissions) ? storeContext.user.permissions.length : 0} permissions</span>
              <span>{storeContext.store?.activeTemplate?.name ?? "No active template"}</span>
            </div>
          </section>
        ) : null}
        {data.mode === "super" ? <SuperBody data={data} onAction={onAction} onMetricReport={(metric) => setMetricReport(buildMetricReport(metric))} /> : <CommerceBody data={data} onAction={onAction} onMetricReport={(metric) => setMetricReport(buildMetricReport(metric))} />}
        <footer className="ds-role-bar"><span>Role Based Theme:</span><b>{data.roleLabel}</b><strong>{data.themeLabel}</strong></footer>
      </main>
      <RightRail data={data} onAction={onAction} />
      <ActionModal action={modal} onClose={() => setModal(null)} />
      <MetricReportModal report={metricReport} onClose={() => setMetricReport(null)} />
    </section>
  );
}







