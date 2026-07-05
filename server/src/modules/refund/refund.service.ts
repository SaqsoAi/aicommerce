import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REFUND_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PROCESSING",
  "REFUNDED",
  "FAILED",
  "CANCELLED",
] as const;

const TERMINAL_REFUND_STATUSES = ["REFUNDED", "REJECTED", "FAILED", "CANCELLED"] as const;

const REFUND_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["PROCESSING", "REFUNDED", "FAILED", "CANCELLED"],
  PROCESSING: ["REFUNDED", "FAILED", "CANCELLED"],
};

function normalizeStatus(status: unknown): string {
  return String(status ?? "").trim().toUpperCase();
}

function assertRefundStatus(status: unknown): string {
  const value = normalizeStatus(status);
  if (!REFUND_STATUSES.includes(value as any)) {
    throw new Error("Invalid refund status");
  }
  return value;
}

function assertRefundStatusTransition(currentStatus: unknown, nextStatus: unknown): string {
  const current = normalizeStatus(currentStatus);
  const next = assertRefundStatus(nextStatus);

  if (TERMINAL_REFUND_STATUSES.includes(current as any)) {
    throw new Error("Invalid duplicate refund mutation from terminal status");
  }

  if (!REFUND_STATUS_TRANSITIONS[current]?.includes(next)) {
    throw new Error(`Invalid refund status transition: ${current} -> ${next}`);
  }

  return next;
}

function assertRefundAmount(amount: unknown): number {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid refund amount");
  }
  return Math.round(value * 100) / 100;
}

function buildRefundIdempotencyKey(input: {
  orderId: string;
  paymentId?: string | null;
  amount: number;
  reason: string;
}): string {
  return [
    "refund",
    input.orderId,
    input.paymentId || "manual",
    input.amount.toFixed(2),
    input.reason.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 80),
  ].join(":");
}

async function getPaidAmount(orderId: string): Promise<{ amount: number; paymentId?: string | null }> {
  const payment = await prisma.payment.findFirst({
    where: {
      orderId,
      status: { in: ["PAID", "AUTHORIZED", "PARTIALLY_REFUNDED"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (payment) {
    return { amount: Number(payment.amount), paymentId: payment.id };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Order not found");
  }

  if (!["PAID", "PARTIALLY_REFUNDED", "REFUNDED"].includes(String(order.paymentStatus))) {
    throw new Error("Order payment is not refundable");
  }

  return { amount: Number(order.finalAmount ?? order.totalAmount ?? 0), paymentId: null };
}

export async function createRefundRequest(input: {
  orderId: string;
  userId: string;
  amount: number;
  reason: string;
  actorId?: string | null;
  provider?: string | null;
  notes?: string | null;
}) {
  if (!input.orderId) throw new Error("orderId is required");
  if (!input.userId) throw new Error("userId is required");
  if (!input.reason || input.reason.trim().length < 3) {
    throw new Error("Refund reason is required");
  }

  const amount = assertRefundAmount(input.amount);

  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new Error("Order not found");

  if (order.userId !== input.userId && !input.actorId) {
    throw new Error("Unauthorized refund request");
  }

  const paid = await getPaidAmount(order.id);

  const aggregate = await prisma.refund.aggregate({
    where: {
      orderId: order.id,
      status: { notIn: ["REJECTED", "FAILED", "CANCELLED"] },
    },
    _sum: { amount: true },
  });

  const alreadyRequested = Number(aggregate._sum.amount ?? 0);
  if (alreadyRequested + amount > paid.amount + 0.01) {
    throw new Error("Refund amount exceeds refundable amount");
  }

  const idempotencyKey = buildRefundIdempotencyKey({
    orderId: order.id,
    paymentId: paid.paymentId,
    amount,
    reason: input.reason,
  });

  const existing = await prisma.refund.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  return prisma.refund.create({
    data: {
      orderId: order.id,
      paymentId: paid.paymentId,
      userId: input.userId,
      amount,
      reason: input.reason.trim(),
      status: "PENDING",
      provider: input.provider || "manual",
      notes: input.notes || null,
      actorId: input.actorId || null,
      idempotencyKey,
    },
  });
}

export async function updateRefundStatus(input: {
  refundId: string;
  status: string;
  actorId: string;
  providerRefundId?: string | null;
  notes?: string | null;
}) {
  if (!input.refundId) throw new Error("refundId is required");
  if (!input.actorId) throw new Error("actorId is required");

  const refund = await prisma.refund.findUnique({ where: { id: input.refundId } });
  if (!refund) throw new Error("Refund not found");

  const next = assertRefundStatusTransition(refund.status, input.status);

  const updated = await prisma.refund.update({
    where: { id: refund.id },
    data: {
      status: next,
      actorId: input.actorId,
      providerRefundId: input.providerRefundId ?? refund.providerRefundId,
      notes: input.notes ?? refund.notes,
      processedAt: next === "REFUNDED" ? new Date() : refund.processedAt,
    },
  });

  if (next === "REFUNDED") {
    const orderRefunds = await prisma.refund.aggregate({
      where: {
        orderId: refund.orderId,
        status: "REFUNDED",
      },
      _sum: { amount: true },
    });

    const order = await prisma.order.findUnique({ where: { id: refund.orderId } });
    if (order) {
      const refundedAmount = Number(orderRefunds._sum.amount ?? 0);
      const orderTotal = Number(order.finalAmount ?? order.totalAmount ?? 0);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: refundedAmount + 0.01 >= orderTotal ? "REFUNDED" : "PARTIALLY_REFUNDED",
        } as any,
      });
    }
  }

  return updated;
}

export async function getRefundRequests() {
  return prisma.refund.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: true,
      payment: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function getUserRefundRequests(userId: string) {
  if (!userId) throw new Error("userId is required");
  return prisma.refund.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      order: true,
      payment: true,
    },
  });
}

// PHASE 5.5C REFUND PAYMENT RECONCILIATION NOTE
// Refund creation validates:
// - order exists
// - requester owns order unless actor/admin context exists
// - payment/order is refundable
// - amount does not exceed paid/refundable amount
// - duplicate refund is blocked by idempotency key
// Provider refund execution remains compatibility-only until a governed provider supports safe refund calls.
