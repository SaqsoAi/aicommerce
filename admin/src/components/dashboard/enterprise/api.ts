import type { DashboardData, DashboardRole, ListRow, MetricCard } from "./types";

type RawRecord = Record<string, unknown>;

const EMPTY_SERIES = [0, 0, 0, 0, 0, 0, 0];

function token() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const auth = token();
    if (auth) headers.Authorization = `Bearer ${auth}`;
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function unwrapArray(input: unknown): RawRecord[] {
  if (Array.isArray(input)) return input as RawRecord[];
  if (input && typeof input === "object") {
    const obj = input as RawRecord;
    if (Array.isArray(obj.data)) return obj.data as RawRecord[];
    if (Array.isArray(obj.items)) return obj.items as RawRecord[];
    if (Array.isArray(obj.rows)) return obj.rows as RawRecord[];
  }
  return [];
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function money(amount: number, currency: string) {
  const sign = currency === "BDT" ? "৳" : currency === "USD" ? "$" : `${currency} `;
  return `${sign}${amount.toLocaleString()}`;
}

function rowFrom(record: RawRecord, index: number): ListRow {
  return {
    id: text(record.id, String(index + 1)),
    title: text(record.name, text(record.title, text(record.customerName, text(record.orderNumber, "Untitled")))),
    subtitle: text(record.subtitle, text(record.email, text(record.status, ""))),
    value: typeof record.total === "number" || typeof record.total === "string" ? record.total as string | number : undefined,
    status: text(record.status, ""),
    time: text(record.createdAt, text(record.updatedAt, "")),
  };
}

function emptyMetric(key: string, label: string): MetricCard {
  return { key, label, value: 0, meta: "API pending", trend: EMPTY_SERIES, status: "neutral" };
}

export function emptyDashboard(role: DashboardRole, currency = "BDT"): DashboardData {
  const isSuper = role === "SUPER_ADMIN";
  const primaryMetrics = isSuper
    ? [
        emptyMetric("projectHealth", "Project Health Score"),
        emptyMetric("criticalBugs", "Critical Bugs"),
        emptyMetric("mediumBugs", "Medium Bugs"),
        emptyMetric("lowPriority", "Low Priority"),
        emptyMetric("performance", "Performance Score"),
        emptyMetric("security", "Security Score"),
      ]
    : [
        emptyMetric("sales", "Total Sales"),
        emptyMetric("orders", "Orders"),
        emptyMetric("customers", "Customers"),
        emptyMetric("conversion", "Conversion Rate"),
        emptyMetric("avgOrder", "Avg. Order Value"),
      ];

  return {
    role,
    currency,
    primaryMetrics,
    secondaryMetrics: isSuper
      ? ["Build Status", "Test Coverage", "Code Quality", "Tech Debt", "Duplicate Code", "Unused Files", "Dependencies"].map((label, index) => emptyMetric(`secondary-${index}`, label))
      : [],
    chartSeries: EMPTY_SERIES,
    overview: [],
    insights: [],
    products: [],
    orders: [],
    customers: [],
    lowStock: [],
    tasks: [],
    activity: [],
    system: [emptyMetric("cpu", "CPU Usage"), emptyMetric("memory", "Memory Usage"), emptyMetric("disk", "Disk Usage"), emptyMetric("network", "Network")],
    permissions: [],
    isEmpty: true,
  };
}

function normalizeDashboard(raw: unknown, role: DashboardRole, fallbackCurrency: string): DashboardData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as RawRecord;
  const data = (obj.data && typeof obj.data === "object" ? obj.data : obj) as RawRecord;
  const currency = text(data.currency, fallbackCurrency);
  const base = emptyDashboard(role, currency);

  return {
    ...base,
    primaryMetrics: Array.isArray(data.primaryMetrics) ? data.primaryMetrics as MetricCard[] : base.primaryMetrics,
    secondaryMetrics: Array.isArray(data.secondaryMetrics) ? data.secondaryMetrics as MetricCard[] : base.secondaryMetrics,
    chartSeries: Array.isArray(data.chartSeries) ? data.chartSeries as number[] : base.chartSeries,
    overview: Array.isArray(data.overview) ? data.overview as ListRow[] : base.overview,
    insights: Array.isArray(data.insights) ? data.insights as ListRow[] : base.insights,
    products: Array.isArray(data.products) ? data.products as ListRow[] : base.products,
    orders: Array.isArray(data.orders) ? data.orders as ListRow[] : base.orders,
    customers: Array.isArray(data.customers) ? data.customers as ListRow[] : base.customers,
    lowStock: Array.isArray(data.lowStock) ? data.lowStock as ListRow[] : base.lowStock,
    tasks: Array.isArray(data.tasks) ? data.tasks as ListRow[] : base.tasks,
    activity: Array.isArray(data.activity) ? data.activity as ListRow[] : base.activity,
    system: Array.isArray(data.system) ? data.system as MetricCard[] : base.system,
    permissions: Array.isArray(data.permissions) ? data.permissions as string[] : base.permissions,
    isEmpty: false,
  };
}

export async function loadDashboardData(role: DashboardRole): Promise<DashboardData> {
  const settings = await getJson<RawRecord>("/api/enterprise-settings");
  const fallbackCurrency = text(settings?.currency, text((settings?.data as RawRecord | undefined)?.currency, "BDT"));

  const rolePath = role === "SUPER_ADMIN" ? "super-admin" : role === "ADMIN" ? "admin" : "user-admin";
  const direct = await getJson<unknown>(`/api/dashboard/${rolePath}`);
  const normalized = normalizeDashboard(direct, role, fallbackCurrency);
  if (normalized) return normalized;

  const [productsRaw, ordersRaw, customersRaw, inventoryRaw] = await Promise.all([
    getJson<unknown>("/api/products"),
    getJson<unknown>("/api/orders"),
    getJson<unknown>("/api/customers"),
    getJson<unknown>("/api/inventory"),
  ]);

  const products = unwrapArray(productsRaw).map(rowFrom);
  const orders = unwrapArray(ordersRaw).map(rowFrom);
  const customers = unwrapArray(customersRaw).map(rowFrom);
  const inventory = unwrapArray(inventoryRaw).map(rowFrom);
  const totalSales = unwrapArray(ordersRaw).reduce((sum, row) => sum + numberValue(row.total), 0);

  const base = emptyDashboard(role, fallbackCurrency);
  if (role !== "SUPER_ADMIN") {
    base.primaryMetrics = [
      { key: "sales", label: "Total Sales", value: money(totalSales, fallbackCurrency), meta: "API aggregate", trend: EMPTY_SERIES },
      { key: "orders", label: "Orders", value: orders.length, meta: "Total orders", trend: EMPTY_SERIES },
      { key: "customers", label: "Customers", value: customers.length, meta: "Total customers", trend: EMPTY_SERIES },
      { key: "conversion", label: "Conversion Rate", value: customers.length ? `${Math.round((orders.length / customers.length) * 100)}%` : "0%", meta: "Orders/customers", trend: EMPTY_SERIES },
      { key: "avgOrder", label: "Avg. Order Value", value: orders.length ? money(totalSales / orders.length, fallbackCurrency) : money(0, fallbackCurrency), meta: "API average", trend: EMPTY_SERIES },
    ];
  }
  return { ...base, products, orders, customers, lowStock: inventory, isEmpty: !products.length && !orders.length && !customers.length && !inventory.length };
}