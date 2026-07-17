// PHASE_5_7_ADMIN_BI_HELPERS
// Admin-only BI formatting and widget contract. No public client BI exposure.

export function formatBIAmount(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : Number(value || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0);
}

export function formatBIPercent(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : Number(value || 0);
  return `${Number.isFinite(n) ? n.toFixed(2) : "0.00"}%`;
}

export function getDefaultBIDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10)
  };
}

export const PHASE_5_7_EXECUTIVE_WIDGETS = [
  "Today's Sales",
  "Monthly Sales",
  "Revenue",
  "Orders",
  "Pending Orders",
  "Returns",
  "Refunds",
  "Inventory Value",
  "Low Stock",
  "Warehouse Health",
  "Top Products",
  "Top Categories",
  "Top Customers",
  "Top Suppliers",
  "Membership Growth",
  "Reward Usage",
  "Coupon Usage"
] as const;
// END_PHASE_5_7_ADMIN_BI_HELPERS
