import { cloneDashboard, type DashboardModel, type DataState, type Metric, unavailable } from "./data";

type ApiResult<T> = { state: DataState; path: string; data: T | null; error?: string };
type DashboardSummary = {
  totalProducts?: number | string | null;
  totalCustomers?: number | string | null;
  totalOrders?: number | string | null;
  totalRevenue?: number | string | null;
  lowStock?: number | string | null;
  recentOrders?: Array<Record<string, unknown>>;
  currency?: string | null;
  kpis?: Array<{ key?: string; label?: string; value?: number | string | null; unit?: string }>;
  salesTrend?: Array<{ label?: string; value?: number | string | null }>;
  orderStatus?: Array<{ label?: string; value?: number | string | null }>;
  orders?: Array<Record<string, unknown>>;
  products?: Array<Record<string, unknown>>;
  tasks?: Array<{ label?: string; value?: number | string | null }>;
activities?: Array<Record<string, unknown>>;
  customers?: Array<Record<string, unknown>>;
  inventory?: Array<Record<string, unknown>>;
  system?: Array<{ label?: string; value?: number | string | null; unit?: string }>;
  store?: { totalProducts?: number; totalCustomers?: number; lowStock?: number; outOfStock?: number };
  platform?: { roles?: string[]; roleCount?: number; permissionCount?: number };
};

type StoreSettings = {
  currency?: string | null;
  currencyCode?: string | null;
  storeCurrency?: string | null;
};

type AiControlDashboard = {
  features?: Array<{
    key?: string;
    label?: string;
    enabled?: boolean;
    placement?: string[];
  }>;
  providers?: Array<{
    key?: string;
    name?: string;
    model?: string | null;
    enabled?: boolean;
    priority?: number;
  }>;
  recentUsage?: Array<{
    id?: string;
    featureKey?: string;
    providerKey?: string | null;
    model?: string | null;
    status?: string;
    totalTokens?: number | string | null;
    cost?: number | string | null;
    createdAt?: string | Date | null;
  }>;
  overrides?: Array<{
    id?: string;
    featureKey?: string;
    targetType?: string;
    targetId?: string;
    active?: boolean;
    reason?: string | null;
    createdAt?: string | Date | null;
  }>;
  usageSummary?: Array<{
    featureKey?: string;
    _count?: { id?: number | string | null };
    _sum?: {
      promptTokens?: number | string | null;
      completionTokens?: number | string | null;
      totalTokens?: number | string | null;
      cost?: number | string | null;
    };
  }>;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return { Accept: "application/json" };
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function apiUrl(path: string) {
  const normalized = path.startsWith("/api/") ? path.slice(4) : path;
  return `${API_BASE}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

async function fetchSource<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(apiUrl(path), {
      headers: authHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      return { state: "unavailable", path, data: null, error: `HTTP ${response.status}` };
    }

    const payload = (await response.json()) as { success?: boolean; data?: T } | T;
    const data = payload && typeof payload === "object" && "data" in payload ? (payload as { data?: T }).data ?? null : (payload as T);
    return { state: data == null ? "unavailable" : "available", path, data };
  } catch (error) {
    return { state: "unavailable", path, data: null, error: error instanceof Error ? error.message : "Request failed" };
  }
}

function formatNumber(value: unknown): string | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return new Intl.NumberFormat("en-US").format(numeric);
}

function formatMoney(value: unknown, currency = "BDT"): string | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const code = String(currency || "BDT").toUpperCase();
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${code} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(numeric)}`;
  }
}

function setMetric(metrics: Metric[], label: string, value: string | null, source: string, sub = "Live API data") {
  const metric = metrics.find((item) => item.label === label);
  if (!metric || value == null) return;
  metric.value = value;
  metric.sub = sub;
  metric.source = source;
  metric.state = "available";
}

function countFromCollection(data: unknown): string | null {
  if (Array.isArray(data)) return formatNumber(data.length);
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const candidates = [record.total, record.count, record.totalCount, record.items, record.roles, record.permissions, record.data];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return formatNumber(candidate.length);
      const formatted = formatNumber(candidate);
      if (formatted) return formatted;
    }
  }
  return null;
}

function orderRows(summary: DashboardSummary | null, currency: string): Array<[string, string, string, string]> {
  return (summary?.recentOrders || []).slice(0, 5).map((order) => [
    String(order.orderNumber || order.id || unavailable),
    String(order.customerName || order.customerEmail || unavailable),
    formatMoney(order.finalAmount, currency) || unavailable,
    String(order.status || unavailable),
  ]);
}

function sourceState(results: Array<ApiResult<unknown>>, path: string): DataState {
  return results.find((result) => result.path === path)?.state || "unavailable";
}

function enabledCount(items: Array<{ enabled?: boolean }> | undefined): string | null {
  if (!Array.isArray(items)) return null;
  return formatNumber(items.filter((item) => item.enabled === true).length);
}

function activityDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
}

export async function hydrateDashboard(baseModel: DashboardModel): Promise<DashboardModel> {
  const dashboardPath = baseModel.role === "SUPER_ADMIN" ? "/dashboard/super-admin" : baseModel.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user-admin";
  const model = cloneDashboard(baseModel);
  const [summaryResult, rolesResult, permissionsResult, aiResult, notificationsResult, healthResult, enterpriseSettingsResult, storeSettingsResult] = await Promise.all([
    fetchSource<DashboardSummary>(dashboardPath),
    fetchSource<unknown>("/roles"),
    fetchSource<unknown>("/permissions"),
    fetchSource<AiControlDashboard>("/ai-control/dashboard"),
    fetchSource<unknown>("/notifications/unread-count"),
    fetchSource<unknown>("/health"),
    fetchSource<StoreSettings>("/enterprise-settings"),
    fetchSource<StoreSettings>("/store-settings"),
  ]);

  const results = [summaryResult, rolesResult, permissionsResult, aiResult, notificationsResult, healthResult, enterpriseSettingsResult, storeSettingsResult] as Array<ApiResult<unknown>>;
  const rawSummary = summaryResult.data;
  const kpiValue = (key: string) => rawSummary?.kpis?.find((item) => item.key === key || item.label?.toLowerCase() === key)?.value;
  const summary: DashboardSummary | null = rawSummary ? {
    ...rawSummary,
    totalProducts: rawSummary.totalProducts ?? kpiValue("products"),
    totalCustomers: rawSummary.totalCustomers ?? kpiValue("customers"),
    totalOrders: rawSummary.totalOrders ?? kpiValue("orders"),
    totalRevenue: rawSummary.totalRevenue ?? kpiValue("sales"),
    recentOrders: rawSummary.recentOrders ?? rawSummary.orders,
    lowStock: rawSummary.lowStock ?? rawSummary.tasks?.find((task) => task.label === "Low Stock Products")?.value,
  } : null;
  const settings = enterpriseSettingsResult.data || storeSettingsResult.data;
  const currency = String(summary?.currency || settings?.currency || settings?.currencyCode || settings?.storeCurrency || "BDT").toUpperCase();
model.salesTrend = (summary?.salesTrend || []).flatMap((point) => {
    const value = Number(point.value);
    return Number.isFinite(value) ? [{ label: String(point.label || ""), value }] : [];
  });
  model.customers = (summary?.customers || []).slice(0, 5).map((customer) => [
    String(customer.name || customer.email || unavailable),
    `${formatNumber(customer.orders) || "0"} orders`,
    formatMoney(customer.total, currency) || unavailable,
  ]);
  model.inventory = (summary?.inventory || []).slice(0, 5).map((item) => [
    String(item.name || unavailable),
    formatNumber(item.stock) || "0",
  ]);
  model.system = (summary?.system || []).map((item) => [
    String(item.label || unavailable),
    `${formatNumber(item.value) || "0"}${String(item.unit || "")}`,
  ]);
  model.store = summary?.store ? [
    ["Total Products", formatNumber(summary.store.totalProducts) || "0"],
    ["Total Customers", formatNumber(summary.store.totalCustomers) || "0"],
    ["Low Stock Items", formatNumber(summary.store.lowStock) || "0"],
    ["Out of Stock", formatNumber(summary.store.outOfStock) || "0"],
  ] : [];

  const totalOrders = Number(summary?.totalOrders || 0);
  const totalRevenue = Number(summary?.totalRevenue || 0);
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : null;

  setMetric(model.metrics, "Platform Revenue", formatMoney(summary?.totalRevenue, currency), "/api/dashboard/summary");
  setMetric(model.metrics, "Total Sales", formatMoney(summary?.totalRevenue, currency), "/api/dashboard/summary");
  setMetric(model.metrics, "Total Orders", formatNumber(summary?.totalOrders), "/api/dashboard/summary");
  setMetric(model.metrics, "Orders", formatNumber(summary?.totalOrders), "/api/dashboard/summary");
  setMetric(model.metrics, "Products", formatNumber(summary?.totalProducts), "/api/dashboard/summary");
  setMetric(model.metrics, "Customers", formatNumber(summary?.totalCustomers), "/api/dashboard/summary");
  setMetric(model.metrics, "Roles", countFromCollection(rolesResult.data), "/api/roles");
  setMetric(model.metrics, "Permissions", countFromCollection(permissionsResult.data), "/api/permissions");
  setMetric(model.metrics, "Avg. Order Value", averageOrder == null ? null : formatMoney(averageOrder, currency), "/api/dashboard/summary");

  setMetric(model.smallMetrics, "Low Stock", formatNumber(summary?.lowStock), "/api/dashboard/summary");
  setMetric(model.smallMetrics, "Notifications", countFromCollection(notificationsResult.data), "/api/notifications/unread-count");
  setMetric(model.smallMetrics, "Menu Sections", formatNumber(model.role === "SUPER_ADMIN" ? 5 : 3), "Role navigation registry");
  setMetric(model.smallMetrics, "API Health", healthResult.state === "available" ? "Online" : null, "/api/health");
  setMetric(model.smallMetrics, "AI Providers", aiResult.state === "available" ? "Connected" : null, "/api/ai-control/dashboard");

  if (model.mode === "super" && aiResult.state === "available") {
    const ai = aiResult.data;
    const featureCount = countFromCollection(ai?.features);
    const providerCount = countFromCollection(ai?.providers);
    const usageCount = countFromCollection(ai?.recentUsage);
    const activeOverrides = Array.isArray(ai?.overrides)
      ? formatNumber(ai.overrides.filter((item) => item.active !== false).length)
      : null;

    setMetric(model.metrics, "AI Features", featureCount, "/api/ai-control/dashboard");
    setMetric(model.metrics, "AI Providers", providerCount, "/api/ai-control/dashboard");
    setMetric(model.metrics, "Enabled Features", enabledCount(ai?.features), "/api/ai-control/dashboard");
    setMetric(model.metrics, "Enabled Providers", enabledCount(ai?.providers), "/api/ai-control/dashboard");
    setMetric(model.metrics, "Usage Events", usageCount, "/api/ai-control/dashboard");
    setMetric(model.metrics, "Active Overrides", activeOverrides, "/api/ai-control/dashboard");

    setMetric(model.smallMetrics, "API Health", healthResult.state === "available" ? "Online" : null, "/api/health");
    setMetric(model.smallMetrics, "Roles", countFromCollection(rolesResult.data), "/api/roles");
    setMetric(model.smallMetrics, "Permissions", countFromCollection(permissionsResult.data), "/api/permissions");
    setMetric(model.smallMetrics, "AI Features", featureCount, "/api/ai-control/dashboard");
    setMetric(model.smallMetrics, "AI Providers", providerCount, "/api/ai-control/dashboard");
    setMetric(model.smallMetrics, "Usage Logs", usageCount, "/api/ai-control/dashboard");
    setMetric(model.smallMetrics, "Overrides", activeOverrides, "/api/ai-control/dashboard");

    model.overview = [
      ["Platform API", healthResult.state === "available" ? "Online" : unavailable, healthResult.state, "/api/health"],
      ["Roles", countFromCollection(rolesResult.data) || unavailable, rolesResult.state, "/api/roles"],
      ["Permissions", countFromCollection(permissionsResult.data) || unavailable, permissionsResult.state, "/api/permissions"],
      ["AI Features", featureCount || unavailable, "available", "/api/ai-control/dashboard"],
      ["AI Providers", providerCount || unavailable, "available", "/api/ai-control/dashboard"],
      ["Usage Events", usageCount || unavailable, "available", "/api/ai-control/dashboard"],
      ["Role Menu Coverage", "Configured", "available", "Local role registry"],
      ["Active Overrides", activeOverrides || "0", "available", "/api/ai-control/dashboard"],
    ];

    model.insights = [
      ...(ai?.features || []).slice(0, 4).map((item) => [
        item.enabled ? "AI Feature Enabled" : "AI Feature Disabled",
        String(item.label || item.key || "AI feature"),
        item.enabled ? "Active" : "Inactive",
      ] as [string, string, string]),
      ...(ai?.providers || []).slice(0, 3).map((item) => [
        item.enabled ? "Provider Connected" : "Provider Disabled",
        `${String(item.name || item.key || "AI provider")}${item.model ? ` · ${item.model}` : ""}`,
        item.enabled ? "Available" : "Inactive",
      ] as [string, string, string]),
    ];

    const usageActivities = (ai?.recentUsage || []).slice(0, 5).map((item) => [
      "AI usage",
      `${String(item.featureKey || "unknown feature")} · ${String(item.status || "UNKNOWN")}`,
      activityDate(item.createdAt),
    ] as [string, string, string]);

    const overrideActivities = (ai?.overrides || []).slice(0, 3).map((item) => [
      item.active === false ? "AI override disabled" : "AI override active",
      `${String(item.featureKey || "unknown feature")} · ${String(item.targetType || "target")}`,
      activityDate(item.createdAt),
    ] as [string, string, string]);

    model.activities = [...usageActivities, ...overrideActivities].slice(0, 8);
  }

  model.sources = model.sources.map((source) => ({ ...source, state: sourceState(results, source.path.replace("/api", "")) }));

  if (summaryResult.state === "available" && model.mode === "commerce") {
    model.overview = [
      ["Products", formatNumber(summary?.totalProducts) || unavailable, "available", "/api/dashboard/summary"],
      ["Orders", formatNumber(summary?.totalOrders) || unavailable, "available", "/api/dashboard/summary"],
      ["Customers", formatNumber(summary?.totalCustomers) || unavailable, "available", "/api/dashboard/summary"],
      ["Revenue", formatMoney(summary?.totalRevenue, currency) || unavailable, "available", "/api/dashboard/summary"],
      ["Low Stock", formatNumber(summary?.lowStock) || unavailable, "available", "/api/dashboard/summary"],
      ["Role Menu Coverage", "Configured", "available", "Local role registry"],
    ];
    model.orders = orderRows(summary, currency);
    model.products = (summary?.products || []).slice(0, 5).map((product) => [
      String(product.name || "Product"),
      `${formatNumber(product.quantity) || "0"} sold`,
      formatMoney(product.revenue, currency) || unavailable,
    ]);
    model.status = (summary?.orderStatus || []).map((item) => [
      String(item.label || unavailable),
      formatNumber(item.value) || "0",
    ]);
    model.tasks = (summary?.tasks || []).map((task) => [
      String(task.label || unavailable),
      formatNumber(task.value) || unavailable,
    ]);
    model.activities = (summary?.activities || []).slice(0, 8).map((activity) => [
      String(activity.title || "Activity"),
      String(activity.detail || "Live audit event"),
      String(activity.createdAt || ""),
    ]);
    if (!model.activities.length) {
      model.activities = model.orders.map((order) => [
        "Recent order",
        `${order[0]} - ${order[1]}`,
        order[3],
      ]);
    }
  }

  if (model.mode === "super") {
    model.products = [];
    model.orders = [];
    model.status = [];
    model.tasks = [];
  }

  if (model.mode === "commerce") {
    if (!model.status.length) model.status = model.orders.length ? [["Recent Orders", formatNumber(model.orders.length) || unavailable]] : [];
    if (!model.tasks.length) model.tasks = [];
  }

  model.warning = results.some((result) => result.state === "unavailable")
    ? "Some dashboard APIs are unavailable; affected widgets are not estimated."
    : "All displayed widgets are backed by live API responses.";

  return model;
}



