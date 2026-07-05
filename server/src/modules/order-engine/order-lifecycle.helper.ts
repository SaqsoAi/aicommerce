export const ORDER_LIFECYCLE_STATUSES = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "RETURN_REJECTED",
  "RETURNED",
  "REFUND_PENDING",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

const TERMINAL_ORDER_STATUSES = [
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

const ORDER_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED", "RETURN_REQUESTED"],
  COMPLETED: ["RETURN_REQUESTED", "REFUND_PENDING"],
  RETURN_REQUESTED: ["RETURN_APPROVED", "RETURN_REJECTED"],
  RETURN_APPROVED: ["RETURNED", "REFUND_PENDING"],
  RETURN_REJECTED: ["COMPLETED"],
  RETURNED: ["REFUND_PENDING", "REFUNDED", "PARTIALLY_REFUNDED"],
  REFUND_PENDING: ["REFUNDED", "PARTIALLY_REFUNDED"],
  PARTIALLY_REFUNDED: ["REFUNDED"],
};

export function normalizeOrderLifecycleStatus(status: unknown): string {
  return String(status ?? "").trim().toUpperCase();
}

export function assertOrderLifecycleStatus(status: unknown): string {
  const value = normalizeOrderLifecycleStatus(status);
  if (!ORDER_LIFECYCLE_STATUSES.includes(value as any)) {
    throw new Error(`Invalid order lifecycle status: ${value}`);
  }
  return value;
}

export function assertOrderLifecycleTransition(currentStatus: unknown, nextStatus: unknown): string {
  const current = normalizeOrderLifecycleStatus(currentStatus);
  const next = assertOrderLifecycleStatus(nextStatus);

  if (TERMINAL_ORDER_STATUSES.includes(current as any)) {
    throw new Error(`Invalid order status mutation from terminal status: ${current}`);
  }

  if (!ORDER_TRANSITIONS[current]?.includes(next)) {
    throw new Error(`Invalid order lifecycle transition: ${current} -> ${next}`);
  }

  return next;
}

export function assertCustomerCanAccessOrder(orderUserId: unknown, actor: { id?: unknown; userId?: unknown; role?: unknown }): void {
  const actorId = String(actor?.id ?? actor?.userId ?? "");
  const role = String(actor?.role ?? "").toUpperCase();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"].includes(role);

  if (!isAdmin && String(orderUserId) !== actorId) {
    throw new Error("Unauthorized order access");
  }
}

export function assertReturnQuantity(input: {
  purchasedQuantity: unknown;
  requestedQuantity: unknown;
  alreadyReturnedQuantity?: unknown;
}): number {
  const purchased = Number(input.purchasedQuantity);
  const requested = Number(input.requestedQuantity);
  const alreadyReturned = Number(input.alreadyReturnedQuantity ?? 0);

  if (!Number.isFinite(purchased) || purchased <= 0) {
    throw new Error("Invalid purchased quantity");
  }
  if (!Number.isFinite(requested) || requested <= 0) {
    throw new Error("Invalid return quantity");
  }
  if (alreadyReturned + requested > purchased) {
    throw new Error("Return quantity exceeds purchased quantity");
  }

  return requested;
}

export function assertRefundAmountAgainstPaid(input: {
  paidAmount: unknown;
  refundAmount: unknown;
  alreadyRefundedAmount?: unknown;
}): number {
  const paid = Number(input.paidAmount);
  const refund = Number(input.refundAmount);
  const alreadyRefunded = Number(input.alreadyRefundedAmount ?? 0);

  if (!Number.isFinite(paid) || paid <= 0) {
    throw new Error("Invalid paid amount");
  }
  if (!Number.isFinite(refund) || refund <= 0) {
    throw new Error("Invalid refund amount");
  }
  if (alreadyRefunded + refund > paid + 0.01) {
    throw new Error("Refund amount exceeds refundable amount");
  }

  return Math.round(refund * 100) / 100;
}