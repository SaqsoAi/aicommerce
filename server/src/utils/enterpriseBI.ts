// PHASE_5_7_ENTERPRISE_BI_HELPERS
// Enterprise BI helper utilities. No route, no duplicate API, no schema change.

export type EnterpriseBIAmount = number | string | null | undefined;

export function toBIAmount(value: EnterpriseBIAmount): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
}

export function safeBIPercent(part: number, total: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

export function safeBIRate(part: number, total: number): number {
  return safeBIPercent(part, total);
}

export function safeBIAverage(total: number, count: number): number {
  if (!Number.isFinite(total) || !Number.isFinite(count) || count <= 0) return 0;
  return Number((total / count).toFixed(2));
}

export function normalizeBIDateRange(input?: { from?: string; to?: string }) {
  const now = new Date();
  const to = input?.to ? new Date(input.to) : now;
  const from = input?.from ? new Date(input.from) : new Date(now.getFullYear(), now.getMonth(), 1);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  }
  return { from, to };
}

export function buildExecutiveKpis(input: {
  revenue?: number;
  cost?: number;
  orderCount?: number;
  pendingOrders?: number;
  returns?: number;
  refunds?: number;
  inventoryValue?: number;
  lowStock?: number;
  membersNew?: number;
  membersTotal?: number;
  couponOrders?: number;
  rewardRedemptions?: number;
  totalOrders?: number;
}) {
  const revenue = toBIAmount(input.revenue);
  const cost = toBIAmount(input.cost);
  const orderCount = toBIAmount(input.orderCount);
  const totalOrders = toBIAmount(input.totalOrders || input.orderCount);
  const refunds = toBIAmount(input.refunds);
  const returns = toBIAmount(input.returns);
  return {
    revenue,
    profit: revenue > 0 && cost > 0 ? Number((revenue - cost).toFixed(2)) : 0,
    orderCount,
    pendingOrders: toBIAmount(input.pendingOrders),
    averageOrderValue: safeBIAverage(revenue, orderCount),
    returnRate: safeBIRate(returns, totalOrders),
    refundRate: safeBIRate(refunds, totalOrders),
    inventoryValue: toBIAmount(input.inventoryValue),
    lowStock: toBIAmount(input.lowStock),
    membershipGrowth: safeBIRate(toBIAmount(input.membersNew), toBIAmount(input.membersTotal)),
    couponConversion: safeBIRate(toBIAmount(input.couponOrders), totalOrders),
    rewardRedemption: toBIAmount(input.rewardRedemptions)
  };
}

export function buildBIExportRows<T extends Record<string, unknown>>(rows: T[]): T[] {
  return Array.isArray(rows) ? rows : [];
}
// END_PHASE_5_7_ENTERPRISE_BI_HELPERS
