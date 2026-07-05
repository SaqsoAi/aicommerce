export const initializePayment = async (
  order: any
) => {
  return {
    success: true,
    transactionId: `TXN-${Date.now()}`,
    gatewayURL: `https://sandbox-payment.local/pay/${order.id}`,
  };
};

export const verifyPayment = async (
  transactionId: string
) => {
  return {
    success: true,
    transactionId,
    status: "PAID",
  };
};

export const refundPayment = async (
  transactionId: string
) => {
  return {
    success: true,
    transactionId,
    status: "REFUNDED",
  };
};
// PHASE 5.4 ENTERPRISE PAYMENT IDEMPOTENCY GUARDS - START
const PHASE_5_4_PAYMENT_STATUSES = [
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

const PHASE_5_4_FINAL_PAYMENT_STATUSES = [
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const;

function phase54NormalizePaymentStatus(status: unknown): string {
  return String(status ?? "").toUpperCase();
}

function phase54AssertPaymentStatus(status: unknown): void {
  const value = phase54NormalizePaymentStatus(status);
  if (!PHASE_5_4_PAYMENT_STATUSES.includes(value as any)) {
    throw new Error("Invalid payment status");
  }
}

function phase54AssertPaymentStatusTransition(currentStatus: unknown, nextStatus: unknown): void {
  const current = phase54NormalizePaymentStatus(currentStatus);
  const next = phase54NormalizePaymentStatus(nextStatus);
  phase54AssertPaymentStatus(next);

  if (PHASE_5_4_FINAL_PAYMENT_STATUSES.includes(current as any) && current !== "PAID") {
    throw new Error("Invalid payment mutation from terminal status");
  }

  const allowed: Record<string, string[]> = {
    PENDING: ["AUTHORIZED", "PAID", "FAILED", "CANCELLED"],
    AUTHORIZED: ["PAID", "FAILED", "CANCELLED"],
    PAID: ["REFUNDED", "PARTIALLY_REFUNDED"],
    PARTIALLY_REFUNDED: ["REFUNDED"],
  };

  if (!allowed[current]?.includes(next)) {
    throw new Error(`Invalid payment status transition: ${current} -> ${next}`);
  }
}

function phase54BuildPaymentIdempotencyKey(input: {
  orderId?: string | number | null;
  provider?: string | null;
  providerPaymentId?: string | number | null;
  amount?: number | string | null;
}): string {
  const orderId = String(input.orderId ?? "unknown-order");
  const provider = String(input.provider ?? "unknown-provider").toLowerCase();
  const providerPaymentId = String(input.providerPaymentId ?? "unknown-provider-payment");
  const amount = String(input.amount ?? "0");
  return `${provider}:${orderId}:${providerPaymentId}:${amount}`;
}

function phase54AssertProviderGoverned(provider: unknown, allowedProviders?: string[]): void {
  const value = String(provider ?? "").trim().toLowerCase();
  if (!value) {
    throw new Error("Payment provider is required");
  }
  if (allowedProviders && allowedProviders.length > 0) {
    const normalized = allowedProviders.map((p) => String(p).trim().toLowerCase());
    if (!normalized.includes(value)) {
      throw new Error("Payment provider is not governed or enabled");
    }
  }
}
// PHASE 5.4 ENTERPRISE PAYMENT IDEMPOTENCY GUARDS - END
