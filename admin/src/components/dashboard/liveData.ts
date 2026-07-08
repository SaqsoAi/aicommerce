import { cloneDashboard, type DashboardModel, type DataState, type Metric, unavailable } from "./data";

type ApiResult<T> = { state: DataState; path: string; data: T | null; error?: string };
type DashboardSummary = {
  totalProducts?: number | string | null;
  totalCustomers?: number | string | null;
  totalOrders?: number | string | null;
  totalRevenue?: number | string | null;
  lowStock?: number | string | null;
  recentOrders?: Array<Record<string, unknown>>;
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

function formatMoney(value: unknown): string | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(numeric);
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

function orderRows(summary: DashboardSummary | null): Array<[string, string, string, string]> {
  return (summary?.recentOrders || []).slice(0, 5).map((order) => [
    String(order.orderNumber || order.id || unavailable),
    String(order.customerName || "Customer unavailable"),
    formatMoney(order.finalAmount) || unavailable,
    String(order.status || unavailable),
  ]);
}

function sourceState(results: Array<ApiResult<unknown>>, path: string): DataState {
  return results.find((result) => result.path === path)?.state || "unavailable";
}

export async function hydrateDashboard(baseModel: DashboardModel): Promise<DashboardModel> {
  const model = cloneDashboard(baseModel);
  const [summaryResult, rolesResult, permissionsResult, aiResult, notificationsResult, healthResult] = await Promise.all([
    fetchSource<DashboardSummary>("/dashboard/summary"),
    fetchSource<unknown>("/roles"),
    fetchSource<unknown>("/permissions"),
    fetchSource<unknown>("/ai-control/dashboard"),
    fetchSource<unknown>("/notifications/unread-count"),
    fetchSource<unknown>("/health"),
  ]);

  const results = [summaryResult, rolesResult, permissionsResult, aiResult, notificationsResult, healthResult] as Array<ApiResult<unknown>>;
  const summary = summaryResult.data;
  const totalOrders = Number(summary?.totalOrders || 0);
  const totalRevenue = Number(summary?.totalRevenue || 0);
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : null;

  setMetric(model.metrics, "Platform Revenue", formatMoney(summary?.totalRevenue), "/api/dashboard/summary");
  setMetric(model.metrics, "Total Sales", formatMoney(summary?.totalRevenue), "/api/dashboard/summary");
  setMetric(model.metrics, "Total Orders", formatNumber(summary?.totalOrders), "/api/dashboard/summary");
  setMetric(model.metrics, "Orders", formatNumber(summary?.totalOrders), "/api/dashboard/summary");
  setMetric(model.metrics, "Products", formatNumber(summary?.totalProducts), "/api/dashboard/summary");
  setMetric(model.metrics, "Customers", formatNumber(summary?.totalCustomers), "/api/dashboard/summary");
  setMetric(model.metrics, "Roles", countFromCollection(rolesResult.data), "/api/roles");
  setMetric(model.metrics, "Permissions", countFromCollection(permissionsResult.data), "/api/permissions");
  setMetric(model.metrics, "Avg. Order Value", averageOrder == null ? null : formatMoney(averageOrder), "/api/dashboard/summary");

  setMetric(model.smallMetrics, "Low Stock", formatNumber(summary?.lowStock), "/api/dashboard/summary");
  setMetric(model.smallMetrics, "Notifications", countFromCollection(notificationsResult.data), "/api/notifications/unread-count");
  setMetric(model.smallMetrics, "Menu Sections", formatNumber(model.role === "SUPER_ADMIN" ? 5 : 3), "Role navigation registry");
  setMetric(model.smallMetrics, "API Health", healthResult.state === "available" ? "Online" : null, "/api/health");
  setMetric(model.smallMetrics, "AI Providers", aiResult.state === "available" ? "Connected" : null, "/api/ai-control/dashboard");

  model.sources = model.sources.map((source) => ({ ...source, state: sourceState(results, source.path.replace("/api", "")) }));

  if (summaryResult.state === "available") {
    model.overview = [
      ["Products", formatNumber(summary?.totalProducts) || unavailable, "available", "/api/dashboard/summary"],
      ["Orders", formatNumber(summary?.totalOrders) || unavailable, "available", "/api/dashboard/summary"],
      ["Customers", formatNumber(summary?.totalCustomers) || unavailable, "available", "/api/dashboard/summary"],
      ["Revenue", formatMoney(summary?.totalRevenue) || unavailable, "available", "/api/dashboard/summary"],
      ["Low Stock", formatNumber(summary?.lowStock) || unavailable, "available", "/api/dashboard/summary"],
      ["Role Menu Coverage", "Configured", "available", "Local role registry"],
    ];
    model.orders = orderRows(summary);
    model.activities = model.orders.map((order) => ["Recent order", `${order[0]} - ${order[1]}`, order[3]]);
  }

  if (model.mode === "commerce") {
    model.status = model.orders.length ? [["Recent Orders", formatNumber(model.orders.length) || unavailable]] : [];
    model.tasks = model.tasks.map(([label]) => [label, label === "Low Stock Products" ? formatNumber(summary?.lowStock) || unavailable : unavailable]);
  }

  model.warning = results.some((result) => result.state === "unavailable")
    ? "Some dashboard APIs are unavailable; affected widgets are not estimated."
    : "All displayed widgets are backed by live API responses.";

  return model;
}
