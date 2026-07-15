import os from "node:os";
import prisma from "../../config/prisma";
import { getProjectTelemetry } from "../project-telemetry/project-telemetry.dashboard";
import { ensureRepositoryTelemetrySnapshot } from "../project-telemetry/project-telemetry.service";

type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER";

function normalizeRole(value: unknown): Role {
  const role = String(value || "MANAGER").toUpperCase();
  if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (role === "ADMIN") return "ADMIN";
  return "MANAGER";
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function settingCurrency(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object" && "code" in value) {
    const code = (value as { code?: unknown }).code;
    return typeof code === "string" && code.trim() ? code.trim() : null;
  }
  return null;
}

function systemMetrics() {
  const totalMemory = os.totalmem();
  const memory = totalMemory ? Math.round(((totalMemory - os.freemem()) / totalMemory) * 100) : 0;
  const cpu = Math.min(100, Math.round((os.loadavg()[0] / Math.max(1, os.cpus().length)) * 100));
  return [
    { label: "CPU Usage", value: cpu, unit: "%" },
    { label: "Memory Usage", value: memory, unit: "%" },
    { label: "System Uptime", value: Math.round(os.uptime() / 3600), unit: "h" },
    { label: "Process Memory", value: Math.round(process.memoryUsage().rss / 1024 / 1024), unit: "MB" },
  ];
}


function hasRepositoryTelemetry(value: Awaited<ReturnType<typeof getProjectTelemetry>> | null) {
  return Boolean(
    value &&
      value.overview &&
      (
        value.overview.totalModules != null ||
        value.overview.totalApis != null ||
        value.overview.reactComponents != null ||
        value.overview.linesOfCode != null
      ),
  );
}

export async function getRoleDashboard(inputRole?: unknown) {
  const role = normalizeRole(inputRole);
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const [totalProducts, totalCustomers, totalOrders, revenue, lowStock, outOfStock, recentOrders, trendOrders, statusRows, topProducts, topCustomers, auditRows, storeSetting, currencySetting, pendingReviews, unpaidOrders, roles, permissions, initialProjectTelemetry, conversations] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { finalAmount: true } }),
    prisma.productVariant.count({ where: { active: true, availableStock: { gt: 0, lte: 5 } } }),
    prisma.productVariant.count({ where: { active: true, availableStock: { lte: 0 } } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, finalAmount: true, status: true, paymentStatus: true, createdAt: true, items: { take: 1, select: { product: { select: { name: true, thumbnail: true } } } } } }),
    prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, finalAmount: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
    prisma.order.groupBy({ by: ["userId"], _count: { _all: true }, _sum: { finalAmount: true }, orderBy: { _sum: { finalAmount: "desc" } }, take: 5 }),
    prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, action: true, module: true, description: true, createdAt: true } }),
    prisma.storeSetting.findUnique({ where: { singletonKey: "main" }, select: { storeName: true } }),
    prisma.settingValue.findUnique({ where: { key: "general.currency" }, select: { value: true } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.permission.findMany({ orderBy: { code: "asc" }, select: { code: true } }),
    role === "SUPER_ADMIN" ? getProjectTelemetry() : Promise.resolve(null),
    role === "SUPER_ADMIN" ? prisma.aILog.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, feature: true, prompt: true, response: true, createdAt: true } }) : Promise.resolve([]),
  ]);

  let projectTelemetry = initialProjectTelemetry;
  if (role === "SUPER_ADMIN") {
    if (!hasRepositoryTelemetry(projectTelemetry)) {
      try {
        await ensureRepositoryTelemetrySnapshot();
        projectTelemetry = await getProjectTelemetry();
      } catch (error) {
        console.error("repository telemetry refresh failed", { error });
      }
    } else {
      void ensureRepositoryTelemetrySnapshot().catch((error) => {
        console.error("repository telemetry background refresh failed", { error });
      });
    }
  }

  const productIds = topProducts.map((item) => item.productId);
  const customerIds = topCustomers.map((item) => item.userId);
  const [products, customers, inventoryRows] = await Promise.all([
    productIds.length ? prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, thumbnail: true, orderItems: { select: { quantity: true, price: true } } } }) : [],
    customerIds.length ? prisma.user.findMany({ where: { id: { in: customerIds } }, select: { id: true, name: true, email: true } }) : [],
    prisma.productVariant.findMany({ where: { active: true, availableStock: { lte: 5 } }, take: 5, orderBy: { availableStock: "asc" }, select: { id: true, availableStock: true, lowStockThreshold: true, product: { select: { id: true, name: true, thumbnail: true } } } }),
  ]);

  const productMap = new Map(products.map((product): [string, (typeof products)[number]] => [product.id, product]));
  const customerMap = new Map(customers.map((customer): [string, (typeof customers)[number]] => [customer.id, customer]));
  const salesMap = new Map<string, number>();
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(since);
    date.setDate(date.getDate() + index);
    salesMap.set(dateKey(date), 0);
  }
  for (const order of trendOrders) salesMap.set(dateKey(order.createdAt), (salesMap.get(dateKey(order.createdAt)) || 0) + order.finalAmount);

  const totalRevenue = revenue._sum.finalAmount || 0;
  const currency = (settingCurrency(currencySetting?.value) || "BDT").toUpperCase();
  const kpis = role === "SUPER_ADMIN" ? [] : [
    { key: "sales", label: "Total Sales", value: totalRevenue, unit: "currency" },
    { key: "orders", label: "Orders", value: totalOrders },
    { key: "customers", label: "Customers", value: totalCustomers },
    { key: "conversion", label: "Conversion Rate", value: null, unit: "percent" },
    { key: "average", label: "Avg. Order Value", value: totalOrders ? totalRevenue / totalOrders : 0, unit: "currency" },
  ];

  return {
    role,
    currency,
    storeName: storeSetting?.storeName || "",
    totalProducts,
    totalCustomers,
    totalOrders,
    totalRevenue,
    lowStock,
    kpis,
    salesTrend: [...salesMap].map(([key, value]) => ({ label: new Date(`${key}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" }), value })),
    orderStatus: statusRows.map((item) => ({ label: String(item.status), value: item._count._all })),
    orders: recentOrders.map((item) => ({ ...item, amount: item.finalAmount, status: String(item.status), paymentStatus: String(item.paymentStatus), createdAt: item.createdAt.toISOString() })),
    recentOrders: recentOrders.map((item) => ({ ...item, productName: item.items[0]?.product.name || null, thumbnail: item.items[0]?.product.thumbnail || null, status: String(item.status), paymentStatus: String(item.paymentStatus), createdAt: item.createdAt.toISOString() })),
    products: topProducts.flatMap((item) => {
      const product = productMap.get(item.productId);
      return product ? [{ id: product.id, name: product.name, quantity: item._sum.quantity || 0, revenue: product.orderItems.reduce((sum, row) => sum + row.quantity * row.price, 0), thumbnail: product.thumbnail }] : [];
    }),
    customers: topCustomers.flatMap((item) => {
      const customer = customerMap.get(item.userId);
      return customer ? [{ id: customer.id, name: customer.name, email: customer.email, orders: item._count._all, total: item._sum.finalAmount || 0 }] : [];
    }),
    inventory: inventoryRows.map((item) => ({ id: item.id, productId: item.product.id, name: item.product.name, thumbnail: item.product.thumbnail, stock: item.availableStock, threshold: item.lowStockThreshold })),
    tasks: [
      { label: "Process Pending Orders", value: statusRows.find((item) => String(item.status) === "PENDING")?._count._all || 0 },
      { label: "Low Stock Products", value: lowStock },
      { label: "Customer Inquiries", value: null },
      { label: "Reviews to Approve", value: pendingReviews },
      { label: "Unpaid Orders", value: unpaidOrders },
    ],
    activities: auditRows.map((item) => ({ id: item.id, title: `${item.module}: ${item.action}`, detail: item.description || "", createdAt: item.createdAt.toISOString(), kind: "audit" })),
    aiInsights: projectTelemetry?.insights || [],
    projectTelemetry,
    conversations: conversations.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    system: systemMetrics(),
    permissions: permissions.map((item) => item.code),
    platform: { roles: roles.map((item) => item.name), roleCount: roles.length, permissionCount: permissions.length },
    store: { totalProducts, totalCustomers, lowStock, outOfStock },
  };
}

